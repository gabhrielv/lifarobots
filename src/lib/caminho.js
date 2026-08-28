/** Resolve um caminho de asset contra o `base` configurado no Vite.
 *
 *  Sem isso, um caminho relativo quebra quando a URL nao termina em barra. */
export function caminho(relativo) {
  if (!relativo) return ''
  return `${import.meta.env.BASE_URL}/${relativo}`.replace(/\/{2,}/g, '/')
}
