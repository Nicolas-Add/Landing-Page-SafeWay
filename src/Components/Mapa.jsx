
import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Dados de demonstração.
// Futuramente serão substituídos pelos dados da US01AT01.
const ocorrencias = [
  {
    id: 1,
    titulo: "Alagamento",
    categoria: "Risco ambiental",
    descricao: "Ponto de alagamento para teste.",
    latitude: -29.852,
    longitude: -51.184,
  },
  {
    id: 2,
    titulo: "Via danificada",
    categoria: "Infraestrutura",
    descricao: "Trecho de via danificada para teste.",
    latitude: -29.858,
    longitude: -51.175,
  },
  {
    id: 3,
    titulo: "Iluminação pública",
    categoria: "Segurança",
    descricao: "Falha de iluminação para teste.",
    latitude: -29.845,
    longitude: -51.190,
  },
];

// Verifica se as coordenadas são válidas.
function coordenadasValidas(ocorrencia) {
  const { latitude, longitude } = ocorrencia;

  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

// Monitora erros de carregamento dos blocos do mapa.
function MonitorarMapa({ informarErro }) {
  useMapEvents({
    tileerror: () => {
      informarErro(
        "Não foi possível carregar parte do mapa. Verifique sua conexão."
      );
    },
  });

  return null;
}

function Mapa() {
  const centro = [-29.852, -51.184];

  const [erroMapa, setErroMapa] = useState("");

  const ocorrenciasValidas = ocorrencias.filter(
    coordenadasValidas
  );

  return (
    <div>
      <h1>Mapa de Riscos - SafeWay</h1>

      {erroMapa && (
        <div role="alert" style={{
          color: "#9b1c1c",
          backgroundColor: "#fde8e8",
          padding: "10px",
          marginBottom: "10px",
        }}>
          {erroMapa}
        </div>
      )}

      <MapContainer
        center={centro}
        zoom={13}
        style={{ height: "500px", width: "100%" }}
      >
        <MonitorarMapa informarErro={setErroMapa} />

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {ocorrenciasValidas.map((ocorrencia) => (
          <Marker
            key={ocorrencia.id}
            position={[
              ocorrencia.latitude,
              ocorrencia.longitude,
            ]}
          >
            <Popup>
              <strong>{ocorrencia.titulo}</strong>
              <p>Categoria: {ocorrencia.categoria}</p>
              <p>{ocorrencia.descricao}</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Mapa;
