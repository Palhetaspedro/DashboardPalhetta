import { Router, Response } from "express";
import { v4 as uuid } from "uuid";
import db from "../db/index.js";
import { authMiddleware, requireRole, AuthRequest } from "../middleware/auth.js";

const router = Router();

// ─── Plans configuration ──────────────────────────────────────────────────────────

export const PLANS = {
  free:       { name: "Free",       price: 0,     features: ["5 vendas/mês", "Dashboard básico", "Suporte email"],          maxSales: 5 },
  starter:    { name: "Starter",    price: 49.90,  features: ["50 vendas/mês", "Dashboard completo", "Suporte prioritário", "Relatórios"], maxSales: 50 },
  pro:        { name: "Pro",        price: 149.90, features: ["Vendas ilimitadas", "API Access", "Webhooks", "Suporte 24/7", "Relatórios avançados"], maxSales: -1 },
  enterprise: { name: "Enterprise", price: 499.90, features: ["Tudo do Pro", "SLA garantido", "Gerente dedicado", "Integrações custom", "SSO/SAML"], maxSales: -1 },
};

// ─── GET /plans ──────────────────────────────────────────────────────────────────

router.get("/plans", (_req, res: Response) => {
  res.json({ plans: PLANS });
});

// ─── GET /current ───────────────────────────────────────────────────────────────

router.get("/current", authMiddleware, (req: AuthRequest, res: Response) => {
  const sub = db.prepare(`
    SELECT s.*, u.name as user_name, u.email as user_email
    FROM subscriptions s
    JOIN users u ON s.user_id = u.id
    WHERE s.user_id = ? AND s.status = 'active'
    ORDER BY s.created_at DESC LIMIT 1
  `).get(req.user!.userId) as any;

  if (!sub) {
    return res.json({ subscription: null, plan: PLANS.free });
  }

  res.json({ subscription: sub, plan: PLANS[sub.plan as keyof typeof PLANS] });
});

// ─── POST /subscribe ─────────────────────────────────────────────────────────────

router.post("/subscribe", authMiddleware, (req: AuthRequest, res: Response) => {
  const { plan } = req.body;
  if (!plan || !PLANS[plan as keyof typeof PLANS]) {
    return res.status(400).json({ error: "Plano inválido" });
  }

  const userId = req.user!.userId;
  const id = uuid();

  // Expire current subscription
  db.prepare("UPDATE subscriptions SET status = 'expired' WHERE user_id = ? AND status = 'active'").run(userId);

  // Create new subscription
  const now = new Date();
  const expires = new Date(now);
  expires.setMonth(expires.getMonth() + 1);

  db.prepare(`
    INSERT INTO subscriptions (id, user_id, plan, status, starts_at, expires_at)
    VALUES (?, ?, ?, 'active', ?, ?)
  `).run(id, userId, plan, now.toISOString(), expires.toISOString());

  // Update user plan
  db.prepare("UPDATE users SET plan = ?, updated_at = datetime('now') WHERE id = ?").run(plan, userId);

  const sub = db.prepare("SELECT * FROM subscriptions WHERE id = ?").get(id);
  res.status(201).json({ subscription: sub, plan: PLANS[plan as keyof typeof PLANS] });
});

// ─── POST /cancel ────────────────────────────────────────────────────────────────

router.post("/cancel", authMiddleware, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  db.prepare("UPDATE subscriptions SET status = 'cancelled' WHERE user_id = ? AND status = 'active'").run(userId);
  db.prepare("UPDATE users SET plan = 'free', updated_at = datetime('now') WHERE id = ?").run(userId);

  res.json({ message: "Assinatura cancelada com sucesso" });
});

// ─── GET /admin/all (admin) ──────────────────────────────────────────────────────

router.get("/admin/all", authMiddleware, requireRole("admin"), (_req: AuthRequest, res: Response) => {
  const subs = db.prepare(`
    SELECT s.*, u.name as user_name, u.email as user_email
    FROM subscriptions s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.created_at DESC
  `).all();

  res.json({ subscriptions: subs });
});

export default router;