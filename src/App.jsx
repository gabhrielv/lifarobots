import { useRef } from 'react'
import Cabecalho from './componentes/Cabecalho.jsx'
import Hero from './componentes/Hero.jsx'
import SecaoTexto from './componentes/SecaoTexto.jsx'
import Carrossel from './componentes/Carrossel.jsx'
import Equipe from './componentes/Equipe.jsx'
import Rodape from './componentes/Rodape.jsx'
import { useForaDaTela } from './hooks/useForaDaTela.js'
import site from './dados/site.json'
import repos from './dados/repos.json'
import equipe from './dados/equipe.json'

export default function App() {
  const sentinela = useRef(null)
  const passouDoHero = useForaDaTela(sentinela)

  return (
    <>
      <Cabecalho itens={site.nav} visivel={passouDoHero} marca={site.marca} />
      <main>
        <Hero itens={site.nav} hero={site.hero} marca={site.marca} refSentinela={sentinela} />
        <SecaoTexto {...site.sobre} />
        <Carrossel secao={site.secoes.repositorio} slides={repos} />
        <Equipe secao={site.secoes.equipe} grupos={equipe} />
      </main>
      <Rodape rodape={site.rodape} />
    </>
  )
}
