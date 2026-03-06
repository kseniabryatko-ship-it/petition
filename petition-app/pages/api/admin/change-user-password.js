const { getDb } = require("../../../lib/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "petition_secret_2024";

function auth(req) {
  try { jwt.verify((req.headers.authorization||"").replace("Bearer ",""), SECRET); return true; } catch { return false; }
}

export default async function handler(req, res) {
  if (!auth(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).end();
  const { new_password } = req.body;
  if (!new_password || new_password.length < 4)
    return res.status(400).json({ error: "Пароль должен быть не менее 4 символов" });
  const hash = await bcrypt.hash(new_password, 10);
  await getDb().setSetting("user_password", hash);
  res.json({ success: true });
}
