import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve('src/css/componentes.css'), 'utf8')

describe('pontos de quebra', () => {
  it('tem um ponto de quebra para tablet e outro para celular', () => {
    expect(css).toContain('@media (max-width: 1023px)')
    expect(css).toContain('@media (max-width: 639px)')
  })

  it('a grade da equipe reduz para 2 e depois 1 coluna', () => {
    expect(css).toMatch(/grid-template-columns:\s*repeat\(2, 1fr\)/)
    expect(css).toMatch(/grid-template-columns:\s*1fr/)
  })
})

describe('movimento reduzido', () => {
  it('desliga a animacao da reticula', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
  })
})

describe('regra de contraste', () => {
  it('nenhuma cor literal escapou dos tokens', () => {
    const literais = css.match(/(?<!-)#[0-9a-fA-F]{3,8}\b|\brgba?\(/g) ?? []
    expect(literais).toEqual([])
  })
})
