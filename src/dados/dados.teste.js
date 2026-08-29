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

  it('todo campo do rodape tem um valor nao vazio', () => {
    // Os valores sao "placeholder" hoje, a pedido do cliente — mas o dia em
    // que alguem preencher um endereco real e exatamente o dia em que uma
    // asercao presa ao literal "placeholder" quebra apontando para o lugar
    // errado. O contrato que importa e so este: nunca vazio.
    expect(site.rodape.campos.length).toBeGreaterThan(0)
    for (const campo of site.rodape.campos) {
      expect(typeof campo.valor).toBe('string')
      expect(campo.valor.length).toBeGreaterThan(0)
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

  it('os titulos das quatro secoes nao ficam vazios', () => {
    // Cada um destes vira um <h2>, e tres tambem sao referenciados por
    // aria-labelledby ou usados como aria-label de grupo. `getByRole` com
    // `name: undefined` ignora o filtro de nome inteiramente — um titulo
    // apagado do JSON passaria pelos testes de componente sem ser notado,
    // deixando cabecalhos vazios e ponteiros aria-labelledby quebrados.
    // A guarda de verdade precisa estar aqui, contra o dado bruto.
    const titulos = [
      site.sobre.titulo,
      site.secoes.repositorio.titulo,
      site.secoes.equipe.titulo,
      site.rodape.titulo,
    ]
    for (const titulo of titulos) {
      expect(typeof titulo).toBe('string')
      expect(titulo.length).toBeGreaterThan(0)
    }
  })

  it('a secao equipe tem os campos de formato da aba e da especialidade', () => {
    const { rotuloTodos, formatoAba, prefixoEspecialidade } = site.secoes.equipe
    expect(typeof rotuloTodos).toBe('string')
    expect(rotuloTodos.length).toBeGreaterThan(0)
    expect(typeof formatoAba).toBe('string')
    expect(formatoAba.length).toBeGreaterThan(0)
    // Sem o marcador, a substituicao nao tem onde encaixar a area e toda
    // aba renderizaria com o mesmo texto.
    expect(formatoAba).toContain('{area}')
    expect(typeof prefixoEspecialidade).toBe('string')
    expect(prefixoEspecialidade.length).toBeGreaterThan(0)
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

  it('nenhuma area se repete', () => {
    // `extrairAreas` nao deduplica, e o resultado alimenta `key={nome}` e o
    // rotulo do botao de filtro. Uma equipe que divide uma area em dois
    // blocos do JSON — uma edicao natural — produziria chaves React
    // duplicadas e dois botoes identicos, ambos "pressionados" juntos.
    const nomes = equipe.map((grupo) => grupo.area)
    expect(new Set(nomes).size).toBe(nomes.length)
  })
})
