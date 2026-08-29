import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import site from './site.json'
import repos from './repos.json'
import equipe from './equipe.json'

// Resolvido a partir do proprio arquivo de teste, nao de process.cwd():
// o caminho fica correto independente de onde o vitest for chamado.
//
// `new URL(...)` seria o idioma esperado aqui e nao funciona: o ambiente de
// teste e jsdom, cujo `URL` global nao e o do Node, e `fs.existsSync` nao
// reconhece esse objeto — devolve false para todo caminho, inclusive os que
// existem, transformando a asercao abaixo num teste que nunca passa.
const PUBLICO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public')

/** Um caminho de imagem no JSON e uma string solta: um erro de digitacao
 *  vira imagem quebrada em producao sem que nenhum outro teste note —
 *  `<img>` com src invalido renderiza e passa em qualquer asercao de
 *  componente. So o disco sabe a verdade. */
function existeEmPublico(relativo) {
  return existsSync(path.join(PUBLICO, relativo))
}

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

  it('o hero tem imagem e alt preenchidos, e a imagem existe', () => {
    expect(site.hero.imagem).toBeTruthy()
    expect(site.hero.alt).toBeTruthy()
    expect(existeEmPublico(site.hero.imagem), site.hero.imagem).toBe(true)
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

  it('a secao equipe tem os campos de formato da aba', () => {
    const { rotuloTodos, formatoAba } = site.secoes.equipe
    expect(typeof rotuloTodos).toBe('string')
    expect(rotuloTodos.length).toBeGreaterThan(0)
    expect(typeof formatoAba).toBe('string')
    expect(formatoAba.length).toBeGreaterThan(0)
    // Sem o marcador, a substituicao nao tem onde encaixar a area e toda
    // aba renderizaria com o mesmo texto.
    expect(formatoAba).toContain('{area}')
  })
})

describe('repos.json', () => {
  it('tem ao menos tres slides, para o carrossel ter laterais dos dois lados', () => {
    expect(repos.length).toBeGreaterThanOrEqual(3)
  })

  it('todo slide tem id unico, imagem, alt, nome e texto', () => {
    const ids = repos.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const slide of repos) {
      expect(slide.imagem).toBeTruthy()
      expect(existeEmPublico(slide.imagem), slide.imagem).toBe(true)
      expect(slide.alt).toBeTruthy()
      expect(slide.nome).toBeTruthy()
      expect(slide.texto).toBeTruthy()
    }
  })
})

describe('equipe.json', () => {
  const { areas, pessoas } = equipe

  it('declara ao menos uma area e ao menos uma pessoa', () => {
    expect(areas.length).toBeGreaterThan(0)
    expect(pessoas.length).toBeGreaterThan(0)
  })

  it('toda pessoa tem id unico no site inteiro e nome nao vazio', () => {
    const ids = pessoas.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const pessoa of pessoas) {
      expect(typeof pessoa.nome).toBe('string')
      expect(pessoa.nome.length).toBeGreaterThan(0)
    }
  })

  it('toda pessoa pertence a ao menos uma area', () => {
    // Uma pessoa com `areas: []` desaparece de todos os filtros menos
    // TODOS. O cartao existe, mas nenhuma aba chega ate ele — e nenhuma
    // contagem de grade denuncia isso, porque a grade de TODOS continua
    // com o numero certo.
    for (const pessoa of pessoas) {
      expect(Array.isArray(pessoa.areas)).toBe(true)
      expect(pessoa.areas.length).toBeGreaterThan(0)
    }
  })

  it('nenhuma pessoa repete a mesma area', () => {
    // `includes` nao se importa com a repeticao, entao o site nao quebra —
    // mas a duplicata e sinal de edicao errada, e o proximo a mexer no
    // arquivo copiaria o engano.
    for (const pessoa of pessoas) {
      expect(new Set(pessoa.areas).size).toBe(pessoa.areas.length)
    }
  })

  it('nenhuma area se chama "todos", que e reservado para o filtro', () => {
    for (const area of areas) {
      expect(area.toLowerCase()).not.toBe('todos')
    }
  })

  it('nenhuma area se repete na lista de abas', () => {
    // `extrairAreas` nao deduplica, e o resultado alimenta `key={nome}` e o
    // rotulo do botao de filtro. Uma area repetida produz chaves React
    // duplicadas e dois botoes identicos, ambos "pressionados" juntos.
    expect(new Set(areas).size).toBe(areas.length)
  })

  it('toda area citada por uma pessoa esta declarada na lista de abas', () => {
    // A ordem das abas vem de `areas`, nao das pessoas. Uma area que so
    // existe dentro de alguem nunca vira botao: essa pessoa ficaria
    // alcancavel somente por TODOS.
    const declaradas = new Set(areas)
    for (const pessoa of pessoas) {
      for (const area of pessoa.areas) {
        expect(declaradas).toContain(area)
      }
    }
  })

  it('nenhuma area declarada fica sem ninguem', () => {
    // O caminho inverso do teste acima: uma area renomeada so na lista de
    // abas deixa um botao que abre numa grade vazia.
    const povoadas = new Set(pessoas.flatMap((p) => p.areas))
    for (const area of areas) {
      expect(povoadas).toContain(area)
    }
  })

  it('toda foto referenciada existe em public/', () => {
    for (const pessoa of pessoas) {
      expect(pessoa.foto).toBeTruthy()
      expect(existeEmPublico(pessoa.foto), `foto sumida: ${pessoa.foto}`).toBe(true)
    }
  })
})
