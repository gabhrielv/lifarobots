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

# Os originais das fotos oficiais ficam fora do git: o entregavel sao os
# retratos de 800x800 em public/img/equipe/. Se a pasta nao existir nesta
# maquina, o passo dos retratos e pulado e o que ja esta commitado continua
# valendo. O nome dela sai do Google Forms e ja chegou de duas formas, com um
# e com dois espacos antes do parenteses: vale a primeira que existir.
PASTAS_FOTOS = (
    RAIZ / "Foto oficial do membro  (File responses)",
    RAIZ / "Foto oficial do membro (File responses)",
)
FOTOS = next((p for p in PASTAS_FOTOS if p.is_dir()), PASTAS_FOTOS[0])

# Um placeholder por slide de src/dados/repos.json. Os dois numeros andam
# juntos: um slide sem imagem quebra o teste de dados, e um placeholder a
# mais fica orfao em public/img.
TOTAL_REPOS = 9

LADO_RETRATO = 800
QUALIDADE_RETRATO = 82

# Coordenadas conferidas nos mockups de 1280x860.
RECORTE_LOGO = (40, 40, 1240, 200)
LIMIAR = 128

# O morcego vem do vetor oficial da marca, nao do recorte do mockup.
# O arquivo original traz fundo branco, a silhueta e o logotipo
# "lifarobots" — o site quer so a silhueta, branca, sem fundo.
MARCA_VETOR = ORIGEM / "part lifa vetor.svg"

# Foto do hero, ja tratada em preto-e-branco pelo cliente.
HERO_ORIGEM = ORIGEM / "hero.jpg"
QUALIDADE_HERO = 88
# Indices dos paths no arquivo original: silhueta e os dois olhos.
PATH_SILHUETA = 2
PATHS_OLHOS = (10, 11)
# Caixa da silhueta medida por renderizacao, com 4px de folga: x, y, largura
# e altura. E tupla, e nao a string do viewBox, porque o placeholder precisa
# dos numeros para encaixar a silhueta no centro do quadro.
CAIXA_MORCEGO = (178, 348, 642, 258)

# Quanto da largura do placeholder a silhueta ocupa, e com que forca ela
# aparece. A fracao e conservadora de proposito: as laterais do carrossel
# recortam o slide de 16/9 para 4/3, o que come 25% da largura — em 0.56 o
# morcego continua inteiro no recorte.
FRACAO_MARCA = 0.56
OPACIDADE_MARCA = 0.5


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


def desenho_morcego() -> str:
    """Os paths da silhueta: branca, com os olhos vazados em preto.

    O arquivo da marca e preto sobre branco e inclui o logotipo. Onde o
    morcego aparece — na nav e nos placeholders — o fundo e preto: a
    silhueta vira branca e os olhos ficam pretos, casando com o fundo.
    """
    fonte = MARCA_VETOR.read_text(encoding="utf-8")
    paths = re.findall(r'<path d="([^"]+)"', fonte)
    olhos = "".join(
        f'<path fill="#000000" d="{paths[i]}"/>' for i in PATHS_OLHOS
    )
    return f'<path fill="#ffffff" d="{paths[PATH_SILHUETA]}"/>{olhos}'


def gerar_morcego() -> None:
    """Extrai a silhueta do vetor oficial e a devolve branca, sem fundo."""
    caixa = " ".join(str(n) for n in CAIXA_MORCEGO)
    (PUBLICO / "morcego.svg").write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{caixa}" '
        f'role="img" aria-label="Morcego, simbolo do LIFAROBOTS">'
        f'{desenho_morcego()}</svg>',
        encoding="utf-8",
    )


