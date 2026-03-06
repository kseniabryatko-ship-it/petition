const { getDb } = require("../../lib/db");

export default async function handler(req, res) {
  const db = getDb();
  const settings = await db.getSettings(["petition_title","petition_text","petition_image","goal","redirect_url"]);
  const count = await db.countSignatures();
  res.json({ ...settings, count });
}
