
import { useEffect, useRef } from 'react';

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import './Mapa.css';

// Posição inicial: Canoas - RS
const POSICAO_PADRAO = [-29.9178, -51.1794];

// Categorias das ocorrências
const CATEGORIAS = {
  obras: {
    nome: 'Obras e infraestrutura',
    cor: '#f0643c',
    emoji: '🚧'
  },
  serv: {
    nome: 'Serviços Urbanos',
    cor: '#9ca3af',
    emoji: '🔧'
  },
  saude: {
    nome: 'Saúde e Assistência',
    cor: '#34d399',
    emoji: '🏥'
  },
  defesa: {
    nome: 'Defesa civil e alertas',
    cor: '#3b82f6',
    emoji: '⚠️'
  },
  eventos: {
    nome: 'Eventos e Cultura',
    cor: '#a855f7',
    emoji: '🎭'
  }
};

// Cria os marcadores personalizados
function criarIcone(tipo) {
  const categoria = CATEGORIAS[tipo] || {
    nome: 'Outros',
    cor: '#ffffff',
    emoji: '📍'
  };

  return L.divIcon({
    className: 'marcador-personalizado',
    html: `
      <div class="icone-mapa"
        style="--cor-marcador: ${categoria.cor}">
        <span>${categoria.emoji}</span>
      </div>
    `,
    iconSize: [38, 46],
    iconAnchor: [19, 43],
    popupAnchor: [0, -42]
  });
}

// Movimenta o mapa quando uma nova localização é encontrada.
// Não movimenta novamente quando o usuário arrasta o marcador.
function MoverMapa({ posicao, origem }) {
  const map = useMap();

  const lat = posicao?.[0];
  const lng = posicao?.[1];

  useEffect(() => {
    if (
      origem === 'arraste' ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return;
    }

    map.flyTo([lat, lng], 16, {
      animate: true,
      duration: 1
    });
  }, [lat, lng, origem, map]);

  return null;
}

// Atualiza as dimensões do mapa ao trocar de aba
function AtualizarTamanhoMapa({ visivel }) {
  const map = useMap();

  useEffect(() => {
    if (!visivel) return;

    const temporizador = setTimeout(() => {
      map.invalidateSize({
        pan: false,
        animate: false
      });
    }, 150);

    return () => clearTimeout(temporizador);
  }, [visivel, map]);

  return null;
}

