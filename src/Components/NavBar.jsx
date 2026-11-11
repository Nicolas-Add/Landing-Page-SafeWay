
import './Navbar.css';

function NavBar({
  abaAtiva,
  setAbaAtiva,
  onRegistrar,
  onPerfil
}) {

  if (abaAtiva === 'mural') {
    return (
      <nav className="navbar-mural">

        <button className="botao-menu" aria-label="Abrir menu">
          ☰
        </button>

        <input
          type="text"
          className="pesquisa"
          placeholder="Pesquisar..."
        />

        <button
          className="nav-item ativo"
          onClick={() => setAbaAtiva('mapa')}
        >
          Mapa
        </button>

        <button
          className="botao-adicionar"
          onClick={onRegistrar}
          aria-label="Adicionar ocorrência"
        >
          +
        </button>

        <div className="navbar-espacador"></div>

        <button
          className="botao-registrar"
          onClick={onRegistrar}
        >
          Registrar Ocorrência
          <span>⚠</span>
        </button>

        <button
          className="botao-perfil"
          onClick={onPerfil}
          aria-label="Abrir perfil"
        >
          <span>●</span>
          <span>▬</span>
        </button>

      </nav>
    );
  }

  if (abaAtiva === 'perfil') {
    return (
      <nav className="navbar-mural">

        <button className="botao-menu" aria-label="Abrir menu">
          ☰
        </button>

        <input
          type="text"
          className="pesquisa"
          placeholder="Pesquisar..."
        />

        <button
          className="nav-item ativo"
          onClick={() => setAbaAtiva('mapa')}
        >
          Mapa
        </button>

        <button
        className={`nav-item ${abaAtiva === 'mural' ? 'ativo' : ''}`}
        onClick={() => setAbaAtiva('mural')}
        >
        Mural
        </button>


        <button
          className="botao-adicionar"
          onClick={onRegistrar}
          aria-label="Adicionar ocorrência"
        >
          +
        </button>

        <div className="navbar-espacador"></div>

        <button
          className="botao-registrar"
          onClick={onRegistrar}
        >
          Registrar Ocorrência
          <span>⚠</span>
        </button>

        <button
          className="botao-perfil"
          onClick={onPerfil}
          aria-label="Abrir perfil"
        >
          <span>●</span>
          <span>▬</span>
        </button>

      </nav>
    );
  }

  return (
    <nav className="navbar-principal">

      <button className="botao-menu" aria-label="Abrir menu">
        ☰
      </button>

      <input
        type="text"
        className="pesquisa"
        placeholder="Pesquisar..."
      />

      <button
        className={`nav-item ${abaAtiva === 'bairro' ? 'ativo' : ''}`}
        onClick={() => setAbaAtiva('bairro')}
      >
        Meu bairro
      </button>

      <button
        className={`nav-item ${abaAtiva === 'mural' ? 'ativo' : ''}`}
        onClick={() => setAbaAtiva('mural')}
      >
        Mural
      </button>

      <button
        className="botao-adicionar"
        onClick={onRegistrar}
        aria-label="Adicionar ocorrência"
      >
        +
      </button>

      <div className="navbar-espacador"></div>

      <button
        className="botao-registrar"
        onClick={onRegistrar}
      >
        Registrar Ocorrência
        <span>⚠</span>
      </button>

      <button
        className={`botao-perfil ${abaAtiva === 'perfil' ? 'ativo' : ''}`}
        onClick={onPerfil}
        aria-label="Abrir perfil"
      >
        <span>●</span>
        <span>▬</span>
      </button>

    </nav>
  );
}

export default NavBar;
