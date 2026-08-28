import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const css = readFileSync(resolve('src/css/tokens.css'), 'utf8')

function variaveisDoBloco(seletor) {
  const escapado = seletor.replace(/[[\]"=]/g, '\\$&')
  const bloco = new RegExp(`${escapado}\\s*\\{([^}]*)\\}`).exec(css)
  if (!bloco) return null
  return [...bloco[1].matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]).sort()
}

describe('tokens de tipografia', () => {
  it('define os presets lifa e arial', () => {
    expect(variaveisDoBloco(':root[data-tipografia="lifa"]')).not.toBeNull()
    expect(variaveisDoBloco(':root[data-tipografia="arial"]')).not.toBeNull()
  })

  it('os dois presets declaram exatamente as mesmas variaveis', () => {
    expect(variaveisDoBloco(':root[data-tipografia="arial"]'))
      .toEqual(variaveisDoBloco(':root[data-tipografia="lifa"]'))
  })

  it('registra a propriedade --ponto para poder transicionar', () => {
    expect(css).toMatch(/@property\s+--ponto/)
    expect(css).toMatch(/syntax:\s*['"]<length>['"]/)
  })
})

describe('tokens de cor', () => {
  const esperadas = [
    '--tinta', '--papel', '--tela-70', '--tela-52',
    '--tela-38', '--tela-14', '--tela-06',
  ]

  it('declara toda a paleta', () => {
    for (const nome of esperadas) {
      expect(css).toContain(`${nome}:`)
    }
  })
})
