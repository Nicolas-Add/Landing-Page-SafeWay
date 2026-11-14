import { useEffect, useState } from 'react';
import './Perfil.css';
import CardOcorrencia from './CardOcorrencia.jsx';
import { useIdioma } from './i18n.js';

function Perfil({
  usuario,
  ocorrencias = [],
  onSair,
  onApagarOcorrencia,
  onAtualizarUsuario,
  onComentar,
}) {
  const { t } = useIdioma();
  const [editando, setEditando] = useState(false);
  const [foto, setFoto] = useState(usuario?.foto || null);
  const [dados, setDados] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    cidade: usuario?.cidade || '',
    bairro: usuario?.bairro || '',
  });
  const [receberEmail, setReceberEmail] = useState(usuario?.receberEmail ?? true);

  useEffect(() => {
    setDados({
      nome: usuario?.nome || '',
      email: usuario?.email || '',
      cidade: usuario?.cidade || '',
      bairro: usuario?.bairro || '',
    });
    setFoto(usuario?.foto || null);
    setReceberEmail(usuario?.receberEmail ?? true);
  }, [usuario]);

  const minhasOcorrencias = ocorrencias
    .filter((ocorrencia) => Boolean(usuario?.email) && ocorrencia.usuarioEmail === usuario.email)
    .sort((a, b) => (b.ts || 0) - (a.ts || 0));

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setDados((anterior) => ({ ...anterior, [name]: value }));
  }

  function salvarPerfil(event) {
    event.preventDefault();
    const usuarioAtualizado = {
      ...usuario,
      ...dados,
      foto,
      receberEmail,
    };
    try {
      localStorage.setItem('sw-user', JSON.stringify(usuarioAtualizado));
      onAtualizarUsuario?.(usuarioAtualizado);
      setEditando(false);
    } catch {
      alert(t('pf.saveError'));
    }
  }

  function alterarFoto(event) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;
    if (!arquivo.type.startsWith('image/')) {
      alert(t('pf.selectImage'));
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => setFoto(leitor.result);
    leitor.readAsDataURL(arquivo);
  }

  return (
    <div className="pagina-perfil">
      <div className="perfil-container">
        <section className="perfil-superior">
          <div className="perfil-avatar-area">
            <div className="perfil-avatar">
              {foto ? <img src={foto} alt={t('pf.photoAlt')} /> : (
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <circle cx="50" cy="30" r="17" />
                  <path d="M13 91 C13 65 29 48 50 48 C71 48 87 65 87 91 Z" />
                </svg>
              )}
            </div>
            <label className="perfil-alterar-foto" title={t('pf.photo')}>
              <span>▣</span>
              <input type="file" accept="image/*" onChange={alterarFoto} />
            </label>
          </div>

          <div className="perfil-dados">
            <div className="perfil-nome-linha">
              <h1>{dados.nome || t('c.user')}</h1>
              <button type="button" className="perfil-editar" onClick={() => setEditando(!editando)}>
                {editando ? t('pf.cancel') : t('pf.edit')}
                <span>{editando ? '×' : '✎'}</span>
              </button>
            </div>

            {editando ? (
              <form className="perfil-form-edicao" onSubmit={salvarPerfil}>
                <label>{t('pf.name')}
                  <input name="nome" value={dados.nome} onChange={atualizarCampo} required />
                </label>
                <label>{t('pf.city')}
                  <input name="cidade" value={dados.cidade} onChange={atualizarCampo} placeholder={t('pf.phCity')} />
                </label>
                <label>{t('pf.neighborhood')}
                  <input name="bairro" value={dados.bairro} onChange={atualizarCampo} placeholder={t('pf.phNeigh')} />
                </label>
                <label>{t('pf.email')}
                  <input name="email" type="email" value={dados.email} onChange={atualizarCampo} required />
                </label>
                <button className="perfil-salvar" type="submit">{t('pf.save')}</button>
              </form>
            ) : (
              <>
                <div className="perfil-informacoes">
                  <div className="perfil-campo"><strong>{t('pf.cityL')}</strong><span>{dados.cidade || t('c.notInformedM')}</span></div>
                  <div className="perfil-campo"><strong>{t('pf.neighL')}</strong><span>{dados.bairro || t('c.notInformedM')}</span></div>
                  <div className="perfil-campo perfil-campo-email"><strong>{t('pf.emailL')}</strong><span>{dados.email || t('c.notInformedM')}</span></div>
                </div>
                <div className="perfil-notificacoes">
                  <span>{t('pf.notify')}</span>
                  <button type="button" className={`perfil-toggle ${receberEmail ? 'ligado' : ''}`}
                    onClick={() => setReceberEmail(!receberEmail)}
                    aria-label={t('pf.toggleNotify')} aria-pressed={receberEmail}>
                    <span />
                  </button>
                </div>
              </>
            )}

            <button type="button" className="perfil-sair" onClick={onSair}>{t('pf.logout')} <span>⇥</span></button>
          </div>
        </section>

        <section className="perfil-ocorrencias-area">
          <h2>{t('pf.mine')}</h2>
          {minhasOcorrencias.length === 0 ? (
            <div className="perfil-sem-ocorrencias">{t('pf.none')}</div>
          ) : (
            <div className="sw perfil-sw">
              <div className="grid">
                {minhasOcorrencias.map((ocorrencia) => (
                  <CardOcorrencia
                    key={ocorrencia.id}
                    p={ocorrencia}
                    onComment={onComentar}
                    podeApagar
                    onApagar={onApagarOcorrencia}
                  />
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Perfil;
