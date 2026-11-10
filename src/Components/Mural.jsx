import { useState, useMemo } from "react";
import "./Mural.css";

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
const NOFILTER = { tipo: "", cidade: "", bairro: "", data: "" };
const pad = (n) => String(n).padStart(2, "0");
const norm = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const fmt = (ts) => {
  const d = new Date(ts);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(2)}  ${pad(d.getHours())}H${pad(d.getMinutes())}`;
};

/* ---------- card do mural (com comentários) ---------- */
function Card({ p, onComment }) {
  const [open, setOpen] = useState(false);
  const [txt, setTxt] = useState("");
  const catInfo = CATS[p.tipo] || ["Outros", "#fff"];
  const name = catInfo[0];
  const color = catInfo[1];
  const cs = p.comments || [];

  const send = () => {
    const t = txt.trim();
    if (!t) return;
    onComment(p.id, t);
    setTxt("");
  };

  return (
    <article className="card">
      <div className="who">
        <i />
        {p.oculto ? "Anônimo" : p.nome || "Usuário"}
      </div>
      <div className="meta">
        <span>{fmt(p.ts || Date.now())}</span>
        <span className="tag" style={{ color, borderColor: color }}>
          {name}
        </span>
      </div>
      <p>{p.desc || p.descricao || p.titulo}</p>
      <div className="meta">
        <div className="chips">
          <span>{p.cidade || "Canoas"}</span>
          <span>{p.bairro || "Centro"}</span>
        </div>
        {p.fonte ? <span className="vf">✔ {p.fonte}</span> : <span className="unv">Não verificada</span>}
      </div>
      <div>
        <button className="cbtn" onClick={() => setOpen(!open)}>
          💬 Comentar{cs.length ? ` (${cs.length})` : ""}
        </button>
      </div>
      {open && (
        <div className="cm">
          {cs.map((c, i) => (
            <div className="c" key={i}>
              <small>
                {c.nome} · {fmt(c.ts)}
              </small>
              <br />
              {c.texto}
            </div>
          ))}
          <div className="add">
            <input
              value={txt}
              placeholder="Escreva um comentário…"
              onChange={(e) => setTxt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button className="pill white" onClick={send}>
              Enviar
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

/* ---------- componente principal Mural ---------- */
export default function Mural({ ocorrenciasSalvas = [], onSalvarOcorrencia }) {
  const [postsLocais, setPostsLocais] = useState([]);
  const me = { nome: "User Name", email: "username@gmail.com" };
  const [F, setF] = useState(NOFILTER);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState("");

  // Unifica ocorrências recebidas pelo App com posts locais
  const posts = useMemo(() => {
    return [...ocorrenciasSalvas, ...postsLocais];
  }, [ocorrenciasSalvas, postsLocais]);

  const toast = (m) => { setMsg(m); setTimeout(() => setMsg(""), 2200); };
  
  const addComment = (id, texto) =>
    setPostsLocais(posts.map((p) => (p.id === id ? { ...p, comments: [...(p.comments || []), { nome: me.nome, texto, ts: Date.now() }] } : p)));

  const list = useMemo(() => posts.filter((p) =>
    (!F.tipo || p.tipo === F.tipo) && (!F.cidade || p.cidade === F.cidade) && (!F.bairro || p.bairro === F.bairro) &&
    (!F.data || Date.now() - (p.ts || Date.now()) <= F.data * DAY) &&
    (!q || norm([(p.desc || p.descricao || p.titulo), p.bairro, p.cidade, p.nome, CATS[p.tipo] ? CATS[p.tipo][0] : "", p.fonte, ...(p.comments || []).map((c) => c.texto)].join(" ")).includes(norm(q)))
  ).sort((a, b) => (b.ts || 0) - (a.ts || 0)), [posts, F, q]);

  const bairros = F.cidade ? BAIRROS[F.cidade] : Object.values(BAIRROS).flat();

  const Sel = ({ k, all, opts }) => (
    <select value={F[k]} onChange={(e) => setF({ ...F, [k]: e.target.value, ...(k === "cidade" ? { bairro: "" } : {}) })}>
      <option value="">{all}</option>
      {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
    </select>
  );

  return (
    <div className="sw">
      <main>
        {/* Barra de pesquisa e filtro superior (sem o botão de registrar) */}
        <div className="filterbar">
          <div className="pill search grad" style={{ flex: 1, minWidth: "200px" }}>
            <input 
              placeholder="Pesquisar ocorrências…" 
              value={q}
              onChange={(e) => setQ(e.target.value)} 
            />
          </div>
          <label>Tipo: <Sel k="tipo" all="Todos" opts={Object.entries(CATS).map(([k, v]) => [k, v[0]])} /></label>
          <label>Cidade: <Sel k="cidade" all="Todas" opts={Object.keys(BAIRROS).map((c) => [c, c])} /></label>
          <label>Bairro: <Sel k="bairro" all="Todos" opts={bairros.map((b) => [b, b])} /></label>
          <label>Data: <Sel k="data" all="Qualquer" opts={[["1", "Últimas 24h"], ["7", "Últimos 7 dias"]]} /></label>
          <button className="pill" onClick={() => { setF(NOFILTER); setQ(""); }}>Limpar</button>
          <span style={{ marginLeft: "auto", color: "var(--text)" }}>{list.length} {list.length === 1 ? "ocorrência" : "ocorrências"}</span>
        </div>

        <h1 className="t">Mural de Ocorrências</h1>

        {/* Grid com os cards */}
        <div className="grid">
          {list.length
            ? list.map((p) => <Card key={p.id || Math.random()} p={p} onComment={addComment} />)
            : <div className="empty">{posts.length ? "Nenhuma ocorrência encontrada com esses filtros." : "Nenhuma ocorrência registrada ainda."}</div>}
        </div>
      </main>

      {msg && <div className="toast">{msg}</div>}
    </div>
  );
}