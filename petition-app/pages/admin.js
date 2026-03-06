import { useState, useEffect, useRef } from "react";
import Head from "next/head";

const ACTION_LABELS = {
  signed: { label: "✍️ Подписал", color: "#2a7a2a", bg: "#edfaed" },
  view_signatures: { label: "👁️ Просмотр подписей", color: "#1a4a8a", bg: "#edf3fa" },
};

export default function Admin() {
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("signatures");
  const [signatures, setSignatures] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logFilter, setLogFilter] = useState("all");
  const [settings, setSettings] = useState({ petition_title: "", petition_text: "", redirect_url: "", petition_image: "", goal: "5000" });
  const [saveMsg, setSaveMsg] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [newUserPass, setNewUserPass] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const fileRef = useRef();

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (token) {
      loadSignatures();
      loadSettings();
      loadLogs();
    }
  }, [token]);

  const login = async () => {
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).then(x => x.json());
    if (r.token) { setToken(r.token); localStorage.setItem("admin_token", r.token); setLoginError(""); }
    else setLoginError("Неверный пароль");
  };

  const logout = () => { setToken(null); localStorage.removeItem("admin_token"); };

  const loadSignatures = async () => {
    const r = await fetch("/api/admin/signatures", { headers: { Authorization: `Bearer ${token}` } }).then(x => x.json());
    if (r.signatures) setSignatures(r.signatures);
  };

  const loadLogs = async () => {
    const r = await fetch("/api/admin/logs", { headers: { Authorization: `Bearer ${token}` } }).then(x => x.json());
    if (r.logs) setLogs(r.logs);
  };

  const loadSettings = async () => {
    const r = await fetch("/api/petition").then(x => x.json());
    setSettings({ petition_title: r.petition_title || "", petition_text: r.petition_text || "", redirect_url: r.redirect_url || "", petition_image: r.petition_image || "", goal: r.goal || "5000" });
  };

  const changeUserPassword = async () => {
    if (!newUserPass.trim()) return;
    const r = await fetch("/api/admin/change-user-password", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ new_password: newUserPass }),
    }).then(x => x.json());
    if (r.success) {
      setPassMsg("Пароль изменён ✓");
      setNewUserPass("");
      setTimeout(() => setPassMsg(""), 3000);
    } else {
      setPassMsg(r.error || "Ошибка");
    }
  };

  const saveSettings = async () => {
    await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(settings),
    });
    setSaveMsg("Сохранено ✓");
    setTimeout(() => setSaveMsg(""), 2500);
  };

  const uploadImage = async (file) => {
    setImageUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    const r = await fetch("/api/admin/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd }).then(x => x.json());
    if (r.url) setSettings(st => ({ ...st, petition_image: r.url }));
    setImageUploading(false);
  };

  const filteredLogs = logFilter === "all" ? logs : logs.filter(l => l.action === logFilter);

  const css = {
    container: { minHeight: "100vh", background: "#f7f4ee", fontFamily: "'Segoe UI', Georgia, sans-serif" },
    header: { background: "#1a1610", borderBottom: "3px solid #c8a84b", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" },
    card: { background: "#fff", border: "1px solid #ddd6c2", borderRadius: 6, padding: "28px 32px", marginBottom: 24 },
    label: { fontSize: 13, color: "#555", display: "block", marginBottom: 6, fontWeight: 600 },
    input: { width: "100%", border: "1.5px solid #c5b99a", borderRadius: 4, padding: "10px 13px", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fdfaf4", fontFamily: "Georgia, serif" },
    textarea: { width: "100%", border: "1.5px solid #c5b99a", borderRadius: 4, padding: "10px 13px", fontSize: 14, outline: "none", boxSizing: "border-box", background: "#fdfaf4", fontFamily: "Georgia, serif", minHeight: 200, resize: "vertical" },
    btn: { background: "#c8a84b", color: "#1a1610", border: "none", borderRadius: 4, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" },
    tabBtn: (active) => ({ padding: "10px 22px", cursor: "pointer", border: "none", background: active ? "#c8a84b" : "transparent", color: active ? "#1a1610" : "#555", fontWeight: active ? 700 : 400, borderRadius: "4px 4px 0 0", fontSize: 14, transition: "all 0.2s" }),
    th: { padding: "11px 14px", textAlign: "left", background: "#f5edd8", fontSize: 13, fontWeight: 700, color: "#4a3e28", borderBottom: "2px solid #e8d9b0" },
    td: { padding: "11px 14px", fontSize: 13, color: "#333", borderBottom: "1px solid #f0e8d5" },
  };

  if (!token) return (
    <div style={{ minHeight: "100vh", background: "#f2ede3", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Head><title>Вход — Администратор</title></Head>
      <div style={{ background: "#fff", border: "1px solid #d9d0bc", borderTop: "4px solid #c8a84b", borderRadius: 6, padding: "40px 40px 32px", width: 360 }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, marginBottom: 24, color: "#1a1610" }}>Панель администратора</div>
        <label style={css.label}>Пароль</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && login()}
          style={{ ...css.input, marginBottom: 8 }} placeholder="Введите пароль" />
        {loginError && <div style={{ color: "#b00", fontSize: 13, marginBottom: 10 }}>{loginError}</div>}
        <button onClick={login} style={{ ...css.btn, width: "100%", marginTop: 8, padding: "12px 0" }}>Войти</button>
        <div style={{ fontSize: 12, color: "#aaa", marginTop: 14, textAlign: "center" }}>По умолчанию: password</div>
      </div>
    </div>
  );

  return (
    <div style={css.container}>
      <Head><title>Администратор — Петиция</title></Head>
      <div style={css.header}>
        <span style={{ color: "#c8a84b", fontWeight: 700, fontSize: 17, letterSpacing: "0.06em" }}>⚙️ Панель администратора</span>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <a href="/" target="_blank" style={{ color: "#c8a84b", fontSize: 13, textDecoration: "none" }}>Сайт ↗</a>
          <a href="/signatures" target="_blank" style={{ color: "#c8a84b", fontSize: 13, textDecoration: "none" }}>Подписи ↗</a>
          <button onClick={logout} style={{ background: "transparent", border: "1px solid #555", color: "#aaa", borderRadius: 4, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>Выйти</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", borderBottom: "2px solid #c8a84b", marginBottom: 28 }}>
          <button style={css.tabBtn(tab === "signatures")} onClick={() => setTab("signatures")}>📋 Подписи ({signatures.length})</button>
          <button style={css.tabBtn(tab === "logs")} onClick={() => { setTab("logs"); loadLogs(); }}>🕵️ Лог действий ({logs.length})</button>
          <button style={css.tabBtn(tab === "settings")} onClick={() => setTab("settings")}>⚙️ Настройки</button>
        </div>

        {/* SIGNATURES */}
        {tab === "signatures" && (
          <div style={css.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 18 }}>Полный список подписей</h2>
              <button onClick={loadSignatures} style={{ ...css.btn, padding: "7px 16px", fontSize: 13 }}>Обновить</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>{["№","Имя","Фамилия","Телефон","Уведомления","Дата и время"].map(h => <th key={h} style={css.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {signatures.length === 0 ? (
                    <tr><td colSpan={6} style={{ ...css.td, textAlign: "center", color: "#aaa", padding: 32 }}>Подписей пока нет</td></tr>
                  ) : signatures.map((sig, i) => (
                    <tr key={sig.id} style={{ background: i % 2 === 0 ? "#fff" : "#fdfaf4" }}>
                      <td style={css.td}>{sig.id}</td>
                      <td style={css.td}>{sig.first_name}</td>
                      <td style={css.td}>{sig.last_name}</td>
                      <td style={{ ...css.td, fontFamily: "monospace" }}>{sig.phone}</td>
                      <td style={css.td}>{sig.consent === "yes" ? "✅ Да" : "❌ Нет"}</td>
                      <td style={css.td}>{new Date(sig.created_at).toLocaleString("ru-RU")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LOGS */}
        {tab === "logs" && (
          <div style={css.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: 18 }}>Лог действий пользователей</h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select value={logFilter} onChange={e => setLogFilter(e.target.value)}
                  style={{ border: "1.5px solid #c5b99a", borderRadius: 4, padding: "7px 12px", fontSize: 13, background: "#fdfaf4", cursor: "pointer" }}>
                  <option value="all">Все действия</option>
                  <option value="signed">Только подписи</option>
                  <option value="view_signatures">Только просмотры</option>
                </select>
                <button onClick={loadLogs} style={{ ...css.btn, padding: "7px 16px", fontSize: 13 }}>Обновить</button>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Всего событий", value: logs.length, icon: "📊" },
                { label: "Подписей", value: logs.filter(l => l.action === "signed").length, icon: "✍️" },
                { label: "Просмотров списка", value: logs.filter(l => l.action === "view_signatures").length, icon: "👁️" },
              ].map(stat => (
                <div key={stat.label} style={{ background: "#fdfaf4", border: "1px solid #e8d9b0", borderRadius: 6, padding: "14px 18px" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#1a1610", fontFamily: "Georgia, serif" }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["№","Действие","Детали","IP-адрес","Браузер / ОС","Дата и время"].map(h => <th key={h} style={css.th}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {filteredLogs.length === 0 ? (
                    <tr><td colSpan={6} style={{ ...css.td, textAlign: "center", color: "#aaa", padding: 32 }}>Событий нет</td></tr>
                  ) : filteredLogs.map((log, i) => {
                    const info = ACTION_LABELS[log.action] || { label: log.action, color: "#555", bg: "#f5f5f5" };
                    const ua = log.user_agent || "";
                    const browser = ua.includes("Edg") ? "Edge" : ua.includes("Chrome") ? "Chrome" : ua.includes("Firefox") ? "Firefox" : ua.includes("Safari") ? "Safari" : "Другой";
                    const os = ua.includes("Windows") ? "Windows" : ua.includes("Mac") ? "macOS" : ua.includes("Android") ? "Android" : ua.includes("iPhone") ? "iOS" : "Другое";
                    return (
                      <tr key={log.id} style={{ background: i % 2 === 0 ? "#fff" : "#fdfaf4" }}>
                        <td style={{ ...css.td, color: "#aaa", width: 40 }}>{log.id}</td>
                        <td style={css.td}>
                          <span style={{ background: info.bg, color: info.color, padding: "3px 10px", borderRadius: 12, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>{info.label}</span>
                        </td>
                        <td style={{ ...css.td, maxWidth: 280, fontSize: 13 }}>{log.details || "—"}</td>
                        <td style={{ ...css.td, fontFamily: "monospace", fontSize: 12, color: "#555" }}>{log.ip || "—"}</td>
                        <td style={{ ...css.td, fontSize: 12, color: "#555" }}>{browser} / {os}</td>
                        <td style={{ ...css.td, whiteSpace: "nowrap", fontSize: 12 }}>{new Date(log.created_at).toLocaleString("ru-RU")}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filteredLogs.length > 0 && (
              <div style={{ textAlign: "right", marginTop: 10, fontSize: 12, color: "#aaa" }}>Показано {filteredLogs.length} событий (последние 500)</div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {tab === "settings" && (
          <div>
            <div style={css.card}>
              <h2 style={{ margin: "0 0 22px 0", fontFamily: "Georgia, serif", fontSize: 18, paddingBottom: 12, borderBottom: "1px solid #e8e0ce" }}>Содержимое петиции</h2>
              <div style={{ marginBottom: 18 }}>
                <label style={css.label}>Заголовок петиции</label>
                <input value={settings.petition_title} onChange={e => setSettings(s => ({...s, petition_title: e.target.value}))} style={css.input} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={css.label}>Фото (в начале текста)</label>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && uploadImage(e.target.files[0])} />
                  <button onClick={() => fileRef.current.click()} style={{ ...css.btn, background: "#e8d9b0" }}>{imageUploading ? "Загрузка..." : "Загрузить фото"}</button>
                  {settings.petition_image && <span style={{ fontSize: 12, color: "#4a3e28" }}>✓ Загружено</span>}
                </div>
                {settings.petition_image && (
                  <div style={{ position: "relative", display: "inline-block", marginBottom: 8 }}>
                    <img src={settings.petition_image} alt="preview" style={{ maxWidth: 220, maxHeight: 140, objectFit: "cover", borderRadius: 3, border: "1px solid #d9d0bc" }} />
                    <button onClick={() => setSettings(s => ({...s, petition_image: ""}))} style={{ position: "absolute", top: 4, right: 4, background: "#b00", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 12 }}>✕</button>
                  </div>
                )}
                <input value={settings.petition_image} onChange={e => setSettings(s => ({...s, petition_image: e.target.value}))} style={css.input} placeholder="Или вставьте URL изображения..." />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={css.label}>Текст петиции <span style={{ color: "#999", fontWeight: 400 }}>(**жирный**)</span></label>
                <textarea value={settings.petition_text} onChange={e => setSettings(s => ({...s, petition_text: e.target.value}))} style={css.textarea} />
              </div>
              <div>
                <label style={css.label}>Цель — количество подписей</label>
                <input type="number" value={settings.goal} onChange={e => setSettings(s => ({...s, goal: e.target.value}))} style={{ ...css.input, maxWidth: 180 }} />
              </div>
            </div>
            <div style={css.card}>
              <h2 style={{ margin: "0 0 18px 0", fontFamily: "Georgia, serif", fontSize: 18, paddingBottom: 12, borderBottom: "1px solid #e8e0ce" }}>Перенаправление после подписи</h2>
              <label style={css.label}>URL для перенаправления</label>
              <input value={settings.redirect_url} onChange={e => setSettings(s => ({...s, redirect_url: e.target.value}))} style={css.input} placeholder="https://example.com (оставьте пустым, чтобы не перенаправлять)" />
              <p style={{ fontSize: 12, color: "#888", marginTop: 8 }}>После подписи пользователь будет перенаправлен через 1.8 секунды.</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button onClick={saveSettings} style={{ ...css.btn, padding: "12px 32px", fontSize: 15 }}>Сохранить изменения</button>
              {saveMsg && <span style={{ color: "#3a8a3a", fontWeight: 700, fontSize: 14 }}>{saveMsg}</span>}
            </div>

            {/* User password card */}
            <div style={{ ...css.card, marginTop: 24 }}>
              <h2 style={{ margin: "0 0 6px 0", fontFamily: "Georgia, serif", fontSize: 18, paddingBottom: 12, borderBottom: "1px solid #e8e0ce" }}>
                🔑 Пароль страницы подписей
              </h2>
              <p style={{ fontSize: 13, color: "#888", margin: "0 0 16px 0" }}>
                Этот пароль используется для входа на <code>/signatures</code>. Пользователи видят ФИО и полный номер телефона.
              </p>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <label style={css.label}>Новый пароль</label>
                  <input
                    type="password"
                    value={newUserPass}
                    onChange={e => { setNewUserPass(e.target.value); setPassMsg(""); }}
                    onKeyDown={e => e.key === "Enter" && changeUserPassword()}
                    placeholder="Введите новый пароль..."
                    style={css.input}
                  />
                </div>
                <div style={{ paddingTop: 22 }}>
                  <button onClick={changeUserPassword} style={{ ...css.btn, padding: "10px 22px", background: "#2a5a2a", color: "#fff" }}>
                    Изменить пароль
                  </button>
                </div>
              </div>
              {passMsg && (
                <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: passMsg.includes("✓") ? "#3a8a3a" : "#b00" }}>
                  {passMsg}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
