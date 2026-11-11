
import { useState } from 'react';
import './Perfil.css';

function Perfil({ usuario, ocorrencias = [], onSair }) {
  const [editando, setEditando] = useState(false);
  const [foto, setFoto] = useState(usuario?.foto || null);

  const [dados, setDados] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    cidade: usuario?.cidade || '',
    bairro: usuario?.bairro || '',
  });

  const [receberEmail, setReceberEmail] = useState(
    usuario?.receberEmail ?? true
  );

  const minhasOcorrencias = ocorrencias.filter(
    (ocorrencia) => ocorrencia.usuarioEmail === usuario?.email
  );

  function atualizarCampo(event) {
    const { name, value } = event.target;

    setDados((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  }

  function salvarPerfil(event) {
    event.preventDefault();

    const usuarioAtualizado = {
      ...usuario,
      ...dados,
      receberEmail,
    };

    try {
      localStorage.setItem('sw-user', JSON.stringify(usuarioAtualizado));
    } catch {
      alert('Não foi possível salvar as alterações.');
      return;
    }

    setEditando(false);
  }

  function alterarFoto(event) {
    const arquivo = event.target.files?.[0];

    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
      alert('Selecione um arquivo de imagem.');
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      setFoto(leitor.result);
    };

    leitor.readAsDataURL(arquivo);
  }

  function formatarData(data) {
    if (!data) return 'Data não informada';

    const valor = new Date(data);

    if (Number.isNaN(valor.getTime())) return data;

    return valor.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="pagina-perfil">
      <div className="perfil-container">

        {/* INFORMAÇÕES DO USUÁRIO */}
        <section className="perfil-superior">

          <div className="perfil-avatar-area">
            <div className="perfil-avatar">
              {foto ? (
                <img src={foto} alt="Foto do perfil" />
              ) : (
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="30" r="17" />
                  <path d="M13 91 C13 65 29 48 50 48 C71 48 87 65 87 91 Z" />
                </svg>
              )}
            </div>

            <label className="perfil-alterar-foto" title="Alterar foto">
              <span>▣</span>
              <input
                type="file"
                accept="image/*"
                onChange={alterarFoto}
              />
            </label>
          </div>

          <div className="perfil-dados">

            <div className="perfil-nome-linha">
              <h1>{dados.nome || 'Usuário'}</h1>

              <button
                className="perfil-editar"
                onClick={() => setEditando(!editando)}
              >
                {editando ? 'Cancelar' : 'Editar perfil'}
                <span>{editando ? '×' : '✎'}</span>
              </button>
            </div>

            {editando ? (
              <form className="perfil-form-edicao" onSubmit={salvarPerfil}>
                <label>
                  Nome
                  <input
                    name="nome"
                    value={dados.nome}
                    onChange={atualizarCampo}
                    required
                  />
                </label>

                <label>
                  Cidade
                  <input
                    name="cidade"
                    value={dados.cidade}
                    onChange={atualizarCampo}
                    placeholder="Sua cidade"
                  />
                </label>

                <label>
                  Bairro
                  <input
                    name="bairro"
                    value={dados.bairro}
                    onChange={atualizarCampo}
                    placeholder="Seu bairro"
                  />
                </label>

                <label>
                  E-mail
                  <input
                    name="email"
                    type="email"
                    value={dados.email}
                    onChange={atualizarCampo}
                    required
                  />
                </label>

                <button className="perfil-salvar" type="submit">
                  Salvar alterações
                </button>
              </form>
            ) : (
              <>
                <div className="perfil-informacoes">
                  <div className="perfil-campo">
                    <strong>Cidade:</strong>
                    <span>{dados.cidade || 'Não informado'}</span>
                  </div>

                  <div className="perfil-campo">
                    <strong>Bairro:</strong>
                    <span>{dados.bairro || 'Não informado'}</span>
                  </div>

                  <div className="perfil-campo perfil-campo-email">
                    <strong>Email:</strong>
                    <span>{dados.email || 'Não informado'}</span>
                  </div>
                </div>

                <div className="perfil-notificacoes">
                  <span>
                    Receber email para ocorrências perto de onde eu moro:
                  </span>

                  <button
                    type="button"
                    className={`perfil-toggle ${receberEmail ? 'ligado' : ''}`}
                    onClick={() => setReceberEmail(!receberEmail)}
                    aria-label="Alternar notificações por e-mail"
                    aria-pressed={receberEmail}
                  >
                    <span />
                  </button>
                </div>
              </>
            )}

            <button
              className="perfil-sair"
              onClick={onSair}
            >
              Sair <span>⇥</span>
            </button>

          </div>
        </section>

        {/* MINHAS OCORRÊNCIAS */}
        <section className="perfil-ocorrencias-area">
          <h2>Minhas ocorrências</h2>

          {minhasOcorrencias.length === 0 ? (
            <div className="perfil-sem-ocorrencias">
              Você ainda não registrou nenhuma ocorrência.
            </div>
          ) : (
            <div className="perfil-lista-ocorrencias">
              {minhasOcorrencias.map((ocorrencia, index) => (
                <article
                  className="perfil-card-ocorrencia"
                  key={ocorrencia.id || index}
                >
                  <div className="perfil-card-topo">
                    <span className="perfil-data">
                      {formatarData(
                        ocorrencia.data || ocorrencia.createdAt
                      )}
                    </span>

                    <span className="perfil-categoria">
                      {ocorrencia.categoria ||
                        ocorrencia.tipo ||
                        'Ocorrência'}
                    </span>
                  </div>

                  <p>
                    {ocorrencia.descricao ||
                      ocorrencia.titulo ||
                      'Sem descrição disponível.'}
                  </p>

                  {ocorrencia.local && (
                    <span className="perfil-local">
                      {ocorrencia.local}
                    </span>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default Perfil;
