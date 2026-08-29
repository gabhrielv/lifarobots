"""Gera os assets estaticos do site a partir dos mockups.

Roda uma vez, fora do build. Os arquivos vao para public/.

    python3 ferramentas/gerar-assets.py
"""

import re
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / "ferramentas" / "origem"
PUBLICO = RAIZ / "public"
IMAGENS = PUBLICO / "img"
EQUIPE = IMAGENS / "equipe"

# Os originais das fotos oficiais (44MB, um deles um PNG de 23MB) ficam fora
# do git: o entregavel sao os retratos de 800x800 em public/img/equipe/. Se a
# pasta nao existir nesta maquina, o passo dos retratos e pulado e o que ja
# esta commitado continua valendo.
FOTOS = RAIZ / "Foto oficial do membro  (File responses)"

LADO_RETRATO = 800
QUALIDADE_RETRATO = 82

# Coordenadas conferidas nos mockups de 1280x860.
RECORTE_LOGO = (40, 40, 1240, 200)
LIMIAR = 128

# O morcego vem do vetor oficial da marca, nao do recorte do mockup.
# O arquivo original traz fundo branco, a silhueta e o logotipo
# "lifarobots" — o site quer so a silhueta, branca, sem fundo.
MARCA_VETOR = ORIGEM / "part lifa vetor.svg"
# Indices dos paths no arquivo original: silhueta e os dois olhos.
PATH_SILHUETA = 2
PATHS_OLHOS = (10, 11)
# Caixa da silhueta medida por renderizacao, com 4px de folga.
CAIXA_MORCEGO = "178 348 642 258"


def binarizar(imagem: Image.Image) -> Image.Image:
    """Branco puro onde havia claro, transparente onde havia escuro.

    Os mockups sao JPEG: a compressao suja as bordas com cinza. O limiar
    devolve o preto-e-branco chapado que a serigrafia da logo pede.
    """
    cinza = imagem.convert("L")
    saida = Image.new("RGBA", cinza.size, (255, 255, 255, 0))
    saida.putdata([
        (255, 255, 255, 255) if valor >= LIMIAR else (255, 255, 255, 0)
        for valor in cinza.getdata()
    ])
    return saida


def gerar_logo() -> None:
    origem = Image.open(ORIGEM / "landingpage.jpeg").crop(RECORTE_LOGO)
    binarizar(origem).save(PUBLICO / "logo-lifarobots.png")


def gerar_morcego() -> None:
    """Extrai a silhueta do vetor oficial e a devolve branca, sem fundo.

    O arquivo da marca e preto sobre branco e inclui o logotipo. Na nav do
    site, sobre preto, so a silhueta interessa: ela vira branca e os olhos
    ficam pretos, casando com o fundo da pagina.
    """
    fonte = MARCA_VETOR.read_text(encoding="utf-8")
    paths = re.findall(r'<path d="([^"]+)"', fonte)
    silhueta = paths[PATH_SILHUETA]
    olhos = "".join(
        f'<path fill="#000000" d="{paths[i]}"/>' for i in PATHS_OLHOS
    )
    (PUBLICO / "morcego.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{CAIXA_MORCEGO}" '
        f'role="img" aria-label="Morcego, simbolo do LIFAROBOTS">'
        f'<path fill="#ffffff" d="{silhueta}"/>{olhos}</svg>',
        encoding="utf-8",
    )


# Arquivo de origem de cada retrato. A tabela e explicita de proposito: os
# nomes de arquivo vem de um formulario e nao seguem padrao nenhum — casar
# por heuristica ("o nome depois do hifen") erraria em pifas.jpg, em
# WIN_20251023_12_11_54_Pro.jpg (sem nome nenhum) e em "Lmda Martins".
RETRATOS = {
    "bernardo-abrahao": "WhatsApp Image 2026-07-12 at 18.59.27 - BERNARDO ABRAHAO LOPES.jpeg",
    "rodrigo-bon": "WIN_20251023_12_11_54_Pro.jpg",
    "gustavo-bersan": "FotoPerfil - GUSTAVO BERSAN MOREIRA CAMPOS.jpg",
    "joao-nilson": "2025-03-08_131656 - JOÃO NILSON.jpg",
    "vinicius-soldati": "Foto_PART - VINICIUS SOLDATI DE PAULA MATTOS.jpeg",
    "bernardo-peccini": "Screenshot_20251002_214212_WhatsApp - BERNARDO PECCINI DE ANDRADE.jpg",
    "gabhriel": "IMG_6607 - gabhriel.jpeg",
    "davi-grossi": "Capturar - Davi Grossi.JPG",
    "gustavo-rosa": "20260810_161630 - GUSTAVO DE OLIVEIRA ROSA.jpg",
    "vitor-gabriel": "cfe76005-0d95-4f60-9e39-8f0054c0eb3e - Vitor Gabriel.jpg",
    "lucas-martins": "_MG_0309 - Lmda Martins.JPG",
    "evelyn-queiroz": "20251007_190214 - Evelyn Costa.jpg",
    "adrian-marini": "Foto Oficial Adrian - ADRIAN JOSÉ DA SILVA MARINI PASCHÔA.jpg",
    "pifano": "pifas.jpg",
    "vitoria": "IMG_20250706_235355_218 - vitória..webp",
    "luiza-colucci": "IMG-20250207-WA0005 - Luiza Colucci de Castro De Martin.jpg",
    "heitor-silveira": "IMG_20260213_203451033 - Heitor P. Silveira.jpg",
    "matheus-bersan": "c93ba37c-fb4e-4456-8d99-e9e0531c0fd7 - Matheus Bersan.jpg",
    "mariana-gomes": "Screenshot_20260318_202651_Photos - MARIANA ANGELICA GOMES SILVA.jpg",
    "leticia-ribeiro": "20250613_010525 - LETICIA PAULINO RIBEIRO.jpg",
}

