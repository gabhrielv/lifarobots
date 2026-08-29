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

// O padrao mora na raiz de :root, ao lado de paleta, tempos e ritmo — nao
// da para comparar o bloco inteiro contra o preset arial (so tipografia).
// Filtra para as variaveis que a tipografia de fato declara.
const TIPOGRAFICA = /^--(fonte-|titulo-largura)/
function variaveisTipograficas(seletor) {
  const vars = variaveisDoBloco(seletor)
  return vars && vars.filter((nome) => TIPOGRAFICA.test(nome))
}

describe('tokens de tipografia', () => {
  it('define o padrao (bare :root) e o preset arial', () => {
    // "lifa" e o padrao: um typo em data-tipografia, ou o atributo
    // ausente, precisa degradar para a fonte da casa, nao para serif
    // do navegador. Por isso o preset "lifa" vive na raiz de :root —
    // so "arial" continua atras de um seletor de atributo.
    expect(variaveisDoBloco(':root')).not.toBeNull()
    expect(variaveisDoBloco(':root[data-tipografia="arial"]')).not.toBeNull()
  })

  it('mantem o opt-in explicito data-tipografia="lifa" funcionando', () => {
    expect(variaveisDoBloco(':root[data-tipografia="lifa"]')).not.toBeNull()
  })

  it('o padrao e o preset arial declaram exatamente as mesmas variaveis', () => {
    expect(variaveisTipograficas(':root[data-tipografia="arial"]'))
      .toEqual(variaveisTipograficas(':root'))
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
