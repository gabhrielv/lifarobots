import { describe, it, expect } from 'vitest'
import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import Hero from './Hero.jsx'
import site from '../dados/site.json'
import { caminho } from '../lib/caminho.js'

function montar() {
  return render(<Hero itens={site.nav} hero={site.hero} refSentinela={createRef()} />)
}

describe('Hero', () => {
  it('mostra a logo com texto alternativo', () => {
    montar()
    expect(screen.getByRole('img', { name: /lifarobots/i })).toBeInTheDocument()
  })

  it('mostra os quatro links numa linha so, sem o morcego', () => {
    const { container } = montar()
    expect(container.querySelectorAll('.hero__nav a')).toHaveLength(4)
    expect(container.querySelector('.cabecalho__marca')).toBeNull()
  })

  it('usa a imagem e o alt vindos do JSON', () => {
    montar()
    const foto = screen.getByAltText(site.hero.alt)
    expect(foto).toHaveAttribute('src', caminho(site.hero.imagem))
  })

  it('tem a sentinela que dispara a troca da nav', () => {
    const { container } = montar()
    expect(container.querySelector('.hero__sentinela')).toBeInTheDocument()
  })
})
