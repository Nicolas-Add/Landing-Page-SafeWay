
import { useState } from 'react';

import Formulario from './Formulario.jsx';
import NavBar from './NavBar.jsx';
import Mapa from './Mapa.jsx';

function App() {
  // Controla a aba selecionada
  const [abaAtiva, setAbaAtiva] = useState('mapa');

  // Controla a exibição do formulário
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Abre o formulário de ocorrência
  function registrarOcorrencia() {
    setMostrarFormulario(true);
  }

  // Altera a aba selecionada
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

      {/* Conteúdo principal */}
      <main className="conteudo-principal">

        {mostrarFormulario ? (

          // Formulário de registro
          <section className="pagina-formulario">
            <h1>Registrar ocorrência</h1>

            <Formulario />
          </section>

        ) : abaAtiva === 'mapa' ? (

          // Aba Mapa
          <section className="pagina-mapa">
            <Mapa />
          </section>

        ) : abaAtiva === 'bairro' ? (

          // Aba Meu bairro
          <section className="pagina-bairro">
            <h1>Meu bairro</h1>
            <p>
              Acompanhe as ocorrências e os alertas
              registrados na sua região.
            </p>
          </section>

        ) : abaAtiva === 'mural' ? (

          // Aba Mural
          <section className="pagina-mural">
            <h1>Mural da comunidade</h1>
            <p>
              Confira as informações e os avisos
              compartilhados pela comunidade.
            </p>
          </section>

        ) : null}

      </main>

    </div>
  );
}

export default App;
