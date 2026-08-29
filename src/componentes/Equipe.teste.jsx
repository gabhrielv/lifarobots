import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Equipe from './Equipe.jsx'
import equipe from '../dados/equipe.json'
import site from '../dados/site.json'

const secao = site.secoes.equipe
const totalPessoas = equipe.reduce((n, g) => n + g.pessoas.length, 0)

function montar() {
  return render(<Equipe secao={secao} grupos={equipe} />)
}

describe('Equipe', () => {
  it('mostra uma aba por area, mais a aba TODOS', () => {
    montar()
    expect(screen.getAllByRole('tab')).toHaveLength(equipe.length + 1)
  })

  it('comeca com TODOS ativa e o time inteiro visivel', () => {
    const { container } = montar()
    const abas = screen.getAllByRole('tab')
    expect(abas[0]).toHaveAttribute('aria-selected', 'true')
    expect(container.querySelectorAll('.cartao')).toHaveLength(totalPessoas)
  })

  it('clicar numa area reduz a grade aquela area', async () => {
    const usuario = userEvent.setup()
    const { container } = montar()
    await usuario.click(screen.getAllByRole('tab')[1])
    expect(container.querySelectorAll('.cartao'))
      .toHaveLength(equipe[0].pessoas.length)
  })

  it('o cartao mostra nome e especialidade do JSON', () => {
    montar()
    const primeira = equipe[0].pessoas[0]
    expect(screen.getAllByText(primeira.nome)[0]).toBeInTheDocument()
    expect(screen.getAllByText(`/ ${primeira.especialidade}`)[0]).toBeInTheDocument()
  })

  it('so a aba ativa fica marcada como selecionada', async () => {
    const usuario = userEvent.setup()
    montar()
    await usuario.click(screen.getAllByRole('tab')[1])
    const selecionadas = screen.getAllByRole('tab')
      .filter((aba) => aba.getAttribute('aria-selected') === 'true')
    expect(selecionadas).toHaveLength(1)
  })
})
