import { describe, it, expect } from 'vitest'
import { caminho } from './caminho.js'

describe('caminho', () => {
  it('prefixa o base do Vite', () => {
    expect(caminho('img/hero.svg')).toBe(`${import.meta.env.BASE_URL}img/hero.svg`)
  })

  it('nao duplica barra quando o relativo ja comeca com uma', () => {
    expect(caminho('/img/hero.svg')).not.toMatch(/\/\//)
  })

  it('devolve string vazia para entrada vazia, para o JSX poder testar', () => {
    expect(caminho('')).toBe('')
    expect(caminho(null)).toBe('')
  })
})
