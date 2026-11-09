import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./Mapa.css";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const iconeMarcador = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MoverMapa({ posicao }) {
  const map = useMap();
  useEffect(() => {
    if (posicao) {
      map.flyTo(posicao, 16, { animate: true });
    }
  }, [posicao, map]);
  return null;
}

function Mapa({ marcadorTemporario, ocorrenciasSalvas = [] }) {
  const posicaoPadrao = [-29.9178, -51.1794]; // Canoas, RS

  const centroAtual = marcadorTemporario
    ? [marcadorTemporario.lat, marcadorTemporario.lng]
    : posicaoPadrao;

  return (
    <div className="container-mapa">
      <MapContainer
        center={posicaoPadrao}
        zoom={14}
        scrollWheelZoom={true}
        className="mapa"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MoverMapa posicao={centroAtual} />

        {/* Marcador temporário (enquanto preenche) */}
        {marcadorTemporario && (
          <Marker
            position={[marcadorTemporario.lat, marcadorTemporario.lng]}
            icon={iconeMarcador}
          >
            <Popup>
              <strong>Local Selecionado (Pendente)</strong>
              <br />
              {marcadorTemporario.endereco}
            </Popup>
          </Marker>
        )}

        {/* Marcadores salvos definitivamente */}
        {ocorrenciasSalvas.map((item, index) => (
          <Marker
            key={index}
            position={[item.lat, item.lng]}
            icon={iconeMarcador}
          >
            <Popup>
              <strong>{item.tipoDeRisco}</strong>
              <br />
              {item.descricao}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Mapa;