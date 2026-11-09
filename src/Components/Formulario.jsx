import { useState } from "react";
import "./Formulario.css";

function Formulario({ isOpen, onClose, setMarcadorTemporario, onSalvarOcorrencia }) {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  const data_atual = `${ano}-${mes}-${dia}`;

  const [nome, setNome] = useState("");
  const [local, setLocal] = useState("");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipoDeRisco, setTipoDeRisco] = useState("Obras e Infraestrutura");
  const [outroRisco, setOutroRisco] = useState("");
  const [imagem, setImagem] = useState(null);
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
        setMarcadorTemporario(coords); // Move o mapa e exibe o pin temporário
      } else {
        alert("Endereço não encontrado no mapa.");
      }
    } catch (erro) {
      console.error("Erro ao buscar endereço:", erro);
    }
  }

  function enviarFormulario(event) {
    event.preventDefault();

    if (!coordenadasTemp) {
      alert("Por favor, busque e selecione um local válido no mapa clicando em 'Buscar'.");
      return;
    }

    if (data > data_atual) {
      alert("A data não pode ser maior que a data atual!");
      return;
    }

    const riscoFinal = tipoDeRisco === "Outro" ? outroRisco.trim() : tipoDeRisco;

    const novaOcorrencia = {
      nome,
      local,
      lat: coordenadasTemp.lat,
      lng: coordenadasTemp.lng,
      tipoDeRisco: riscoFinal,
      data,
      descricao,
    };

    onSalvarOcorrencia(novaOcorrencia); // Salva definitivamente
    setMarcadorTemporario(null);
    onClose();
  }

  return (
    <>
      {isOpen && <div className="drawer-overlay" onClick={onClose} />}

      <aside className={`drawer-container ${isOpen ? "open" : ""}`}>
        <button type="button" className="back-btn" onClick={onClose}>
          Voltar &larr;
        </button>

        <form className="form-ocorrencia" onSubmit={enviarFormulario}>
          <h2>Registrar Ocorrência</h2>

          <label htmlFor="nome">Nome:</label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />

          <label htmlFor="local">Local:</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              id="local"
              type="text"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
              placeholder="Digite o endereço..."
              required
            />
            <button type="button" onClick={buscarEndereco} className="btn-buscar">
              Buscar
            </button>
          </div>

          <label htmlFor="tipoRisco">Tipo de risco:</label>
          <select
            id="tipoRisco"
            value={tipoDeRisco}
            onChange={(e) => setTipoDeRisco(e.target.value)}
          >
            <option value="Obras e Infraestrutura">Obras e Infraestrutura</option>
            <option value="Serviços Urbanos">Serviços Urbanos</option>
            <option value="Saúde e Assistência">Saúde e Assistência</option>
            <option value="Defesa civil e alertas">Defesa civil e alertas</option>
            <option value="Eventos e Cultura">Eventos e Cultura</option>
            <option value="Outro">Outro</option>
          </select>

          <label htmlFor="data">Data:</label>
          <input
            id="data"
            type="date"
            value={data}
            max={data_atual}
            onChange={(e) => setData(e.target.value)}
            required
          />

          <label htmlFor="descricao">Descrição:</label>
          <textarea
            id="descricao"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
          />

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
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