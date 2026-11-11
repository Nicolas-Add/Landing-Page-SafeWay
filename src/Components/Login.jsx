  import { useState } from "react";

  /**
   * Página de login do SafeWay — mesmo esquema visual do mural
   * (preto #000, roxo #5424bb / #c59dff, avatar #652cbd, botões em pílula).
   *
   * Uso:
   *   <SafeWayLogin onLogin={(user) => { ...salvar sessão e abrir o mural... }} />
   *
   * `user` = { nome, email, nasc, receberEmail, provider: "email" | "google" }
   * Sem `onLogin`, a página guarda o usuário em localStorage ("sw-user") e mostra uma tela de boas-vindas.
   */

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const today = () => new Date().toISOString().slice(0, 10);

  function validate(f) {
    const e = {};
    if (f.nome.trim().length < 2) e.nome = "Digite seu nome.";
    if (!EMAIL_RE.test(f.email.trim())) e.email = "Digite um email válido, como nome@email.com.";
    if (!f.nasc) e.nasc = "Informe sua data de nascimento.";
    else if (f.nasc > today() || f.nasc < "1900-01-01") e.nasc = "Use uma data de nascimento válida.";
    return e;
  }

  export default function SafeWayLogin({ onLogin }) {
    const [theme, setTheme] = useState(() => {
      try { return localStorage.getItem("sw-theme") === '"light"' ? "light" : "dark"; } catch { return "dark"; }
    });
    const [f, setF] = useState({ nome: "", email: "", nasc: "", receberEmail: true });
    const [err, setErr] = useState({});
    const [touched, setTouched] = useState({});
    const [user, setUser] = useState(null);

    const set = (k) => (e) => {
      const next = { ...f, [k]: e.target.value };
      setF(next);
      if (touched[k]) setErr(validate(next));
    };
    const blur = (k) => () => { setTouched({ ...touched, [k]: true }); setErr(validate(f)); };

    const finish = (u) => {
      try { localStorage.setItem("sw-user", JSON.stringify(u)); } catch {}
      if (onLogin) onLogin(u); else setUser(u);
    };
    const submit = () => {
      const e = validate(f);
      setErr(e);
      setTouched({ nome: true, email: true, nasc: true });
      if (Object.keys(e).length) return;
      finish({ nome: f.nome.trim(), email: f.email.trim(), nasc: f.nasc, receberEmail: f.receberEmail, provider: "email" });
    };
    // Ponto de integração: troque pelo fluxo real de OAuth do Google.
    const google = () => finish({ nome: "Conta Google", email: "", nasc: "", receberEmail: f.receberEmail, provider: "google" });
    const enterGuest = () => {
      const u = { guest: true, nome: "Visitante", provider: "guest" };
      if (onLogin) onLogin(u); else setUser(u);
    };
    const toggleTheme = () => {
      const t = theme === "dark" ? "light" : "dark";
      setTheme(t);
      try { localStorage.setItem("sw-theme", JSON.stringify(t)); } catch {}
    };

    const field = (k) => ({
      value: f[k], onChange: set(k), onBlur: blur(k),
      "aria-invalid": !!(touched[k] && err[k]), "aria-describedby": touched[k] && err[k] ? `err-${k}` : undefined,
    });
    const Err = ({ k }) => touched[k] && err[k] ? <div className="err" id={`err-${k}`} role="alert">{err[k]}</div> : null;

    return (
      <div className="swl" data-theme={theme}>
        <style>{CSS}</style>
        <button className="ico theme" onClick={toggleTheme} aria-label="Alternar modo claro/escuro">{theme === "dark" ? "☾" : "☀"}</button>

        <div className="box">
          {user ? (
            <>
              <div className="logo" />
              <h1>Bem-vindo, {user.nome}</h1>
              <p className="sub">Login feito. Agora é só abrir o mural do seu bairro.</p>
              <button className="pill gradbtn" onClick={() => setUser(null)}>Ir para o mural</button>
            </>
          ) : (
            <>
              <div className="brand"><div className="logo" /><b>Safe<span>Way</span></b></div>
              <h1>Fazer Login</h1>

              <div className="fld">
                <input type="text" placeholder="Nome:" autoComplete="name" aria-label="Nome" {...field("nome")} />
                <Err k="nome" />
              </div>
              <div className="fld">
                <input type="email" placeholder="Email:" autoComplete="email" aria-label="Email" {...field("email")} />
                <Err k="email" />
              </div>
              <div className="fld">
                <label className="dateWrap">
                  <span>Data de Nascimento:</span>
                  <input type="date" max={today()} autoComplete="bday" {...field("nasc")} />
                </label>
                <Err k="nasc" />
              </div>

              <div className="or" />

              <button className="pill gbtn" onClick={google}>Continuar com Google <b>G</b></button>

              <div className="mail">
                <span id="mail-lbl">Receber email para ocorrências perto de onde eu moro:</span>
                <button className={"tgl" + (f.receberEmail ? " on" : "")} role="switch" aria-checked={f.receberEmail}
                  aria-labelledby="mail-lbl" onClick={() => setF({ ...f, receberEmail: !f.receberEmail })} />
              </div>

              <button className="pill gradbtn go" onClick={submit}>Fazer Login</button>
              <button className="link" onClick={enterGuest}>Navegar sem login</button>
              <p className="hint">Como visitante você vê o mural e o mapa, mas não registra, comenta nem fixa alfinetes.</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const CSS = `
  .swl{--bg:#000;--card:#000;--fg:#fff;--mut:#a3a3a3;--line:rgba(255,255,255,.75);--soft:rgba(255,255,255,.14);--p1:#5424bb;--p2:#c59dff;--err:#f87171;
  --glow:radial-gradient(ellipse 90% 220% at 100% 100%,#c59dff 0,#5424bb 17%,#000 45%);--edge:linear-gradient(90deg,#000,#5424bb 50%,#c59dff);
  position:relative;min-height:100vh;display:grid;place-items:center;padding:1.5rem 1rem;background:var(--bg);color:var(--fg);
  font-family:"Space Grotesk",system-ui,-apple-system,"Segoe UI",sans-serif}
  .swl[data-theme="light"]{--bg:#f5f3fa;--card:#fff;--fg:#14101f;--mut:#605a70;--line:rgba(20,16,31,.6);--soft:rgba(20,16,31,.12);--err:#dc2626;
  --glow:radial-gradient(ellipse 90% 220% at 100% 100%,#c59dff 0,#b79cf2 17%,#fff 45%);--edge:linear-gradient(90deg,#fff,#b79cf2 50%,#c59dff)}
  .swl *{box-sizing:border-box}
  .swl button,.swl input{font:inherit;color:inherit}
  .swl button{cursor:pointer}
  .swl :focus-visible{outline:2px solid var(--p2);outline-offset:2px}
  .swl .ico{width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:transparent;display:grid;place-items:center;font-size:1rem;padding:0}
  .swl .theme{position:absolute;top:1rem;right:1rem}
  .swl .box{position:relative;overflow:hidden;width:min(380px,100%);text-align:center;padding:1.6rem 1.5rem 1.5rem;border:1px solid transparent;border-radius:22px;
  background:linear-gradient(var(--card),var(--card)) padding-box,var(--edge) border-box}
  .swl .box::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(circle at 100% 100%,#c59dff 0,#5424bb 14%,transparent 42%)}
  .swl .box>*{position:relative;z-index:1}
  .swl .brand{display:flex;align-items:center;justify-content:center;gap:.5rem;font-size:1.1rem}
  .swl .brand span{color:var(--p2)}
  .swl .logo{width:30px;height:30px;border-radius:50%;background:conic-gradient(from 20deg,#67e8f9,#a78bfa,#c026d3,#67e8f9);margin:0 auto}
  .swl .brand .logo{margin:0}
  .swl h1{font-weight:500;font-size:1.6rem;margin:.9rem 0 1.1rem}
  .swl .sub{color:var(--mut);font-size:.85rem;margin:0 0 1.2rem}
  .swl .fld{margin:.55rem 0;text-align:left}
  .swl input[type=text],.swl input[type=email],.swl .dateWrap{display:flex;align-items:center;gap:.6rem;width:100%;border:1px solid var(--line);border-radius:999px;background:transparent;padding:.6rem 1rem;font-size:.85rem}
  .swl input[type=text],.swl input[type=email]{outline:0}
  .swl input::placeholder{color:var(--fg);opacity:.85}
  .swl .dateWrap span{white-space:nowrap}
  .swl .dateWrap input{flex:1;min-width:0;border:0;background:transparent;outline:0;font-size:.85rem;color-scheme:dark}
  .swl[data-theme="light"] .dateWrap input{color-scheme:light}
  .swl [aria-invalid="true"],.swl .fld:has([aria-invalid="true"]) .dateWrap{border-color:var(--err)}
  .swl .err{color:var(--err);font-size:.72rem;margin:.3rem 0 0 1rem}
  .swl .or{border-top:1px dashed var(--line);margin:1.3rem 0}
  .swl .pill{border:1px solid var(--line);border-radius:999px;background:transparent;padding:.6rem 1.1rem;font-size:.85rem;display:inline-flex;align-items:center;gap:.4rem;white-space:nowrap}
  .swl .gbtn{width:100%;justify-content:space-between}
  .swl .gradbtn{border:1px solid transparent;background:var(--glow) padding-box,var(--edge) border-box;color:var(--fg)}
  .swl .go{margin-top:1.2rem;min-width:150px;justify-content:center}
  .swl .mail{display:flex;align-items:center;justify-content:space-between;gap:.8rem;font-size:.75rem;text-align:left;margin-top:1rem}
  .swl .tgl{width:40px;height:22px;border-radius:999px;background:var(--soft);border:1px solid var(--line);position:relative;padding:0;flex:none}
  .swl .tgl::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .15s}
  .swl .tgl.on{background:var(--p1)}.swl .tgl.on::after{left:20px}

  .swl .link{display:block;margin:1rem auto 0;background:none;border:0;text-decoration:underline;text-underline-offset:3px;font-size:.85rem}
  .swl .hint{color:var(--mut);font-size:.7rem;margin:.4rem 0 0}
  @media(prefers-reduced-motion:reduce){.swl .tgl::after{transition:none}}
  `;
