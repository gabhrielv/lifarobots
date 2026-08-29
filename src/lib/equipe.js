/** Valor reservado do filtro. Nenhuma area do JSON pode se chamar assim
 *  — a Tarefa 3 tem um teste que garante isso. */
export const AREA_TODOS = 'todos'

/** Rotulos das abas: "todos" seguido das areas na ordem do JSON. */
export function extrairAreas(grupos) {
  return [AREA_TODOS, ...grupos.map((grupo) => grupo.area)]
}

/** Pessoas da area pedida, cada uma carimbada com a area de origem. */
export function filtrarPessoas(grupos, area) {
  const escolhidos =
    area === AREA_TODOS ? grupos : grupos.filter((grupo) => grupo.area === area)
  return escolhidos.flatMap((grupo) =>
    grupo.pessoas.map((pessoa) => ({ ...pessoa, area: grupo.area })),
  )
}
