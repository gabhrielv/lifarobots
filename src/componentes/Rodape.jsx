export default function Rodape({ rodape }) {
  const idTitulo = `${rodape.id}-titulo`

  return (
    <footer className="secao rodape" id={rodape.id} aria-labelledby={idTitulo}>
      <h2 className="secao__titulo" id={idTitulo}>{rodape.titulo}</h2>
      <dl className="rodape__campos">
        {rodape.campos.map((campo) => (
          <div className="rodape__campo" key={campo.rotulo}>
            <dt className="rodape__rotulo">{campo.rotulo}</dt>
            {/* `url` e opcional: os perfis viram link, a localizacao
                continua texto. O rotulo (INSTAGRAM, GITHUB) ja diz para
                onde o link vai, entao o proprio valor serve de nome
                acessivel sem precisar de aria-label. */}
            <dd className="rodape__valor">
              {campo.url ? (
                <a
                  className="rodape__elo"
                  href={campo.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {campo.valor}
                </a>
              ) : (
                campo.valor
              )}
            </dd>
          </div>
        ))}
      </dl>
    </footer>
  )
}
