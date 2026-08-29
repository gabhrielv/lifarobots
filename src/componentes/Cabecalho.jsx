const MEIO = 2

import { caminho } from '../lib/caminho.js'

export default function Cabecalho({ itens, visivel, marca }) {
  const esquerda = itens.slice(0, MEIO)
  const direita = itens.slice(MEIO)

  return (
    <header
      className={`cabecalho${visivel ? ' cabecalho--visivel' : ''}`}
      aria-hidden={visivel ? 'false' : 'true'}
    >
      <nav className="cabecalho__nav">
        <ul className="cabecalho__lado">
          {esquerda.map((item) => (
            <li key={item.id}>
              <a className="elo" href={`#${item.id}`} tabIndex={visivel ? 0 : -1}>
                {item.rotulo}
              </a>
            </li>
          ))}
        </ul>

        <img
          className="cabecalho__marca"
          src={caminho('morcego.svg')}
          alt={marca.morcegoAlt}
        />

        <ul className="cabecalho__lado">
          {direita.map((item) => (
            <li key={item.id}>
              <a className="elo" href={`#${item.id}`} tabIndex={visivel ? 0 : -1}>
                {item.rotulo}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
