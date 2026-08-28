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

  it('avanca sozinho a cada 5 segundos', () => {
    const { result } = renderHook(() => useCarrossel(4))
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.indice).toBe(1)
    act(() => vi.advanceTimersByTime(5000))
    expect(result.current.indice).toBe(2)
  })

  it('da a volta ao passar do ultimo', () => {
    const { result } = renderHook(() => useCarrossel(2))
    act(() => vi.advanceTimersByTime(10000))
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

    act(() => vi.advanceTimersByTime(5000))
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
