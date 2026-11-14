import { useEffect, useState } from 'react';

import SafeWayLogin from './Login.jsx';
import Formulario from './Formulario.jsx';
import NavBar from './NavBar.jsx';
import Mapa from './Mapa.jsx';
import Mural from './Mural.jsx';
import Perfil from './Perfil.jsx';
import { IdiomaContext, criarT } from './i18n.js';
import './tema.css';

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
  const [busca, setBusca] = useState('');
  const [buscaEndereco, setBuscaEndereco] = useState(null);
  const [irParaBairro, setIrParaBairro] = useState(null);

  // Mantém os marcadores e suas coordenadas após atualizar/reabrir o site.
  const [ocorrenciasSalvas, setOcorrenciasSalvas] = useState(() => {
    try {
      const dados = JSON.parse(localStorage.getItem('sw-ocorrencias') || '[]');
      return Array.isArray(dados) ? dados : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sw-ocorrencias', JSON.stringify(ocorrenciasSalvas));
    } catch (erro) {
      console.error('Não foi possível salvar as ocorrências no navegador:', erro);
    }
  }, [ocorrenciasSalvas]);

  const [filtrosMapa, setFiltrosMapa] = useState({
    tipo: '',
    bairro: '',
    cidade: '',
    minhas: false,
    salvas: false,
  });
  const [idsSalvos, setIdsSalvos] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sw-salvos') || '[]'); }
    catch { return []; }
  });
  const [temaEscuro, setTemaEscuro] = useState(() => {
    try { return localStorage.getItem('sw-theme') !== '"light"'; }
    catch { return true; }
  });

  const [idioma, setIdioma] = useState(() => {
    try { return localStorage.getItem('sw-lang') || 'pt'; }
    catch { return 'pt'; }
  });
  const t = criarT(idioma);

  function alterarIdioma(novo) {
    setIdioma(novo);
    try { localStorage.setItem('sw-lang', novo); } catch {}
  }

  function realizarLogin(usuarioLogado) {
    setUsuario(usuarioLogado);
    setAbaAtiva('mapa');
  }

  function sairDaConta() {
    localStorage.removeItem('sw-user');
    setUsuario(null);
    setAbaAtiva('mapa');
    setMostrarFormulario(false);
    setMarcadorTemporario(null);
    setBusca('');
    setBuscaEndereco(null);
    setIrParaBairro(null);
  }

  function atualizarUsuario(usuarioAtualizado) {
    const emailAnterior = usuario?.email;
    if (emailAnterior && emailAnterior !== usuarioAtualizado.email) {
      setOcorrenciasSalvas((anteriores) => anteriores.map((item) =>
        item.usuarioEmail === emailAnterior
          ? { ...item, usuarioEmail: usuarioAtualizado.email }
          : item
      ));
    }
    setUsuario(usuarioAtualizado);
    try {
      localStorage.setItem('sw-user', JSON.stringify(usuarioAtualizado));
    } catch (erro) {
      console.error('Não foi possível atualizar o usuário:', erro);
    }
  }

  function registrarOcorrencia() {
    if (usuario?.guest) {
      alert(t('a.guestRegister'));
      return;
    }
    setAbaAtiva('mapa');
    setMostrarFormulario(true);
  }

  function abrirPerfil() {
    setAbaAtiva('perfil');
    setMostrarFormulario(false);
  }

  function trocarAba(aba) {
    if (aba === 'bairro') {
      if (!usuario?.bairro?.trim()) {
        alert(t('a.addNeighborhood'));
        setAbaAtiva('perfil');
        return;
      }
      // "Meu bairro" só leva o mapa até lá, sem filtrar as ocorrências
      setIrParaBairro({
        bairro: usuario.bairro.trim(),
        cidade: (usuario.cidade || '').trim(),
        id: Date.now(),
      });
      setAbaAtiva('mapa');
      setMostrarFormulario(false);
      return;
    }
    setAbaAtiva(aba);
    setMostrarFormulario(false);
  }

  // Pesquisa da navbar: procura uma rua/endereço e leva o mapa até lá.
  function alterarBusca(valor) {
    setBusca(valor);
    if (!valor.trim()) setBuscaEndereco(null);
  }

  function pesquisarEndereco(texto) {
    const limpo = String(texto || '').trim();
    if (!limpo) {
      setBuscaEndereco(null);
      return;
    }
    setBuscaEndereco({ texto: limpo, id: Date.now() });
    setAbaAtiva('mapa');
    setMostrarFormulario(false);
  }

  function salvarNovaOcorrencia(novaOcorrencia) {
    const lat = marcadorTemporario?.lat ?? novaOcorrencia.lat;
    const lng = marcadorTemporario?.lng ?? novaOcorrencia.lng;
    const ocorrenciaComCoordenadas = {
      ...novaOcorrencia,
      id: novaOcorrencia.id || Date.now(),
      lat: Number(lat),
      lng: Number(lng),
      usuarioEmail: usuario?.email || null,
      usuarioNome: usuario?.nome || 'Visitante',
    };

    setOcorrenciasSalvas((prev) => [...prev, ocorrenciaComCoordenadas]);
    setMarcadorTemporario(null);
    setMostrarFormulario(false);
  }

  function apagarOcorrencia(id) {
    const confirmar = window.confirm(t('a.confirmDelete'));
    if (!confirmar) return;
    setOcorrenciasSalvas((anteriores) => anteriores.filter((item) => item.id !== id));
    setIdsSalvos((anteriores) => {
      const atualizados = anteriores.filter((itemId) => itemId !== id);
      try { localStorage.setItem('sw-salvos', JSON.stringify(atualizados)); } catch {}
      return atualizados;
    });
  }

  // Adiciona o comentário SOMENTE na ocorrência comentada (não duplica nenhum card).
  function comentarOcorrencia(id, texto) {
    if (usuario?.guest) {
      alert(t('a.guestComment'));
      return;
    }
    const comentario = {
      nome: usuario?.nome || 'Usuário',
      texto,
      ts: Date.now(),
    };
    setOcorrenciasSalvas((anteriores) => anteriores.map((item) =>
      item.id === id
        ? { ...item, comments: [...(item.comments || []), comentario] }
        : item
    ));
  }

  function alternarSalvo(id) {
    setIdsSalvos((anteriores) => {
      const atualizados = anteriores.includes(id)
        ? anteriores.filter((itemId) => itemId !== id)
        : [...anteriores, id];
      try { localStorage.setItem('sw-salvos', JSON.stringify(atualizados)); } catch {}
      return atualizados;
    });
  }

  function alternarTema() {
    setTemaEscuro((anterior) => {
      const novoTema = !anterior;
      try { localStorage.setItem('sw-theme', JSON.stringify(novoTema ? 'dark' : 'light')); } catch {}
      return novoTema;
    });
  }

  if (!usuario) return <SafeWayLogin onLogin={realizarLogin} />;

  return (
    <IdiomaContext.Provider value={{ idioma, t }}>
    <div className={`aplicativo ${temaEscuro ? 'tema-escuro' : 'tema-claro'}`}>
      <NavBar
        abaAtiva={abaAtiva}
        setAbaAtiva={trocarAba}
        onRegistrar={registrarOcorrencia}
        onPerfil={abrirPerfil}
        usuario={usuario}
        filtros={filtrosMapa}
        onAlterarFiltros={setFiltrosMapa}
        idsSalvos={idsSalvos}
        onSair={sairDaConta}
        temaEscuro={temaEscuro}
        onAlternarTema={alternarTema}
        busca={busca}
        onAlterarBusca={alterarBusca}
        onBuscar={pesquisarEndereco}
        onAlterarIdioma={alterarIdioma}
      />

      <main className="conteudo-principal">
        <section className={`pagina-mapa ${abaAtiva !== 'mapa' ? 'pagina-oculta' : ''}`}>
          <Mapa
            marcadorTemporario={marcadorTemporario}
            ocorrenciasSalvas={ocorrenciasSalvas}
            visivel={abaAtiva === 'mapa'}
            onMoverMarcador={setMarcadorTemporario}
            filtros={filtrosMapa}
            usuarioEmail={usuario?.email}
            idsSalvos={idsSalvos}
            onAlternarSalvo={alternarSalvo}
            bairroAlvo={usuario?.bairro}
            cidadeAlvo={usuario?.cidade}
            buscaEndereco={buscaEndereco}
            irParaBairro={irParaBairro}
          />
        </section>

        <section className={`pagina-mural ${abaAtiva !== 'mural' ? 'pagina-oculta' : ''}`}>
          <Mural
            ocorrenciasSalvas={ocorrenciasSalvas}
            usuarioEmail={usuario?.email}
            onApagarOcorrencia={apagarOcorrencia}
            onComentar={comentarOcorrencia}
          />
        </section>

        <section className={`pagina-perfil-area ${abaAtiva !== 'perfil' ? 'pagina-oculta' : ''}`}>
          <Perfil
            usuario={usuario}
            ocorrencias={ocorrenciasSalvas}
            onSair={sairDaConta}
            onApagarOcorrencia={apagarOcorrencia}
            onAtualizarUsuario={atualizarUsuario}
            onComentar={comentarOcorrencia}
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
    </IdiomaContext.Provider>
  );
}

export default App;
