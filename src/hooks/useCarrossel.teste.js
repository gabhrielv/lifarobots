import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCarrossel } from './useCarrossel.js'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('useCarrossel — autoplay', () => {
  it('comeca no primeiro slide', () => {
    const { result } = renderHook(() => useCarrossel(4))
    expect(result.current.indice).toBe(0)
  })

  it('avanca sozinho a cada 12 segundos', () => {
    const { result } = renderHook(() => useCarrossel(4))
    act(() => vi.advanceTimersByTime(11999))
    expect(result.current.indice).toBe(0)
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.indice).toBe(1)
    act(() => vi.advanceTimersByTime(12000))
    expect(result.current.indice).toBe(2)
  })

  it('da a volta ao passar do ultimo', () => {
    const { result } = renderHook(() => useCarrossel(2))
    act(() => vi.advanceTimersByTime(24000))
    expect(result.current.indice).toBe(0)
  })
})

describe('useCarrossel — pausa', () => {
  it('para de avancar enquanto pausado', () => {
    const { result } = renderHook(() => useCarrossel(4))
    act(() => result.current.pausar())
    act(() => vi.advanceTimersByTime(20000))
    expect(result.current.indice).toBe(0)
  })

  it('retoma um segundo depois de sair', () => {
    const { result } = renderHook(() => useCarrossel(4))
    act(() => result.current.pausar())
    act(() => result.current.retomar())

    act(() => vi.advanceTimersByTime(999))
    expect(result.current.indice).toBe(0)

    // Este act precisa terminar antes do proximo: o setInterval so nasce
    // depois que o efeito do React roda, o que acontece ao sair do act.
    act(() => vi.advanceTimersByTime(1))
    expect(result.current.indice).toBe(0)

    act(() => vi.advanceTimersByTime(12000))
    expect(result.current.indice).toBe(1)
  })
})

describe('useCarrossel — dwell do hover lateral', () => {
  it('nao troca o centro se o cursor so atravessa', () => {
    const { result } = renderHook(() => useCarrossel(4))
    act(() => result.current.aoEntrarLateral(2))
    act(() => vi.advanceTimersByTime(200))
    act(() => result.current.aoSairLateral())
    act(() => vi.advanceTimersByTime(1000))
    expect(result.current.indice).toBe(0)
  })

  it('troca o centro quando o cursor fica 250ms', () => {
    const { result } = renderHook(() => useCarrossel(4))
    act(() => result.current.aoEntrarLateral(2))
    act(() => vi.advanceTimersByTime(250))
    expect(result.current.indice).toBe(2)
  })

  it('um avanco por dwell nao arma outro dwell sozinho', () => {
    const { result } = renderHook(() => useCarrossel(4))
    act(() => result.current.aoEntrarLateral(1))
    act(() => vi.advanceTimersByTime(250))
    expect(result.current.indice).toBe(1)

    // Avancar redesenha o trilho sob um cursor parado: as larguras nao
    // mudam, entao o slide seguinte ocupa exatamente a faixa de tela onde
    // o ponteiro ja estava, e o navegador dispara mouseenter nele. Isso e
    // o layout se mexendo, nao o usuario apontando — e sem guarda o dwell
    // se re-arma sozinho, num ciclo de 250ms que nunca para.
    act(() => result.current.aoEntrarLateral(2))
    act(() => vi.advanceTimersByTime(250))
    expect(result.current.indice).toBe(1)
  })

  it('volta a aceitar o dwell depois que o trilho assenta', () => {
    const { result } = renderHook(() => useCarrossel(4))
    act(() => result.current.aoEntrarLateral(1))
    act(() => vi.advanceTimersByTime(250))

    // Passada a transicao, um mouseenter so pode ter vindo de movimento
    // real do ponteiro: a guarda nao pode virar um bloqueio permanente.
    act(() => vi.advanceTimersByTime(500))
    act(() => result.current.aoEntrarLateral(2))
    act(() => vi.advanceTimersByTime(250))
    expect(result.current.indice).toBe(2)
  })

  it('retomar cancela um dwell pendente', () => {
    const { result } = renderHook(() => useCarrossel(4))
    act(() => result.current.aoEntrarLateral(2))
    act(() => result.current.retomar())
    act(() => vi.advanceTimersByTime(250))
    expect(result.current.indice).toBe(0)
  })
})

describe('useCarrossel — clique na lateral', () => {
  it('centraliza na hora, sem esperar o dwell', () => {
    const { result } = renderHook(() => useCarrossel(4))
    act(() => result.current.aoClicarLateral(2))
    expect(result.current.indice).toBe(2)
  })

  it('o clique nao estende a janela em que o hover e ignorado', () => {
    const { result } = renderHook(() => useCarrossel(4))

    // No desktop o ponteiro entra na lateral antes de clicar: quando o
    // clique chega, o dwell de 250ms ja esta armado.
    act(() => result.current.aoEntrarLateral(1))
    act(() => result.current.aoClicarLateral(1))

    // O timer velho nao levaria a lugar errado — ele guarda o indice, e o
    // clique acabou de mandar para esse mesmo indice. O estrago e outro:
    // ao disparar em t+250 ele re-armaria a acomodacao ate t+750, e o
    // hover abaixo, ja fora dos 500ms normais, seria engolido.
    act(() => vi.advanceTimersByTime(600))
    act(() => result.current.aoEntrarLateral(2))
    act(() => vi.advanceTimersByTime(250))
    expect(result.current.indice).toBe(2)
  })
})

describe('useCarrossel — navegacao direta', () => {
  it('irPara normaliza indices fora da faixa', () => {
    const { result } = renderHook(() => useCarrossel(4))
    act(() => result.current.irPara(-1))
    expect(result.current.indice).toBe(3)
    act(() => result.current.irPara(7))
    expect(result.current.indice).toBe(3)
  })
})
