
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
    setOcorrenciasSalvas((prev) => [
      ...prev,
      novaOcorrencia
    ]);
  }

  return (
    <div className="aplicativo">

      <NavBar
        abaAtiva={abaAtiva}
        setAbaAtiva={trocarAba}
        onRegistrar={registrarOcorrencia}
      />

      <main className="conteudo-principal">

        {/* Mapa permanece montado */}
        <section
          className={`pagina-mapa ${
            abaAtiva !== 'mapa' ? 'pagina-oculta' : ''
          }`}
        >
          <Mapa
            marcadorTemporario={marcadorTemporario}
            ocorrenciasSalvas={ocorrenciasSalvas}
            visivel={abaAtiva === 'mapa'}
          />
        </section>

        {/* Meu bairro */}
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

        {/* Mural permanece montado */}
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

      {/* Formulário */}
      <Formulario
        isOpen={mostrarFormulario}
        onClose={() => {
          setMostrarFormulario(false);
          setMarcadorTemporario(null);
        }}
        setMarcadorTemporario={setMarcadorTemporario}
        onSalvarOcorrencia={salvarNovaOcorrencia}
      />

    </div>
  );
}

export default App;
