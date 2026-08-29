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

Todo push na `main` publica sozinho. Os testes rodam antes: se um JSON estiver
malformado, a publicação é barrada.

```bash
npm test    # rodar os testes localmente
npm run build
```
