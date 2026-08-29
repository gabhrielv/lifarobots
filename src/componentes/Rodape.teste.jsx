import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import Rodape from './Rodape.jsx'
import site from '../dados/site.json'

describe('Rodape', () => {
  it('mostra o titulo CONTATO', () => {
    render(<Rodape rodape={site.rodape} />)
    expect(screen.getByRole('heading', { level: 2, name: site.rodape.titulo }))
      .toBeInTheDocument()
  })

  it('mostra um campo por item, com rotulo e valor', () => {
    const { container } = render(<Rodape rodape={site.rodape} />)
    expect(container.querySelectorAll('.rodape__campo'))
      .toHaveLength(site.rodape.campos.length)
    for (const campo of site.rodape.campos) {
      expect(screen.getByText(campo.rotulo)).toBeInTheDocument()
    }
  })

  it('mostra o valor de cada campo vindo do JSON', () => {
    const { container } = render(<Rodape rodape={site.rodape} />)
    // Cada campo.valor e verificado dentro do seu proprio .rodape__campo,
    // nao com getByText global: varios valores hoje sao identicos
    // ("placeholder"), o que faria getByText/getAllByText por texto
    // colidir sem saber a qual campo cada ocorrencia pertence.
    const elementosCampo = container.querySelectorAll('.rodape__campo')
    site.rodape.campos.forEach((campo, i) => {
      expect(within(elementosCampo[i]).getByText(campo.valor)).toBeInTheDocument()
    })
  })
})
