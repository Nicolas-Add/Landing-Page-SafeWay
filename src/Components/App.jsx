
import { useState } from 'react';

import SafeWayLogin from './Login.jsx';
import Formulario from './Formulario.jsx';
import NavBar from './NavBar.jsx';
import Mapa from './Mapa.jsx';
import Mural from './Mural.jsx';
import Perfil from './Perfil.jsx';

function lerUsuarioSalvo() {
  try {
    const usuario = localStorage.getItem('sw-user');
    return usuario ? JSON.parse(usuario) : null;
  } catch {
    return null;
  }
}

function App() {
  const [usuario, setUsuario] = useState(lerUsuarioSalvo);

  const [abaAtiva, setAbaAtiva] = useState('mapa');

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [marcadorTemporario, setMarcadorTemporario] = useState(null);

  const [ocorrenciasSalvas, setOcorrenciasSalvas] = useState([]);

  // Login concluído
  function realizarLogin(usuarioLogado) {
    setUsuario(usuarioLogado);
    setAbaAtiva('mapa');
  }

  // Sair da conta
  function sairDaConta() {
    localStorage.removeItem('sw-user');

    setUsuario(null);
    setAbaAtiva('mapa');
    setMostrarFormulario(false);
    setMarcadorTemporario(null);
  }

  // Abrir formulário
  function registrarOcorrencia() {
    if (usuario?.guest) {
      alert('Entre com uma conta para registrar ocorrências.');
      return;
    }

    setMostrarFormulario(true);
  }

  // Abrir perfil
  function abrirPerfil() {
    setAbaAtiva('perfil');
    setMostrarFormulario(false);
  }

  // Trocar abas
  function trocarAba(aba) {
    setAbaAtiva(aba);
    setMostrarFormulario(false);
  }

  // Salvar ocorrência
  function salvarNovaOcorrencia(novaOcorrencia) {
    const lat = marcadorTemporario?.lat ?? novaOcorrencia.lat;
    const lng = marcadorTemporario?.lng ?? novaOcorrencia.lng;

    const ocorrenciaComCoordenadas = {
      ...novaOcorrencia,
      lat: Number(lat),
      lng: Number(lng),

      // Identificação do responsável pelo registro
      usuarioEmail: usuario?.email || null,
      usuarioNome: usuario?.nome || 'Visitante'
    };

    console.log('Ocorrência salva:', ocorrenciaComCoordenadas);

    setOcorrenciasSalvas((prev) => [
      ...prev,
      ocorrenciaComCoordenadas
    ]);

    setMarcadorTemporario(null);
    setMostrarFormulario(false);
  }

  // Sem login, mostrar tela de entrada
  if (!usuario) {
    return (
      <SafeWayLogin onLogin={realizarLogin} />
    );
  }

  return (
    <div className="aplicativo">

      <NavBar
        abaAtiva={abaAtiva}
        setAbaAtiva={trocarAba}
        onRegistrar={registrarOcorrencia}
        onPerfil={abrirPerfil}
      />

      <main className="conteudo-principal">

        {/* MAPA */}
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

        {/* MEU BAIRRO */}
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

        {/* MURAL */}
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

        {/* PERFIL */}
        <section
          className={`pagina-perfil-area ${
            abaAtiva !== 'perfil' ? 'pagina-oculta' : ''
          }`}
        >
          <Perfil
            usuario={usuario}
            ocorrencias={ocorrenciasSalvas}
            onSair={sairDaConta}
          />
        </section>

      </main>

      {/* FORMULÁRIO */}
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
