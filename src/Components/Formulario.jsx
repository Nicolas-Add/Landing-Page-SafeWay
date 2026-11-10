import { useState } from "react";
import "./Formulario.css";

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

const norm = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function Formulario({ isOpen, onClose, setMarcadorTemporario, onSalvarOcorrencia }) {
  const [nome, setNome] = useState("");
  const [oculto, setOculto] = useState(false);
  const [local, setLocal] = useState("");
  const [data, setData] = useState("");
  const [tipo, setTipo] = useState("");
  const [desc, setDesc] = useState("");
  const [fonte, setFonte] = useState("");
  const [coordenadasTemp, setCoordenadasTemp] = useState(null);

  async function buscarEndereco() {
    if (!local.trim()) return;

    try {
      const query = encodeURIComponent(`${local}, Canoas, RS, Brasil`);
      const resposta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
      );
      const dados = await resposta.json();

      if (dados.length > 0) {
        const coords = {
          lat: parseFloat(dados[0].lat),
          lng: parseFloat(dados[0].lon),
          endereco: dados[0].display_name,
        };
        setCoordenadasTemp(coords);
        if (setMarcadorTemporario) setMarcadorTemporario(coords);
      } else {
        alert("Endereço não encontrado no mapa.");
      }
    } catch (erro) {
      console.error("Erro ao buscar endereço:", erro);
    }
  }

  function enviarFormulario(event) {
    event.preventDefault();

    if (!tipo) {
      alert("Selecione o tipo do ocorrido.");
      return;
    }

    if (!desc.trim()) {
      alert("Escreva uma descrição para a ocorrência.");
      return;
    }

    const loc = local.trim();
    const bairro = Object.values(BAIRROS).flat().find((b) => norm(loc).includes(norm(b))) || loc || "Centro";
    const cidade = Object.keys(BAIRROS).find((c) => BAIRROS[c].includes(bairro)) || "Canoas";

    const novaOcorrencia = {
      id: Date.now(),
      nome: nome.trim() || "Usuário",
      oculto,
      local,
      lat: coordenadasTemp ? coordenadasTemp.lat : null,
      lng: coordenadasTemp ? coordenadasTemp.lng : null,
      tipo,
      cidade,
      bairro,
      ts: data ? new Date(data).getTime() : Date.now(),
      desc: desc.trim(),
      fonte: fonte.trim(),
      mine: true,
      comments: [],
    };

    onSalvarOcorrencia(novaOcorrencia);
    if (setMarcadorTemporario) setMarcadorTemporario(null);
    limparCampos();
    onClose();
  }

  function limparCampos() {
    setNome("");
    setOculto(false);
    setLocal("");
    setData("");
    setTipo("");
    setDesc("");
    setFonte("");
    setCoordenadasTemp(null);
  }

  return (
    <>
      {isOpen && <div className="drawer-overlay" onClick={onClose} />}

      <aside className={`drawer-container ${isOpen ? "open" : ""}`}>
        <button type="button" className="back-btn" onClick={onClose}>
          Voltar ◂
        </button>

        <form className="form-ocorrencia" onSubmit={enviarFormulario}>
          <h2>Registrar Ocorrência</h2>

          <label htmlFor="nome">Nome:</label>
          <input
            id="nome"
            className="f"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome..."
          />

          <div className="hide">
            <span>Ocultar nome:</span>
            <button
              type="button"
              className={"tgl" + (oculto ? " on" : "")}
              onClick={() => setOculto(!oculto)}
              aria-label="Ocultar nome"
            />
          </div>

          <label htmlFor="local">Local:</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              id="local"
              className="f"
              type="text"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Digite o endereço..."
              required
              style={{ margin: 0 }}
            />
            <button type="button" onClick={buscarEndereco} className="btn-buscar">
              Buscar
            </button>
          </div>

          <label htmlFor="data">Data:</label>
          <input
            id="data"
            className="f"
            type="datetime-local"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          <div className="lbl">Selecione o tipo do ocorrido:</div>
          <div className="types">
            {Object.entries(CATS).map(([k, [n, c]]) => (
              <button
                key={k}
                type="button"
                className={"chip" + (tipo === k ? " sel" : "")}
                style={{ color: c, borderColor: c }}
                onClick={() => setTipo(k)}
              >
                {n}
              </button>
            ))}
          </div>

          <label htmlFor="descricao">Descrição:</label>
          <textarea
            id="descricao"
            className="f"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Descreva o ocorrido..."
            required
          />

          <label htmlFor="imagem">Adicionar Imagem (Opcional):</label>
          <input
            id="imagem"
            className="f"
            type="file"
            accept="image/*"
          />

          <label htmlFor="fonte">Fonte (Opcional):</label>
          <input
            id="fonte"
            className="f"
            type="text"
            value={fonte}
            onChange={(e) => setFonte(e.target.value)}
            placeholder="Link ou origem..."
          />

          <div className="note">
            Se não houver fonte a mensagem receberá o selo de não verificada!
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={limparCampos}>
              Excluir
            </button>
            <button type="submit" className="btn-primary">
              Registrar
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

export default Formulario;