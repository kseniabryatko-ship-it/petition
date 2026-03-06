const { getDb } = require("../../../lib/db");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "petition_secret_2024";

function auth(req) {
  try { jwt.verify((req.headers.authorization||"").replace("Bearer ",""), SECRET); return true; } catch { return false; }
}

export default async function handler(req, res) {
  if (!auth(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "GET") return res.status(405).end();
  res.json({ logs: await getDb().getLogs() });
}
