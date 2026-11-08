
import './Navbar.css';

function NavBar({ abaAtiva, setAbaAtiva, onRegistrar }) {
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

      <button
        className="botao-adicionar"
        onClick={onRegistrar}
        aria-label="Adicionar ocorrência"
      >
        +
      </button>

      {/* Espaço flexível */}
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
