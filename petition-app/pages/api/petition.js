const { getDb } = require("../../lib/db");

export default function handler(req, res) {
  const db = getDb();
  const settings = db.getSettings(["petition_title","petition_text","petition_image","goal","redirect_url"]);
  const count = db.countSignatures();
  res.json({ ...settings, count });
}
