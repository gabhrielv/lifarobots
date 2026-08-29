import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizarIndice } from '../lib/carrossel.js'
import { useMovimentoReduzido } from './useMovimentoReduzido.js'

const INTERVALO = 5000
const DWELL = 250
const RETOMADA = 1000

/** Estado do carrossel: qual slide esta no centro e quando avancar sozinho.
 *
 *  O dwell existe para o carrossel nao disparar quando o cursor apenas
 *  atravessa um slide lateral a caminho de outra coisa. */
export function useCarrossel(total) {
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)
  const movimentoReduzido = useMovimentoReduzido()

  const tempoDwell = useRef(null)
  const tempoRetomada = useRef(null)

  const irPara = useCallback(
    (proximo) => setIndice(normalizarIndice(proximo, total)),
    [total],
  )

  const limparRetomada = useCallback(() => {
    clearTimeout(tempoRetomada.current)
    tempoRetomada.current = null
  }, [])

  const limparDwell = useCallback(() => {
    clearTimeout(tempoDwell.current)
    tempoDwell.current = null
  }, [])

  const pausar = useCallback(() => {
    limparRetomada()
    setPausado(true)
  }, [limparRetomada])

  const retomar = useCallback(() => {
    limparRetomada()
    // Sair do carrossel tambem cancela um dwell pendente. Sem isso o
    // carrossel avancaria para um slide que o ponteiro ja deixou — o
    // oposto do que o dwell existe para evitar.
    limparDwell()
    tempoRetomada.current = setTimeout(() => setPausado(false), RETOMADA)
  }, [limparRetomada, limparDwell])

  const aoEntrarLateral = useCallback(
    (alvo) => {
      pausar()
      limparDwell()
      tempoDwell.current = setTimeout(() => irPara(alvo), DWELL)
    },
    [irPara, pausar, limparDwell],
  )

  const aoSairLateral = limparDwell

  useEffect(() => {
    if (pausado || movimentoReduzido || total <= 1) return
    const t = setInterval(
      () => setIndice((atual) => normalizarIndice(atual + 1, total)),
      INTERVALO,
    )
    return () => clearInterval(t)
  }, [pausado, movimentoReduzido, total])

  useEffect(
    () => () => {
      clearTimeout(tempoDwell.current)
      clearTimeout(tempoRetomada.current)
    },
    [],
  )

  return { indice, irPara, pausar, retomar, aoEntrarLateral, aoSairLateral }
}
