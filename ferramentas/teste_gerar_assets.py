import subprocess
import sys
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent


def gerar():
    resultado = subprocess.run(
        [sys.executable, str(RAIZ / "ferramentas" / "gerar-assets.py")],
        capture_output=True, text=True,
    )
    assert resultado.returncode == 0, resultado.stderr
    return resultado


def teste_logo_tem_alfa_e_e_binaria():
    gerar()
    logo = Image.open(RAIZ / "public" / "logo-lifarobots.png")
    assert logo.mode == "RGBA", f"esperado RGBA, veio {logo.mode}"

    # Todo pixel visivel deve ser branco puro. O halftone da LedLite so
    # tem duas densidades; cinza intermediario e ruido de JPEG.
    for r, g, b, a in logo.getdata():
        if a > 0:
            assert (r, g, b) == (255, 255, 255), f"pixel nao-branco: {(r, g, b)}"

    opacos = sum(1 for _, _, _, a in logo.getdata() if a > 0)
    total = logo.width * logo.height
    assert 0.05 < opacos / total < 0.60, (
        f"cobertura de {opacos / total:.0%} — recorte provavelmente errado"
    )


def teste_morcego_existe_em_alta():
    gerar()
    morcego = Image.open(RAIZ / "public" / "morcego.png")
    assert morcego.mode == "RGBA"
    assert morcego.width >= 320, "morcego pequeno demais para telas retina"


def teste_placeholders_foram_gerados():
    gerar()
    img = RAIZ / "public" / "img"
    assert (img / "hero.svg").exists()
    assert len(list(img.glob("repo-*.svg"))) == 4
    assert len(list(img.glob("equipe-*.svg"))) == 6

    conteudo = (img / "hero.svg").read_text()
    assert "HERO" in conteudo
    assert "2400" in conteudo
