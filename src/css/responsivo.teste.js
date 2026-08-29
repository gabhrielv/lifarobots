import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve('src/css/componentes.css'), 'utf8')
const cssBase = readFileSync(resolve('src/css/base.css'), 'utf8')

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
  it('a politica de movimento reduzido existe, com um unico dono em base.css', () => {
    // base.css aplica transition-duration/animation-duration com !important
    // a todo elemento, o que domina qualquer regra sem !important — por
    // isso a politica tem uma casa so, e nao um bloco duplicado (e morto)
    // em componentes.css.
    expect(cssBase).toContain('@media (prefers-reduced-motion: reduce)')
  })
})

describe('regra de contraste', () => {
  it('nenhuma cor literal escapou dos tokens', () => {
    // hsl/hsla e as cores nomeadas mais plausiveis num design monocromatico
    // tambem contam como cor literal. `transparent` fica de fora: e uma
    // palavra-chave, nao uma cor, e e usada legitimamente no arquivo.
    // `grayscale(` nao bate com `\bgray\b` — nao ha fronteira de palavra
    // entre "gray" e "scale".
    const literais = css.match(
      /(?<!-)#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\b(?:black|white|gray|grey|silver)\b/g,
    ) ?? []
    expect(literais).toEqual([])
  })
})
