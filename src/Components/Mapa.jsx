
import { useEffect } from 'react';

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

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const POSICAO_PADRAO = [-29.9178, -51.1794];

const iconeMarcador = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Movimenta o mapa quando uma posição válida é selecionada
function MoverMapa({ posicao }) {
  const map = useMap();

  useEffect(() => {
    if (
      posicao &&
      Number.isFinite(posicao[0]) &&
      Number.isFinite(posicao[1])
    ) {
      map.flyTo(posicao, 16, {
        animate: true,
        duration: 1.5
      });
    }
  }, [posicao, map]);

  return null;
}

// Atualiza o tamanho do mapa quando ele volta a aparecer
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

function Mapa({
  marcadorTemporario,
  ocorrenciasSalvas = [],
  visivel = true
}) {
  // Verifica se existe uma posição temporária válida
  const posicaoTemporaria =
    marcadorTemporario &&
    Number.isFinite(Number(marcadorTemporario.lat)) &&
    Number.isFinite(Number(marcadorTemporario.lng))
      ? [
          Number(marcadorTemporario.lat),
          Number(marcadorTemporario.lng)
        ]
      : null;

  // IMPORTANTE:
  // Só utiliza ocorrências que possuem latitude e longitude válidas.
  const ocorrenciasComCoordenadas = ocorrenciasSalvas.filter((item) => {
    return (
      item.lat !== null &&
      item.lat !== undefined &&
      item.lng !== null &&
      item.lng !== undefined &&
      Number.isFinite(Number(item.lat)) &&
      Number.isFinite(Number(item.lng))
    );
  });

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

        <MoverMapa posicao={posicaoTemporaria} />

        <AtualizarTamanhoMapa visivel={visivel} />

        {/* Marcador temporário */}
        {posicaoTemporaria && (
          <Marker
            position={posicaoTemporaria}
            icon={iconeMarcador}
          >
            <Popup>
              <strong>Local selecionado (pendente)</strong>
              <br />
              {marcadorTemporario.endereco}
            </Popup>
          </Marker>
        )}

        {/* Ocorrências salvas com coordenadas válidas */}
        {ocorrenciasComCoordenadas.map((item) => (
          <Marker
            key={item.id}
            position={[
              Number(item.lat),
              Number(item.lng)
            ]}
            icon={iconeMarcador}
          >
            <Popup>
              <strong>{item.tipo || 'Ocorrência'}</strong>
              <br />
              {item.desc || 'Sem descrição'}
              <br />
              <small>{item.local}</small>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Mapa;
