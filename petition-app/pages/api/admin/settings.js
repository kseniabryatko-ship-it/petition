const { getDb } = require("../../../lib/db");
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "petition_secret_2024";

function auth(req) {
  try { jwt.verify((req.headers.authorization||"").replace("Bearer ",""), SECRET); return true; } catch { return false; }
}

export default async function handler(req, res) {
  if (!auth(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).end();
  const allowed = ["petition_title","petition_text","redirect_url","petition_image","goal"];
  const update = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }
  await getDb().setSettings(update);
  res.json({ success: true });
}
