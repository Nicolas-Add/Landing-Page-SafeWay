
import { useEffect, useRef, useState } from "react";
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

const norm = (t) =>
  String(t || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

function Formulario({
  isOpen,
  onClose,
  setMarcadorTemporario,
  onSalvarOcorrencia,
  marcadorTemporario,
}) {
  const [nome, setNome] = useState("");
  const [oculto, setOculto] = useState(false);
  const [local, setLocal] = useState("");
  const [data, setData] = useState("");
  const [tipo, setTipo] = useState("");
  const [desc, setDesc] = useState("");
  const [fonte, setFonte] = useState("");
  const [enderecoLocalizado, setEnderecoLocalizado] = useState("");

  // Evita uma nova busca quando o endereço veio do arraste do mapa
  const ignorarProximaBusca = useRef(false);

  // Busca automaticamente o endereço digitado
  useEffect(() => {
    const endereco = local.trim();

    if (!isOpen || endereco.length < 5) {
      return;
    }

    // O endereço foi atualizado pela busca reversa do mapa
    if (ignorarProximaBusca.current) {
      ignorarProximaBusca.current = false;
      return;
    }

    const controller = new AbortController();

    const temporizador = setTimeout(async () => {
      try {
        const query = encodeURIComponent(
          `${endereco}, Canoas, RS, Brasil`
        );

        const resposta = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${query}&limit=1&countrycodes=br`,
          { signal: controller.signal }
        );

        if (!resposta.ok) {
          throw new Error("Falha ao buscar endereço.");
        }

        const dados = await resposta.json();

        if (dados.length > 0) {
          const coords = {
            lat: Number(dados[0].lat),
            lng: Number(dados[0].lon),
            endereco: dados[0].display_name,
            local: endereco,
            origem: "busca",
          };

          if (
            Number.isFinite(coords.lat) &&
            Number.isFinite(coords.lng)
          ) {
            setMarcadorTemporario?.(coords);
            setEnderecoLocalizado(endereco);
          } else {
            setEnderecoLocalizado("");
          }
        } else {
          setEnderecoLocalizado("");
        }
      } catch (erro) {
        if (erro.name !== "AbortError") {
          console.error("Erro ao buscar endereço:", erro);
          setEnderecoLocalizado("");
        }
      }
    }, 1000);

    return () => {
      clearTimeout(temporizador);
      controller.abort();
    };
  }, [local, isOpen, setMarcadorTemporario]);

  // Atualiza o campo Local quando o marcador é arrastado
  useEffect(() => {
    if (
      marcadorTemporario?.origem === "arraste" &&
      marcadorTemporario.local
    ) {
      const novoLocal = marcadorTemporario.local;

      ignorarProximaBusca.current = true;

      setLocal(novoLocal);
      setEnderecoLocalizado(novoLocal);
    }
  }, [marcadorTemporario]);

  function alterarLocal(valor) {
    setLocal(valor);
    setEnderecoLocalizado("");

    // Se o campo foi apagado, remove o marcador antigo
    if (valor.trim().length < 5) {
      setMarcadorTemporario?.(null);
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

    if (
      !marcadorTemporario ||
      !Number.isFinite(Number(marcadorTemporario.lat)) ||
      !Number.isFinite(Number(marcadorTemporario.lng)) ||
      norm(enderecoLocalizado) !== norm(local)
    ) {
      alert(
        "Aguarde a localização ser encontrada ou atualizada no mapa antes de registrar."
      );
      return;
    }

    const loc = local.trim();

    const bairro =
      Object.values(BAIRROS)
        .flat()
        .find((b) => norm(loc).includes(norm(b))) ||
      loc ||
      "Centro";

    const cidade =
      Object.keys(BAIRROS).find((c) =>
        BAIRROS[c].includes(bairro)
      ) || "Canoas";

    const novaOcorrencia = {
      id: Date.now(),
      nome: nome.trim() || "Usuário",
      oculto,
      local: loc,
      lat: Number(marcadorTemporario.lat),
      lng: Number(marcadorTemporario.lng),
      endereco: marcadorTemporario.endereco || loc,
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
    setEnderecoLocalizado("");
    ignorarProximaBusca.current = false;
    setMarcadorTemporario?.(null);
  }

  return (
    <>
      {isOpen && (
        <div className="drawer-overlay" />
      )}

      <aside className={`drawer-container ${isOpen ? "open" : ""}`}>
        <button
          type="button"
          className="back-btn"
          onClick={onClose}
        >
          Voltar ◂
        </button>

        <form
          className="form-ocorrencia"
          onSubmit={enviarFormulario}
        >
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

          <input
            id="local"
            className="f"
            type="text"
            value={local}
            onChange={(e) => alterarLocal(e.target.value)}
            placeholder="Digite o endereço ou local..."
            required
          />

          <small className="ajuda-local">
            Digite o endereço e aguarde a localização aparecer.
            Você também pode arrastar o marcador no mapa para
            atualizar automaticamente a rua e o bairro.
          </small>

          {local.trim().length >= 5 && (
            <div className="local-encontrado">
              {norm(enderecoLocalizado) === norm(local) &&
              marcadorTemporario ? (
                <span>✓ Localização atualizada</span>
              ) : (
                <span>Procurando localização...</span>
              )}
            </div>
          )}

          <label htmlFor="data">Data:</label>

          <input
            id="data"
            className="f"
            type="datetime-local"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          <div className="lbl">
            Selecione o tipo do ocorrido:
          </div>

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

          <label htmlFor="imagem">
            Adicionar Imagem (Opcional):
          </label>

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
            Se não houver fonte, a mensagem receberá o selo de não verificada!
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={limparCampos}
            >
              Excluir
            </button>

            <button
              type="submit"
              className="btn-primary"
            >
              Registrar
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}

export default Formulario;
