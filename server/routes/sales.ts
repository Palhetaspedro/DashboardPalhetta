import { Router, Response } from "express";
import { v4 as uuid } from "uuid";
import z from "zod";
import db from "../db/index.js";
import { authMiddleware, AuthRequest } from "../middleware/auth.js";

const router = Router();

// ─── Validation ──────────────────────────────────────────────────────────────────

const createSaleSchema = z.object({
  product: z.string().min(1),
  specs: z.string().optional(),
  amount: z.number().positive(),
  buyer_id: z.string().optional(),
  thumb: z.string().optional(),
});

const updateSaleSchema = z.object({
  status: z.enum(["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"]).optional(),
});

// ─── GET / (list sales) ──────────────────────────────────────────────────────────

router.get("/", authMiddleware, (req: AuthRequest, res: Response) => {
  const { status } = req.query;
  let query: string;
  let params: any[] = [];

  if (req.user!.role === "admin") {
    query = "SELECT s.*, u_s.name as seller_name, u_b.name as buyer_name FROM sales s LEFT JOIN users u_s ON s.seller_id = u_s.id LEFT JOIN users u_b ON s.buyer_id = u_b.id";
    if (status) {
      query += " WHERE s.status = ?";
      params.push(status);
    }
    query += " ORDER BY s.created_at DESC";
  } else if (req.user!.role === "seller") {
    query = "SELECT s.*, u_b.name as buyer_name FROM sales s LEFT JOIN users u_b ON s.buyer_id = u_b.id WHERE s.seller_id = ?";
    params.push(req.user!.userId);
    if (status) {
      query += " AND s.status = ?";
      params.push(status);
    }
    query += " ORDER BY s.created_at DESC";
  } else {
    query = "SELECT s.*, u_s.name as seller_name FROM sales s LEFT JOIN users u_s ON s.seller_id = u_s.id WHERE s.buyer_id = ?";
    params.push(req.user!.userId);
    if (status) {
      query += " AND s.status = ?";
      params.push(status);
    }
    query += " ORDER BY s.created_at DESC";
  }

  const sales = db.prepare(query).all(...params);
  res.json({ sales });
});

// ─── POST / (create sale) ───────────────────────────────────────────────────────

router.post("/", authMiddleware, (req: AuthRequest, res: Response) => {
  const parsed = createSaleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { product, specs, amount, buyer_id, thumb } = parsed.data;
  const id = uuid();

  db.prepare(`
    INSERT INTO sales (id, seller_id, buyer_id, product, specs, amount, status, thumb)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
  `).run(id, req.user!.userId, buyer_id || null, product, specs || "", amount, thumb || "");

  const sale = db.prepare("SELECT * FROM sales WHERE id = ?").get(id);
  res.status(201).json({ sale });
});

// ─── GET /:id ────────────────────────────────────────────────────────────────────

router.get("/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const sale = db.prepare(`
    SELECT s.*, u_s.name as seller_name, u_b.name as buyer_name
    FROM sales s
    LEFT JOIN users u_s ON s.seller_id = u_s.id
    LEFT JOIN users u_b ON s.buyer_id = u_b.id
    WHERE s.id = ?
  `).get(req.params.id) as any;

  if (!sale) return res.status(404).json({ error: "Venda não encontrada" });

  // Only seller, buyer, or admin can view
  if (req.user!.role !== "admin" && sale.seller_id !== req.user!.userId && sale.buyer_id !== req.user!.userId) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  res.json({ sale });
});

// ─── PATCH /:id (update status) ──────────────────────────────────────────────────

router.patch("/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const parsed = updateSaleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const sale = db.prepare("SELECT * FROM sales WHERE id = ?").get(req.params.id) as any;
  if (!sale) return res.status(404).json({ error: "Venda não encontrada" });

  if (req.user!.role !== "admin" && sale.seller_id !== req.user!.userId) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  db.prepare("UPDATE sales SET status = ?, updated_at = datetime('now') WHERE id = ?").run(parsed.data.status, req.params.id);

  const updated = db.prepare("SELECT * FROM sales WHERE id = ?").get(req.params.id);
  res.json({ sale: updated });
});

// ─── GET /stats/overview ──────────────────────────────────────────────────────────

router.get("/stats/overview", authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const isAdmin = req.user!.role === "admin";
  const isSeller = req.user!.role === "seller";

  let salesQuery: string;
  let params: any[] = [];

  if (isAdmin) {
    salesQuery = "SELECT status, SUM(amount) as total, COUNT(*) as count FROM sales GROUP BY status";
  } else if (isSeller) {
    salesQuery = "SELECT status, SUM(amount) as total, COUNT(*) as count FROM sales WHERE seller_id = ? GROUP BY status";
    params.push(userId);
  } else {
    salesQuery = "SELECT status, SUM(amount) as total, COUNT(*) as count FROM sales WHERE buyer_id = ? GROUP BY status";
    params.push(userId);
  }

  const statusGroups = db.prepare(salesQuery).all(...params) as any[];

  // Monthly revenue
  let monthlyQuery: string;
  if (isAdmin) {
    monthlyQuery = "SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as total FROM sales WHERE status != 'cancelled' AND status != 'refunded' GROUP BY month ORDER BY month DESC LIMIT 6";
  } else if (isSeller) {
    monthlyQuery = "SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as total FROM sales WHERE seller_id = ? AND status != 'cancelled' AND status != 'refunded' GROUP BY month ORDER BY month DESC LIMIT 6";
    params = [userId];
  } else {
    monthlyQuery = "SELECT strftime('%Y-%m', created_at) as month, SUM(amount) as total FROM sales WHERE buyer_id = ? AND status != 'cancelled' AND status != 'refunded' GROUP BY month ORDER BY month DESC LIMIT 6";
    params = [userId];
  }

  const monthlyRevenue = db.prepare(monthlyQuery).all(...params) as any[];

  const totalRevenue = statusGroups.reduce((acc: number, s: any) => {
    if (s.status !== "cancelled" && s.status !== "refunded") return acc + s.total;
    return acc;
  }, 0);
  const totalSales = statusGroups.reduce((acc: number, s: any) => acc + s.count, 0);

  res.json({
    totalRevenue,
    totalSales,
    byStatus: statusGroups,
    monthlyRevenue,
  });
});

export default router;