import { useEffect, useState } from 'react'

const CONSULTA = '(prefers-reduced-motion: reduce)'

/** True quando o sistema do visitante pede menos movimento.
 *  Usado para desligar o autoplay do carrossel. */
export function useMovimentoReduzido() {
  const [reduzido, setReduzido] = useState(
    () => globalThis.matchMedia?.(CONSULTA).matches ?? false,
  )

  useEffect(() => {
    const mq = globalThis.matchMedia?.(CONSULTA)
    if (!mq) return
    const aoMudar = (evento) => setReduzido(evento.matches)
    mq.addEventListener('change', aoMudar)
    return () => mq.removeEventListener('change', aoMudar)
  }, [])

  return reduzido
}
