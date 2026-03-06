const { getDb } = require("../../lib/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "petition_secret_2024";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { password } = req.body;
  const db = getDb();
  const hash = await db.getSetting("user_password");
  const valid = await bcrypt.compare(password, hash);
  if (!valid) return res.status(401).json({ error: "Неверный пароль" });
  const token = jwt.sign({ role: "user" }, SECRET, { expiresIn: "12h" });
  res.json({ token });
}
