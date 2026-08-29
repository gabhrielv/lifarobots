import { describe, it, expect } from 'vitest'
import { createRef } from 'react'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { render, screen } from '@testing-library/react'
import Hero from './Hero.jsx'
import site from '../dados/site.json'
import { caminho } from '../lib/caminho.js'

function montar() {
  return render(
    <Hero
      itens={site.nav}
      hero={site.hero}
      marca={site.marca}
      refSentinela={createRef()}
    />,
  )
}

const css = readFileSync(resolve('src/css/componentes.css'), 'utf8')

function blocoDoSeletor(seletor) {
  const escapado = seletor.replace(/[.[\]"=]/g, '\\$&')
  const bloco = new RegExp(`${escapado}\\s*\\{([^}]*)\\}`).exec(css)
  return bloco ? bloco[1] : null
}

describe('Hero', () => {
  it('mostra a logo com texto alternativo vindo do JSON', () => {
    montar()
    expect(screen.getByRole('img', { name: site.marca.logoAlt })).toBeInTheDocument()
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

  it('a figura e a foto carregam as classes que o CSS usa para desacoplar o tamanho', () => {
    const { container } = montar()
    expect(container.querySelector('figure.hero__figura')).toBeInTheDocument()
    expect(container.querySelector('img.hero__foto')).toBeInTheDocument()
  })

  it('o CSS tira a foto do fluxo para o tamanho intrinseco dela nao inflar a figura', () => {
    // jsdom nao tem motor de layout: altura zero em todo elemento, entao um
    // teste de altura renderizada nao provaria nada. O que de fato evita a
    // regressao (hero mais alto que a viewport, expondo o cabecalho fixo
    // antes de qualquer rolagem) e este contrato de CSS: a foto some do
    // fluxo do documento, entao seu aspect ratio intrinseco nunca infla o
    // container.
    expect(blocoDoSeletor('.hero__figura')).toMatch(/position:\s*relative/)
    expect(blocoDoSeletor('.hero__foto')).toMatch(/position:\s*absolute/)
  })
})
