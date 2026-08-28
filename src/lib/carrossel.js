/** Quantas posicoes de cada lado o trilho renderiza.
 *  A segunda fica fora de tela para o slide que entra nao piscar. */
export const POSICOES_VISIVEIS = 2

/** Traz um indice qualquer para a faixa [0, total).
 *  O `%` do JavaScript devolve negativo para entrada negativa; o dobro
 *  ajuste abaixo corrige isso. */
export function normalizarIndice(indice, total) {
  if (total <= 0) return 0
  return ((indice % total) + total) % total
}

/** Deslocamento com sinal entre um slide e o centro, pelo caminho mais curto.
 *  0 e o centro, negativo fica a esquerda, positivo a direita. */
export function posicaoRelativa(indice, centro, total) {
  if (total <= 0) return 0
  const bruto = normalizarIndice(indice - centro, total)
  return bruto > Math.floor(total / 2) ? bruto - total : bruto
}
