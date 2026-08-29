import { useState } from 'react'
import { caminho } from '../lib/caminho.js'
import { AREA_TODOS, extrairAreas, filtrarPessoas } from '../lib/equipe.js'

export default function Equipe({ secao, grupos }) {
  const [area, setArea] = useState(AREA_TODOS)
  const areas = extrairAreas(grupos)
  const pessoas = filtrarPessoas(grupos, area)
  const idTitulo = `${secao.id}-titulo`

  return (
    <section className="secao equipe" id={secao.id} aria-labelledby={idTitulo}>
      <h2 className="secao__titulo" id={idTitulo}>{secao.titulo}</h2>

      <div className="equipe__filtros" role="tablist" aria-label={secao.titulo}>
        {areas.map((nome) => (
          <button
            className={`aba${nome === area ? ' aba--ativa' : ''}`}
            key={nome}
            type="button"
            role="tab"
            aria-selected={nome === area}
            onClick={() => setArea(nome)}
          >
            [{nome.toUpperCase()}]
          </button>
        ))}
      </div>

      <ul className="equipe__grade">
        {pessoas.map((pessoa) => (
          <li className="cartao" key={pessoa.id}>
            <div className="cartao__retrato">
              {pessoa.foto && (
                <img className="cartao__foto" src={caminho(pessoa.foto)} alt={pessoa.nome} />
              )}
            </div>
            <div className="cartao__dados">
              <p className="cartao__nome">{pessoa.nome}</p>
              <p className="cartao__especialidade">/ {pessoa.especialidade}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
