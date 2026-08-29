# LIFAROBOTS

Site de página única da equipe. React + Vite, publicado no GitHub Pages.

## Rodar localmente

```bash
npm install
npm run dev
```

## Editar o conteúdo

**Nenhuma edição de texto exige mexer em código.** Tudo vive em `src/dados/`:

| Arquivo | O que contém |
|---|---|
| `site.json` | Menu, texto do Sobre, campos do rodapé |
| `repos.json` | Slides do carrossel |
| `equipe.json` | Áreas e integrantes |

Os textos marcados com `[[LACUNA: ...]]` ainda precisam ser preenchidos.
Substitua o marcador inteiro, colchetes inclusive.

O campo `url` de cada item em `repos.json` está reservado para um link
futuro do slide para o repositório — hoje ele **não é renderizado**;
preenchê-lo não tem efeito nenhum no site.

## Trocar as imagens

Coloque os arquivos em `public/img/` e aponte o caminho no JSON correspondente.

| Onde | Tamanho | Formato |
|---|---|---|
| Hero | 2400 × 1350 | JPEG |
| Carrossel | 1600 × 900 | JPEG |
| Equipe | 800 × 800 | JPEG |

Por exemplo, para trocar a foto do primeiro slide do carrossel, em
`src/dados/repos.json`, mude o campo `"imagem"`:

```json
"imagem": "img/repo-01.svg"
```

```json
"imagem": "img/repo-01.jpg"
```

O arquivo `repo-01.jpg` precisa existir em `public/img/`. O caminho no JSON
sempre começa com `img/`, sem `public/` na frente.

Não converta para preto-e-branco — o site faz isso sozinho no CSS.

## Trocar a fonte para Arial

Em `index.html`, mude uma palavra:

```html
<html lang="pt-BR" data-tipografia="arial">
```

Valores aceitos: `lifa` (identidade da equipe) ou `arial` (padrão corporativo).

## Publicar

Todo push na `main` publica sozinho no GitHub Pages. Os testes e o linter
rodam antes: se um JSON estiver malformado ou o lint falhar, a publicação é
barrada.

```bash
npm test    # rodar os testes localmente
npm run lint
npm run build
```

O `base` em `vite.config.js` precisa bater com o nome do repositório no
GitHub — é assim que os caminhos de asset resolvem sob
`usuario.github.io/<repo>/`. Hoje ele está fixo em `/lifarobots/`, ou seja, o
repositório é presumido chamar-se `lifarobots`. Se o repositório for
renomeado ou movido para outra conta, atualize `base` de acordo.

## Ferramentas de geração de assets

`ferramentas/gerar-assets.py` é um script auxiliar, executado manualmente e
fora do build, que gera a logo, o morcego e os placeholders SVG a partir dos
mockups originais (`ferramentas/origem/`). Ele não roda em CI nem é
necessário para rodar ou publicar o site — os arquivos que ele produz já
estão commitados em `public/` e são o entregável real.

Rode-o apenas quando for necessário regenerar esses assets a partir da fonte
(por exemplo, um novo recorte do mockup ou uma versão nova do vetor da
marca):

```bash
python3 ferramentas/gerar-assets.py
```
