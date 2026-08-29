import { useRef } from 'react'
import Cabecalho from './componentes/Cabecalho.jsx'
import Hero from './componentes/Hero.jsx'
import SecaoTexto from './componentes/SecaoTexto.jsx'
import Rodape from './componentes/Rodape.jsx'
import { useForaDaTela } from './hooks/useForaDaTela.js'
import site from './dados/site.json'

export default function App() {
  const sentinela = useRef(null)
  const passouDoHero = useForaDaTela(sentinela)

  return (
    <>
      <Cabecalho itens={site.nav} visivel={passouDoHero} marca={site.marca} />
      <main>
        <Hero itens={site.nav} hero={site.hero} marca={site.marca} refSentinela={sentinela} />
        <SecaoTexto {...site.sobre} />
      </main>
      <Rodape rodape={site.rodape} />
    </>
  )
}
