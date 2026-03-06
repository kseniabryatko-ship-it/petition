const { put, get, list } = require('@vercel/blob');

const DB_KEY = 'petition-db/db.json';

const DEFAULTS = {
  settings: {
    petition_title: "Петиция о присвоении звания Героя Российской Федерации (посмертно)",
    petition_text: "Настоящим мы, нижеподписавшиеся граждане Российской Федерации, выражаем свою волю и обращаемся к Президенту Российской Федерации с ходатайством о присвоении звания **Героя Российской Федерации** (посмертно).\n\nСвоим беззаветным служением Отечеству, личным мужеством и самопожертвованием этот человек явил образец истинного патриотизма. Его подвиг сохранится в памяти народа навсегда.\n\nПросим рассмотреть настоящую петицию и принять решение о присвоении высшей государственной награды в знак признания заслуг перед Родиной.",
    redirect_url: "",
    petition_image: "",
    goal: "5000",
    admin_password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    user_password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
  },
  signatures: [],
  user_logs: [],
  next_sig_id: 1,
  next_log_id: 1
};

let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 2000; // 2 seconds

async function readDb() {
  // use cache to avoid too many blob reads
  if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache;

  try {
    const { blobs } = await list({ prefix: 'petition-db/' });
    const blob = blobs.find(b => b.pathname === DB_KEY);
    if (!blob) {
      _cache = JSON.parse(JSON.stringify(DEFAULTS));
      _cacheTime = Date.now();
      return _cache;
    }
    const res = await fetch(blob.url);
    const data = await res.json();
    // merge missing defaults
    if (!data.settings) data.settings = DEFAULTS.settings;
    else {
      for (const [k, v] of Object.entries(DEFAULTS.settings)) {
        if (data.settings[k] === undefined) data.settings[k] = v;
      }
    }
    if (!data.signatures) data.signatures = [];
    if (!data.user_logs) data.user_logs = [];
    if (!data.next_sig_id) data.next_sig_id = data.signatures.length + 1;
    if (!data.next_log_id) data.next_log_id = data.user_logs.length + 1;
    _cache = data;
    _cacheTime = Date.now();
    return data;
  } catch (e) {
    console.error('readDb error:', e);
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
}

async function writeDb(data) {
  _cache = data;
  _cacheTime = Date.now();
  await put(DB_KEY, JSON.stringify(data), {
    access: 'public',
    allowOverwrite: true,
    contentType: 'application/json'
  });
}

function getDb() {
  return {
    async getSetting(key) {
      const data = await readDb();
      return data.settings[key];
    },
    async getSettings(keys) {
      const data = await readDb();
      const result = {};
      for (const k of keys) result[k] = data.settings[k];
      return result;
    },
    async setSetting(key, value) {
      const data = await readDb();
      data.settings[key] = value;
      await writeDb(data);
    },
    async setSettings(obj) {
      const data = await readDb();
      Object.assign(data.settings, obj);
      await writeDb(data);
    },
    async addSignature({ first_name, last_name, phone, consent }) {
      const data = await readDb();
      const sig = {
        id: data.next_sig_id++,
        first_name, last_name, phone, consent,
        created_at: new Date().toISOString()
      };
      data.signatures.push(sig);
      await writeDb(data);
      return sig;
    },
    async getSignatures() {
      const data = await readDb();
      return [...data.signatures].reverse();
    },
    async countSignatures() {
      const data = await readDb();
      return data.signatures.length;
    },
    async addLog({ action, ip, user_agent, details }) {
      const data = await readDb();
      const log = {
        id: data.next_log_id++,
        action, ip: ip || "", user_agent: user_agent || "", details: details || "",
        created_at: new Date().toISOString()
      };
      data.user_logs.push(log);
      if (data.user_logs.length > 500) data.user_logs = data.user_logs.slice(-500);
      await writeDb(data);
      return log;
    },
    async getLogs() {
      const data = await readDb();
      return [...data.user_logs].reverse().slice(0, 500);
    }
  };
}

module.exports = { getDb };
