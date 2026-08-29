import { useEffect, useState } from 'react'

/** True quando o elemento observado saiu do viewport.
 *
 *  Usa IntersectionObserver em vez de escutar `scroll`, que dispararia a
 *  cada quadro e travaria a rolagem em maquina fraca. */
export function useForaDaTela(referencia) {
  const [fora, setFora] = useState(false)

  useEffect(() => {
    const alvo = referencia.current
    if (!alvo) return
    const observador = new IntersectionObserver(
      ([entrada]) => setFora(!entrada.isIntersecting),
      { threshold: 0 },
    )
    observador.observe(alvo)
    return () => observador.disconnect()
  }, [referencia])

  return fora
}
