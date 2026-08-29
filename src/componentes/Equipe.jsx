import { useState } from 'react'
import { caminho } from '../lib/caminho.js'
import { AREA_TODOS, extrairAreas, filtrarPessoas } from '../lib/equipe.js'

/** Monta o rotulo da aba a partir do formato do JSON, substituindo o
 *  marcador {area} — nenhuma pontuacao de decoracao fica literal aqui. */
function rotuloAba(nome, secao) {
  const texto = nome === AREA_TODOS ? secao.rotuloTodos : nome.toUpperCase()
  return secao.formatoAba.replace('{area}', texto)
}

export default function Equipe({ secao, equipe }) {
  const [area, setArea] = useState(AREA_TODOS)
  const areas = extrairAreas(equipe)
  const pessoas = filtrarPessoas(equipe, area)
  const idTitulo = `${secao.id}-titulo`

  return (
    <section className="secao equipe" id={secao.id} aria-labelledby={idTitulo}>
      <h2 className="secao__titulo" id={idTitulo}>{secao.titulo}</h2>

      {/* Isto e um filtro sobre uma unica lista, nao um conjunto de paineis
          de conteudo diferentes — o padrao ARIA de abas prometeria paineis
          associados e navegacao por seta que este controle nao entrega.
          Botoes de alternancia descrevem o que de fato acontece aqui. */}
      <div className="equipe__filtros" role="group" aria-label={secao.titulo}>
        {areas.map((nome) => (
          <button
            className={`aba${nome === area ? ' aba--ativa' : ''}`}
            key={nome}
            type="button"
            aria-pressed={nome === area}
            onClick={() => setArea(nome)}
          >
            {rotuloAba(nome, secao)}
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
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
