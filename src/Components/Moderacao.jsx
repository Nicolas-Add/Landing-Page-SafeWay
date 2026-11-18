
import './Moderacao.css';
import { useIdioma } from './i18n.js';

const ADMIN_EMAIL = 'admin@gmail.com';

export default function Moderacao({
  usuario,
  usuarios = [],
  ocorrencias = [],
  onAlterarPapel,
  onModerarOcorrencia
}) {
  const { t } = useIdioma();

  const ehAdmin =
    usuario?.role === 'admin' ||
    usuario?.email?.toLowerCase() === ADMIN_EMAIL;

  const pendentes = ocorrencias.filter(
    (item) =>
      (item.statusModeracao || 'Em análise') === 'Em análise'
  );

  return (
    <div className="moderacao-pagina">

      {/* CABEÇALHO */}
      <header className="moderacao-topo">
        <div>
          <span className="moderacao-selo">
            {ehAdmin ? t('nav.admin') : t('nav.moderator')}
          </span>

          <h1>
            {ehAdmin
              ? t('nav.adminPanel')
              : t('nav.moderation')}
          </h1>

          <p>
            {ehAdmin
              ? t('nav.adminHelp')
              : t('nav.moderationHelp')}
          </p>
        </div>
      </header>

      {/* GERENCIAMENTO DE MODERADORES */}
      {ehAdmin && (
        <section className="moderacao-bloco">

          <h2>{t('nav.manageModerators')}</h2>

          <p className="moderacao-ajuda">
            {t('nav.promoteRemoveModerators')}
          </p>

          {usuarios.filter(
            (u) =>
              u.email &&
              u.email.toLowerCase() !== ADMIN_EMAIL
          ).length === 0 ? (

            <p className="moderacao-vazio">
              {t('nav.noUsers')}
            </p>

          ) : (

            <div className="moderacao-usuarios">

              {usuarios
                .filter(
                  (u) =>
                    u.email &&
                    u.email.toLowerCase() !== ADMIN_EMAIL
                )
                .map((u) => (

                  <div
                    className="moderacao-usuario"
                    key={u.email}
                  >
                    <div>
                      <strong>
                        {u.nome || t('nav.user')}
                      </strong>

                      <span>{u.email}</span>
                    </div>

                    <button
                      type="button"
                      className={
                        u.role === 'moderator'
                          ? 'remover'
                          : ''
                      }
                      onClick={() =>
                        onAlterarPapel?.(
                          u.email,
                          u.role === 'moderator'
                            ? 'user'
                            : 'moderator'
                        )
                      }
                    >
                      {u.role === 'moderator'
                        ? t('nav.removeModerator')
                        : t('nav.makeModerator')}
                    </button>
                  </div>

                ))}

            </div>
          )}

        </section>
      )}

      {/* OCORRÊNCIAS PARA ANÁLISE */}
      <section className="moderacao-bloco">

        <div className="moderacao-titulo-linha">
          <h2>{t('nav.reviewOccurrences')}</h2>

          <span>
            {pendentes.length} {t('nav.pending')}
          </span>
        </div>

        {ocorrencias.length === 0 ? (

          <p className="moderacao-vazio">
            {t('nav.noOccurrences')}
          </p>

        ) : (

          <div className="moderacao-lista">

            {ocorrencias
              .slice()
              .sort((a, b) => (b.ts || 0) - (a.ts || 0))
              .map((item) => {

                const status =
                  item.statusModeracao || 'Em análise';

                return (
                  <article
                    className="moderacao-card"
                    key={item.id}
                  >

                    <div className="moderacao-card-topo">

                      <strong>
                        {item.tipo
                          ? t(`cat.${item.tipo}`)
                          : t('nav.occurrence')}
                      </strong>

                      <span
                        className={`moderacao-status ${
                          status === 'Verificada'
                            ? 'verificada'
                            : status === 'Falsa'
                              ? 'falsa'
                              : ''
                        }`}
                      >
                        {status === 'Verificada'
                          ? t('nav.verified')
                          : status === 'Falsa'
                            ? t('nav.false')
                            : t('nav.underReview')}
                      </span>

                    </div>

                    {/* IMAGEM ANEXADA */}
                    {item.imagem && (
                      <img
                        className="moderacao-foto"
                        src={item.imagem}
                        alt={t('nav.attachedImage')}
                      />
                    )}

                    {/* DESCRIÇÃO */}
                    <p>
                      {item.desc || t('nav.noDescription')}
                    </p>

                    {/* LOCALIZAÇÃO */}
                    <small>
                      {[
                        item.local,
                        item.bairro,
                        item.cidade
                      ]
                        .filter(Boolean)
                        .join(' • ') ||
                        t('nav.locationNotInformed')}
                    </small>

                    {/* AUTOR */}
                    <small>
                      {t('nav.publishedBy')}{' '}
                      {item.usuarioNome ||
                        item.nome ||
                        t('nav.user')}
                    </small>

                    {/* AÇÕES DE MODERAÇÃO */}
                    {status === 'Em análise' && (

                      <div className="moderacao-acoes">

                        <button
                          type="button"
                          className="aprovar"
                          onClick={() =>
                            onModerarOcorrencia?.(
                              item.id,
                              'Verificada'
                            )
                          }
                        >
                          {t('nav.markVerified')}
                        </button>

                        <button
                          type="button"
                          className="reprovar"
                          onClick={() =>
                            onModerarOcorrencia?.(
                              item.id,
                              'Falsa'
                            )
                          }
                        >
                          {t('nav.markFalse')}
                        </button>

                      </div>

                    )}

                  </article>
                );

              })}

          </div>

        )}

      </section>

      {/* AVISO */}
      <p className="moderacao-aviso">
        {t('nav.moderationWarning')}
      </p>

    </div>
  );
}
