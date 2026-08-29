export default function SecaoTexto({ id, titulo, paragrafos }) {
  const idTitulo = `${id}-titulo`

  return (
    <section className="secao" id={id} aria-labelledby={idTitulo}>
      <h2 className="secao__titulo" id={idTitulo}>{titulo}</h2>
      <div className="secao__corpo">
        {/* Indice como chave: a lista e estatica, ordenada e nunca reordena.
            Usar o proprio texto colidiria se dois paragrafos comecassem igual. */}
        {paragrafos.map((texto, i) => (
          <p key={i}>{texto}</p>
        ))}
      </div>
    </section>
  )
}
