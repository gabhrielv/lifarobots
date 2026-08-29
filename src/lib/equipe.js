/** Valor reservado do filtro. Nenhuma area do JSON pode se chamar assim
 *  — dados.teste.js tem um teste que garante isso. */
export const AREA_TODOS = 'todos'

/** Rotulos das abas: "todos" seguido das areas na ordem declarada.
 *
 *  A ordem vem de `equipe.areas`, nao das pessoas: qual area aparece
 *  primeiro e decisao editorial, e derivar isso da lista de pessoas
 *  faria a ordem das abas mudar sozinha a cada entrada ou saida. */
export function extrairAreas(equipe) {
  return [AREA_TODOS, ...equipe.areas]
}

/** Pessoas da area pedida, na ordem em que estao no JSON.
 *
 *  Quem acumula duas areas aparece nas duas e uma unica vez em "todos" —
 *  o cartao e da pessoa, nao do cargo. */
export function filtrarPessoas(equipe, area) {
  if (area === AREA_TODOS) return [...equipe.pessoas]
  return equipe.pessoas.filter((pessoa) => pessoa.areas.includes(area))
}
