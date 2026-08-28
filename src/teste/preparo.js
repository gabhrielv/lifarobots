import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

globalThis.IntersectionObserver = class {
  constructor(retorno) { this.retorno = retorno }
  observe() {}
  unobserve() {}
  disconnect() {}
  disparar(entradas) { this.retorno(entradas, this) }
}

Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((consulta) => ({
    matches: false,
    media: consulta,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
