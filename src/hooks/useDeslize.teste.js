import { describe, it, expect, vi } from 'vitest'
import { useDeslize } from './useDeslize.js'

/** O hook nao guarda estado do React, so uma ref — da para exercitar os
 *  manipuladores diretamente, sem renderizar. */
function toque(x) {
  return { touches: [{ clientX: x }], changedTouches: [{ clientX: x }] }
}

describe('useDeslize', () => {
  it('deslizar para a esquerda avanca', () => {
    const aoEsquerda = vi.fn()
    const aoDireita = vi.fn()
    const h = useDeslize({ aoEsquerda, aoDireita })
    h.onTouchStart(toque(300))
    h.onTouchEnd(toque(200))
    expect(aoEsquerda).toHaveBeenCalledOnce()
    expect(aoDireita).not.toHaveBeenCalled()
  })

  it('deslizar para a direita volta', () => {
    const aoEsquerda = vi.fn()
    const aoDireita = vi.fn()
    const h = useDeslize({ aoEsquerda, aoDireita })
    h.onTouchStart(toque(100))
    h.onTouchEnd(toque(220))
    expect(aoDireita).toHaveBeenCalledOnce()
    expect(aoEsquerda).not.toHaveBeenCalled()
  })

  it('ignora toque curto — evita que um tap vire navegacao', () => {
    const aoEsquerda = vi.fn()
    const aoDireita = vi.fn()
    const h = useDeslize({ aoEsquerda, aoDireita })
    h.onTouchStart(toque(200))
    h.onTouchEnd(toque(180))
    expect(aoEsquerda).not.toHaveBeenCalled()
    expect(aoDireita).not.toHaveBeenCalled()
  })

  it('ignora um fim de toque sem inicio correspondente', () => {
    const aoEsquerda = vi.fn()
    const h = useDeslize({ aoEsquerda, aoDireita: vi.fn() })
    h.onTouchEnd(toque(0))
    expect(aoEsquerda).not.toHaveBeenCalled()
  })
})
