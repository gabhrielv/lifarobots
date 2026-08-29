import { describe, it, expect } from 'vitest'
import site from './site.json'
import repos from './repos.json'
import equipe from './equipe.json'

describe('site.json', () => {
  it('tem os quatro itens de navegacao entre colchetes', () => {
    expect(site.nav).toHaveLength(4)
    expect(site.nav.map((i) => i.id)).toEqual([
      'sobre', 'repositorio', 'equipe', 'contato',
    ])
    for (const item of site.nav) {
      expect(item.rotulo).toMatch(/^\[.+\]$/)
    }
  })

  it('o hero tem imagem e alt preenchidos', () => {
    expect(site.hero.imagem).toBeTruthy()
    expect(site.hero.alt).toBeTruthy()
  })

  it('a marca tem alt para a logo e para o morcego, ambos strings nao vazias', () => {
    expect(typeof site.marca.logoAlt).toBe('string')
    expect(site.marca.logoAlt.length).toBeGreaterThan(0)
    expect(typeof site.marca.morcegoAlt).toBe('string')
    expect(site.marca.morcegoAlt.length).toBeGreaterThan(0)
  })

  it('a secao sobre tem ao menos um paragrafo', () => {
    expect(site.sobre.paragrafos.length).toBeGreaterThan(0)
    for (const p of site.sobre.paragrafos) {
      expect(typeof p).toBe('string')
      expect(p.length).toBeGreaterThan(0)
    }
  })

  it('o rodape usa placeholder em todo valor, conforme pedido', () => {
    expect(site.rodape.campos.length).toBeGreaterThan(0)
    for (const campo of site.rodape.campos) {
      expect(campo.valor).toBe('placeholder')
    }
  })

  it('cada id de nav tem uma secao correspondente', () => {
    const ids = [
      site.sobre.id,
      site.secoes.repositorio.id,
      site.secoes.equipe.id,
      site.rodape.id,
    ]
    expect(ids.sort()).toEqual(site.nav.map((i) => i.id).sort())
  })
})

describe('repos.json', () => {
  it('tem ao menos tres slides, para o carrossel ter laterais dos dois lados', () => {
    expect(repos.length).toBeGreaterThanOrEqual(3)
  })

  it('todo slide tem id unico, imagem, alt e texto', () => {
    const ids = repos.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const slide of repos) {
      expect(slide.imagem).toBeTruthy()
      expect(slide.alt).toBeTruthy()
      expect(slide.texto).toBeTruthy()
    }
  })
})

describe('equipe.json', () => {
  it('tem ao menos uma area', () => {
    expect(equipe.length).toBeGreaterThan(0)
  })

  it('toda pessoa tem id unico no site inteiro, nome e especialidade', () => {
    const ids = equipe.flatMap((g) => g.pessoas.map((p) => p.id))
    expect(new Set(ids).size).toBe(ids.length)
    for (const grupo of equipe) {
      expect(grupo.area).toBeTruthy()
      expect(grupo.pessoas.length).toBeGreaterThan(0)
      for (const pessoa of grupo.pessoas) {
        expect(pessoa.nome).toBeTruthy()
        expect(pessoa.especialidade).toBeTruthy()
      }
    }
  })

  it('nenhuma area se chama "todos", que e reservado para o filtro', () => {
    for (const grupo of equipe) {
      expect(grupo.area.toLowerCase()).not.toBe('todos')
    }
  })
})
