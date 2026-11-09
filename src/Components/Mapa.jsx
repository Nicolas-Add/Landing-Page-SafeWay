
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./Mapa.css";

// Corrige o caminho dos ícones dos marcadores no Vite
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

function Mapa() {
  // Coordenadas de demonstração
  const posicaoInicial = [-29.9178, -51.1794];

  return (
    <div className="container-mapa">

      <MapContainer
        center={posicaoInicial}
        zoom={14}
        scrollWheelZoom={true}
        className="mapa"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={posicaoInicial}
          icon={iconeMarcador}
        >
          <Popup>
            <strong>Ocorrência registrada</strong>
            <br />
            Ponto de demonstração do SafeWay.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default Mapa;
