import { useMemo } from 'react'
import { useCarrossel } from '../hooks/useCarrossel.js'
import { useDeslize } from '../hooks/useDeslize.js'
import { caminho } from '../lib/caminho.js'
import { posicaoRelativa, POSICOES_VISIVEIS } from '../lib/carrossel.js'

export default function Carrossel({ secao, slides }) {
  const total = slides.length
  const { indice, irPara, pausar, retomar, aoEntrarLateral, aoSairLateral } =
    useCarrossel(total)
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
        {/* Nome e descricao dividem a regiao viva: anunciar a descricao
            sozinha nao diria de que projeto ela fala. Cada um remonta pela
            propria key, para o crossfade reiniciar nos dois. */}
        <p className="carrossel__nome" key={`${slides[indice].id}-nome`}>
          {slides[indice].nome}
        </p>
        <p className="carrossel__texto" key={slides[indice].id}>
          {slides[indice].texto}
        </p>
      </div>
    </section>
  )
}
