import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import Carrossel from './Carrossel.jsx'
import repos from '../dados/repos.json'
import site from '../dados/site.json'
import { caminho } from '../lib/caminho.js'

const secao = site.secoes.repositorio
const css = readFileSync(resolve('src/css/componentes.css'), 'utf8')

function blocoDoSeletor(seletor) {
  const escapado = seletor.replace(/[.[\]"=]/g, '\\$&')
  const bloco = new RegExp(`${escapado}\\s*\\{([^}]*)\\}`).exec(css)
  return bloco ? bloco[1] : null
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

function montar() {
  return render(<Carrossel secao={secao} slides={repos} />)
}

describe('Carrossel', () => {
  it('mostra o titulo da secao', () => {
    montar()
    expect(screen.getByRole('heading', { level: 2, name: secao.titulo }))
      .toBeInTheDocument()
  })

  it('marca o primeiro slide como centro', () => {
    const { container } = montar()
    const centro = container.querySelector('[data-posicao="0"]')
    expect(centro).toHaveAttribute('data-id', repos[0].id)
  })

  it('mostra o texto do slide central', () => {
    montar()
    expect(screen.getByText(repos[0].texto)).toBeInTheDocument()
  })

  it('mostra o nome do projeto do slide central', () => {
    montar()
    expect(screen.getByText(repos[0].nome)).toBeInTheDocument()
  })

  it('o nome fica dentro da regiao viva, junto da descricao', () => {
    // Se o nome ficasse fora, o leitor de tela anunciaria a descricao de um
    // projeto sem dizer de qual projeto se trata.
    const { container } = montar()
    const regiao = container.querySelector('[aria-live="polite"]')
    expect(regiao).toContainElement(screen.getByText(repos[0].nome))
    expect(regiao).toContainElement(screen.getByText(repos[0].texto))
  })

  it('troca o nome e o texto quando o autoplay avanca', () => {
    montar()
    act(() => vi.advanceTimersByTime(12000))
    expect(screen.getByText(repos[1].nome)).toBeInTheDocument()
    expect(screen.getByText(repos[1].texto)).toBeInTheDocument()
  })

  it('coloca vizinhos em -1 e +1', () => {
    const { container } = montar()
    expect(container.querySelector('[data-posicao="1"]'))
      .toHaveAttribute('data-id', repos[1].id)
    expect(container.querySelector('[data-posicao="-1"]'))
      .toHaveAttribute('data-id', repos[repos.length - 1].id)
  })

  it('cada slide usa a imagem e o alt do JSON', () => {
    montar()
    expect(screen.getByAltText(repos[0].alt))
      .toHaveAttribute('src', caminho(repos[0].imagem))
  })

  it('as setas do teclado navegam', () => {
    const { container } = montar()
    const trilho = container.querySelector('.carrossel__trilho')
    act(() => fireEvent.keyDown(trilho, { key: 'ArrowRight' }))
    expect(container.querySelector('[data-posicao="0"]'))
      .toHaveAttribute('data-id', repos[1].id)
  })

  it('anuncia a mudanca de slide para leitores de tela sem remontar a regiao viva', () => {
    const { container } = montar()
    const regiao = container.querySelector('[aria-live="polite"]')
    expect(regiao).toBeInTheDocument()

    act(() => vi.advanceTimersByTime(12000))

    // Se a regiao viva remontar quando o slide troca, o leitor de tela nao
    // anuncia nada — precisa ser o mesmo no do DOM antes e depois.
    expect(container.querySelector('[aria-live="polite"]')).toBe(regiao)
  })
})

describe('Carrossel — sem hover (celular)', () => {
  it('sem "(hover: hover)", tocar no trilho nao pausa o autoplay', () => {
    // Override local e explicito: nao depende do default do stub
    // compartilhado em preparo.js continuar reportando "sem hover".
    vi.spyOn(globalThis, 'matchMedia').mockReturnValue({
      matches: false,
      media: '(hover: hover)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    const { container } = montar()
    const trilho = container.querySelector('.carrossel__trilho')

    // Mobile sintetiza mouseenter sem o mouseleave correspondente. Se o
    // manipulador nao estiver desligado, isso pausaria o autoplay para
    // sempre — o oposto do que a Tarefa 11 existe para resolver.
    act(() => fireEvent.mouseEnter(trilho))
    act(() => vi.advanceTimersByTime(12000))

    expect(screen.getByText(repos[1].texto)).toBeInTheDocument()
  })
})

describe('Carrossel — contrato de CSS do trilho', () => {
  it('define order para cada data-posicao, alinhado ao valor da posicao', () => {
    // O flex posiciona na ordem do DOM, nao na ordem logica dos dados. Sem
    // `order` casando com `data-posicao`, o slide -1 renderiza por ultimo,
    // do lado errado.
    for (const posicao of [-2, -1, 0, 1, 2]) {
      const regra = new RegExp(
        `\\.slide\\[data-posicao="${posicao}"\\]\\s*\\{\\s*order:\\s*${posicao};\\s*\\}`,
      )
      expect(css).toMatch(regra)
    }
  })

  it('corta o sangramento do trilho sem criar barra de rolagem', () => {
    expect(blocoDoSeletor('.carrossel')).toMatch(/overflow-x:\s*clip/)
  })

  it('slides fora de tela ficam no fluxo com largura zero, nunca fora do fluxo', () => {
    const bloco = /\.slide\[data-posicao="-2"\],\s*\.slide\[data-posicao="2"\]\s*\{([^}]*)\}/
      .exec(css)[1]
    // Largura e interpolavel, `position` nao e: alternar absolute/relative
    // faria o slide pular para o lugar em vez de crescer ate la.
    expect(bloco).toMatch(/width:\s*0/)
    expect(bloco).not.toMatch(/position:\s*absolute/)
  })
})
