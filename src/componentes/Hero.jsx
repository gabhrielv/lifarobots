import { caminho } from '../lib/caminho.js'

export default function Hero({ itens, hero, marca, refSentinela }) {
  return (
    <div className="hero">
      <div className="hero__marca">
        <h1 className="hero__titulo">
          <img
            className="hero__logo"
            src={caminho('logo-lifarobots.png')}
            alt={marca.logoAlt}
          />
        </h1>
        <nav className="hero__nav">
          <ul className="hero__lista">
            {itens.map((item) => (
              <li key={item.id}>
                <a className="elo" href={`#${item.id}`}>{item.rotulo}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <figure className="hero__figura">
        <img className="hero__foto" src={caminho(hero.imagem)} alt={hero.alt} />
      </figure>

      {/* Alvo do IntersectionObserver do Cabecalho. Um pixel, invisivel. */}
      <div className="hero__sentinela" ref={refSentinela} aria-hidden="true" />
    </div>
  )
}
