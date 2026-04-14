import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import z from "zod";
import db from "../db/index.js";
import { authMiddleware, JWT_SECRET, AuthRequest } from "../middleware/auth.js";

const router = Router();

// ─── Validation schemas ──────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres").max(100),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────────

function generateToken(user: { id: string; email: string; role: string; plan: string }) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role, plan: user.plan },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, type: "refresh" }, JWT_SECRET, { expiresIn: "7d" });
}

function sanitizeUser(user: any) {
  const { password, ...rest } = user;
  return rest;
}

// ─── POST /register ───────────────────────────────────────────────────────────────

router.post("/register", (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { name, email, password, phone } = parsed.data;

  // Check if email already exists
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email) as any;
  if (existing) {
    return res.status(409).json({ error: "Email já cadastrado" });
  }

  const hashedPw = bcrypt.hashSync(password, 12);
  const id = uuid();

  db.prepare(`
    INSERT INTO users (id, name, email, password, role, plan, phone)
    VALUES (?, ?, ?, ?, 'buyer', 'free', ?)
  `).run(id, name, email, hashedPw, phone || "");

  // Create free subscription
  db.prepare(`
    INSERT INTO subscriptions (id, user_id, plan, status, starts_at, expires_at)
    VALUES (?, ?, 'free', 'active', datetime('now'), datetime('now', '+100 years'))
  `).run(uuid(), id);

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(id);

  // Store refresh token
  const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
  db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token, expires_at)
    VALUES (?, ?, ?, datetime('now', '+7 days'))
  `).run(uuid(), id, refreshToken);

  res.status(201).json({
    user: sanitizeUser(user),
    token,
    refreshToken,
  });
});

// ─── POST /login ──────────────────────────────────────────────────────────────────

router.post("/login", (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
  }

  const { email, password } = parsed.data;

  const user = db.prepare("SELECT * FROM users WHERE email = ? AND active = 1").get(email) as any;
  if (!user) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }

  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token
  db.prepare(`
    INSERT INTO refresh_tokens (id, user_id, token, expires_at)
    VALUES (?, ?, ?, datetime('now', '+7 days'))
  `).run(uuid(), user.id, refreshToken);

  // Clean up old refresh tokens for this user (keep last 5)
  const tokens = db.prepare("SELECT id FROM refresh_tokens WHERE user_id = ? ORDER BY created_at DESC").all(user.id) as any[];
  if (tokens.length > 5) {
    const toDelete = tokens.slice(5).map((t: any) => t.id);
    db.prepare(`DELETE FROM refresh_tokens WHERE id IN (${toDelete.map(() => "?").join(",")})`).run(...toDelete);
  }

  // Update user's plan to match their active subscription
  const sub = db.prepare("SELECT plan FROM subscriptions WHERE user_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1").get(user.id) as any;
  if (sub && sub.plan !== user.plan) {
    db.prepare("UPDATE users SET plan = ?, updated_at = datetime('now') WHERE id = ?").run(sub.plan, user.id);
  }

  res.json({
    user: sanitizeUser(user),
    token,
    refreshToken,
  });
});

// ─── POST /refresh ────────────────────────────────────────────────────────────────

router.post("/refresh", (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token não fornecido" });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any;
    if (decoded.type !== "refresh") {
      return res.status(401).json({ error: "Token inválido" });
    }

    // Check if token exists in DB
    const stored = db.prepare("SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ?").get(refreshToken, decoded.userId) as any;
    if (!stored) {
      return res.status(401).json({ error: "Refresh token revogado" });
    }

    const user = db.prepare("SELECT * FROM users WHERE id = ? AND active = 1").get(decoded.userId) as any;
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    const newToken = generateToken(user);
    res.json({ token: newToken });
  } catch {
    return res.status(401).json({ error: "Refresh token inválido ou expirado" });
  }
});

// ─── POST /logout ────────────────────────────────────────────────────────────────

router.post("/logout", authMiddleware, (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    db.prepare("DELETE FROM refresh_tokens WHERE token = ?").run(refreshToken);
  }
  res.json({ message: "Logout realizado com sucesso" });
});

// ─── GET /me ──────────────────────────────────────────────────────────────────────

router.get("/me", authMiddleware, (req: AuthRequest, res: Response) => {
  const user = db.prepare("SELECT id, name, email, role, plan, avatar, phone, active, created_at FROM users WHERE id = ?").get(req.user!.userId) as any;
  if (!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  res.json({ user });
});

export default router;