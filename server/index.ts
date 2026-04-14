import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { initDb } from "./db/index.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import salesRoutes from "./routes/sales.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import disputeRoutes from "./routes/disputes.js";
import productRoutes from "./routes/products.js";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// ─── Security Middleware ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: "Muitas tentativas. Tente novamente em 15 minutos." } });
const apiLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 100, message: { error: "Rate limit excedido." } });

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// ─── Routes ──────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/products", productRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Error handler ───────────────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ error: err.message || "Erro interno do servidor" });
});

// ─── Start server after DB is ready ──────────────────────────────────────────────
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Palhetta API rodando na porta ${PORT}`);
  });
}).catch((err) => {
  console.error("Failed to initialize database:", err);
  process.exit(1);
});
