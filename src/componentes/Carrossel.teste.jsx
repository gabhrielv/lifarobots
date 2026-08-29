import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act, fireEvent } from '@testing-library/react'
import Carrossel from './Carrossel.jsx'
import repos from '../dados/repos.json'
import site from '../dados/site.json'
import { caminho } from '../lib/caminho.js'

const secao = site.secoes.repositorio

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

  it('troca o texto quando o autoplay avanca', () => {
    montar()
    act(() => vi.advanceTimersByTime(5000))
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

  it('anuncia a mudanca de slide para leitores de tela', () => {
    const { container } = montar()
    expect(container.querySelector('[aria-live="polite"]')).toBeInTheDocument()
  })
})
