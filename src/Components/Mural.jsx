import { useState, useMemo } from "react";
import "./Mural.css";
import CardOcorrencia, { CATS } from "./CardOcorrencia.jsx";
import { useIdioma } from "./i18n.js";

const BAIRROS = {
  Canoas: ["Mathias Velho", "Niterói", "Igara", "Estância Velha", "Centro"],
  "Porto Alegre": ["Centro Histórico", "Cidade Baixa"],
};

const DAY = 864e5;
const NOFILTER = { tipo: "", cidade: "", bairro: "", data: "" };
const norm = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export default function Mural({
  ocorrenciasSalvas = [],
  usuarioEmail,
  onApagarOcorrencia,
  onComentar,
  onApagarComentario, // <--- Prop para apagar o comentário específico
}) {
  const { t } = useIdioma();
  const [F, setF] = useState(NOFILTER);
  const [q, setQ] = useState("");

  const termo = norm(q);

  const list = useMemo(
    () =>
      ocorrenciasSalvas
        .filter(
          (p) =>
            (!F.tipo || p.tipo === F.tipo) &&
            (!F.cidade || p.cidade === F.cidade) &&
            (!F.bairro || p.bairro === F.bairro) &&
            (!F.data || Date.now() - (p.ts || Date.now()) <= F.data * DAY) &&
            (!termo ||
              norm(
                [
                  p.desc || p.descricao || p.titulo,
                  p.local,
                  p.bairro,
                  p.cidade,
                  p.nome,
                  CATS[p.tipo] ? t("cat." + p.tipo) : "",
                  p.fonte,
                  ...(p.comments || []).map((c) => c.texto),
                ].join(" ")
              ).includes(termo))
        )
        .sort((a, b) => (b.ts || 0) - (a.ts || 0)),
    [ocorrenciasSalvas, F, termo, t]
  );

  const bairros = F.cidade ? BAIRROS[F.cidade] : Object.values(BAIRROS).flat();

  const Sel = ({ k, all, opts }) => (
    <select
      value={F[k]}
      onChange={(e) => setF({ ...F, [k]: e.target.value, ...(k === "cidade" ? { bairro: "" } : {}) })}
    >
      <option value="">{all}</option>
      {opts.map(([v, txt]) => (
        <option key={v} value={v}>
          {txt}
        </option>
      ))}
    </select>
  );

  return (
    <div className="sw">
      <main>
        <div className="filterbar">
          <div className="pill search grad" style={{ flex: 1, minWidth: "200px" }}>
            <input
              placeholder={t("m.searchOcc")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <label>{t("m.type")} <Sel k="tipo" all={t("m.all")} opts={Object.keys(CATS).map((k) => [k, t("cat." + k)])} /></label>
          <label>{t("m.city")} <Sel k="cidade" all={t("m.allF")} opts={Object.keys(BAIRROS).map((c) => [c, c])} /></label>
          <label>{t("m.neighborhood")} <Sel k="bairro" all={t("m.all")} opts={bairros.map((b) => [b, b])} /></label>
          <label>{t("m.date")} <Sel k="data" all={t("m.any")} opts={[["1", t("m.last24")], ["7", t("m.last7")]]} /></label>
          <button
            type="button"
            className="pill"
            onClick={() => {
              setF(NOFILTER);
              setQ("");
            }}
          >
            {t("m.clear")}
          </button>
          <span style={{ marginLeft: "auto", color: "var(--text)" }}>
            {list.length} {list.length === 1 ? t("m.occ1") : t("m.occN")}
          </span>
        </div>

        <h1 className="t">{t("m.title")}</h1>

        <div className="grid">
          {list.length ? (
            list.map((p) => (
              <CardOcorrencia
                key={p.id}
                p={p}
                usuarioEmail={usuarioEmail}
                onComment={onComentar}
                onApagarComentario={onApagarComentario}
                podeApagar={Boolean(usuarioEmail) && p.usuarioEmail === usuarioEmail}
                onApagar={onApagarOcorrencia}
              />
            ))
          ) : (
            <div className="empty">
              {ocorrenciasSalvas.length ? t("m.noneFilter") : t("m.noneYet")}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
