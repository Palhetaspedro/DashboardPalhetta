import { Router, Response } from "express";
import { v4 as uuid } from "uuid";
import z from "zod";
import db from "../db/index.js";
import { authMiddleware, requireRole, AuthRequest } from "../middleware/auth.js";

const router = Router();

// ─── Validation ──────────────────────────────────────────────────────────────────

const createDisputeSchema = z.object({
  order_id: z.string().optional(),
  reason: z.string().min(3, "Motivo deve ter ao menos 3 caracteres"),
});

const updateDisputeSchema = z.object({
  status: z.enum(["open", "review", "resolved"]),
});

// ─── GET / (list disputes) ──────────────────────────────────────────────────────

router.get("/", authMiddleware, (req: AuthRequest, res: Response) => {
  const { status } = req.query;
  let query = `
    SELECT d.*, s.product as order_product, u.name as user_name
    FROM disputes d
    LEFT JOIN sales s ON d.order_id = s.id
    JOIN users u ON d.user_id = u.id
  `;
  const params: any[] = [];

  if (req.user!.role === "admin") {
    if (status) {
      query += " WHERE d.status = ?";
      params.push(status);
    }
  } else {
    query += " WHERE d.user_id = ?";
    params.push(req.user!.userId);
    if (status) {
      query += " AND d.status = ?";
      params.push(status);
    }
  }

  query += " ORDER BY d.created_at DESC";

  const disputes = db.prepare(query).all(...params);
  res.json({ disputes });
});

// ─── POST / (create dispute) ───────────────────────────────────────────────────

router.post("/", authMiddleware, (req: AuthRequest, res: Response) => {
  const parsed = createDisputeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const id = uuid();
  db.prepare(`
    INSERT INTO disputes (id, order_id, user_id, reason, status)
    VALUES (?, ?, ?, ?, 'open')
  `).run(id, parsed.data.order_id || null, req.user!.userId, parsed.data.reason);

  const dispute = db.prepare(`
    SELECT d.*, s.product as order_product, u.name as user_name
    FROM disputes d
    LEFT JOIN sales s ON d.order_id = s.id
    JOIN users u ON d.user_id = u.id
    WHERE d.id = ?
  `).get(id);

  res.status(201).json({ dispute });
});

// ─── GET /:id ──────────────────────────────────────────────────────────────────

router.get("/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const dispute = db.prepare(`
    SELECT d.*, s.product as order_product, u.name as user_name
    FROM disputes d
    LEFT JOIN sales s ON d.order_id = s.id
    JOIN users u ON d.user_id = u.id
    WHERE d.id = ?
  `).get(req.params.id) as any;

  if (!dispute) return res.status(404).json({ error: "Disputa não encontrada" });

  if (req.user!.role !== "admin" && dispute.user_id !== req.user!.userId) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  res.json({ dispute });
});

// ─── PATCH /:id (update status) ────────────────────────────────────────────────

router.patch("/:id", authMiddleware, requireRole("admin"), (req: AuthRequest, res: Response) => {
  const parsed = updateDisputeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const dispute = db.prepare("SELECT * FROM disputes WHERE id = ?").get(req.params.id);
  if (!dispute) return res.status(404).json({ error: "Disputa não encontrada" });

  db.prepare("UPDATE disputes SET status = ?, updated_at = datetime('now') WHERE id = ?").run(
    parsed.data.status,
    req.params.id
  );

  const updated = db.prepare(`
    SELECT d.*, s.product as order_product, u.name as user_name
    FROM disputes d
    LEFT JOIN sales s ON d.order_id = s.id
    JOIN users u ON d.user_id = u.id
    WHERE d.id = ?
  `).get(req.params.id);

  res.json({ dispute: updated });
});

// ─── DELETE /:id ───────────────────────────────────────────────────────────────

router.delete("/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const dispute = db.prepare("SELECT * FROM disputes WHERE id = ?").get(req.params.id) as any;
  if (!dispute) return res.status(404).json({ error: "Disputa não encontrada" });

  if (req.user!.role !== "admin" && dispute.user_id !== req.user!.userId) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  db.prepare("DELETE FROM disputes WHERE id = ?").run(req.params.id);
  res.json({ message: "Disputa removida com sucesso" });
});

export default router;
