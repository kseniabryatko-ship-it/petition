import { useState, useEffect } from "react";
import Head from "next/head";

const starSVG = (
  <svg width="14" height="14" viewBox="0 0 18 18" fill="#c8a84b">
    <polygon points="9,1 11.5,6.5 17.5,7.2 13,11.5 14.3,17.5 9,14.5 3.7,17.5 5,11.5 0.5,7.2 6.5,6.5" />
  </svg>
);

export default function Signatures() {
  const [token, setToken] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signatures, setSignatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const t = sessionStorage.getItem("user_token");
    if (t) { setToken(t); loadSignatures(t); }
  }, []);

  const login = async () => {
    setLoginError("");
    const r = await fetch("/api/user-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).then(x => x.json());

    if (r.token) {
      sessionStorage.setItem("user_token", r.token);
      setToken(r.token);
      loadSignatures(r.token);
    } else {
      setLoginError("Неверный пароль");
    }
  };

  const loadSignatures = async (t) => {
    setLoading(true);
    const r = await fetch("/api/public-signatures", {
      headers: { Authorization: `Bearer ${t}` },
    }).then(x => x.json());
    if (r.signatures) setSignatures(r.signatures);
    else { setToken(null); sessionStorage.removeItem("user_token"); }
    setLoading(false);
  };

  const logout = () => {
    setToken(null);
    setSignatures([]);
    sessionStorage.removeItem("user_token");
  };

  const filtered = signatures.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

  const inputStyle = (err) => ({
    width: "100%", border: `1.5px solid ${err ? "#b00" : "#c5b99a"}`, borderRadius: 4,
    padding: "10px 13px", fontSize: 15, outline: "none", boxSizing: "border-box",
    background: "#fdfaf4", fontFamily: "Georgia, serif",
  });

  // LOGIN SCREEN
  if (!token) return (
    <div style={{ minHeight: "100vh", background: "#f2ede3", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif" }}>
      <Head>
        <title>Вход — Список подписантов</title>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />
      </Head>
      <div style={{ background: "#fff", border: "1px solid #d9d0bc", borderTop: "4px solid #c8a84b", borderRadius: 6, padding: "40px 40px 32px", width: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          {starSVG}
          <span style={{ fontFamily: "'Playfair Display', serif", color: "#c8a84b", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Народные петиции России
          </span>
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, color: "#1a1610", margin: "14px 0 6px" }}>
          Список подписантов
        </h1>
        <p style={{ fontSize: 13, color: "#888", margin: "0 0 24px 0", lineHeight: 1.5 }}>
          Эта страница доступна только по паролю.
        </p>

        <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 6, fontWeight: 600 }}>Пароль</label>
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setLoginError(""); }}
          onKeyDown={e => e.key === "Enter" && login()}
          style={inputStyle(loginError)}
          placeholder="Введите пароль"
        />
        {loginError && <div style={{ color: "#b00", fontSize: 13, marginTop: 6 }}>{loginError}</div>}

        <button onClick={login} style={{
          width: "100%", marginTop: 16, background: "#c8a84b", color: "#1a1610",
          border: "none", borderRadius: 4, padding: "12px 0", fontSize: 15,
          fontWeight: 700, cursor: "pointer", fontFamily: "'Playfair Display', serif",
          letterSpacing: "0.04em",
        }}>
          Войти
        </button>

        <div style={{ marginTop: 18, textAlign: "center" }}>
          <a href="/" style={{ fontSize: 13, color: "#c8a84b", textDecoration: "none" }}>← Вернуться к петиции</a>
        </div>
      </div>
    </div>
  );

  // SIGNATURES LIST
  return (
    <>
      <Head>
        <title>Подписавшиеся — Народные петиции России</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=PT+Serif:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <style>{`
        * { box-sizing: border-box; } body { margin: 0; background: #f2ede3; font-family: Georgia, serif; }
        tr:hover td { background: #fdf7e8 !important; }
        input:focus { border-color: #c8a84b !important; outline: none; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
        .fade { animation: fadeIn 0.5s ease both; }
        @media(max-width:600px) { .hide-mob { display: none !important; } }
      `}</style>

      <header style={{ background: "#1a1610", borderBottom: "3px solid #c8a84b", padding: "14px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {starSVG}
            <span style={{ fontFamily: "'Playfair Display', serif", color: "#c8a84b", fontSize: 16, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Народные петиции России
            </span>
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <a href="/" style={{ color: "#c5b99a", fontSize: 13, textDecoration: "none" }}>← К петиции</a>
            <button onClick={logout} style={{ background: "transparent", border: "1px solid #555", color: "#aaa", borderRadius: 4, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>Выйти</button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 60px" }} className="fade">
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ height: 2, width: 32, background: "#c8a84b" }} />
            <span style={{ color: "#c8a84b", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase" }}>Список подписантов</span>
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, margin: "0 0 6px", color: "#1a1610" }}>
            Подписавшиеся под петицией
          </h1>
          <p style={{ color: "#6b5e45", fontSize: 14, margin: 0 }}>
            Всего подписей: <strong>{signatures.length.toLocaleString("ru-RU")}</strong>
          </p>
        </div>

        <div style={{ marginBottom: 18 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по имени или телефону..."
            style={{ width: "100%", maxWidth: 400, border: "1.5px solid #c5b99a", borderRadius: 4, padding: "10px 14px", fontSize: 14, background: "#fdfaf4", fontFamily: "Georgia, serif", outline: "none" }}
          />
        </div>

        <div style={{ background: "#fff", border: "1px solid #d9d0bc", borderTop: "4px solid #c8a84b", borderRadius: 4, overflow: "hidden" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 48, color: "#aaa" }}>Загрузка...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#aaa" }}>{search ? "Ничего не найдено" : "Подписей пока нет"}</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["№","ФИО","Телефон","Дата"].map(h => (
                    <th key={h} className={h === "Дата" ? "hide-mob" : ""} style={{ padding: "13px 18px", textAlign: "left", background: "#f5edd8", fontSize: 13, fontWeight: 700, color: "#4a3e28", borderBottom: "2px solid #e8d9b0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sig, i) => (
                  <tr key={sig.id}>
                    <td style={{ padding: "12px 18px", fontSize: 13, color: "#999", borderBottom: "1px solid #f0e8d5", background: i % 2 === 0 ? "#fff" : "#fdfaf4" }}>{sig.id}</td>
                    <td style={{ padding: "12px 18px", borderBottom: "1px solid #f0e8d5", background: i % 2 === 0 ? "#fff" : "#fdfaf4" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#c8a84b,#e8c96b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0, fontFamily: "'Playfair Display', serif" }}>
                          {sig.name[0]}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1610" }}>{sig.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 18px", fontSize: 14, color: "#333", fontFamily: "monospace", letterSpacing: "0.04em", borderBottom: "1px solid #f0e8d5", background: i % 2 === 0 ? "#fff" : "#fdfaf4" }}>
                      {sig.phone}
                    </td>
                    <td className="hide-mob" style={{ padding: "12px 18px", fontSize: 12, color: "#888", borderBottom: "1px solid #f0e8d5", background: i % 2 === 0 ? "#fff" : "#fdfaf4" }}>
                      {new Date(sig.created_at).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {filtered.length > 0 && (
          <div style={{ textAlign: "center", marginTop: 14, color: "#aaa", fontSize: 12 }}>
            Показано {filtered.length} из {signatures.length} подписей
          </div>
        )}
      </div>

      <footer style={{ background: "#1a1610", borderTop: "2px solid #c8a84b", padding: "18px 24px", textAlign: "center", color: "#6b5e45", fontSize: 12, letterSpacing: "0.05em" }}>
        © 2025 Народные петиции России · Все права защищены
      </footer>
    </>
  );
}
