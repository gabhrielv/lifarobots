import { useCallback, useEffect, useRef, useState } from 'react'
import { normalizarIndice } from '../lib/carrossel.js'
import { useMovimentoReduzido } from './useMovimentoReduzido.js'

const INTERVALO = 12000
const DWELL = 250
const RETOMADA = 1000
/** Quanto o trilho leva para assentar depois de um avanco. Espelha
 *  `--t-reticula` em tokens.css, que anima a largura dos slides. */
const ACOMODACAO = 500

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
  const tempoAcomodacao = useRef(null)
  const acomodando = useRef(false)

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

  const liberarAcomodacao = useCallback(() => {
    clearTimeout(tempoAcomodacao.current)
    tempoAcomodacao.current = null
    acomodando.current = false
  }, [])

  /** Avanca e marca o trilho como em movimento pelo tempo da transicao. */
  const avancarPara = useCallback(
    (alvo) => {
      irPara(alvo)
      acomodando.current = true
      clearTimeout(tempoAcomodacao.current)
      tempoAcomodacao.current = setTimeout(() => {
        acomodando.current = false
      }, ACOMODACAO)
    },
    [irPara],
  )

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
    // Sair do trilho e movimento inequivoco do ponteiro: a guarda de
    // acomodacao existe para ignorar eventos que o layout fabricou, e nao
    // deve sobreviver a uma saida de verdade.
    liberarAcomodacao()
    tempoRetomada.current = setTimeout(() => setPausado(false), RETOMADA)
  }, [limparRetomada, limparDwell, liberarAcomodacao])

  const aoEntrarLateral = useCallback(
    (alvo) => {
      pausar()
      limparDwell()
      // Avancar redesenha o trilho sob um cursor parado. As larguras nao
      // mudam, entao o slide seguinte desliza para exatamente a faixa de
      // tela que o ponteiro ja ocupava, e o navegador dispara mouseenter
      // nele. Isso e o layout se mexendo, nao o usuario apontando: sem a
      // guarda o dwell se re-arma sozinho e o carrossel avanca em cascata
      // a cada 250ms, mais rapido que a propria transicao de 500ms — que
      // e o que se ve como um trilho pulando sem parar.
      if (acomodando.current) return
      tempoDwell.current = setTimeout(() => avancarPara(alvo), DWELL)
    },
    [avancarPara, pausar, limparDwell],
  )

  const aoSairLateral = limparDwell

  /** Clique numa lateral: escolha explicita, entao centraliza na hora.
   *
   *  O dwell pendente e cancelado antes de avancar. Ele nao levaria a lugar
   *  errado — guarda o indice do slide, nao um passo, e o clique acabou de
   *  mandar para esse mesmo indice. O problema e a guarda de acomodacao:
   *  ao disparar, o timer velho a re-arma por mais 500ms, e nessa janela
   *  `aoEntrarLateral` ignora hover de verdade. Sem cancelar, um clique
   *  deixa o carrossel surdo ao ponteiro por 750ms em vez de 500ms.
   *
   *  Cancelar depende do clique chegar depois do mouseenter, o que o
   *  navegador garante; no toque nao ha dwell nenhum para cancelar. */
  const aoClicarLateral = useCallback(
    (alvo) => {
      limparDwell()
      avancarPara(alvo)
    },
    [limparDwell, avancarPara],
  )

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
      clearTimeout(tempoAcomodacao.current)
    },
    [],
  )

  return {
    indice, irPara, pausar, retomar,
    aoEntrarLateral, aoSairLateral, aoClicarLateral,
  }
}
