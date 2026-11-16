import { useEffect, useRef, useState } from 'react';

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
import { useIdioma, LOCALES } from './i18n.js';

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
function localSemDuplicar(local, bairro, cidade) {
  const partes = String(local || '')
    .split(',')
    .map((parte) => parte.trim())
    .filter(Boolean);

  const normalizar = (valor) => String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const removidos = [bairro, cidade].filter(Boolean).map(normalizar);
  const unicos = partes.filter((parte, indice) => {
    const chave = normalizar(parte);
    return !removidos.includes(chave) &&
      partes.findIndex((item) => normalizar(item) === chave) === indice;
  });

  return unicos.join(', ');
}

function formatarData(timestamp, idioma = 'pt', t = (c) => c) {
  if (!timestamp) {
    return t('c.noDate');
  }

  const data = new Date(timestamp);

  if (Number.isNaN(data.getTime())) {
    return t('c.noDate');
  }

  return data.toLocaleString(LOCALES[idioma] || 'pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}

// Cartão exibido ao clicar no marcador
function CartaoOcorrencia({ item, salvo, onAlternarSalvo }) {
  const { t, idioma } = useIdioma();

  const categoria = CATEGORIAS[item.tipo] || {
    nome: 'Outros',
    cor: '#9ca3af',
    emoji: '📍'
  };
  const nomeCategoria = CATEGORIAS[item.tipo]
    ? t('cat.' + item.tipo)
    : t('cat.other');

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
          <strong>{nomeCategoria}</strong>

          <span className="popup-data">
            {formatarData(item.ts, idioma, t)}
          </span>
        </div>
      </div>

      {item.imagem && (
        <div className="popup-imagem-wrap">
          <img className="popup-imagem" src={item.imagem} alt="Imagem anexada à ocorrência" />
        </div>
      )}

      <div className="popup-conteudo">
        <div className="popup-campo">
          <strong>{t('p.location')}</strong>
          <p>{localSemDuplicar(item.local, item.bairro, item.cidade) || t('p.noLocation')}</p>
        </div>

        <div className="popup-campo">
          <strong>{t('p.description')}</strong>
          <p>{item.desc || t('p.noDescription')}</p>
        </div>

        <div className="popup-campo">
          <strong>{t('p.source')}</strong>
          <p>{item.fonte || t('c.notInformedF')}</p>
        </div>

        <div className="popup-campo">
          <strong>{t('p.neighborhood')}</strong>
          <p>{item.bairro || t('c.notInformedM')}</p>
        </div>

        <div className="popup-campo">
          <strong>{t('p.city')}</strong>
          <p>{item.cidade || t('c.notInformedF')}</p>
        </div>
      </div>

      <button type="button" className="popup-salvar" onClick={() => onAlternarSalvo?.(item.id)}>
        {salvo ? t('p.unsave') : t('p.save')}
      </button>

      <div className={`popup-status ${
        item.statusModeracao === 'Verificada' ? 'status-verificada' :
        item.statusModeracao === 'Falsa' ? 'status-falsa' : 'nao-verificado'
      }`}>
        {item.statusModeracao || 'Em análise'}
      </div>
    </div>
  );
}

// Componente principal
function CentralizarBairro({ bairro, cidade, ativar, foco }) {
  const map = useMap();
  useEffect(() => {
    if (!ativar || !bairro?.trim()) return;
    const controller = new AbortController();
    const buscar = async () => {
      try {
        const consulta = encodeURIComponent(`${bairro}, ${cidade || 'Canoas'}, RS, Brasil`);
        const resposta = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${consulta}&limit=1&countrycodes=br`, { signal: controller.signal });
        if (!resposta.ok) return;
        const dados = await resposta.json();
        if (dados[0]) {
          map.invalidateSize({ animate: false });
          map.flyTo([Number(dados[0].lat), Number(dados[0].lon)], 15, { animate: true, duration: 1.2 });
        }
      } catch (erro) {
        if (erro.name !== 'AbortError') console.error('Erro ao localizar bairro:', erro);
      }
    };
    buscar();
    return () => controller.abort();
  }, [bairro, cidade, ativar, foco, map]);
  return null;
}

function normalizar(texto) {
  return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Bairro bate com o nome salvo, ou com alguma parte do endereço da ocorrência
function correspondeBairro(item, bairro) {
  const alvo = normalizar(bairro);
  const partes = [
    item.bairro,
    ...String(item.local || '').split(','),
    ...String(item.endereco || '').split(',')
  ].map(normalizar);
  return partes.includes(alvo);
}

// Pesquisa da navbar: procura uma rua/endereço e leva o mapa até lá
function BuscarEndereco({ busca, cidade, onResultado }) {
  const map = useMap();
  const { t } = useIdioma();

  useEffect(() => {
    if (!busca?.texto) {
      onResultado(null);
      return;
    }

    const controller = new AbortController();

    async function procurar(consulta) {
      const resposta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(consulta)}&limit=1&countrycodes=br`,
        { signal: controller.signal }
      );
      if (!resposta.ok) return null;
      const dados = await resposta.json();
      return dados[0] || null;
    }

    (async () => {
      try {
        const achado =
          (await procurar(`${busca.texto}, ${cidade || 'Canoas'}, RS, Brasil`)) ||
          (await procurar(`${busca.texto}, RS, Brasil`));

        if (!achado) {
          onResultado(null);
          alert(t('p.notFound'));
          return;
        }

        const lat = Number(achado.lat);
        const lng = Number(achado.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

        onResultado({ lat, lng, nome: achado.display_name });
        map.invalidateSize({ animate: false });
        map.flyTo([lat, lng], 17, { animate: true, duration: 1 });
      } catch (erro) {
        if (erro.name !== 'AbortError') {
          console.error('Erro ao pesquisar endereço:', erro);
        }
      }
    })();

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca, cidade, map]);

  return null;
}

function Mapa({
  marcadorTemporario,
  ocorrenciasSalvas = [],
  visivel = true,
  onMoverMarcador,
  filtros = {},
  usuarioEmail,
  idsSalvos = [],
  onAlternarSalvo,
  bairroAlvo,
  cidadeAlvo,
  buscaEndereco,
  irParaBairro
}) {
  // Identifica buscas reversas para evitar respostas antigas
  const buscaEnderecoId = useRef(0);

  // Resultado da pesquisa de endereço feita na navbar
  const [resultadoBusca, setResultadoBusca] = useState(null);
  const { t } = useIdioma();

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

  const ocorrenciasFiltradas = ocorrenciasComCoordenadas.filter((item) => {
    if (filtros.tipo && item.tipo !== filtros.tipo) return false;
    if (filtros.cidade && normalizar(item.cidade) !== normalizar(filtros.cidade)) return false;
    if (filtros.bairro && !correspondeBairro(item, filtros.bairro)) return false;
    if (filtros.minhas && item.usuarioEmail !== usuarioEmail) return false;
    if (filtros.salvas && !idsSalvos.includes(item.id)) return false;
    return true;
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
        bairro,
        cidade,
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
        zoomControl={false}
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
        <BuscarEndereco
          busca={buscaEndereco}
          cidade={cidadeAlvo}
          onResultado={setResultadoBusca}
        />
        {/* Bairro escolhido no menu (filtro) */}
        <CentralizarBairro
          bairro={filtros.bairro}
          cidade={filtros.cidade || cidadeAlvo}
          ativar={visivel && Boolean(filtros.bairro)}
        />
        {/* Botão "Meu bairro": só leva o mapa até lá, sem filtrar */}
        <CentralizarBairro
          bairro={irParaBairro?.bairro}
          cidade={irParaBairro?.cidade || cidadeAlvo}
          ativar={visivel && Boolean(irParaBairro)}
          foco={irParaBairro?.id}
        />

        {/* Endereço pesquisado na navbar */}
        {resultadoBusca && (
          <Marker
            position={[resultadoBusca.lat, resultadoBusca.lng]}
            icon={criarIcone('busca')}
          >
            <Popup className="popup-safeway">
              <div className="popup-ocorrencia">
                <strong>{t('p.searchedAddress')}</strong>
                <p>{resultadoBusca.nome}</p>
              </div>
            </Popup>
          </Marker>
        )}

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
            <Popup className="popup-safeway">
              <div className="popup-ocorrencia">
                <strong>{t('p.selectedPlace')}</strong>

                <p>
                  {marcadorTemporario.local ||
                    marcadorTemporario.endereco ||
                    t('p.dragAdjust')}
                </p>

                <small>
                  {t('p.dragHint')}
                </small>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores das ocorrências registradas */}
        {ocorrenciasFiltradas.map((item) => (
          <Marker
            key={`${item.id}-${item.lat}-${item.lng}`}
            position={[
              Number(item.lat),
              Number(item.lng)
            ]}
            icon={criarIcone(item.tipo)}
          >
            <Popup className="popup-safeway">
              <CartaoOcorrencia item={item} salvo={idsSalvos.includes(item.id)} onAlternarSalvo={onAlternarSalvo} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Mapa;
