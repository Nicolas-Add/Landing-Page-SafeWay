import { useEffect, useRef, useState } from "react";
import "./Mural.css";
import { useIdioma } from "./i18n.js";

/* Card compartilhado entre o Mural e o Perfil.
   Precisa estar dentro de um elemento com a classe "sw" (estilos do Mural.css). */

// [nome em português (fallback), cor]. O nome exibido vem do dicionário: t("cat." + chave)
export const CATS = {
  obras: ["Obras e infraestrutura", "#f0643c"],
  serv: ["Serviços Urbanos", "#cfcfcf"],
  saude: ["Saúde e Assistência", "#34d399"],
  defesa: ["Defesa civil e alertas", "#3b82f6"],
  eventos: ["Eventos e Cultura", "#e5e5e5"],
};

const pad = (n) => String(n).padStart(2, "0");

export const fmt = (ts, idioma = "pt") => {
  const d = new Date(ts);
  const dia = pad(d.getDate());
  const mes = pad(d.getMonth() + 1);
  const ano = String(d.getFullYear()).slice(2);
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  if (idioma === "en") return `${mes}/${dia}/${ano}  ${h}:${m}`;
  if (idioma === "es") return `${dia}/${mes}/${ano}  ${h}:${m}`;
  return `${dia}/${mes}/${ano}  ${h}H${m}`;
};

export default function CardOcorrencia({ p, onComment, podeApagar = false, onApagar }) {
  const { t, idioma } = useIdioma();
  const [open, setOpen] = useState(false);
  const [txt, setTxt] = useState("");
  const listaRef = useRef(null);

  const cor = (CATS[p.tipo] || [null, "#fff"])[1];
  const nomeCategoria = CATS[p.tipo] ? t("cat." + p.tipo) : t("cat.other");
  const cs = p.comments || [];

  // Mantém a lista de comentários rolada até o mais recente
  useEffect(() => {
    if (open && listaRef.current) {
      listaRef.current.scrollTop = listaRef.current.scrollHeight;
    }
  }, [open, cs.length]);

  const send = () => {
    const texto = txt.trim();
    if (!texto) return;
    onComment?.(p.id, texto);
    setTxt("");
  };

  return (
    <article className="card">
      <div className="who">
        <i />
        {p.oculto ? t("c.anonymous") : p.nome || t("c.user")}
      </div>
      <div className="meta">
        <span>{fmt(p.ts || Date.now(), idioma)}</span>
        <span className="tag" style={{ color: cor, borderColor: cor }}>
          {nomeCategoria}
        </span>
      </div>
      <p>{p.desc || p.descricao || p.titulo}</p>
      <div className="meta">
        <div className="chips">
          <span>{p.cidade || "Canoas"}</span>
          <span>{p.bairro || "Centro"}</span>
        </div>
        {p.fonte ? <span className="vf">✔ {p.fonte}</span> : <span className="unv">{t("c.unverified")}</span>}
      </div>
      <div className="card-acoes">
        <button type="button" className="cbtn" onClick={() => setOpen(!open)}>
          💬 {t("c.comment")}{cs.length ? ` (${cs.length})` : ""}
        </button>

        {podeApagar && (
          <button
            type="button"
            className="mural-apagar"
            title={t("c.deleteOcc")}
            aria-label={t("c.deleteOcc")}
            onClick={() => onApagar?.(p.id)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 6h18M8 6V4h8v2m-10 0 1 14h10l1-14M10 10v6m4-6v6" />
            </svg>
          </button>
        )}
      </div>
      {open && (
        <div className="cm">
          {cs.length > 0 && (
            <div className="cm-lista" ref={listaRef}>
              {cs.map((c, i) => (
                <div className="c" key={i}>
                  <small>
                    {c.nome} · {fmt(c.ts, idioma)}
                  </small>
                  <br />
                  {c.texto}
                </div>
              ))}
            </div>
          )}
          <div className="add">
            <input
              value={txt}
              placeholder={t("c.writeComment")}
              onChange={(e) => setTxt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button type="button" className="pill white" onClick={send}>
              {t("c.send")}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
