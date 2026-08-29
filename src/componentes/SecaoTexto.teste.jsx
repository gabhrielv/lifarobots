import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SecaoTexto from './SecaoTexto.jsx'
import site from '../dados/site.json'

describe('SecaoTexto', () => {
  it('mostra o titulo como cabecalho de nivel 2', () => {
    render(<SecaoTexto {...site.sobre} />)
    expect(screen.getByRole('heading', { level: 2, name: site.sobre.titulo }))
      .toBeInTheDocument()
  })

  it('mostra todos os paragrafos do JSON', () => {
    const { container } = render(<SecaoTexto {...site.sobre} />)
    expect(container.querySelectorAll('p')).toHaveLength(site.sobre.paragrafos.length)
  })

  it('a secao aponta para o proprio titulo, para leitores de tela', () => {
    const { container } = render(<SecaoTexto {...site.sobre} />)
    const secao = container.querySelector('section')
    expect(secao).toHaveAttribute('id', site.sobre.id)
    const titulo = screen.getByRole('heading', { level: 2 })
    expect(secao).toHaveAttribute('aria-labelledby', titulo.id)
  })
})
