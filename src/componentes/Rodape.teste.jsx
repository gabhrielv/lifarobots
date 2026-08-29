import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  it('todo valor e o texto placeholder, conforme pedido', () => {
    render(<Rodape rodape={site.rodape} />)
    expect(screen.getAllByText('placeholder'))
      .toHaveLength(site.rodape.campos.length)
  })
})
