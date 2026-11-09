import { useState } from 'react';
import Formulario from './Formulario.jsx';
import NavBar from './NavBar.jsx';
import Mapa from './Mapa.jsx';

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
    setOcorrenciasSalvas((prev) => [...prev, novaOcorrencia]);
  }

  return (
    <div className="aplicativo">
      <NavBar
        abaAtiva={abaAtiva}
        setAbaAtiva={trocarAba}
        onRegistrar={registrarOcorrencia}
      />

      <main className="conteudo-principal">
        {abaAtiva === 'mapa' ? (
          <section className="pagina-mapa">
            <Mapa
              marcadorTemporario={marcadorTemporario}
              ocorrenciasSalvas={ocorrenciasSalvas}
            />
          </section>
        ) : abaAtiva === 'bairro' ? (
          <section className="pagina-bairro" style={{ padding: '100px 30px', color: '#fff' }}>
            <h1>Meu bairro</h1>
            <p>Acompanhe as ocorrências e os alertas registrados na sua região.</p>
          </section>
        ) : abaAtiva === 'mural' ? (
          <section className="pagina-mural" style={{ padding: '100px 30px', color: '#fff' }}>
            <h1>Mural da comunidade</h1>
            <p>Confira as informações e os avisos compartilhados pela comunidade.</p>
          </section>
        ) : null}
      </main>

      <Formulario
        isOpen={mostrarFormulario}
        onClose={() => {
          setMostrarFormulario(false);
          setMarcadorTemporario(null); // Limpa o temporário se fechar
        }}
        setMarcadorTemporario={setMarcadorTemporario}
        onSalvarOcorrencia={salvarNovaOcorrencia}
      />
    </div>
  );
}

export default App;