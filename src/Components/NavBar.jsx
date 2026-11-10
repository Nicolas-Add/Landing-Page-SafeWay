
import './Navbar.css';

function NavBar({ abaAtiva, setAbaAtiva, onRegistrar }) {

  // Navbar específica da aba Mural
  if (abaAtiva === 'mural') {
    return (
      <nav className="navbar-mural">

        {/* Menu e pesquisa */}
        <button className="botao-menu" aria-label="Abrir menu">
          ☰
        </button>

        <input
          type="text"
          className="pesquisa"
          placeholder="Pesquisar..."
        />

        {/* Botão para voltar ao mapa */}
        <button
          className="nav-item ativo"
          onClick={() => setAbaAtiva('mapa')}
        >
          Mapa
        </button>

        {/* Adicionar ocorrência */}
        <button
          className="botao-adicionar"
          onClick={onRegistrar}
          aria-label="Adicionar ocorrência"
        >
          +
        </button>

        <div className="navbar-espacador"></div>

        {/* Registrar ocorrência */}
        <button
          className="botao-registrar"
          onClick={onRegistrar}
        >
          Registrar Ocorrência
          <span>⚠</span>
        </button>

        {/* Perfil */}
        <button className="botao-perfil" aria-label="Perfil">
          <span>●</span>
          <span>▬</span>
        </button>

      </nav>
    );
  }

  

  // Navbar padrão
  return (
    <nav className="navbar-principal">

      {/* Menu e pesquisa */}
      <button className="botao-menu" aria-label="Abrir menu">
        ☰
      </button>

      <input
        type="text"
        className="pesquisa"
        placeholder="Pesquisar..."
      />

      {/* Navegação */}
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

      {/* Adicionar ocorrência */}
      <button
        className="botao-adicionar"
        onClick={onRegistrar}
        aria-label="Adicionar ocorrência"
      >
        +
      </button>

      <div className="navbar-espacador"></div>

      {/* Registrar ocorrência */}
      <button
        className="botao-registrar"
        onClick={onRegistrar}
      >
        Registrar Ocorrência
        <span>⚠</span>
      </button>

      {/* Perfil */}
      <button className="botao-perfil" aria-label="Perfil">
        <span>●</span>
        <span>▬</span>
      </button>

    </nav>
  );
}

export default NavBar;
