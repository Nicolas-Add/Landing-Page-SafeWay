
import { useState } from 'react';

import Formulario from './Formulario.jsx';
import NavBar from './NavBar.jsx';
import Mapa from './Mapa.jsx';
import Mural from './Mural.jsx';

function App() {
  const [abaAtiva, setAbaAtiva] = useState('mapa');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [marcadorTemporario, setMarcadorTemporario] = useState(null);
  const [ocorrenciasSalvas, setOcorrenciasSalvas] = useState([]);

  function registrarOcorrencia() {
    setMostrarFormulario(true);
  }

  function trocarAba(aba) {
    setAbaAtiva(aba);
    setMostrarFormulario(false);
  }

  function salvarNovaOcorrencia(novaOcorrencia) {
    const lat = marcadorTemporario?.lat ?? novaOcorrencia.lat;
    const lng = marcadorTemporario?.lng ?? novaOcorrencia.lng;

    const ocorrenciaComCoordenadas = {
      ...novaOcorrencia,
      lat: Number(lat),
      lng: Number(lng),
    };

    console.log('Ocorrência salva:', ocorrenciaComCoordenadas);

    setOcorrenciasSalvas((prev) => [
      ...prev,
      ocorrenciaComCoordenadas,
    ]);

    setMarcadorTemporario(null);
  }

  return (
    <div className="aplicativo">
      <NavBar
        abaAtiva={abaAtiva}
        setAbaAtiva={trocarAba}
        onRegistrar={registrarOcorrencia}
      />

      <main className="conteudo-principal">
        <section
          className={`pagina-mapa ${
            abaAtiva !== 'mapa' ? 'pagina-oculta' : ''
          }`}
        >
          <Mapa
            marcadorTemporario={marcadorTemporario}
            ocorrenciasSalvas={ocorrenciasSalvas}
            visivel={abaAtiva === 'mapa'}
            onMoverMarcador={setMarcadorTemporario}
          />
        </section>

        <section
          className={`pagina-bairro ${
            abaAtiva !== 'bairro' ? 'pagina-oculta' : ''
          }`}
        >
          <h1>Meu bairro</h1>
          <p>
            Acompanhe as ocorrências e os alertas
            registrados na sua região.
          </p>
        </section>

        <section
          className={`pagina-mural ${
            abaAtiva !== 'mural' ? 'pagina-oculta' : ''
          }`}
        >
          <Mural
            ocorrenciasSalvas={ocorrenciasSalvas}
            onSalvarOcorrencia={salvarNovaOcorrencia}
          />
        </section>
      </main>

      <Formulario
        isOpen={mostrarFormulario}
        onClose={() => {
          setMostrarFormulario(false);
          setMarcadorTemporario(null);
        }}
        setMarcadorTemporario={setMarcadorTemporario}
        marcadorTemporario={marcadorTemporario}
        onSalvarOcorrencia={salvarNovaOcorrencia}
      />
    </div>
  );
}

export default App;