# Enquadramento: (fx, fy, escala). fx/fy sao o ponto focal em fracao da
# imagem e escala e o lado do recorte em fracao do menor lado. O padrao
# puxa o quadro para cima porque em retrato o rosto fica acima do centro
# geometrico; centralizar corta a testa e sobra chao.
FOCO_PADRAO = (0.50, 0.38, 1.0)

# Medidos sobre a imagem ja endireitada. Sao as tres fotos em que o rosto
# nao domina o quadro: uma de corpo inteiro na frente de um banner e duas
# de meio corpo com paisagem. Sem o recorte fechado, o retrato de 100px do
# cartao vira uma mancha.
FOCOS = {
    "lucas-martins": (0.24, 0.395, 0.30),
    "bernardo-peccini": (0.53, 0.47, 0.70),
    "gustavo-bersan": (0.66, 0.27, 0.62),
}

# Quem ainda nao mandou foto oficial. As iniciais mantem a grade uniforme e
# deixam claro que o espaco esta reservado, nao quebrado.
INICIAIS = {
    "guilherme-camanho": "GC",
    "danilo": "D",
    "isabella": "I",
    "vinycius": "V",
    "luis": "L",
    "tiaguera": "T",
}


# Orientacao EXIF (tag 0x0112) -> transposicao que endireita a imagem.
ORIENTACAO_EXIF = 0x0112
ENDIREITAR = {
    2: Image.Transpose.FLIP_LEFT_RIGHT,
    3: Image.Transpose.ROTATE_180,
    4: Image.Transpose.FLIP_TOP_BOTTOM,
    5: Image.Transpose.TRANSPOSE,
    6: Image.Transpose.ROTATE_270,
    7: Image.Transpose.TRANSVERSE,
    8: Image.Transpose.ROTATE_90,
}


def endireitar(imagem: Image.Image) -> Image.Image:
    """Aplica a orientacao EXIF e devolve a imagem sem metadado nenhum.

    `ImageOps.exif_transpose` faria o mesmo, mas reserializa o bloco EXIF
    para carrega-lo adiante — e uma das fotos oficiais tem um racional com
    denominador zero, o que estoura com ZeroDivisionError no Pillow. Aqui
    so o valor da orientacao e lido; o resto do EXIF e descartado, que e o
    que queremos de qualquer forma: os originais carregam GPS, modelo de
    aparelho e data, e nada disso deve ir para um arquivo publico.
    """
    try:
        orientacao = imagem.getexif().get(ORIENTACAO_EXIF)
    except Exception:
        orientacao = None
    if orientacao in ENDIREITAR:
        imagem = imagem.transpose(ENDIREITAR[orientacao])
    return imagem


def gerar_retrato(origem: Path, destino: Path, foco: tuple) -> None:
    """Recorta um quadrado em torno do ponto focal e normaliza para 800x800.

    Endireita antes de recortar: varias fotos chegaram deitadas, e recortar
    primeiro enquadraria o lado errado da imagem.
    """
    imagem = endireitar(Image.open(origem)).convert("RGB")
    fx, fy, escala = foco
    lado = round(min(imagem.width, imagem.height) * escala)

    # O ponto focal vira canto superior esquerdo e depois e preso dentro da
    # imagem — sem isso, um foco perto da borda pediria um recorte que
    # comeca fora do quadro e o Pillow devolveria faixa preta.
    x = round(imagem.width * fx - lado / 2)
    y = round(imagem.height * fy - lado / 2)
    x = max(0, min(x, imagem.width - lado))
    y = max(0, min(y, imagem.height - lado))

    quadro = imagem.crop((x, y, x + lado, y + lado))
    quadro = quadro.resize((LADO_RETRATO, LADO_RETRATO), Image.LANCZOS)
    quadro.save(destino, "JPEG", quality=QUALIDADE_RETRATO, optimize=True)


