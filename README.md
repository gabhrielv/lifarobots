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

Os marcadores `[[LACUNA: ...]]` já saíram: o texto real entrou. Cinco dos nove
slides do carrossel já mostram a imagem do projeto; os outros quatro seguem
com o placeholder `repo-NN.svg`, o morcego da marca sobre o grid, até a foto
chegar (veja *Fotos dos projetos*). Ao trocar a imagem, troque também o `alt`:
nesses quatro ele ainda descreve o espaço reservado, não a foto.

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

Um slide novo precisa da imagem correspondente em `public/img/`. Enquanto
ela não chega, o placeholder sai de `ferramentas/gerar-assets.py`: aumente
`TOTAL_REPOS` e rode o script.

No rodapé, cada campo tem `rotulo` e `valor`; o `url` é opcional e, quando
existe, transforma o valor em link que abre em outra aba. A localização não
tem `url` e continua texto puro:

```json
{ "rotulo": "GITHUB", "valor": "github.com/lifarobots",
  "url": "https://github.com/lifarobots" }
```

## Trocar as imagens

O hero, os slides do carrossel e os retratos da equipe saem todos de
`ferramentas/gerar-assets.py`, a partir dos originais em `ferramentas/origem/`.
Para o hero, substitua `ferramentas/origem/hero.jpg` e rode o script; para os
outros dois, veja as seções abaixo.

| Onde | Quadro | Formato |
|---|---|---|
| Carrossel | 16/9, até 1600 × 900 | JPEG |
| Equipe | 800 × 800 | JPEG |

O caminho no JSON sempre começa com `img/`, sem `public/` na frente:
`"imagem": "img/repo-02.svg"` aponta para `public/img/repo-02.svg`.

Não converta para preto-e-branco — o site faz isso sozinho no CSS, no hero,
nos slides do carrossel e nos retratos da equipe.

### Fotos dos projetos

Os originais ficam em `ferramentas/origem/repos/` e o gerador normaliza cada
um para o quadro 16/9 do slide. Para dar foto a um slide que ainda está com o
morcego:

1. Ponha o original em `ferramentas/origem/repos/`.
2. Em `ferramentas/gerar-assets.py`, acrescente o slide em `FOTOS_REPO`:
   `id` → (arquivo, cor da moldura).
3. Rode `python3 ferramentas/gerar-assets.py`. O placeholder `repo-NN.svg`
   sai do disco e no lugar dele entra `repo-NN.jpg`.
4. Em `src/dados/repos.json`, aponte `"imagem"` para `img/repo-NN.jpg` e
   troque o `alt`, que passa a descrever a foto.

Nada é cortado: a imagem entra inteira no quadro e a cor da moldura completa o
que falta dos lados. A cor é a do fundo que a imagem já tem — `BRANCO` para
diagrama sobre fundo chapado, `PRETO` para o resto, que é a cor da página. Nos
dois casos a borda não aparece como borda. Para um enquadramento mais fechado,
recorte o próprio original antes de soltá-lo em `origem/repos/`: assim o corte
fica visível no arquivo, e não escondido num parâmetro.

Nada é ampliado, também: uma imagem menor que 1600 × 900 vira um quadro 16/9
menor, e o navegador cuida do resto. `python3 -m pytest ferramentas/` confere
que a tabela e o `repos.json` apontam para os mesmos arquivos, e `npm test`
reclama se o caminho do JSON não existir em `public/`.

### Fotos da equipe

Os retratos em `public/img/equipe/` são gerados a partir dos originais do
formulário, que ficam em `Foto oficial do membro (File responses)/` e
**não são versionados**. O que entra no git são os 800 × 800 já prontos.

O download do Google Forms já veio com uma e com duas grafias do nome da
pasta — um e dois espaços antes do parêntese. O gerador aceita as duas e usa
a primeira que encontrar no disco. A pasta também pode chegar parcial, só
com as fotos que faltavam: quem não tem original nesta máquina é pulado com
aviso e o retrato já commitado continua valendo.

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
fora do build. Ele gera, a partir de `ferramentas/origem/`, a logo, o
morcego, a foto do hero, as fotos dos projetos e os placeholders SVG dos
slides que ainda não têm foto; e, a partir da pasta de fotos oficiais, os
retratos da equipe. Não roda em CI nem é necessário para rodar ou publicar o
site — os arquivos que ele produz já estão commitados em `public/` e são o
entregável real.

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
