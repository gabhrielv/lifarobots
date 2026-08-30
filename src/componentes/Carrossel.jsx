import { useMemo } from 'react'
import { useCarrossel } from '../hooks/useCarrossel.js'
import { useDeslize } from '../hooks/useDeslize.js'
import { caminho } from '../lib/caminho.js'
import { posicaoRelativa, POSICOES_VISIVEIS } from '../lib/carrossel.js'

export default function Carrossel({ secao, slides }) {
  const total = slides.length
  const {
    indice, irPara, pausar, retomar,
    aoEntrarLateral, aoSairLateral, aoClicarLateral,
  } = useCarrossel(total)
  const idTitulo = `${secao.id}-titulo`

  const aoTeclar = (evento) => {
    if (evento.key === 'ArrowRight') irPara(indice + 1)
    if (evento.key === 'ArrowLeft') irPara(indice - 1)
  }

  const deslize = useDeslize({
    aoEsquerda: () => irPara(indice + 1),
    aoDireita: () => irPara(indice - 1),
  })

  // Mobile sintetiza mouseenter/mouseleave depois de um toque, sem o par
  // correspondente — sem esse portao, o primeiro tap pausaria o autoplay
  // para sempre e um toque numa lateral disparia o dwell por engano.
  const temHover = useMemo(
    () => globalThis.matchMedia?.('(hover: hover)').matches ?? true,
    [],
  )

  return (
    <section className="secao carrossel" id={secao.id} aria-labelledby={idTitulo}>
      <h2 className="secao__titulo" id={idTitulo}>{secao.titulo}</h2>

      {/* O nome do projeto fica entre o titulo e a imagem, e por isso nao
          cabe na mesma regiao viva da descricao, que fica abaixo do trilho.
          Cada um anuncia a propria troca, na ordem do DOM: sem o nome numa
          regiao viva, o leitor de tela leria a descricao de um projeto sem
          dizer de qual projeto se trata. */}
      <div className="carrossel__projeto" aria-live="polite">
        <p className="carrossel__nome" key={`${slides[indice].id}-nome`}>
          {slides[indice].nome}
        </p>
      </div>

      <div
        className="carrossel__trilho"
        role="group"
        tabIndex={0}
        aria-roledescription="carrossel"
        aria-label={secao.titulo}
        onKeyDown={aoTeclar}
        onMouseEnter={temHover ? pausar : undefined}
        onMouseLeave={temHover ? () => { aoSairLateral(); retomar() } : undefined}
        {...deslize}
      >
        {/* Clicar numa lateral a traz para o centro. O clique mora no
            <figure> e nao num <button>: as laterais sao aria-hidden, e
            elemento focavel dentro de conteudo escondido do leitor de tela
            e armadilha de foco — o Tab para num controle que a leitura nao
            anuncia. O caminho de teclado ja existe e continua sendo o
            trilho, que e focavel e responde as setas. */}
        {slides.map((slide, i) => {
          const posicao = posicaoRelativa(i, indice, total)
          if (Math.abs(posicao) > POSICOES_VISIVEIS) return null
          const eCentro = posicao === 0

          return (
            <figure
              className="slide"
              key={slide.id}
              data-id={slide.id}
              data-posicao={posicao}
              aria-hidden={eCentro ? 'false' : 'true'}
              onClick={eCentro ? undefined : () => aoClicarLateral(i)}
              onMouseEnter={eCentro || !temHover ? undefined : () => aoEntrarLateral(i)}
              onMouseLeave={eCentro || !temHover ? undefined : aoSairLateral}
            >
              <img className="slide__imagem" src={caminho(slide.imagem)} alt={slide.alt} />
              {/* Trama de pontos. Fecha no centro, abre nas laterais. */}
              <span className="slide__reticula" aria-hidden="true" />
            </figure>
          )
        })}
      </div>

      {/* A regiao viva precisa ser estavel: se ela propria remontar, o
          leitor de tela nao anuncia a troca. So o <p> interno remonta,
          para reiniciar o crossfade. */}
      <div className="carrossel__anuncio" aria-live="polite">
        <p className="carrossel__texto" key={slides[indice].id}>
          {slides[indice].texto}
        </p>
      </div>
    </section>
  )
}