// Formata a data da ocorrência
function formatarData(timestamp) {
  if (!timestamp) {
    return 'Data não informada';
  }

  const data = new Date(timestamp);

  if (Number.isNaN(data.getTime())) {
    return 'Data não informada';
  }

  return data.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

// Cartão exibido ao clicar no marcador
function CartaoOcorrencia({ item }) {
  const categoria = CATEGORIAS[item.tipo] || {
    nome: 'Outros',
    cor: '#9ca3af',
    emoji: '📍'
  };

  return (
    <div className="popup-ocorrencia">
      <div className="popup-cabecalho">
        <span
          className="popup-icone"
          style={{ backgroundColor: categoria.cor }}
        >
          {categoria.emoji}
        </span>

        <div className="popup-titulo">
          <strong>{categoria.nome}</strong>

          <span className="popup-data">
            {formatarData(item.ts)}
          </span>
        </div>
      </div>

      <div className="popup-conteudo">
        <div className="popup-campo">
          <strong>Localização</strong>
          <p>{item.local || 'Local não informado'}</p>
        </div>

        <div className="popup-campo">
          <strong>Descrição</strong>
          <p>{item.desc || 'Sem descrição'}</p>
        </div>

        <div className="popup-campo">
          <strong>Fonte da informação</strong>
          <p>{item.fonte || 'Não informada'}</p>
        </div>

        <div className="popup-campo">
          <strong>Bairro</strong>
          <p>{item.bairro || 'Não informado'}</p>
        </div>
      </div>

      <div
        className={`popup-status ${
          item.fonte ? 'fonte-informada' : 'nao-verificado'
        }`}
      >
        {item.fonte ? 'Fonte informada' : 'Não verificada'}
      </div>
    </div>
  );
}

// Componente principal
function Mapa({
  marcadorTemporario,
  ocorrenciasSalvas = [],
  visivel = true,
  onMoverMarcador
}) {
  // Identifica buscas reversas para evitar respostas antigas
  const buscaEnderecoId = useRef(0);

  // Filtra ocorrências com coordenadas válidas
  const ocorrenciasComCoordenadas = ocorrenciasSalvas.filter((item) => {
    if (
      item.lat === null ||
      item.lat === undefined ||
      item.lng === null ||
      item.lng === undefined
    ) {
      return false;
    }

    const lat = Number(item.lat);
    const lng = Number(item.lng);

    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  });

  // Verifica o marcador temporário
  const posicaoTemporaria =
    marcadorTemporario &&
    Number.isFinite(Number(marcadorTemporario.lat)) &&
    Number.isFinite(Number(marcadorTemporario.lng))
      ? [
          Number(marcadorTemporario.lat),
          Number(marcadorTemporario.lng)
        ]
      : null;

  // Busca o endereço correspondente às coordenadas após arrastar
  async function finalizarArraste(event) {
    const novaPosicao = event.target.getLatLng();

    const lat = novaPosicao.lat;
    const lng = novaPosicao.lng;

    // Identificador da busca atual
    const buscaAtual = ++buscaEnderecoId.current;

    // Atualiza a posição do marcador imediatamente
    onMoverMarcador?.({
      lat,
      lng,
      endereco: 'Atualizando endereço...',
      local: '',
      origem: 'arraste'
    });

    try {
      const resposta = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );

      if (!resposta.ok) {
        throw new Error('Não foi possível identificar o endereço.');
      }

      const dados = await resposta.json();

      // Ignora respostas de arrastes anteriores
      if (buscaAtual !== buscaEnderecoId.current) {
        return;
      }

      const endereco = dados.address || {};

      const rua =
        endereco.road ||
        endereco.pedestrian ||
        endereco.residential ||
        endereco.footway ||
        endereco.path ||
        '';

      const bairro =
        endereco.suburb ||
        endereco.neighbourhood ||
        endereco.quarter ||
        endereco.city_district ||
        '';

      const cidade =
        endereco.city ||
        endereco.town ||
        endereco.municipality ||
        endereco.village ||
        '';

      const partes = [rua, bairro, cidade].filter(Boolean);

      const novoLocal = partes.length > 0
        ? partes.join(', ')
        : dados.display_name || '';

      onMoverMarcador?.({
        lat,
        lng,
        endereco: dados.display_name || novoLocal,
        local: novoLocal,
        origem: 'arraste'
      });

    } catch (erro) {
      if (buscaAtual === buscaEnderecoId.current) {
        console.error('Erro ao atualizar endereço:', erro);
      }
    }
  }

  return (
    <div className="container-mapa">
      <MapContainer
        center={POSICAO_PADRAO}
        zoom={14}
        scrollWheelZoom={true}
        className="mapa"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MoverMapa
          posicao={posicaoTemporaria}
          origem={marcadorTemporario?.origem}
        />

        <AtualizarTamanhoMapa visivel={visivel} />

        {/* Marcador temporário que pode ser arrastado */}
        {posicaoTemporaria && (
          <Marker
            position={posicaoTemporaria}
            icon={criarIcone('defesa')}
            draggable={true}
            eventHandlers={{
              dragend: finalizarArraste
            }}
          >
            <Popup>
              <div className="popup-ocorrencia">
                <strong>Local selecionado</strong>

                <p>
                  {marcadorTemporario.local ||
                    marcadorTemporario.endereco ||
                    'Arraste para ajustar a localização'}
                </p>

                <small>
                  Arraste o marcador para mudar o endereço.
                </small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores das ocorrências registradas */}
        {ocorrenciasComCoordenadas.map((item) => (
          <Marker
            key={item.id}
            position={[
              Number(item.lat),
              Number(item.lng)
            ]}
            icon={criarIcone(item.tipo)}
          >
            <Popup className="popup-safeway">
              <CartaoOcorrencia item={item} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Mapa;
