import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App.jsx'
import site from './dados/site.json'

// Cada componente ja testa o seu proprio <h2> isoladamente — nenhum teste,
// ate agora, montava a pagina inteira e olhava para a estrutura de titulos
// resultante. Foi assim que a ausencia de <h1> (a logo do Hero era so uma
// <img> solta) passou por doze rodadas de revisao sem nenhum teste acusar.
// Este arquivo existe para fechar esse buraco.
describe('App', () => {
  it('tem exatamente um <h1>, e ele e o wordmark do hero', () => {
    render(<App />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    // O <h1> nao tem texto proprio — e uma <img> com alt vindo do JSON —
    // entao o nome acessivel, nao o textContent, e o que prova que este
    // heading e de fato o wordmark do hero.
    expect(screen.getByRole('heading', { level: 1, name: site.marca.logoAlt }))
      .toBeInTheDocument()
  })

  it('tem os quatro <h2> de secao, na ordem do documento', () => {
    render(<App />)
    const h2s = screen.getAllByRole('heading', { level: 2 })
    expect(h2s.map((h) => h.textContent)).toEqual([
      site.sobre.titulo,
      site.secoes.repositorio.titulo,
      site.secoes.equipe.titulo,
      site.rodape.titulo,
    ])
  })

  it('tem as landmarks principais: main e contentinfo', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
