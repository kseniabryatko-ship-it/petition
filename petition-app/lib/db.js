const path = require("path");
const fs = require("fs");

const DATA_PATH = path.join(process.cwd(), "data", "db.json");
const dataDir = path.dirname(DATA_PATH);

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

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

function readDb() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(DEFAULTS, null, 2), "utf8");
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    // merge missing defaults
    if (!data.settings) data.settings = DEFAULTS.settings;
    else {
      for (const [k, v] of Object.entries(DEFAULTS.settings)) {
        if (data.settings[k] === undefined) data.settings[k] = v;
      }
    }
    if (!data.signatures) data.signatures = [];
    if (!data.user_logs) data.user_logs = [];
    if (!data.next_sig_id) data.next_sig_id = (data.signatures.length || 0) + 1;
    if (!data.next_log_id) data.next_log_id = (data.user_logs.length || 0) + 1;
    return data;
  } catch {
    return JSON.parse(JSON.stringify(DEFAULTS));
  }
}

function writeDb(data) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), "utf8");
}

function getDb() {
  const data = readDb();
  return {
    // settings
    getSetting(key) {
      return data.settings[key];
    },
    getSettings(keys) {
      const result = {};
      for (const k of keys) result[k] = data.settings[k];
      return result;
    },
    setSetting(key, value) {
      data.settings[key] = value;
      writeDb(data);
    },
    setSettings(obj) {
      Object.assign(data.settings, obj);
      writeDb(data);
    },

    // signatures
    addSignature({ first_name, last_name, phone, consent }) {
      const sig = {
        id: data.next_sig_id++,
        first_name, last_name, phone, consent,
        created_at: new Date().toISOString()
      };
      data.signatures.push(sig);
      writeDb(data);
      return sig;
    },
    getSignatures() {
      return [...data.signatures].reverse();
    },
    countSignatures() {
      return data.signatures.length;
    },

    // logs
    addLog({ action, ip, user_agent, details }) {
      const log = {
        id: data.next_log_id++,
        action, ip: ip || "", user_agent: user_agent || "", details: details || "",
        created_at: new Date().toISOString()
      };
      data.user_logs.push(log);
      // keep only last 500
      if (data.user_logs.length > 500) data.user_logs = data.user_logs.slice(-500);
      writeDb(data);
      return log;
    },
    getLogs() {
      return [...data.user_logs].reverse().slice(0, 500);
    }
  };
}

module.exports = { getDb };
