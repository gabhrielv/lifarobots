import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Equipe from './Equipe.jsx'
import equipe from '../dados/equipe.json'
import site from '../dados/site.json'

const secao = site.secoes.equipe

function montar() {
  return render(<Equipe secao={secao} equipe={equipe} />)
}

describe('Equipe', () => {
  it('mostra uma aba por area, mais a aba TODOS', () => {
    montar()
    expect(screen.getAllByRole('button')).toHaveLength(equipe.areas.length + 1)
  })

  it('comeca com TODOS ativa e o time inteiro visivel', () => {
    const { container } = montar()
    const abas = screen.getAllByRole('button')
    expect(abas[0]).toHaveAttribute('aria-pressed', 'true')
    expect(container.querySelectorAll('.cartao'))
      .toHaveLength(equipe.pessoas.length)
  })

  it('quem esta em duas areas ocupa um cartao so em TODOS', () => {
    // A soma ingenua — contar as pessoas de cada area — passaria dos
    // cartoes de fato renderizados sempre que alguem acumula duas areas.
    // E exatamente essa diferenca que o modelo de dado existe para criar.
    const mencoes = equipe.pessoas.reduce((n, p) => n + p.areas.length, 0)
    const { container } = montar()
    expect(container.querySelectorAll('.cartao').length)
      .toBeLessThanOrEqual(mencoes)
    expect(container.querySelectorAll('.cartao'))
      .toHaveLength(new Set(equipe.pessoas.map((p) => p.id)).size)
  })

  it('clicar numa area reduz a grade aquela area', async () => {
    const usuario = userEvent.setup()
    const { container } = montar()
    const primeira = equipe.areas[0]
    const daArea = equipe.pessoas.filter((p) => p.areas.includes(primeira))
    await usuario.click(screen.getAllByRole('button')[1])
    expect(container.querySelectorAll('.cartao')).toHaveLength(daArea.length)
  })

  it('o cartao mostra o nome do JSON', () => {
    montar()
    const primeira = equipe.pessoas[0]
    expect(screen.getAllByText(primeira.nome)[0]).toBeInTheDocument()
  })

  it('o cartao nao carrega mais linha de especialidade', () => {
    const { container } = montar()
    expect(container.querySelector('.cartao__especialidade')).toBeNull()
  })

  it('toda foto renderizada tem alt com o nome da pessoa', () => {
    // O retrato e a unica imagem do cartao; sem alt, um leitor de tela
    // anuncia "imagem" e o nome ao lado perde a ancora.
    const { container } = montar()
    for (const img of container.querySelectorAll('.cartao__foto')) {
      expect(img.getAttribute('alt')).toBeTruthy()
    }
  })

  it('so a aba ativa fica marcada como pressionada', async () => {
    const usuario = userEvent.setup()
    montar()
    await usuario.click(screen.getAllByRole('button')[1])
    const selecionadas = screen.getAllByRole('button')
      .filter((aba) => aba.getAttribute('aria-pressed') === 'true')
    expect(selecionadas).toHaveLength(1)
  })
})
