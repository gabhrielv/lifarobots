import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDeslize } from './useDeslize.js'

/** O hook usa useRef, entao precisa de um componente em renderizacao —
 *  renderHook fornece esse contexto, como em useCarrossel.teste.js. */
function toque(x) {
  return { touches: [{ clientX: x }], changedTouches: [{ clientX: x }] }
}

describe('useDeslize', () => {
  it('deslizar para a esquerda avanca', () => {
    const aoEsquerda = vi.fn()
    const aoDireita = vi.fn()
    const { result } = renderHook(() => useDeslize({ aoEsquerda, aoDireita }))
    result.current.onTouchStart(toque(300))
    result.current.onTouchEnd(toque(200))
    expect(aoEsquerda).toHaveBeenCalledOnce()
    expect(aoDireita).not.toHaveBeenCalled()
  })

  it('deslizar para a direita volta', () => {
    const aoEsquerda = vi.fn()
    const aoDireita = vi.fn()
    const { result } = renderHook(() => useDeslize({ aoEsquerda, aoDireita }))
    result.current.onTouchStart(toque(100))
    result.current.onTouchEnd(toque(220))
    expect(aoDireita).toHaveBeenCalledOnce()
    expect(aoEsquerda).not.toHaveBeenCalled()
  })

  it('ignora toque curto — evita que um tap vire navegacao', () => {
    const aoEsquerda = vi.fn()
    const aoDireita = vi.fn()
    const { result } = renderHook(() => useDeslize({ aoEsquerda, aoDireita }))
    result.current.onTouchStart(toque(200))
    result.current.onTouchEnd(toque(180))
    expect(aoEsquerda).not.toHaveBeenCalled()
    expect(aoDireita).not.toHaveBeenCalled()
  })

  it('ignora um fim de toque sem inicio correspondente', () => {
    const aoEsquerda = vi.fn()
    const { result } = renderHook(() =>
      useDeslize({ aoEsquerda, aoDireita: vi.fn() }),
    )
    result.current.onTouchEnd(toque(0))
    expect(aoEsquerda).not.toHaveBeenCalled()
  })
})
