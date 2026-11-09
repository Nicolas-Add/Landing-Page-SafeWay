import { useState } from 'react';

import Formulario from './Formulario.jsx';
import NavBar from './NavBar.jsx';
import Mapa from './Mapa.jsx';

function App() {
  const [abaAtiva, setAbaAtiva] = useState('mapa');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  function registrarOcorrencia() {
    setMostrarFormulario(true);
  }

  function trocarAba(aba) {
    setAbaAtiva(aba);
    setMostrarFormulario(false);
  }

  return (
    <div className="aplicativo">

      {/* Barra de navegação */}
      <NavBar
        abaAtiva={abaAtiva}
        setAbaAtiva={trocarAba}
        onRegistrar={registrarOcorrencia}
      />

      {/* Conteúdo principal (Mantém o mapa ou as abas fixas no fundo) */}
      <main className="conteudo-principal">
        {abaAtiva === 'mapa' ? (
          <section className="pagina-mapa">
            <Mapa />
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

      {/* Painel lateral flutuante (Puxadinho) acionado pelo estado */}
      <Formulario 
        isOpen={mostrarFormulario} 
        onClose={() => setMostrarFormulario(false)} 
      />

    </div>
  );
}

export default App;