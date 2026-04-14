import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { initDb } from "./db/index.js";

async function seed() {
  console.log("Seeding database...");

  const db = await initDb();

  // Clean existing data
  db.exec("DELETE FROM refresh_tokens");
  db.exec("DELETE FROM sales");
  db.exec("DELETE FROM subscriptions");
  db.exec("DELETE FROM users");

  const hash = (pw: string) => bcrypt.hashSync(pw, 12);

  // Seed users
  const users = [
    { id: uuid(), name: "Pedro Palheta", email: "palheta@email.com", password: hash("123456"), role: "admin", plan: "pro", avatar: "", phone: "+55 (61) 90000-0000" },
    { id: uuid(), name: "Maria Santos", email: "maria@email.com", password: hash("123456"), role: "seller", plan: "starter", avatar: "", phone: "+55 (21) 98888-1111" },
    { id: uuid(), name: "Joao Oliveira", email: "joao@email.com", password: hash("123456"), role: "buyer", plan: "free", avatar: "", phone: "+55 (31) 97777-2222" },
    { id: uuid(), name: "Ana Costa", email: "ana@email.com", password: hash("123456"), role: "seller", plan: "pro", avatar: "", phone: "+55 (41) 96666-3333" },
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, plan, avatar, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const u of users) {
    insertUser.run(u.id, u.name, u.email, u.password, u.role, u.plan, u.avatar, u.phone);
  }

  // Seed subscriptions
  const now = new Date();
  const expDate = new Date(now);
  expDate.setMonth(expDate.getMonth() + 1);

  const insertSub = db.prepare(`
    INSERT INTO subscriptions (id, user_id, plan, status, starts_at, expires_at)
    VALUES (?, ?, ?, 'active', ?, ?)
  `);

  for (const u of users) {
    insertSub.run(uuid(), u.id, u.plan, now.toISOString(), expDate.toISOString());
  }

  // Seed sales
  const insertSale = db.prepare(`
    INSERT INTO sales (id, seller_id, buyer_id, product, specs, amount, status, thumb)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const salesData = [
    { id: uuid(), seller_id: users[1].id, buyer_id: users[2].id, product: "Camera Sony A7 IV", specs: "33MP Full-Frame 4K60", amount: 19490, status: "paid", thumb: "camera" },
    { id: uuid(), seller_id: users[3].id, buyer_id: users[2].id, product: "Monitor LG UltraWide", specs: '34" 144Hz QHD', amount: 4899, status: "processing", thumb: "monitor" },
    { id: uuid(), seller_id: users[1].id, buyer_id: users[0].id, product: "Teclado Keychron Q5", specs: "96% Gateron Pro RGB", amount: 1290, status: "shipped", thumb: "keyboard" },
    { id: uuid(), seller_id: users[3].id, buyer_id: users[0].id, product: "SSD Samsung 990 Pro", specs: "2TB NVMe Gen4", amount: 899, status: "paid", thumb: "ssd" },
    { id: uuid(), seller_id: users[1].id, buyer_id: users[2].id, product: "iPhone 16 Pro", specs: "256GB Titanio A18 Pro", amount: 9299, status: "delivered", thumb: "phone" },
    { id: uuid(), seller_id: users[3].id, buyer_id: users[0].id, product: "MacBook Pro M4", specs: "16GB 512GB 14", amount: 18999, status: "pending", thumb: "laptop" },
  ];

  for (const s of salesData) {
    insertSale.run(s.id, s.seller_id, s.buyer_id, s.product, s.specs, s.amount, s.status, s.thumb);
  }

  console.log("Seed complete!");
  console.log(`- ${users.length} users`);
  console.log(`- ${salesData.length} sales`);
  console.log("\nLogin credentials:");
  users.forEach((u) => console.log(`  ${u.email} / 123456 (${u.role})`));
}

seed().catch(console.error);
