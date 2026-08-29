import { describe, it, expect } from 'vitest'
import { extrairAreas, filtrarPessoas, AREA_TODOS } from './equipe.js'

const exemplo = {
  areas: ['ELETRONICA', 'MECANICA', 'SIMULACAO'],
  pessoas: [
    { id: 'e1', nome: 'A', areas: ['ELETRONICA'], foto: null },
    { id: 'm1', nome: 'B', areas: ['MECANICA'], foto: null },
    // Pertence a duas areas: aparece nos dois filtros, uma vez so em TODOS.
    { id: 'm2', nome: 'C', areas: ['MECANICA', 'SIMULACAO'], foto: null },
  ],
}

describe('extrairAreas', () => {
  it('poe "todos" na frente e depois as areas declaradas', () => {
    expect(extrairAreas(exemplo))
      .toEqual([AREA_TODOS, 'ELETRONICA', 'MECANICA', 'SIMULACAO'])
  })

  it('devolve so "todos" quando nao ha areas', () => {
    expect(extrairAreas({ areas: [], pessoas: [] })).toEqual([AREA_TODOS])
  })

  it('respeita a ordem declarada, nao a ordem em que as pessoas aparecem', () => {
    // A primeira pessoa da lista e da ELETRONICA; se as abas fossem
    // derivadas das pessoas, SIMULACAO cairia no fim por acidente. A ordem
    // das abas e uma decisao editorial e mora em `areas`.
    const invertido = { ...exemplo, areas: ['SIMULACAO', 'MECANICA', 'ELETRONICA'] }
    expect(extrairAreas(invertido))
      .toEqual([AREA_TODOS, 'SIMULACAO', 'MECANICA', 'ELETRONICA'])
  })
})

describe('filtrarPessoas', () => {
  it('com "todos", devolve cada pessoa uma unica vez', () => {
    // O ponto do modelo: quem esta em duas areas nao duplica na grade.
    const encontrados = filtrarPessoas(exemplo, AREA_TODOS)
    expect(encontrados.map((p) => p.id)).toEqual(['e1', 'm1', 'm2'])
  })

  it('com uma area, devolve so quem e dela', () => {
    const encontrados = filtrarPessoas(exemplo, 'MECANICA')
    expect(encontrados.map((p) => p.id)).toEqual(['m1', 'm2'])
  })

  it('quem tem duas areas aparece nas duas', () => {
    expect(filtrarPessoas(exemplo, 'SIMULACAO').map((p) => p.id)).toEqual(['m2'])
    expect(filtrarPessoas(exemplo, 'MECANICA').map((p) => p.id)).toContain('m2')
  })

  it('preserva a ordem da lista de pessoas dentro de cada filtro', () => {
    // A grade nao reordena nada: a ordem do JSON e a ordem da tela, e e
    // assim que se controla quem aparece primeiro.
    const fora_de_ordem = {
      ...exemplo,
      pessoas: [exemplo.pessoas[2], exemplo.pessoas[1]],
    }
    expect(filtrarPessoas(fora_de_ordem, 'MECANICA').map((p) => p.id))
      .toEqual(['m2', 'm1'])
  })

  it('devolve lista vazia para area inexistente, sem quebrar', () => {
    expect(filtrarPessoas(exemplo, 'INEXISTENTE')).toEqual([])
  })
})
