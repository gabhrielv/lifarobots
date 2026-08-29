import { describe, it, expect } from 'vitest'
import { extrairAreas, filtrarPessoas, AREA_TODOS } from './equipe.js'

const exemplo = [
  { area: 'ELETRONICA', pessoas: [{ id: 'e1', nome: 'A', especialidade: 'x', foto: null }] },
  { area: 'MECANICA',   pessoas: [
    { id: 'm1', nome: 'B', especialidade: 'y', foto: null },
    { id: 'm2', nome: 'C', especialidade: 'z', foto: null },
  ] },
]

describe('extrairAreas', () => {
  it('poe "todos" na frente e depois as areas do JSON', () => {
    expect(extrairAreas(exemplo)).toEqual([AREA_TODOS, 'ELETRONICA', 'MECANICA'])
  })

  it('devolve so "todos" quando nao ha grupos', () => {
    expect(extrairAreas([])).toEqual([AREA_TODOS])
  })
})

describe('filtrarPessoas', () => {
  it('com "todos", devolve todo mundo', () => {
    expect(filtrarPessoas(exemplo, AREA_TODOS)).toHaveLength(3)
  })

  it('com uma area, devolve so quem e dela', () => {
    const encontrados = filtrarPessoas(exemplo, 'MECANICA')
    expect(encontrados.map((p) => p.id)).toEqual(['m1', 'm2'])
  })

  it('carimba a area em cada pessoa, para o cartao poder exibi-la', () => {
    expect(filtrarPessoas(exemplo, AREA_TODOS)[0].area).toBe('ELETRONICA')
  })

  it('devolve lista vazia para area inexistente, sem quebrar', () => {
    expect(filtrarPessoas(exemplo, 'INEXISTENTE')).toEqual([])
  })
})
