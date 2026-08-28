import { describe, it, expect } from 'vitest'
import { normalizarIndice, posicaoRelativa, POSICOES_VISIVEIS } from './carrossel.js'

describe('normalizarIndice', () => {
  it('mantem indices dentro da faixa', () => {
    expect(normalizarIndice(0, 4)).toBe(0)
    expect(normalizarIndice(3, 4)).toBe(3)
  })

  it('da a volta para frente', () => {
    expect(normalizarIndice(4, 4)).toBe(0)
    expect(normalizarIndice(5, 4)).toBe(1)
    expect(normalizarIndice(9, 4)).toBe(1)
  })

  it('da a volta para tras — o caso que o operador % erra sozinho', () => {
    expect(normalizarIndice(-1, 4)).toBe(3)
    expect(normalizarIndice(-4, 4)).toBe(0)
    expect(normalizarIndice(-5, 4)).toBe(3)
  })

  it('nao explode com lista vazia', () => {
    expect(normalizarIndice(2, 0)).toBe(0)
  })
})

describe('posicaoRelativa', () => {
  it('o proprio centro esta na posicao zero', () => {
    expect(posicaoRelativa(2, 2, 5)).toBe(0)
  })

  it('vizinhos imediatos ficam em -1 e +1', () => {
    expect(posicaoRelativa(1, 2, 5)).toBe(-1)
    expect(posicaoRelativa(3, 2, 5)).toBe(1)
  })

  it('escolhe o caminho mais curto ao cruzar a virada da lista', () => {
    // centro no ultimo item: o primeiro item esta a UMA posicao a direita,
    // nao a quatro posicoes a esquerda.
    expect(posicaoRelativa(0, 4, 5)).toBe(1)
    expect(posicaoRelativa(4, 0, 5)).toBe(-1)
  })

  it('nao explode com lista vazia', () => {
    expect(posicaoRelativa(0, 0, 0)).toBe(0)
  })
})

describe('POSICOES_VISIVEIS', () => {
  it('renderiza duas posicoes de cada lado', () => {
    // Uma de cada lado e visivel; a segunda fica fora de tela, pronta para
    // entrar. Sem ela o slide que chega pisca ao aparecer do nada.
    expect(POSICOES_VISIVEIS).toBe(2)
  })
})
