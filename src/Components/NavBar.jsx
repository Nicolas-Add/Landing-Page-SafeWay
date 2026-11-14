import { useEffect, useRef, useState } from 'react';
import './Navbar.css';
import { useIdioma, IDIOMAS } from './i18n.js';

const CATEGORIAS = [
  ['obras', 'Obras e infraestrutura', '#f0643c'],
  ['serv', 'Serviços Urbanos', '#cfcfcf'],
  ['saude', 'Saúde e Assistência', '#34d399'],
  ['defesa', 'Defesa civil e alertas', '#3b82f6'],
  ['eventos', 'Eventos e Cultura', '#e879c5'],
];

const BAIRROS = {
  Canoas: [
    'Mathias Velho',
    'Niterói',
    'Igara',
    'Estância Velha',
    'Centro',
  ],
  'Porto Alegre': [
    'Centro Histórico',
    'Cidade Baixa',
  ],
};

export default function NavBar({
  abaAtiva,
  setAbaAtiva,
  onRegistrar,
  onPerfil,
  usuario,
  filtros = {},
  onAlterarFiltros,
  idsSalvos = [],
  onSair,
  temaEscuro,
  onAlternarTema,
  busca = '',
  onAlterarBusca,
  onBuscar,
  onAlterarIdioma,
}) {
  const { t, idioma } = useIdioma();
  const [menuAberto, setMenuAberto] = useState(false);
  const [buscaMobileAberta, setBuscaMobileAberta] = useState(false);
  const inputBuscaRef = useRef(null);

  // Fecha o menu e a busca mobile ao pressionar ESC
  useEffect(() => {
    function fecharComEsc(evento) {
      if (evento.key === 'Escape') {
        setMenuAberto(false);
        setBuscaMobileAberta(false);
      }
    }

    window.addEventListener('keydown', fecharComEsc);

    return () => {
      window.removeEventListener('keydown', fecharComEsc);
    };
  }, []);

  function abrirBuscaMobile() {
    setBuscaMobileAberta(true);
    setTimeout(() => {
      inputBuscaRef.current?.focus();
    }, 30);
  }

  // Altera um filtro específico
  function alterarFiltro(chave, valor) {
    onAlterarFiltros?.((anterior) => ({
      ...anterior,
      [chave]: valor,
    }));

    setAbaAtiva('mapa');
  }

  // Ativa ou desativa filtros booleanos
  function alternarFlag(chave) {
    onAlterarFiltros?.((anterior) => ({
      ...anterior,
      [chave]: !anterior[chave],
    }));

    setAbaAtiva('mapa');
  }

  // Seleciona uma cidade
  function selecionarCidade(cidade) {
    onAlterarFiltros?.((anterior) => ({
      ...anterior,
      cidade: anterior.cidade === cidade ? '' : cidade,
      bairro: '',
    }));

    setAbaAtiva('mapa');
  }

  // Seleciona um bairro
  function selecionarBairro(bairro) {
    const jaSelecionado = filtros.bairro === bairro;
    const cidadeDoBairro =
      Object.keys(BAIRROS).find((c) => BAIRROS[c].includes(bairro)) || '';

    onAlterarFiltros?.((anterior) => ({
      ...anterior,
      bairro: jaSelecionado ? '' : bairro,
      cidade: jaSelecionado ? anterior.cidade : cidadeDoBairro,
    }));

    setAbaAtiva('mapa');
  }

  // Limpa todos os filtros
  function limparFiltros() {
    onAlterarFiltros?.({
      tipo: '',
      bairro: '',
      cidade: '',
      minhas: false,
      salvas: false,
    });

    setAbaAtiva('mapa');
  }

  const bairrosDisponiveis = filtros.cidade
    ? BAIRROS[filtros.cidade] || []
    : Object.values(BAIRROS).flat();

  const quantidadeFiltros =
    Number(Boolean(filtros.tipo)) +
    Number(Boolean(filtros.bairro)) +
    Number(Boolean(filtros.cidade)) +
    Number(Boolean(filtros.minhas)) +
    Number(Boolean(filtros.salvas));

  return (
    <>
      {/* NAVBAR */}
      <nav className={`navbar-principal ${buscaMobileAberta ? 'busca-ativa' : ''}`}>

        <button
          className="botao-menu"
          onClick={() => setMenuAberto(true)}
          aria-label={t('nav.menu')}
          aria-expanded={menuAberto}
        >
          ☰
        </button>

        <div className="navbar-logo">
          <strong>SafeWay</strong>
        </div>

        
        <div className="navbar-links">

          <button
            className={`nav-item ${
              abaAtiva === 'mapa' ? 'ativo' : ''
            }`}
            onClick={() => setAbaAtiva('bairro')}
          >
            {t('nav.myNeighborhood')}
          </button>

          {(abaAtiva === 'mural' || abaAtiva === 'perfil') && (
            <button
              className="nav-item"
              onClick={() => setAbaAtiva('mapa')}
            >
              {t('nav.map')}
            </button>
          )}

          {abaAtiva !== 'mural' && (
            <button
              className={`nav-item ${
                abaAtiva === 'mural' ? 'ativo' : ''
              }`}
              onClick={() => setAbaAtiva('mural')}
            >
              {t('nav.wall')}
            </button>
          )}

        </div>


        <div className="navbar-acoes">
          <form
            className="pesquisa-wrap"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              onBuscar?.(busca);
              setBuscaMobileAberta(false);
            }}
          >
            <input
              ref={inputBuscaRef}
              type="text"
              className="pesquisa"
              placeholder={t('nav.search')}
              value={busca}
              onChange={(e) => onAlterarBusca?.(e.target.value)}
              aria-label={t('nav.search')}
            />
            {(busca || buscaMobileAberta) && (
              <button
                type="button"
                className="pesquisa-limpar"
                onClick={() => {
                  onAlterarBusca?.('');
                  onBuscar?.('');
                  setBuscaMobileAberta(false);
                }}
                aria-label={t('nav.clearSearch')}
              >
                ×
              </button>
            )}
          </form>

          {!buscaMobileAberta && (
            <button
              type="button"
              className="botao-lupa"
              onClick={abrirBuscaMobile}
              aria-label={t('nav.search')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
            </button>
          )}

          <button
            className="botao-registrar"
            onClick={onRegistrar}
            aria-label={t('nav.register')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span className="texto-registrar">{t('nav.register')}</span>
          </button>

          <button
            className="botao-perfil"
            onClick={onPerfil}
            aria-label={t('nav.openProfile')}
          >
            {usuario?.nome
              ? usuario.nome.charAt(0).toUpperCase()
              : '♙'}
          </button>
        </div>
      </nav>

      {/* FUNDO ESCURO DO MENU */}
      {menuAberto && (
        <div
          className="menu-overlay"
          onClick={() => setMenuAberto(false)}
        />
      )}

      {/* MENU LATERAL */}
      <aside
        className={`menu-lateral ${
          menuAberto ? 'aberto' : ''
        }`}
        aria-hidden={!menuAberto}
      >

        {/* CABEÇALHO */}
        <div className="menu-cabecalho">
          <div>
            <strong>SafeWay</strong>
            <p>{t('nav.subtitle')}</p>
          </div>

          <button
            className="menu-fechar"
            onClick={() => setMenuAberto(false)}
            aria-label={t('nav.closeMenu')}
          >
            ×
          </button>
        </div>

        {/* FILTROS */}
        <div className="menu-conteudo">

          {/* OCORRÊNCIAS */}
          <section className="menu-secao">
            <h3>{t('nav.occurrences')}</h3>

            <button
              className={`menu-link ${
                filtros.minhas ? 'selecionado' : ''
              }`}
              onClick={() => alternarFlag('minhas')}
            >
              <span>{t('nav.mine')}</span>
              <span>
                {filtros.minhas ? '✓' : '○'}
              </span>
            </button>

            <button
              className={`menu-link ${
                filtros.salvas ? 'selecionado' : ''
              }`}
              onClick={() => alternarFlag('salvas')}
            >
              <span>{t('nav.saved')}</span>
              <span>
                {filtros.salvas ? '✓' : '○'}
              </span>
            </button>
          </section>

          <div className="menu-divisor" />

          {/* CATEGORIAS */}
          <section className="menu-secao">
            <h3>{t('nav.categories')}</h3>

            <div className="menu-opcoes">
              {CATEGORIAS.map(([id, nome, cor]) => (
                <button
                  key={id}
                  className={`menu-chip ${
                    filtros.tipo === id ? 'selecionado' : ''
                  }`}
                  style={{ '--chip-cor': cor }}
                  onClick={() =>
                    alterarFiltro(
                      'tipo',
                      filtros.tipo === id ? '' : id
                    )
                  }
                >
                  <span className="menu-chip-ponto" />
                  {t('cat.' + id)}
                </button>
              ))}
            </div>
          </section>

          <div className="menu-divisor" />

          {/* CIDADES */}
          <section className="menu-secao">
            <h3>{t('nav.cities')}</h3>

            <div className="menu-opcoes">
              {Object.keys(BAIRROS).map((cidade) => (
                <button
                  key={cidade}
                  className={`menu-chip ${
                    filtros.cidade === cidade
                      ? 'selecionado'
                      : ''
                  }`}
                  onClick={() => selecionarCidade(cidade)}
                >
                  {cidade}
                </button>
              ))}
            </div>
          </section>

          <div className="menu-divisor" />

          {/* BAIRROS */}
          <section className="menu-secao">
            <h3>{t('nav.neighborhoods')}</h3>

            <div className="menu-opcoes">
              {bairrosDisponiveis.map((bairro) => (
                <button
                  key={bairro}
                  className={`menu-chip ${
                    filtros.bairro === bairro
                      ? 'selecionado'
                      : ''
                  }`}
                  onClick={() => selecionarBairro(bairro)}
                >
                  {bairro}
                </button>
              ))}
            </div>
          </section>

          {/* LIMPAR FILTROS */}
          <button
            className="menu-limpar"
            onClick={limparFiltros}
          >
            {t('nav.clearFilters')}
            {quantidadeFiltros > 0 && (
              <span>{quantidadeFiltros}</span>
            )}
          </button>

          <div className="menu-divisor" />

          {/* IDIOMA */}
          <section className="menu-secao">
            <h3>{t('nav.language')}</h3>

            <select
              className="menu-select"
              value={idioma}
              onChange={(evento) =>
                onAlterarIdioma?.(evento.target.value)
              }
            >
              {IDIOMAS.map(([codigo, nome]) => (
                <option key={codigo} value={codigo}>{nome}</option>
              ))}
            </select>
          </section>

          <div className="menu-divisor" />

          {/* TEMA */}
          <section className="menu-secao">
            <h3>{t('nav.appearance')}</h3>

            <button
              className="menu-link"
              onClick={onAlternarTema}
            >
              <span>
                {temaEscuro ? t('nav.dark') : t('nav.light')}
              </span>

              <span>
                {temaEscuro ? '🌙' : '☀️'}
              </span>
            </button>
          </section>

          <div className="menu-divisor" />

          {/* PERFIL E SAIR */}
          <section className="menu-secao">
            <button
              className="menu-link"
              onClick={() => {
                setMenuAberto(false);
                onPerfil?.();
              }}
            >
              <span>{t('nav.myProfile')}</span>
              <span>♙</span>
            </button>

            <button
              className="menu-link menu-sair"
              onClick={() => {
                setMenuAberto(false);
                onSair?.();
              }}
            >
              <span>{t('nav.logout')}</span>
              <span>↪</span>
            </button>
          </section>

        </div>
      </aside>
    </>
  );
}