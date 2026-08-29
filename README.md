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
| `equipe.json` | Áreas (na ordem das abas) e integrantes |

Os textos marcados com `[[LACUNA: ...]]` ainda precisam ser preenchidos.
Substitua o marcador inteiro, colchetes inclusive.

Em `equipe.json`, a lista `areas` no topo define a ordem das abas do filtro,
e `pessoas` lista a equipe. Uma pessoa pode pertencer a mais de uma área —
ela aparece em cada filtro correspondente e uma única vez em `[TODOS]`:

```json
{ "id": "gustavo-rosa", "nome": "Gustavo O. Rosa",
  "areas": ["QUANTUM & MACHINE LEARNING", "SIMULAÇÃO"],
  "foto": "img/equipe/gustavo-rosa.jpg" }
```

As duas listas precisam bater: toda área citada dentro de uma pessoa tem de
estar declarada em `areas`, e toda área declarada precisa ter pelo menos uma
pessoa. `npm test` falha se divergirem — uma área só declarada vira uma aba
que abre vazia, e uma área só citada nunca vira aba.

Cada item de `repos.json` tem `nome` (o nome do projeto, exibido abaixo da
imagem) e `texto` (a descrição, abaixo do nome). O campo `url` está
reservado para um link futuro do slide para o repositório — hoje ele **não é
renderizado**; preenchê-lo não tem efeito nenhum no site.

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

O hero e os slides do carrossel são convertidos para preto-e-branco pelo
CSS; não converta os arquivos. Os retratos da equipe aparecem coloridos.

### Fotos da equipe

Os retratos em `public/img/equipe/` são gerados a partir dos originais do
formulário, que ficam em `Foto oficial do membro  (File responses)/` e
**não são versionados** (44 MB, um deles um PNG de 23 MB). O que entra no
git são os 800 × 800 já prontos.

Para incluir alguém novo:

1. Ponha o original na pasta de fotos.
2. Em `ferramentas/gerar-assets.py`, acrescente a pessoa em `RETRATOS`
   (`id` → nome do arquivo). Se a foto oficial ainda não chegou, acrescente
   em `INICIAIS` (`id` → iniciais) e um espaço reservado é gerado no lugar.
3. Rode `python3 ferramentas/gerar-assets.py`.
4. Acrescente a pessoa em `src/dados/equipe.json`, com o mesmo `id`.

Se o recorte automático enquadrar mal, ajuste em `FOCOS`: `(x, y, escala)`
em frações da imagem, onde `x`/`y` é o ponto focal e `escala` é o lado do
recorte em fração do menor lado. `(0.5, 0.5, 1.0)` é o quadrado inteiro
centrado; escalas menores fecham no rosto.

O gerador descarta o EXIF dos originais: GPS, modelo de aparelho e data não
chegam aos arquivos publicados.

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

Os testes do gerador seguem o mesmo padrão de nome do resto do projeto
(`teste_*`, não `test_*`), configurado em `pytest.ini`:

```bash
python3 -m pytest ferramentas/
```
