import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Cabecalho from './Cabecalho.jsx'
import site from '../dados/site.json'

describe('Cabecalho', () => {
  it('mostra os quatro links vindos do JSON', () => {
    render(<Cabecalho itens={site.nav} visivel marca={site.marca} />)
    for (const item of site.nav) {
      expect(screen.getByRole('link', { name: item.rotulo })).toBeInTheDocument()
    }
  })

  it('cada link aponta para a ancora da sua secao', () => {
    render(<Cabecalho itens={site.nav} visivel marca={site.marca} />)
    expect(screen.getByRole('link', { name: '[SOBRE]' }))
      .toHaveAttribute('href', '#sobre')
  })

  it('divide os links em dois lados, com o morcego no meio', () => {
    const { container } = render(<Cabecalho itens={site.nav} visivel marca={site.marca} />)
    const lados = container.querySelectorAll('.cabecalho__lado')
    expect(lados).toHaveLength(2)
    expect(lados[0].querySelectorAll('a')).toHaveLength(2)
    expect(lados[1].querySelectorAll('a')).toHaveLength(2)
    expect(screen.getByRole('img', { name: site.marca.morcegoAlt })).toBeInTheDocument()
  })

  it('fica escondido de leitores de tela quando invisivel', () => {
    const { container } = render(<Cabecalho itens={site.nav} visivel={false} marca={site.marca} />)
    const barra = container.querySelector('.cabecalho')
    expect(barra).toHaveAttribute('aria-hidden', 'true')
    expect(barra.className).not.toContain('cabecalho--visivel')
  })

  it('fica acessivel quando visivel', () => {
    const { container } = render(<Cabecalho itens={site.nav} visivel marca={site.marca} />)
    const barra = container.querySelector('.cabecalho')
    expect(barra).toHaveAttribute('aria-hidden', 'false')
    expect(barra.className).toContain('cabecalho--visivel')
  })
})
