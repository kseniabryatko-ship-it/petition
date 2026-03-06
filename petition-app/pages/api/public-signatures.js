const { getDb } = require("../../lib/db");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "petition_secret_2024";

export default function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try { jwt.verify(token, SECRET); } catch { return res.status(401).json({ error: "Unauthorized" }); }

  const db = getDb();
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
  const ua = req.headers["user-agent"] || "";
  db.addLog({ action: "view_signatures", ip, user_agent: ua, details: "Открыл страницу подписей" });

  const signatures = db.getSignatures().map(s => ({
    id: s.id,
    name: `${s.last_name} ${s.first_name}`,
    phone: s.phone,
    created_at: s.created_at,
  }));
  res.json({ signatures });
}
