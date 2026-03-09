const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const DEFAULTS = {
  settings: {
    petition_title: "Петиция о присвоении звания Героя Российской Федерации (посмертно)",
    petition_text: "Настоящим мы, нижеподписавшиеся граждане Российской Федерации, выражаем свою волю и обращаемся к Президенту Российской Федерации с ходатайством о присвоении звания **Героя Российской Федерации** (посмертно).\n\nСвоим беззаветным служением Отечеству, личным мужеством и самопожертвованием этот человек явил образец истинного патриотизма. Его подвиг сохранится в памяти народа навсегда.\n\nПросим рассмотреть настоящую петицию и принять решение о присвоении высшей государственной награды в знак признания заслуг перед Родиной.",
    redirect_url: "",
    petition_image: "",
    goal: "5000",
    admin_password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
    user_password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
  }
};

function getDb() {
  return {
    async getSetting(key) {
      const val = await redis.hget('settings', key);
      return val !== null ? val : DEFAULTS.settings[key];
    },
    async getSettings(keys) {
      const result = {};
      for (const k of keys) {
        const val = await redis.hget('settings', k);
        result[k] = val !== null ? val : DEFAULTS.settings[k];
      }
      return result;
    },
    async setSetting(key, value) {
      await redis.hset('settings', { [key]: value });
    },
    async setSettings(obj) {
      await redis.hset('settings', obj);
    },
    async addSignature({ first_name, last_name, phone, consent }) {
      const id = await redis.incr('sig:counter');
      const sig = { id, first_name, last_name, phone, consent, created_at: new Date().toISOString() };
      await redis.lpush('signatures', JSON.stringify(sig));
      return sig;
    },
    async getSignatures() {
      const items = await redis.lrange('signatures', 0, -1);
      return items.map(i => typeof i === 'string' ? JSON.parse(i) : i);
    },
    async countSignatures() {
      return await redis.llen('signatures');
    },
    async addLog({ action, ip, user_agent, details }) {
      const id = await redis.incr('log:counter');
      const log = { id, action, ip: ip || '', user_agent: user_agent || '', details: details || '', created_at: new Date().toISOString() };
      await redis.lpush('logs', JSON.stringify(log));
      await redis.ltrim('logs', 0, 499);
      return log;
    },
    async getLogs() {
      const items = await redis.lrange('logs', 0, 499);
      return items.map(i => typeof i === 'string' ? JSON.parse(i) : i);
    }
  };
}

module.exports = { getDb };
