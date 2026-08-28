"""Gera os assets estaticos do site a partir dos mockups.

Roda uma vez, fora do build. Os arquivos vao para public/.

    python3 ferramentas/gerar-assets.py
"""

from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = Path("/home/gabhriel/Downloads")
PUBLICO = RAIZ / "public"
IMAGENS = PUBLICO / "img"

# Coordenadas conferidas nos mockups de 1280x860.
RECORTE_LOGO = (40, 40, 1240, 200)
RECORTE_MORCEGO = (580, 45, 700, 100)
LIMIAR = 128


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
    origem = Image.open(ORIGEM / "repo.jpeg").crop(RECORTE_MORCEGO)
    # A fonte tem ~120px de largura e o morcego aparece a ~56px na nav.
    # Ampliar com NEAREST preserva a silhueta chapada; BICUBIC borraria.
    ampliado = origem.resize((origem.width * 4, origem.height * 4), Image.NEAREST)
    binarizar(ampliado).save(PUBLICO / "morcego.png")


def gerar_placeholder(destino: Path, largura: int, altura: int, rotulo: str) -> None:
    """Retangulo com grid tecnico, rotulo e dimensao.

    Deixa explicito que o espaco esta reservado, em vez de parecer defeito.
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
        f'<text x="{largura / 2}" y="{altura / 2 - 8}" fill="rgba(255,255,255,0.52)" '
        f'font-family="monospace" font-size="{max(13, largura // 48)}" '
        f'letter-spacing="3" text-anchor="middle">{rotulo}</text>'
        f'<text x="{largura / 2}" y="{altura / 2 + 20}" fill="rgba(255,255,255,0.38)" '
        f'font-family="monospace" font-size="{max(11, largura // 68)}" '
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
    for n in range(1, 7):
        gerar_placeholder(IMAGENS / f"equipe-{n:02d}.svg", 800, 800, f"EQUIPE {n:02d}")

    print("assets gerados em", PUBLICO)


if __name__ == "__main__":
    main()
