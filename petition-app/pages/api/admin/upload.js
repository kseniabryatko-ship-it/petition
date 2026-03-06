import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";

export const config = { api: { bodyParser: false } };
const SECRET = process.env.JWT_SECRET || "petition_secret_2024";

function auth(req) {
  try { jwt.verify((req.headers.authorization||"").replace("Bearer ",""), SECRET); return true; } catch { return false; }
}

export default async function handler(req, res) {
  if (!auth(req)) return res.status(401).json({ error: "Unauthorized" });
  if (req.method !== "POST") return res.status(405).end();

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = new IncomingForm({ uploadDir, keepExtensions: true, maxFileSize: 5 * 1024 * 1024 });
  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });
    const file = Array.isArray(files.image) ? files.image[0] : files.image;
    if (!file) return res.status(400).json({ error: "No file" });
    const filename = path.basename(file.filepath || file.path);
    res.json({ url: `/uploads/${filename}` });
  });
}
