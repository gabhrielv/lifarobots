export default function Rodape({ rodape }) {
  const idTitulo = `${rodape.id}-titulo`

  return (
    <footer className="secao rodape" id={rodape.id} aria-labelledby={idTitulo}>
      <h2 className="secao__titulo" id={idTitulo}>{rodape.titulo}</h2>
      <dl className="rodape__campos">
        {rodape.campos.map((campo) => (
          <div className="rodape__campo" key={campo.rotulo}>
            <dt className="rodape__rotulo">{campo.rotulo}</dt>
            <dd className="rodape__valor">{campo.valor}</dd>
          </div>
        ))}
      </dl>
    </footer>
  )
}
