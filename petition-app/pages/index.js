import { useState, useEffect } from "react";
import Head from "next/head";

const starSVG = (
  <svg width="16" height="16" viewBox="0 0 18 18" fill="#c8a84b">
    <polygon points="9,1 11.5,6.5 17.5,7.2 13,11.5 14.3,17.5 9,14.5 3.7,17.5 5,11.5 0.5,7.2 6.5,6.5" />
  </svg>
);

function renderText(text) {
  return text.split("\n").map((para, i) => {
    const html = para.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return para.trim() ? (
      <p key={i} style={{ fontSize: 15, lineHeight: 1.85, color: "#333", margin: "0 0 14px 0" }}
        dangerouslySetInnerHTML={{ __html: html }} />
    ) : null;
  });
}

export default function Home() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", consent: null });
  const [errors, setErrors] = useState({});
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/petition").then(r => r.json()).then(setData);
  }, []);

  const count = data?.count || 2532;
  const goal = parseInt(data?.goal || "5000");
  const progress = Math.min((count / goal) * 100, 100);

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "Введите имя";
    if (!form.last_name.trim()) e.last_name = "Введите фамилию";
    if (!form.phone.trim()) e.phone = "Введите номер телефона";
    if (!form.consent) e.consent = "Выберите вариант";
    return e;
  };

  const handleSign = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setLoading(true);
    const r = await fetch("/api/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).then(x => x.json());
    setLoading(false);
    if (r.success) {
      if (r.redirect_url) {
        window.location.href = r.redirect_url;
      } else {
        setSigned(true);
        setData(d => ({ ...d, count: r.count }));
      }
    }
  };

  const inp = (err) => ({
    width: "100%", border: `1.5px solid ${err ? "#b00" : "#c5b99a"}`, borderRadius: 4,
    padding: "10px 13px", fontSize: 15, outline: "none", boxSizing: "border-box",
    background: "#fdfaf4", color: "#1a1610", fontFamily: "Georgia, serif",
  });

  return (
    <>
      <Head>
        <title>{data?.petition_title || "Петиция"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=PT+Serif:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet" />
      </Head>
      <style>{`* { box-sizing: border-box; } body { margin:0; background:#f2ede3; font-family: Georgia, serif; }
        input:focus { border-color: #c8a84b !important; background: #fffdf5 !important; }
        .sign-btn:hover { background: #b8962e !important; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .fade { animation: fadeIn 0.6s ease both; }
        @media(max-width:700px) { .grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* Header */}
      <header style={{ background: "#1a1610", borderBottom: "3px solid #c8a84b", padding: "14px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
          {starSVG}
          <span style={{ fontFamily: "'Playfair Display', serif", color: "#c8a84b", fontSize: 16, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Народные петиции России
          </span>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#1a1610 0%,#2e2518 60%,#3d3020 100%)", borderBottom: "4px solid #c8a84b", padding: "52px 24px 44px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(45deg,rgba(200,168,75,0.04) 0px,rgba(200,168,75,0.04) 1px,transparent 1px,transparent 40px)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 780, margin: "0 auto", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
            <div style={{ height: 2, width: 40, background: "#c8a84b" }} />
            <span style={{ color: "#c8a84b", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>Официальная петиция</span>
            <div style={{ height: 2, flex: 1, background: "#c8a84b", opacity: 0.3 }} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: "#f5edd8", fontSize: "clamp(20px,4vw,34px)", fontWeight: 900, margin: "0 0 16px 0", lineHeight: 1.3 }}>
            {data?.petition_title || "Петиция о присвоении звания Героя Российской Федерации (посмертно)"}
          </h1>
          <div style={{ maxWidth: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ color: "#f5edd8", fontSize: 26, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{count.toLocaleString("ru-RU")}</span>
              <span style={{ color: "#c5b99a", fontSize: 13, alignSelf: "flex-end", marginBottom: 3 }}>цель: {goal.toLocaleString("ru-RU")}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 3, height: 7, marginBottom: 6 }}>
              <div style={{ background: "linear-gradient(90deg,#c8a84b,#e8c96b)", borderRadius: 3, height: "100%", width: `${progress}%`, transition: "width 0.6s ease" }} />
            </div>
            <span style={{ color: "#c5b99a", fontSize: 13 }}>подтверждённых подписей</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid" style={{ maxWidth: 900, margin: "0 auto", padding: "36px 24px 60px", display: "grid", gridTemplateColumns: "1fr minmax(300px,380px)", gap: 36, alignItems: "start" }}>

        {/* Left */}
        <div className="fade">
          <div style={{ background: "#fff", border: "1px solid #d9d0bc", borderTop: "4px solid #c8a84b", borderRadius: 4, padding: "28px 32px", marginBottom: 24 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, margin: "0 0 18px 0", paddingBottom: 12, borderBottom: "1px solid #e8e0ce" }}>Текст обращения</h2>
            {data?.petition_image && (
              <img src={data.petition_image} alt="Фото" style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 3, marginBottom: 18 }} />
            )}
            {renderText(data?.petition_text || "")}
          </div>

          <div style={{ background: "#fff", border: "1px solid #d9d0bc", borderRadius: 4, padding: "22px 32px" }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, margin: "0 0 14px 0" }}>Недавно подписали</h3>
            {[["А. Петров","Москва"],["Е. Смирнова","Санкт-Петербург"],["В. Козлов","Екатеринбург"],["О. Новикова","Казань"]].map(([name, city], i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 3 ? "1px solid #f0e8d5" : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#c8a84b,#e8c96b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0, fontFamily: "'Playfair Display', serif" }}>{name[0]}</div>
                <div><div style={{ fontSize: 14, fontWeight: 700 }}>{name}</div><div style={{ fontSize: 12, color: "#888" }}>{city}</div></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: form */}
        <div className="fade" style={{ animationDelay: "0.15s" }}>
          <div style={{ background: "#fff", border: "1px solid #d9d0bc", borderTop: "4px solid #c8a84b", borderRadius: 4, padding: "26px 26px 22px", position: "sticky", top: 24 }}>
            {signed ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <div style={{ fontSize: 52, marginBottom: 10 }}>🎖️</div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Ваша подпись принята</div>
                <div style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>Благодарим за участие. {data?.redirect_url ? "Сейчас вы будете перенаправлены..." : ""}</div>
                <div style={{ marginTop: 18, color: "#c8a84b", fontWeight: 700 }}>{count.toLocaleString("ru-RU")} подписей</div>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, margin: "0 0 18px 0", paddingBottom: 12, borderBottom: "1px solid #e8e0ce" }}>Подписать петицию</h2>

                {[["first_name","Имя","text"],["last_name","Фамилия","text"],["phone","Номер телефона","tel"]].map(([field, label, type]) => (
                  <div key={field} style={{ marginBottom: 13 }}>
                    <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 5 }}>{label}</label>
                    <input type={type} value={form[field]}
                      onChange={e => { setForm(f => ({...f, [field]: e.target.value})); setErrors(er => ({...er, [field]: ""})); }}
                      placeholder={type === "tel" ? "+7 (___) ___-__-__" : ""}
                      style={inp(errors[field])} />
                    {errors[field] && <div style={{ color: "#b00", fontSize: 12, marginTop: 3 }}>{errors[field]}</div>}
                  </div>
                ))}

                <div style={{ margin: "16px 0 20px" }}>
                  {[{ val: "yes", label: "Да, сообщите мне о результатах петиции и других важных инициативах" },
                    { val: "no", label: "Нет, не присылайте уведомлений о ходе петиции" }].map(opt => (
                    <label key={opt.val} style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 10, cursor: "pointer", fontSize: 13, color: "#444", lineHeight: 1.5 }}>
                      <input type="radio" name="consent" value={opt.val}
                        checked={form.consent === opt.val}
                        onChange={() => { setForm(f => ({...f, consent: opt.val})); setErrors(er => ({...er, consent: ""})); }}
                        style={{ marginTop: 2, accentColor: "#c8a84b", flexShrink: 0 }} />
                      {opt.label}
                    </label>
                  ))}
                  {errors.consent && <div style={{ color: "#b00", fontSize: 12 }}>{errors.consent}</div>}
                </div>

                <button onClick={handleSign} disabled={loading} className="sign-btn" style={{
                  width: "100%", background: "#c8a84b", color: "#1a1610", border: "none", borderRadius: 3,
                  padding: "13px 0", fontSize: 15, fontWeight: 700, cursor: loading ? "wait" : "pointer",
                  fontFamily: "'Playfair Display', serif", letterSpacing: "0.05em", transition: "background 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  {starSVG} {loading ? "Отправка..." : "Подписать петицию"}
                </button>
                <p style={{ fontSize: 11, color: "#999", textAlign: "center", marginTop: 12, lineHeight: 1.5 }}>
                  Подписывая, вы соглашаетесь с условиями обработки персональных данных в соответствии с законодательством РФ.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <footer style={{ background: "#1a1610", borderTop: "2px solid #c8a84b", padding: "18px 24px", textAlign: "center", color: "#6b5e45", fontSize: 12, letterSpacing: "0.05em" }}>
        © 2025 Народные петиции России · Все права защищены · <a href="/signatures" style={{color:"#c8a84b",textDecoration:"none"}}>Список подписантов</a>
      </footer>
    </>
  );
}
