import { Router, Response } from "express";
import { v4 as uuid } from "uuid";
import z from "zod";
import db from "../db/index.js";
import { authMiddleware, requireRole, AuthRequest } from "../middleware/auth.js";

const router = Router();

// ─── Validation ──────────────────────────────────────────────────────────────────

const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  old_price: z.number().optional(),
  category: z.string().optional(),
  thumb: z.string().optional(),
  discount: z.number().optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  old_price: z.number().optional(),
  category: z.string().optional(),
  thumb: z.string().optional(),
  discount: z.number().optional(),
  active: z.boolean().optional(),
});

// ─── GET / (list products) ─────────────────────────────────────────────────────

router.get("/", authMiddleware, (req: AuthRequest, res: Response) => {
  const { category, search } = req.query;
  let query = "SELECT * FROM products WHERE active = 1";
  const params: any[] = [];

  if (category) {
    query += " AND category = ?";
    params.push(category);
  }
  if (search) {
    query += " AND (name LIKE ? OR description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  query += " ORDER BY created_at DESC";

  const products = db.prepare(query).all(...params);
  res.json({ products });
});

// ─── POST / (create product) ───────────────────────────────────────────────────

router.post("/", authMiddleware, requireRole("admin"), (req: AuthRequest, res: Response) => {
  const parsed = createProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const id = uuid();
  const { name, description, price, old_price, category, thumb, discount } = parsed.data;

  db.prepare(`
    INSERT INTO products (id, name, description, price, old_price, category, thumb, discount, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `).run(id, name, description || "", price, old_price || 0, category || "", thumb || "", discount || 0);

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(id);
  res.status(201).json({ product });
});

// ─── GET /:id ──────────────────────────────────────────────────────────────────

router.get("/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "Produto não encontrado" });
  res.json({ product });
});

// ─── PUT /:id (update product) ─────────────────────────────────────────────────

router.put("/:id", authMiddleware, requireRole("admin"), (req: AuthRequest, res: Response) => {
  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "Produto não encontrado" });

  const updates: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(parsed.data)) {
    if (value !== undefined) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "Nenhum campo para atualizar" });
  }

  updates.push("updated_at = datetime('now')");
  values.push(req.params.id);

  db.prepare(`UPDATE products SET ${updates.join(", ")} WHERE id = ?`).run(...values);

  const updated = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  res.json({ product: updated });
});

// ─── DELETE /:id ───────────────────────────────────────────────────────────────

router.delete("/:id", authMiddleware, requireRole("admin"), (req: AuthRequest, res: Response) => {
  const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id);
  if (!product) return res.status(404).json({ error: "Produto não encontrado" });

  db.prepare("UPDATE products SET active = 0, updated_at = datetime('now') WHERE id = ?").run(req.params.id);
  res.json({ message: "Produto removido com sucesso" });
});

export default router;