def gerar_hero() -> None:
    """Normaliza a foto do hero para public/img/hero.jpg.

    Nao redimensiona: a origem tem 1439px de largura e ampliar nao inventa
    detalhe nenhum, so peso. A qualidade e alta de proposito — a origem ja
    e um JPEG, e recomprimir baixo somaria artefato sobre artefato numa
    imagem que ocupa a tela inteira.
    """
    imagem = endireitar(Image.open(HERO_ORIGEM)).convert("RGB")
    imagem.save(
        IMAGENS / "hero.jpg", "JPEG", quality=QUALIDADE_HERO, optimize=True
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
    "guilherme-camanho": "7bc6f8f2-f99b-45fa-a880-b59877fcfedf - guilherme costa.jpg",
    "danilo": "1000045006 - Danilo Siervi.jpg",
    "isabella": "IMG_0606 - Isabella Honório.jpeg",
    "vitor-gabriel": "cfe76005-0d95-4f60-9e39-8f0054c0eb3e - Vitor Gabriel.jpg",
    "lucas-martins": "_MG_0309 - Lmda Martins.JPG",
    "evelyn-queiroz": "20251007_190214 - Evelyn Costa.jpg",
    "adrian-marini": "Foto Oficial Adrian - ADRIAN JOSÉ DA SILVA MARINI PASCHÔA.jpg",
    "pifano": "pifas.jpg",
    "vinycius": "20260518_162538 - VINYCIOS MOREIRA.jpg",
    "luis": "20260625_093227 - Luiz Antonio.jpg",
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

# Medidos sobre a imagem ja endireitada. Sao as fotos em que o rosto nao
# domina o quadro: as de corpo inteiro na frente de um banner e as de meio
# corpo com paisagem. Sem o recorte fechado, o retrato de 100px do cartao
# vira uma mancha.
FOCOS = {
    "lucas-martins": (0.24, 0.395, 0.30),
    # Foto muito alta (627x1398) com o rosto no topo: o padrao, centrado em
    # 0.38 da altura, cortava a cabeca inteira e enquadrava a gravata.
    "vitor-gabriel": (0.50, 0.155, 0.69),
    "bernardo-peccini": (0.53, 0.47, 0.70),
    "gustavo-bersan": (0.66, 0.27, 0.62),
    # Corpo inteiro na frente de um banner de premiacao: no padrao, o
    # cartao mostraria mais banner que pessoa.
    "guilherme-camanho": (0.553, 0.448, 0.32),
}

# Quem ainda nao mandou foto oficial. As iniciais mantem a grade uniforme e
# deixam claro que o espaco esta reservado, nao quebrado.
INICIAIS = {
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


def marca_centrada(largura: int, altura: int) -> str:
    """A silhueta do morcego encaixada no centro de um quadro qualquer.

    O vetor da marca nao comeca na origem: sua caixa vive em (178, 348) no
    sistema do arquivo original. Por isso o translate desconta esse canto
    ja escalado — sem o desconto, a silhueta sai inteira para fora do
    quadro em vez de aparecer centrada nele.
    """
    x, y, w, h = CAIXA_MORCEGO
    escala = largura * FRACAO_MARCA / w
    dx = (largura - w * escala) / 2 - x * escala
    dy = (altura - h * escala) / 2 - y * escala
    return (
        f'<g opacity="{OPACIDADE_MARCA}" transform="'
        f'translate({dx:.1f} {dy:.1f}) scale({escala:.4f})">'
        f'{desenho_morcego()}</g>'
    )


def gerar_placeholder(destino: Path, largura: int, altura: int) -> None:
    """Retangulo com grid tecnico e o morcego da marca ao centro.

    Deixa explicito que o espaco esta reservado, em vez de parecer defeito.
    O rotulo "REPO NN" que ficava aqui era linguagem de bastidor: no ar,
    em producao, o visitante lia o nome interno do arquivo. A silhueta diz
    a mesma coisa — ainda nao ha foto — sem expor o andaime.
    """
    passo = 40
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
        f'{marca_centrada(largura, altura)}'
        f'</svg>',
        encoding="utf-8",
    )


def main() -> None:
    PUBLICO.mkdir(parents=True, exist_ok=True)
    IMAGENS.mkdir(parents=True, exist_ok=True)

    gerar_logo()
    gerar_morcego()

    # O hero.svg generico saiu junto com o placeholder: ha foto de verdade.
    gerar_hero()
    for n in range(1, TOTAL_REPOS + 1):
        gerar_placeholder(IMAGENS / f"repo-{n:02d}.svg", 1600, 900)

    # Os antigos equipe-NN.svg genericos sairam de cena: cada pessoa agora
    # tem retrato proprio, ou um SVG de iniciais enquanto a foto oficial
    # nao chega.
    EQUIPE.mkdir(parents=True, exist_ok=True)
    for pessoa, iniciais in INICIAIS.items():
        gerar_iniciais(EQUIPE / f"{pessoa}.svg", iniciais)

    if FOTOS.is_dir():
        # A pasta pode chegar parcial — um download novo so com as fotos
        # que faltavam, por exemplo. Quem nao tem original nesta maquina e
        # pulado com aviso, e o retrato ja commitado continua valendo; o
        # alternativo seria derrubar a geracao inteira dos outros.
        feitos, pulados = 0, []
        for pessoa, arquivo in RETRATOS.items():
            origem = FOTOS / arquivo
            if not origem.is_file():
                pulados.append(pessoa)
                continue
            gerar_retrato(
                origem,
                EQUIPE / f"{pessoa}.jpg",
                FOCOS.get(pessoa, FOCO_PADRAO),
            )
            feitos += 1
        print(f"{feitos} retratos gerados em", EQUIPE)
        if pulados:
            print(f"aviso: original ausente, retrato mantido: {', '.join(pulados)}")
    else:
        print(f'aviso: "{FOTOS.name}/" ausente — retratos mantidos como estao')

    print("assets gerados em", PUBLICO)


if __name__ == "__main__":
    main()
