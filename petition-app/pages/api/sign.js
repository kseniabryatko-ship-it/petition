const { getDb } = require("../../lib/db");

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { first_name, last_name, phone, consent } = req.body;
  if (!first_name || !last_name || !phone || !consent)
    return res.status(400).json({ error: "Все поля обязательны" });

  const db = getDb();
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "";
  const ua = req.headers["user-agent"] || "";

  await db.addSignature({ first_name: first_name.trim(), last_name: last_name.trim(), phone: phone.trim(), consent });
  await db.addLog({ action: "signed", ip, user_agent: ua, details: `${last_name.trim()} ${first_name.trim()} | ${phone.trim()} | согласие: ${consent}` });

  const redirect_url = await db.getSetting("redirect_url") || "";
  const count = await db.countSignatures();
  res.json({ success: true, count, redirect_url });
}
