import { Router, Response } from "express";
import z from "zod";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";
import db from "../db/index.js";
import { authMiddleware, requireRole, AuthRequest } from "../middleware/auth.js";

const router = Router();

// ─── GET / (list - admin only) ────────────────────────────────────────────────────

router.get("/", authMiddleware, requireRole("admin"), (_req: AuthRequest, res: Response) => {
  const users = db.prepare("SELECT id, name, email, role, plan, phone, active, created_at FROM users ORDER BY created_at DESC").all();
  res.json({ users });
});

// ─── GET /:id ─────────────────────────────────────────────────────────────────────

router.get("/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Users can only view themselves (unless admin)
  if (req.user!.role !== "admin" && req.user!.userId !== id) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const user = db.prepare("SELECT id, name, email, role, plan, avatar, phone, active, created_at FROM users WHERE id = ?").get(id) as any;
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  res.json({ user });
});

// ─── PUT /:id (update) ──────────────────────────────────────────────────────────

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(["admin", "seller", "buyer"]).optional(),
  plan: z.enum(["free", "starter", "pro", "enterprise"]).optional(),
  active: z.boolean().optional(),
});

router.put("/:id", authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  // Users can only update themselves (unless admin)
  if (req.user!.role !== "admin" && req.user!.userId !== id) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

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
  values.push(id);

  db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(...values);

  const updated = db.prepare("SELECT id, name, email, role, plan, avatar, phone, active, created_at FROM users WHERE id = ?").get(id);
  res.json({ user: updated });
});

// ─── PUT /:id/password ───────────────────────────────────────────────────────────

router.put("/:id/password", authMiddleware, (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (req.user!.role !== "admin" && req.user!.userId !== id) {
    return res.status(403).json({ error: "Acesso negado" });
  }

  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Nova senha deve ter ao menos 6 caracteres" });
  }

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  // Verify current password (unless admin changing someone else)
  if (req.user!.userId === id) {
    if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ error: "Senha atual incorreta" });
    }
  }

  const hashed = bcrypt.hashSync(newPassword, 12);
  db.prepare("UPDATE users SET password = ?, updated_at = datetime('now') WHERE id = ?").run(hashed, id);

  res.json({ message: "Senha atualizada com sucesso" });
});

// ─── DELETE /:id ─────────────────────────────────────────────────────────────────

router.delete("/:id", authMiddleware, requireRole("admin"), (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  // Soft delete - deactivate
  db.prepare("UPDATE users SET active = 0, updated_at = datetime('now') WHERE id = ?").run(id);

  // Revoke all refresh tokens
  db.prepare("DELETE FROM refresh_tokens WHERE user_id = ?").run(id);

  res.json({ message: "Usuário desativado com sucesso" });
});

export default router;