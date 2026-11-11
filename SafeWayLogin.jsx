import { useState, useEffect, useMemo } from "react";

/* ---------- dados e utilitários ---------- */
const CATS = {
  obras: ["Obras e infraestrutura", "#f0643c"],
  serv: ["Serviços Urbanos", "#cfcfcf"],
  saude: ["Saúde e Assistência", "#34d399"],
  defesa: ["Defesa civil e alertas", "#3b82f6"],
  eventos: ["Eventos e Cultura", "#e5e5e5"],
};
const BAIRROS = {
  Canoas: ["Mathias Velho", "Niterói", "Igara", "Estância Velha", "Centro"],
  "Porto Alegre": ["Centro Histórico", "Cidade Baixa"],
};
const DAY = 864e5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PROFILE0 = { nome: "", email: "", cidade: "Canoas", bairro: "Centro", receberEmail: true };
const NOFILTER = { tipo: "", cidade: "", bairro: "", data: "" };
const pad = (n) => String(n).padStart(2, "0");
const norm = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const fmt = (ts) => {
  const d = new Date(ts);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}  ${pad(d.getHours())}H${pad(d.getMinutes())}`;
};
const left = (exp) => {
  const m = Math.max(0, Math.floor((exp - Date.now()) / 6e4));
  return `${Math.floor(m / 60)}h ${pad(m % 60)}min`;
};

function useLS(key, init) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}

/* ---------- card do mural (com comentários) ---------- */
function Card({ p, onComment, canComment, onNeed }) {
  const [open, setOpen] = useState(false);
  const [txt, setTxt] = useState("");
  const [name, color] = CATS[p.tipo];
  const cs = p.comments || [];
  const send = () => {
    if (!canComment) { onNeed("comentar"); return; }
    const t = txt.trim();
    if (!t) return;
    onComment(p.id, t);
    setTxt("");
  };
  return (
    <article className="card">
      <div className="who"><i />{p.oculto ? "Anônimo" : p.nome}</div>
      <div className="meta">
        <span>{fmt(p.ts)}</span>
        <span className="tag" style={{ color, borderColor: color }}>{name}</span>
      </div>
      <p>{p.desc}</p>
      <div className="meta">
        <div className="chips"><span>{p.cidade}</span><span>{p.bairro}</span></div>
        {p.fonte ? <span className="vf">✔ {p.fonte}</span> : <span className="unv">Não verificada</span>}
      </div>
      <div><button className="cbtn" onClick={() => setOpen(!open)}>💬 Comentar{cs.length ? ` (${cs.length})` : ""}</button></div>
      {open && (
        <div className="cm">
          {cs.map((c, i) => (
            <div className="c" key={i}><small>{c.nome} · {fmt(c.ts)}</small><br />{c.texto}</div>
          ))}
          <div className="add">
            <input value={txt} placeholder="Escreva um comentário…" onChange={(e) => setTxt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()} />
            <button className="pill white" onClick={send}>Enviar</button>
          </div>
        </div>
      )}
    </article>
  );
}

/* ---------- mapa com alfinetes que expiram em 24h ---------- */
function MapView({ pins, setPins, q, me, toast, canPin, onNeed }) {
  const [mode, setMode] = useState(false);
  const [draft, setDraft] = useState(null); // {x,y,texto}
  const [sel, setSel] = useState(null);
  const [, tick] = useState(0);

  useEffect(() => { const i = setInterval(() => tick((n) => n + 1), 6e4); return () => clearInterval(i); }, []);
  useEffect(() => {
    const live = pins.filter((p) => p.exp > Date.now());
    if (live.length !== pins.length) setPins(live);
  });

  const shown = pins.filter((p) => p.exp > Date.now() && (!q || norm(p.texto + " " + p.nome).includes(norm(q))));
  const selected = pins.find((p) => p.id === sel);

  const onMap = (e) => {
    setSel(null);
    if (!mode) { setDraft(null); return; }
    const r = e.currentTarget.getBoundingClientRect();
    setDraft({
      x: +(((e.clientX - r.left) / r.width) * 100).toFixed(2),
      y: +(((e.clientY - r.top) / r.height) * 100).toFixed(2),
      texto: "",
    });
  };
  const popStyle = (x, y) => ({
    left: `clamp(125px, ${x}%, calc(100% - 125px))`,
    top: y < 40 ? `calc(${y}% + 12px)` : `calc(${y}% - 34px)`,
    transform: y < 40 ? "translateX(-50%)" : "translate(-50%,-100%)",
  });
  const save = () => {
    if (!draft.texto.trim()) { toast("Escreva um comentário para o alfinete."); return; }
    const now = Date.now();
    setPins([...pins, { id: now, x: draft.x, y: draft.y, texto: draft.texto.trim(), nome: me.nome, ts: now, exp: now + DAY, mine: true }]);
    setDraft(null); setMode(false); toast("Alfinete fixado por 24h.");
  };
  const stop = (e) => e.stopPropagation();

  return (
    <div className="map" style={{ cursor: mode ? "crosshair" : "" }} onClick={onMap}>
      <svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice">
        {Array.from({ length: 17 }, (_, i) => <path key={"v" + i} d={`M${i * 50} 0V450`} stroke="var(--map)" />)}
        {Array.from({ length: 10 }, (_, i) => <path key={"h" + i} d={`M0 ${i * 50}H800`} stroke="var(--map)" />)}
        <path d="M0 320C150 280 250 360 400 300S650 200 800 240" stroke="var(--p2)" strokeWidth="3" fill="none" opacity=".5" />
        <path d="M120 0C160 140 260 200 300 450" stroke="var(--soft)" strokeWidth="10" fill="none" />
      </svg>
      <button className="pill gradbtn" style={{ position: "absolute", left: 12, top: 12, zIndex: 3 }}
        onClick={(e) => { stop(e); if (!canPin) { onNeed("fixar alfinetes"); return; } setDraft(null); setMode(!mode); }}>📍 Fixar alfinete</button>
      <span className="hint">{mode ? "Clique no mapa para escolher o local do alfinete." : "Alfinetes ficam ativos por 24h."}</span>
      <div className="zoom" onClick={stop}><button className="ico">🔍</button><button className="ico">➖</button></div>

      {shown.map((p) => (
        <div key={p.id} className="rpin" title={p.texto} style={{ left: p.x + "%", top: p.y + "%" }}
          onClick={(e) => { stop(e); setDraft(null); setSel(p.id); }} />
      ))}
      {draft && <div className="rpin" style={{ left: draft.x + "%", top: draft.y + "%", opacity: 0.6 }} />}

      {draft && (
        <div className="pop" style={popStyle(draft.x, draft.y)} onClick={stop}>
          <b>Novo alfinete</b>
          <textarea autoFocus value={draft.texto} placeholder="Comentário sobre este local…"
            onChange={(e) => setDraft({ ...draft, texto: e.target.value })} />
          <small>Fica ativo por 24h.</small>
          <div className="acts">
            <button className="pill" onClick={() => setDraft(null)}>Cancelar</button>
            <button className="pill white" onClick={save}>Fixar</button>
          </div>
        </div>
      )}
      {selected && (
        <div className="pop" style={popStyle(selected.x, selected.y)} onClick={stop}>
          <b>{selected.nome}</b>
          <div style={{ margin: ".3rem 0" }}>{selected.texto}</div>
          <small>Expira em {left(selected.exp)}</small>
          <div className="acts">
            <button className="pill" onClick={() => { setPins(pins.filter((p) => p.id !== selected.id)); setSel(null); }}>Remover</button>
            <button className="pill white" onClick={() => setSel(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- painel Registrar Ocorrência ---------- */
function RegisterPanel({ open, onClose, me, onSubmit, toast }) {
  const empty = { nome: "", oculto: false, local: "", data: "", tipo: "", desc: "", fonte: "" };
  const [f, setF] = useState(empty);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const send = () => {
    if (!f.tipo || !f.desc.trim()) { toast("Escolha o tipo e escreva a descrição."); return; }
    const loc = f.local.trim();
    const bairro = Object.values(BAIRROS).flat().find((b) => norm(loc).includes(norm(b))) || loc || "Centro";
    const cidade = Object.keys(BAIRROS).find((c) => BAIRROS[c].includes(bairro)) || "Canoas";
    onSubmit({
      id: Date.now(), nome: f.nome.trim() || me.nome, oculto: f.oculto, tipo: f.tipo, desc: f.desc.trim(),
      cidade, bairro, ts: f.data ? new Date(f.data).getTime() : Date.now(), fonte: f.fonte.trim(), mine: true, comments: [],
    });
    setF(empty);
  };
  return (
    <aside className={"reg" + (open ? " on" : "")}>
      <button className="back" onClick={onClose}>Voltar ◂</button>
      <h2>Registrar Ocorrência ⚠</h2>
      <input className="f" placeholder="Nome:" value={f.nome} onChange={set("nome")} />
      <div className="hide">Ocultar nome:
        <button className={"tgl" + (f.oculto ? " on" : "")} onClick={() => setF({ ...f, oculto: !f.oculto })} aria-label="Ocultar nome" />
      </div>
      <input className="f" placeholder="Local:" value={f.local} onChange={set("local")} />
      <input className="f" type="datetime-local" aria-label="Data" value={f.data} onChange={set("data")} />
      <div className="lbl">Selecione o tipo do ocorrido:</div>
      <div className="types">
        {Object.entries(CATS).map(([k, [n, c]]) => (
          <button key={k} className={"chip" + (f.tipo === k ? " sel" : "")} style={{ color: c, borderColor: c }}
            onClick={() => setF({ ...f, tipo: k })}>{n}</button>
        ))}
      </div>
      <textarea className="f" placeholder="Descrição:" value={f.desc} onChange={set("desc")} />
      <input className="f" type="file" accept="image/*" aria-label="Adicionar Imagem (Opcional)" />
      <input className="f" placeholder="Fonte (Opcional)" value={f.fonte} onChange={set("fonte")} />
      <div className="note">Se não houver fonte a mensagem receberá o selo de não verificada!</div>
      <div className="acts">
        <button className="pill" onClick={() => setF(empty)}>Excluir</button>
        <button className="pill white" onClick={send}>Registrar</button>
      </div>
    </aside>
  );
}

/* ---------- aba Perfil ---------- */
function ProfileView({ me, profile, setProfile, posts, setPosts, pins, setPins, logout, addComment }) {
  const [edit, setEdit] = useState(false);
  const [d, setD] = useState(profile);
  const [err, setErr] = useState("");
  const mine = posts.filter((p) => p.mine);
  const myPins = pins.filter((p) => p.mine && p.exp > Date.now());
  const nComments = posts.reduce((n, p) => n + (p.comments || []).filter((c) => c.mine).length, 0);
  const cidade = edit ? d.cidade : profile.cidade;

  const start = () => { setD({ ...profile, nome: me.nome, email: me.email }); setErr(""); setEdit(true); };
  const save = () => {
    if (d.nome.trim().length < 2) { setErr("Digite seu nome."); return; }
    if (!EMAIL_RE.test(d.email.trim())) { setErr("Digite um email válido, como nome@email.com."); return; }
    setProfile({ ...profile, nome: d.nome.trim(), email: d.email.trim(), cidade: d.cidade, bairro: d.bairro });
    setEdit(false);
  };
  const removePost = (id) => { if (window.confirm("Excluir esta ocorrência?")) setPosts(posts.filter((p) => p.id !== id)); };
  const setCidade = (c) => setD({ ...d, cidade: c, bairro: BAIRROS[c].includes(d.bairro) ? d.bairro : BAIRROS[c][0] });

  return (
    <>
      <div className="profile">
        <div>
          <div className="big">{(me.nome.trim()[0] || "👤").toUpperCase()}</div>
          <h2>Minhas<br />Ocorrências</h2>
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: ".6rem" }}>
            <h1>{me.nome}</h1>
            {!edit && <button className="pill" style={{ border: 0 }} onClick={start}>Editar perfil ✎</button>}
          </div>

          {edit ? (
            <div className="pform">
              <input className="pf" placeholder="Nome:" aria-label="Nome" value={d.nome} onChange={(e) => setD({ ...d, nome: e.target.value })} />
              <input className="pf" type="email" placeholder="Email:" aria-label="Email" value={d.email} onChange={(e) => setD({ ...d, email: e.target.value })} />
              <div className="fields">
                <div><small>Cidade:</small>
                  <select className="pf" value={d.cidade} onChange={(e) => setCidade(e.target.value)}>
                    {Object.keys(BAIRROS).map((c) => <option key={c} value={c}>{c}</option>)}
                  </select></div>
                <div><small>Bairro:</small>
                  <select className="pf" value={d.bairro} onChange={(e) => setD({ ...d, bairro: e.target.value })}>
                    {BAIRROS[cidade].map((b) => <option key={b} value={b}>{b}</option>)}
                  </select></div>
              </div>
              {err && <div className="perr" role="alert">{err}</div>}
              <div className="acts" style={{ maxWidth: 320, marginTop: ".9rem" }}>
                <button className="pill" onClick={() => setEdit(false)}>Cancelar</button>
                <button className="pill white" onClick={save}>Salvar</button>
              </div>
            </div>
          ) : (
            <div className="fields">
              <div><small>Cidade:</small><span className="pill">{profile.cidade}</span></div>
              <div><small>Bairro:</small><span className="pill">{profile.bairro}</span></div>
              <div><small>Email:</small><span className="pill">{me.email}</span></div>
            </div>
          )}

          <div className="stats">
            <div className="stat"><b>{mine.length}</b>ocorrências</div>
            <div className="stat"><b>{nComments}</b>comentários</div>
            <div className="stat"><b>{myPins.length}</b>alfinetes ativos</div>
          </div>

          <p style={{ fontSize: ".78rem", display: "flex", gap: ".6rem", alignItems: "center", margin: "1rem 0" }}>
            Receber email para ocorrências perto de onde eu moro:
            <button className={"tgl" + (profile.receberEmail ? " on" : "")} role="switch" aria-checked={profile.receberEmail}
              aria-label="Receber email" onClick={() => setProfile({ ...profile, receberEmail: !profile.receberEmail })} />
          </p>
          <button className="pill gradbtn" onClick={logout}>Sair ⇥</button>
        </div>
      </div>

      <h3 className="sec">Minhas ocorrências</h3>
      <div className="grid" style={{ marginTop: ".6rem" }}>
        {mine.length ? mine.map((p) => (
          <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: ".5rem" }}>
            <Card p={p} onComment={addComment} canComment onNeed={() => {}} />
            <button className="pill" style={{ alignSelf: "flex-end", fontSize: ".72rem", padding: ".3rem .8rem" }} onClick={() => removePost(p.id)}>Excluir ocorrência</button>
          </div>
        )) : <div className="empty">Você ainda não registrou ocorrências. Use “Registrar Ocorrência” para criar a primeira.</div>}
      </div>

      <h3 className="sec">Meus alfinetes (ativos por 24h)</h3>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {myPins.length ? myPins.map((p) => (
          <div className="mypin" key={p.id}>
            <span>📍 {p.texto}<br /><small style={{ color: "var(--mut)" }}>Expira em {left(p.exp)}</small></span>
            <button className="pill" onClick={() => setPins(pins.filter((x) => x.id !== p.id))}>Remover</button>
          </div>
        )) : <div className="empty" style={{ margin: "1.2rem 0" }}>Nenhum alfinete ativo. Fixe um no mapa, em “Meu bairro”.</div>}
      </div>
    </>
  );
}

/* ---------- app ---------- */
/**
 * Props (todas opcionais):
 *  user        { nome, email } ou { guest: true }. Sem `user`, roda sozinho como usuário logado de exemplo.
 *  onLogout    chamado ao sair.
 *  onNeedLogin chamado quando um visitante quer entrar (abre a tela de login).
 */
export default function SafeWayMural({ user, onLogout, onNeedLogin }) {
  const [view, setView] = useState("mural");
  const [posts, setPosts] = useLS("sw-posts-v2", []);
  const [pins, setPins] = useLS("sw-pins-v1", []);
  const [theme, setTheme] = useLS("sw-theme", "dark");
  const guest = !!(user && user.guest);
  const [profile, setProfile] = useLS("sw-profile-" + ((user && user.email) || "local"), PROFILE0);
  const me = guest
    ? { nome: "Visitante", email: "" }
    : { nome: profile.nome || (user && user.nome) || "User Name", email: profile.email || (user && user.email) || "username@gmail.com" };
  const [F, setF] = useState(NOFILTER);
  const [q, setQ] = useState("");
  const [side, setSide] = useState(false);
  const [reg, setReg] = useState(false);
  const [msg, setMsg] = useState("");
  const [ask, setAsk] = useState("");

  const toast = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2200); };
  const need = (what) => { if (guest) { setAsk(what); return false; } return true; };
  const openReg = () => { if (need("registrar ocorrências")) { setSide(false); setReg(true); } };
  const logout = () => { setSide(false); if (guest) { if (onNeedLogin) onNeedLogin(); } else if (onLogout) onLogout(); else go("mural"); };
  const go = (v) => { setView(v); setSide(false); setReg(false); window.scrollTo(0, 0); };
  const addComment = (id, texto) =>
    setPosts(posts.map((p) => (p.id === id ? { ...p, comments: [...(p.comments || []), { nome: me.nome, texto, ts: Date.now(), mine: true }] } : p)));

  const list = useMemo(() => posts.filter((p) =>
    (!F.tipo || p.tipo === F.tipo) && (!F.cidade || p.cidade === F.cidade) && (!F.bairro || p.bairro === F.bairro) &&
    (!F.data || Date.now() - p.ts <= F.data * DAY) &&
    (!q || norm([p.desc, p.bairro, p.cidade, p.nome, CATS[p.tipo][0], p.fonte, ...(p.comments || []).map((c) => c.texto)].join(" ")).includes(norm(q)))
  ).sort((a, b) => b.ts - a.ts), [posts, F, q]);

  const bairros = F.cidade ? BAIRROS[F.cidade] : Object.values(BAIRROS).flat();
  const toggle = (k, v) => { setF({ ...F, [k]: F[k] === v ? "" : v }); setView("mural"); };
  const Sel = ({ k, all, opts }) => (
    <select value={F[k]} onChange={(e) => setF({ ...F, [k]: e.target.value, ...(k === "cidade" ? { bairro: "" } : {}) })}>
      <option value="">{all}</option>
      {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
    </select>
  );
  const Chip = ({ k, v, t, c }) => (
    <button className={"chip" + (F[k] === v ? " sel" : "")} style={{ color: c || "inherit", borderColor: c || "var(--line)" }}
      onClick={() => toggle(k, v)}>{t}</button>
  );

  return (
    <div className="sw" data-theme={theme}>
      <style>{CSS}</style>

      {view !== "login" && (
        <header>
          <button className="ico" aria-label="Menu" onClick={() => { setReg(false); setSide(true); }}>☰</button>
          <div className="pill search grad">
            <input placeholder="Pesquisar …" value={q}
              onChange={(e) => { setQ(e.target.value); if (view === "perfil") setView("mural"); }}
              onKeyDown={(e) => e.key === "Enter" && view !== "mural" && go("mural")} />
          </div>
          <button className="pill grad hideS" onClick={() => go("mapa")}>Meu bairro</button>
          <button className="pill grad" onClick={() => go("mural")}>Mural</button>
          <button className="ico hideS" aria-label="Novo" onClick={openReg}>+</button>
          <span className="sp" />
          <button className="pill gradbtn hideS" onClick={openReg}>Registrar Ocorrência ⚠</button>
          <button className="ico avatar" aria-label={guest ? "Fazer login" : "Perfil"} onClick={() => (guest ? onNeedLogin && onNeedLogin() : go("perfil"))}>👤</button>
        </header>
      )}

      <main>
        {guest && (
          <div className="guest">
            Você está navegando sem login. Entre para registrar ocorrências, comentar e fixar alfinetes.
            <button className="pill gradbtn" onClick={() => onNeedLogin && onNeedLogin()}>Fazer login</button>
          </div>
        )}
        {view === "mapa" && <MapView pins={pins} setPins={setPins} q={q} me={me} toast={toast} canPin={!guest} onNeed={need} />}

        {view === "mural" && (
          <>
            <div className="filterbar">
              <label>Filtro utilizado ⏷</label>
              <label>Tipo de Ocorrência: <Sel k="tipo" all="Todos" opts={Object.entries(CATS).map(([k, v]) => [k, v[0]])} /></label>
              <label>Cidade: <Sel k="cidade" all="Todas" opts={Object.keys(BAIRROS).map((c) => [c, c])} /></label>
              <label>Bairro: <Sel k="bairro" all="Todos" opts={bairros.map((b) => [b, b])} /></label>
              <label>Data: <Sel k="data" all="Qualquer" opts={[["1", "Últimas 24h"], ["7", "Últimos 7 dias"]]} /></label>
              <button className="pill" onClick={() => { setF(NOFILTER); setQ(""); }}>Limpar</button>
              <span style={{ marginLeft: "auto", color: "var(--mut)" }}>{list.length} {list.length === 1 ? "ocorrência" : "ocorrências"}</span>
            </div>
            <h1 className="t">Mural</h1>
            <div className="grid">
              {list.length
                ? list.map((p) => <Card key={p.id} p={p} onComment={addComment} canComment={!guest} onNeed={need} />)
                : <div className="empty">{posts.length ? "Nenhuma ocorrência encontrada com esses filtros." : "Nenhuma ocorrência registrada ainda. Use “Registrar Ocorrência” para criar a primeira."}</div>}
            </div>
          </>
        )}

        {view === "perfil" && (
          <ProfileView me={me} profile={profile} setProfile={setProfile} posts={posts} setPosts={setPosts}
            pins={pins} setPins={setPins} logout={logout} addComment={addComment} />
        )}
      </main>

      {(side || reg) && <div className="scrim on" onClick={() => { setSide(false); setReg(false); }} />}

      <aside className={"side" + (side ? " on" : "")}>
        <div className="top"><div className="logo" /><button className="ico" style={{ border: 0 }} onClick={() => setSide(false)} aria-label="Fechar">✕</button></div>
        <h4>Minhas ocorrências:</h4>
        <h4>Salvos: ★</h4>
        <h4>Filtros: ⏷</h4>
        <div className="row">{Object.entries(CATS).map(([k, [n, c]]) => <Chip key={k} k="tipo" v={k} t={n} c={c} />)}</div>
        <h4>Bairros:</h4>
        <div className="row">{Object.values(BAIRROS).flat().map((b) => <Chip key={b} k="bairro" v={b} t={b} />)}</div>
        <h4>Cidades:</h4>
        <div className="row">{Object.keys(BAIRROS).map((c) => <Chip key={c} k="cidade" v={c} t={c} />)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: ".6rem", alignItems: "flex-start", marginTop: "1.4rem" }}>
          <button className="pill">Português ⇄</button>
          <button className="pill" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "Modo Escuro ☾" : "Modo Claro ☀"}</button>
          <button className="pill" onClick={logout}>{guest ? "Fazer login ⇥" : "Fazer logout ⇥"}</button>
        </div>
      </aside>

      <RegisterPanel open={reg} onClose={() => setReg(false)} me={me} toast={toast}
        onSubmit={(p) => { setPosts([p, ...posts]); setF(NOFILTER); setQ(""); go("mural"); toast("Ocorrência registrada!"); }} />

      {msg && <div className="toast">{msg}</div>}

      {ask && (
        <>
          <div className="scrim on" style={{ zIndex: 70 }} onClick={() => setAsk("")} />
          <div className="dlg" role="dialog" aria-modal="true">
            <h2>Entre para {ask}</h2>
            <p>Navegar pelo mural e pelo mapa é livre. Para {ask}, faça login.</p>
            <div className="acts">
              <button className="pill" onClick={() => setAsk("")}>Agora não</button>
              <button className="pill gradbtn" onClick={() => { setAsk(""); if (onNeedLogin) onNeedLogin(); }}>Fazer login</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------- estilos (paleta do Canva: #000, #c59dff, #5424bb, #652cbd) ---------- */
const CSS = `
.sw{--bg:#000;--panel:#262626;--fg:#fff;--mut:#a3a3a3;--line:rgba(255,255,255,.75);--soft:rgba(255,255,255,.14);--p1:#5424bb;--p2:#c59dff;--av:#652cbd;--card:#000;--map:rgba(255,255,255,.07);
 --glow:radial-gradient(ellipse 90% 220% at 100% 100%,#c59dff 0,#5424bb 17%,#000 45%);--edge:linear-gradient(90deg,#000,#5424bb 50%,#c59dff);
 background:var(--bg);color:var(--fg);min-height:100vh;font-family:"Space Grotesk",system-ui,-apple-system,"Segoe UI",sans-serif}
.sw[data-theme="light"]{--bg:#f5f3fa;--panel:#fff;--fg:#14101f;--mut:#605a70;--line:rgba(20,16,31,.6);--soft:rgba(20,16,31,.12);--card:#fff;--map:rgba(20,16,31,.08);
 --glow:radial-gradient(ellipse 90% 220% at 100% 100%,#c59dff 0,#b79cf2 17%,#fff 45%);--edge:linear-gradient(90deg,#fff,#b79cf2 50%,#c59dff)}
.sw *{box-sizing:border-box}
.sw button,.sw input,.sw select,.sw textarea{font:inherit;color:inherit}
.sw button{cursor:pointer}
.sw .pill{border:1px solid var(--line);border-radius:999px;background:transparent;padding:.55rem 1rem;font-size:.82rem;display:inline-flex;align-items:center;gap:.4rem;white-space:nowrap}
.sw .grad,.sw .gradbtn{border:1px solid transparent;background:var(--glow) padding-box,var(--edge) border-box}
.sw .white{background:#fff;color:#000;border-color:#fff}
.sw header{position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:.6rem;padding:.8rem 1rem;background:var(--bg)}
.sw header .sp{flex:1}
.sw .search{flex:1;max-width:340px;min-width:90px;padding:0}
.sw .search input{width:100%;background:transparent;border:0;outline:0;padding:.55rem 1rem;font-size:.82rem}
.sw .ico{width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:transparent;display:grid;place-items:center;font-size:1rem;padding:0}
.sw .avatar{background:var(--av);border:0;color:#fff}
.sw .logo{width:28px;height:28px;border-radius:50%;background:conic-gradient(from 20deg,#67e8f9,#a78bfa,#c026d3,#67e8f9)}
.sw main{padding:0 1rem 5rem}
.sw h1.t{text-align:center;font-weight:500;font-size:1.6rem;margin:1.2rem 0}
.sw .filterbar{display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1rem;background:var(--panel);border-radius:14px;padding:.7rem 1rem;font-size:.75rem;max-width:1100px;margin:0 auto}
.sw .filterbar label{display:flex;align-items:center;gap:.45rem;color:var(--mut)}
.sw .filterbar select{background:transparent;border:1px solid var(--line);border-radius:999px;padding:.3rem .7rem;font-size:.75rem;color:var(--fg)}
.sw .filterbar select option{color:#000}
.sw .filterbar .pill{padding:.3rem .8rem;font-size:.75rem}
.sw .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1.2rem;max-width:1100px;margin:1.4rem auto}
.sw .card{position:relative;overflow:hidden;border:1px solid transparent;background:linear-gradient(var(--card),var(--card)) padding-box,var(--edge) border-box;border-radius:18px;padding:1rem 1.1rem 1.1rem;min-height:200px;display:flex;flex-direction:column;gap:.6rem}
.sw .card::after{content:"";position:absolute;inset:0;border-radius:inherit;background:radial-gradient(circle at 100% 100%,#c59dff 0,#5424bb 14%,transparent 42%);pointer-events:none}
.sw .card>*{position:relative;z-index:1}
.sw .who{display:flex;align-items:center;gap:.5rem;font-size:.75rem}
.sw .who i{width:20px;height:20px;border-radius:50%;background:var(--av);display:inline-block}
.sw .meta{display:flex;justify-content:space-between;align-items:center;font-size:.72rem;gap:.5rem}
.sw .tag{border:1px solid;border-radius:999px;padding:.15rem .6rem;font-size:.68rem;white-space:nowrap}
.sw .card p{margin:.2rem 0;font-size:1.02rem;line-height:1.35;flex:1}
.sw .chips{display:flex;gap:.4rem;flex-wrap:wrap}
.sw .chips span{border:1px solid var(--line);border-radius:999px;padding:.15rem .7rem;font-size:.72rem}
.sw .unv{font-size:.65rem;color:#fbbf24}.sw .vf{font-size:.65rem;color:#34d399}
.sw .empty{text-align:center;color:var(--mut);margin:3rem 0;grid-column:1/-1}
.sw .cbtn{background:none;border:1px solid var(--line);border-radius:999px;padding:.2rem .7rem;font-size:.72rem}
.sw .cm{display:flex;flex-direction:column;gap:.4rem;font-size:.78rem;border-top:1px solid var(--soft);padding-top:.5rem}
.sw .cm .c{background:var(--soft);border-radius:10px;padding:.35rem .6rem}
.sw .cm small,.sw .pop small{color:var(--mut)}
.sw .cm .add{display:flex;gap:.4rem}
.sw .cm .add input{flex:1;min-width:0;border:1px solid var(--line);border-radius:999px;background:transparent;padding:.35rem .8rem;font-size:.78rem;outline:0}
.sw .cm .add button{padding:.3rem .8rem}
.sw .side,.sw .reg{position:fixed;top:0;bottom:0;z-index:40;background:var(--panel);padding:1.2rem;overflow-y:auto;transition:transform .25s}
.sw .side{left:0;width:min(300px,88vw);transform:translateX(-105%)}
.sw .reg{right:0;width:min(400px,100vw);transform:translateX(105%);text-align:center}
.sw .side.on,.sw .reg.on{transform:none}
.sw .scrim{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:35}
.sw .side h4{font-weight:500;font-size:.8rem;margin:1.1rem 0 .5rem}
.sw .side .row{display:flex;flex-wrap:wrap;gap:.4rem}
.sw .side .top{display:flex;justify-content:space-between;align-items:center}
.sw .chip{border:1px solid;border-radius:999px;background:transparent;padding:.2rem .7rem;font-size:.7rem}
.sw .chip.sel{background:var(--soft);box-shadow:0 0 0 1px currentColor}
.sw .reg h2{font-weight:500;font-size:1.15rem;margin:.6rem 0 1rem}
.sw .reg .f{display:block;width:100%;border:1px solid var(--line);border-radius:999px;background:transparent;padding:.55rem 1rem;margin:.55rem 0;font-size:.82rem;outline:0;text-align:left}
.sw .reg textarea.f{border-radius:18px;resize:vertical;min-height:76px}
.sw .reg .lbl{font-size:.8rem;margin:.9rem 0 .2rem}
.sw .reg .types{display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center;margin-bottom:.5rem}
.sw .reg .back{background:none;border:0;display:flex;font-size:.8rem;padding:0}
.sw .reg .hide{display:flex;align-items:center;gap:.6rem;font-size:.82rem;margin:.4rem 0}
.sw button.tgl{width:40px;height:22px;border-radius:999px;background:var(--soft);border:1px solid var(--line);position:relative;padding:0;flex:none;min-height:0;color:inherit}
.sw button.tgl::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .15s}
.sw button.tgl.on{background:var(--p1)}.sw button.tgl.on::after{left:20px}
.sw .note{font-size:.7rem;color:var(--mut);margin:.3rem 0 1rem}
.sw .acts{display:flex;gap:.8rem}.sw .acts button{flex:1;justify-content:center}
.sw .map{position:relative;height:calc(100vh - 110px);min-height:380px;border:1px solid var(--soft);border-radius:18px;overflow:hidden;background:var(--card)}
.sw .map svg{width:100%;height:100%;display:block}
.sw .hint{position:absolute;left:14px;top:56px;font-size:.72rem;color:var(--mut);z-index:3}
.sw .zoom{position:absolute;right:12px;bottom:12px;display:flex;flex-direction:column;gap:.5rem}
.sw .rpin{position:absolute;z-index:2;width:20px;height:20px;border-radius:50% 50% 50% 0;background:#e11d2e;border:2px solid #fff;transform:translate(-50%,-100%) rotate(-45deg);cursor:pointer;box-shadow:0 0 0 5px rgba(225,29,46,.25)}
.sw .pop{position:absolute;z-index:6;width:240px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:.7rem;font-size:.78rem;text-align:left;cursor:default}
.sw .pop textarea{width:100%;border:1px solid var(--line);border-radius:12px;background:transparent;padding:.4rem .6rem;margin:.4rem 0;min-height:60px;outline:0;font-size:.78rem;resize:vertical}
.sw .pop .acts{gap:.5rem;margin-top:.5rem}
.sw .profile{display:grid;grid-template-columns:minmax(180px,260px) 1fr;gap:2rem;max-width:960px;margin:1.5rem auto;align-items:start}
.sw .big{width:100%;aspect-ratio:1;max-width:260px;border-radius:50%;background:var(--av);display:grid;place-items:center;font-size:5rem}
.sw .profile h1{font-weight:500;font-size:2rem;margin:.2rem 0 1rem}
.sw .profile h2{font-weight:500;font-size:1.8rem;line-height:1.1;margin:1rem 0}
.sw .fields{display:flex;gap:.8rem;flex-wrap:wrap;align-items:end}
.sw .fields small{display:block;margin:0 0 .3rem;font-size:.8rem}
.sw .login{display:grid;place-items:center;min-height:100vh}
.sw .lbox{width:min(360px,100%);border:1px solid transparent;background:linear-gradient(var(--card),var(--card)) padding-box,var(--edge) border-box;border-radius:22px;padding:1.4rem;text-align:center}
.sw .lbox h1{font-weight:500;font-size:1.5rem;margin:.6rem 0 1rem}
.sw .lbox input{width:100%;border:1px solid var(--line);border-radius:999px;background:transparent;padding:.55rem 1rem;margin:.4rem 0;outline:0;font-size:.82rem}
.sw .lbox .or{border-top:1px dashed var(--line);margin:1.2rem 0}
.sw .lbox .mail{display:flex;align-items:center;justify-content:space-between;gap:.8rem;font-size:.75rem;text-align:left;margin-top:.8rem}
.sw .toast{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);background:#fff;color:#000;padding:.6rem 1.1rem;border-radius:999px;font-size:.8rem;z-index:60}
.sw .guest{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:.7rem;font-size:.78rem;color:var(--mut);margin:.2rem auto 1rem;max-width:1100px;text-align:center}
.sw .guest .pill{padding:.3rem .9rem;font-size:.75rem;color:var(--fg)}
.sw .dlg{position:fixed;z-index:80;left:50%;top:50%;transform:translate(-50%,-50%);width:min(340px,92vw);background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:1.2rem;text-align:center}
.sw .dlg h2{font-weight:500;font-size:1.1rem;margin:0 0 .5rem}
.sw .dlg p{color:var(--mut);font-size:.82rem;margin:0 0 1rem}
 .sw .pform{margin:.4rem 0}
.sw .pf{width:100%;max-width:420px;display:block;border:1px solid var(--line);border-radius:999px;background:transparent;padding:.55rem 1rem;margin:.5rem 0;font-size:.85rem;outline:0}
.sw .fields .pf{width:auto;margin:0}
.sw select.pf option{color:#000}
.sw .perr{color:#f87171;font-size:.75rem;margin:.4rem 0 0 1rem}
.sw .stats{display:flex;gap:.8rem;flex-wrap:wrap;margin:1.2rem 0 0}
.sw .stat{border:1px solid var(--line);border-radius:14px;padding:.5rem .9rem;font-size:.75rem;min-width:96px}
.sw .stat b{display:block;font-size:1.4rem;font-weight:500}
.sw .sec{max-width:1100px;margin:1.8rem auto 0;font-weight:500;font-size:1.1rem}
.sw .mypin{display:flex;justify-content:space-between;align-items:center;gap:.6rem;border:1px solid var(--soft);border-radius:14px;padding:.6rem .9rem;font-size:.8rem;margin-top:.6rem}
@media(max-width:720px){.sw .hideS{display:none}.sw .profile{grid-template-columns:1fr}.sw .big{max-width:160px}.sw header{gap:.4rem;padding:.6rem}}
`;
