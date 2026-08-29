/** Abaixo disso e um toque, nao um deslize. Sem esse piso, encostar na
 *  tela para pausar o carrossel ja o faria avancar. */
const DISTANCIA_MINIMA = 48

/** Manipuladores de toque para navegar o carrossel no celular, onde
 *  hover nao existe.
 *
 *  O hook nao guarda estado do React, so uma ref — por isso usa um
 *  objeto mutavel simples em vez de `useRef`: `useRef` exige um
 *  componente em renderizacao para existir, o que impediria testar os
 *  manipuladores chamando o hook direto, sem renderizar. */
export function useDeslize({ aoEsquerda, aoDireita }) {
  const inicio = { current: null }

  return {
    onTouchStart: (evento) => {
      inicio.current = evento.touches[0].clientX
    },
    onTouchEnd: (evento) => {
      if (inicio.current === null) return
      const delta = evento.changedTouches[0].clientX - inicio.current
      inicio.current = null
      if (Math.abs(delta) < DISTANCIA_MINIMA) return
      if (delta < 0) aoEsquerda()
      else aoDireita()
    },
  }
}