def gerar_iniciais(destino: Path, iniciais: str) -> None:
    """Retrato reservado: as iniciais sobre o mesmo grid dos placeholders."""
    lado = LADO_RETRATO
    passo = 40
    linhas = [
        f'<line x1="{n}" y1="0" x2="{n}" y2="{lado}" />'
        f'<line x1="0" y1="{n}" x2="{lado}" y2="{n}" />'
        for n in range(passo, lado, passo)
    ]
    corpo = 200 if len(iniciais) < 2 else 150
    destino.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{lado}" '
        f'height="{lado}" viewBox="0 0 {lado} {lado}">'
        f'<rect width="{lado}" height="{lado}" fill="#000"/>'
        f'<g stroke="rgba(255,255,255,0.06)" stroke-width="1">{"".join(linhas)}</g>'
        f'<rect x="0.5" y="0.5" width="{lado - 1}" height="{lado - 1}" '
        f'fill="none" stroke="rgba(255,255,255,0.14)"/>'
        # dominant-baseline nao e confiavel entre renderizadores; o deslocamento
        # de ~0.35em no y centra a caixa da fonte de forma previsivel.
        f'<text x="{lado / 2}" y="{lado / 2 + corpo * 0.35:.0f}" '
        f'fill="rgba(255,255,255,0.42)" font-family="monospace" '
        f'font-size="{corpo}" letter-spacing="8" text-anchor="middle">{iniciais}</text>'
        f'</svg>',
        encoding="utf-8",
    )


def gerar_placeholder(destino: Path, largura: int, altura: int, rotulo: str) -> None:
    """Retangulo com grid tecnico, rotulo e dimensao.

    Deixa explicito que o espaco esta reservado, em vez de parecer defeito.
    """
    passo = 40
    corpo = max(13, largura // 48)
    linhas = [
        f'<line x1="{x}" y1="0" x2="{x}" y2="{altura}" />'
        for x in range(passo, largura, passo)
    ] + [
        f'<line x1="0" y1="{y}" x2="{largura}" y2="{y}" />'
        for y in range(passo, altura, passo)
    ]
    destino.write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{largura}" '
        f'height="{altura}" viewBox="0 0 {largura} {altura}">'
        f'<rect width="{largura}" height="{altura}" fill="#000"/>'
        f'<g stroke="rgba(255,255,255,0.06)" stroke-width="1">{"".join(linhas)}</g>'
        f'<rect x="0.5" y="0.5" width="{largura - 1}" height="{altura - 1}" '
        f'fill="none" stroke="rgba(255,255,255,0.14)"/>'
        # As duas linhas se afastam em funcao do corpo da fonte, nao de um
        # valor fixo: com offset fixo o rotulo e a dimensao se sobrepoem
        # assim que o placeholder passa de ~1300px de largura.
        f'<text x="{largura / 2}" y="{altura / 2}" fill="rgba(255,255,255,0.52)" '
        f'font-family="monospace" font-size="{corpo}" '
        f'letter-spacing="3" text-anchor="middle">{rotulo}</text>'
        f'<text x="{largura / 2}" y="{altura / 2 + corpo * 1.7}" fill="rgba(255,255,255,0.38)" '
        f'font-family="monospace" font-size="{corpo * 0.62:.0f}" '
        f'text-anchor="middle">{largura} × {altura}</text>'
        f'</svg>',
        encoding="utf-8",
    )


def main() -> None:
    PUBLICO.mkdir(parents=True, exist_ok=True)
    IMAGENS.mkdir(parents=True, exist_ok=True)

    gerar_logo()
    gerar_morcego()

    gerar_placeholder(IMAGENS / "hero.svg", 2400, 1350, "HERO")
    for n in range(1, 5):
        gerar_placeholder(IMAGENS / f"repo-{n:02d}.svg", 1600, 900, f"REPO {n:02d}")

    # Os antigos equipe-NN.svg genericos sairam de cena: cada pessoa agora
    # tem retrato proprio, ou um SVG de iniciais enquanto a foto oficial
    # nao chega.
    EQUIPE.mkdir(parents=True, exist_ok=True)
    for pessoa, iniciais in INICIAIS.items():
        gerar_iniciais(EQUIPE / f"{pessoa}.svg", iniciais)

    if FOTOS.is_dir():
        for pessoa, arquivo in RETRATOS.items():
            gerar_retrato(
                FOTOS / arquivo,
                EQUIPE / f"{pessoa}.jpg",
                FOCOS.get(pessoa, FOCO_PADRAO),
            )
        print(f"{len(RETRATOS)} retratos gerados em", EQUIPE)
    else:
        print(f'aviso: "{FOTOS.name}/" ausente — retratos mantidos como estao')

    print("assets gerados em", PUBLICO)


if __name__ == "__main__":
    main()
