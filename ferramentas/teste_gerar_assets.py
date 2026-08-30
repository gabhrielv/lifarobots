import importlib.util
import json
import shutil
import re
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent


def carregar_gerador():
    """Importa gerar-assets.py pelo caminho.

    O hifen no nome do arquivo o torna inimportavel por `import`, e as
    tabelas RETRATOS/INICIAIS precisam vir de la: repeti-las aqui faria o
    teste concordar consigo mesmo em vez de com o gerador.
    """
    spec = importlib.util.spec_from_file_location(
        "gerar_assets", RAIZ / "ferramentas" / "gerar-assets.py"
    )
    modulo = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(modulo)
    return modulo


def gerar():
    # Move os SVGs de uma rodada anterior para uma pasta temporaria, em vez
    # de apagar direto, antes de regerar. Sem isso, um SVG commitado no git
    # sobrevive a uma regressao no loop de geracao (ex.: range(1, 5) virar
    # range(1, 4)) e o teste de contagem abaixo passa mesmo que o script
    # tenha parado de gerar aquele arquivo.
    #
    # Se o subprocesso falhar por um motivo alheio a regressao sob teste
    # (ex.: ORIGEM nao existir nesta maquina), os arquivos originais voltam
    # para public/img antes da asercao estourar -- uma falha nao pode
    # deixar a arvore de trabalho com deletions sem recuperacao. Se o
    # subprocesso for bem-sucedido, o que ele gerou agora e que vale; a
    # copia temporaria e so descartada, sem restaurar nada -- e isso que
    # faz a contagem de arquivos no teste de placeholders significar algo.
    img = RAIZ / "public" / "img"
    pasta_backup = Path(tempfile.mkdtemp(prefix="gerar-assets-backup-"))
    for svg in img.glob("*.svg"):
        shutil.move(str(svg), str(pasta_backup / svg.name))

    try:
        resultado = subprocess.run(
            [sys.executable, str(RAIZ / "ferramentas" / "gerar-assets.py")],
            capture_output=True, text=True,
        )
        if resultado.returncode != 0:
            img.mkdir(parents=True, exist_ok=True)
            for svg in pasta_backup.glob("*.svg"):
                shutil.move(str(svg), str(img / svg.name))
        assert resultado.returncode == 0, resultado.stderr
        return resultado
    finally:
        shutil.rmtree(pasta_backup, ignore_errors=True)


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


def teste_morcego_e_vetor_branco_sem_fundo():
    gerar()
    svg = (RAIZ / "public" / "morcego.svg").read_text(encoding="utf-8")

    # Vetor: escala sem perder nitidez, ao contrario do recorte antigo.
    assert "viewBox=" in svg, "sem viewBox o SVG nao escala"

    # Exatamente tres formas: silhueta + dois olhos. Qualquer path a mais
    # significa que o fundo branco ou o logotipo "lifarobots" vazou junto.
    paths = re.findall(r"<path ", svg)
    assert len(paths) == 3, f"esperava 3 paths, veio {len(paths)}"

    # A silhueta e branca (o site e preto) e os olhos sao vazados em preto.
    assert svg.count('fill="#ffffff"') == 1, "silhueta deveria ser branca"
    assert svg.count('fill="#000000"') == 2, "os dois olhos deveriam ser pretos"

    # O PNG antigo saiu de cena: nada deve continuar apontando para ele.
    assert not (RAIZ / "public" / "morcego.png").exists()


def teste_placeholders_foram_gerados():
    gerar()
    img = RAIZ / "public" / "img"
    # O numero e literal de proposito: ler TOTAL_REPOS do gerador faria o
    # teste concordar com o script em vez de com src/dados/repos.json, que
    # e quem define quantos slides existem.
    assert len(list(img.glob("repo-*.svg"))) == 9

    # Dois placeholders foram aposentados quando entrou conteudo de verdade:
    # os equipe-NN.svg, quando a grade ganhou gente, e o hero.svg, quando
    # chegou a foto. Se reaparecerem, os loops antigos ressuscitaram.
    assert list(img.glob("equipe-*.svg")) == []
    assert not (img / "hero.svg").exists()

    # Cobre o mesmo tipo de checagem de conteudo para um repo-*, para nao
    # depender so da contagem de arquivos.
    repo = (img / "repo-01.svg").read_text()
    assert 'width="1600"' in repo
    assert 'height="900"' in repo

    # O rotulo "REPO NN" e a dimensao sairam de cena: eram nome de bastidor
    # exibido em producao. No lugar entrou a silhueta da marca, com os
    # mesmos tres paths do morcego.svg — se vier menos, o vetor mudou de
    # forma e o placeholder ficou so com o grid.
    assert "REPO" not in repo
    assert repo.count("<path ") == 3
    assert repo.count('fill="#ffffff"') == 1, "silhueta deveria ser branca"
    assert repo.count('fill="#000000"') == 2, "os dois olhos deveriam ser pretos"


def teste_hero_e_foto_e_nao_placeholder():
    gerar()
    gerador = carregar_gerador()
    hero = RAIZ / "public" / "img" / "hero.jpg"

    assert hero.exists()
    imagem = Image.open(hero)
    assert imagem.mode == "RGB"
    # A origem nao e ampliada: ampliar so acrescenta peso, nao detalhe.
    assert imagem.size == Image.open(gerador.HERO_ORIGEM).size
    assert not imagem.getexif(), "o hero ainda carrega EXIF"


def teste_iniciais_cobrem_quem_nao_tem_foto():
    gerar()
    gerador = carregar_gerador()
    equipe = RAIZ / "public" / "img" / "equipe"

    for pessoa, iniciais in gerador.INICIAIS.items():
        svg = equipe / f"{pessoa}.svg"
        assert svg.exists(), f"faltou o retrato reservado de {pessoa}"
        conteudo = svg.read_text(encoding="utf-8")
        assert f">{iniciais}<" in conteudo
        # Mesmo lado dos retratos: a grade nao pode ganhar uma celula de
        # outro tamanho so porque a foto ainda nao chegou.
        assert f'width="{gerador.LADO_RETRATO}"' in conteudo


def teste_retratos_saem_quadrados_e_sem_exif():
    gerador = carregar_gerador()
    if not gerador.FOTOS.is_dir():
        return  # os originais nao acompanham o repositorio

    gerar()
    equipe = RAIZ / "public" / "img" / "equipe"
    lado = gerador.LADO_RETRATO

    for pessoa in gerador.RETRATOS:
        arquivo = equipe / f"{pessoa}.jpg"
        assert arquivo.exists(), f"faltou o retrato de {pessoa}"
        imagem = Image.open(arquivo)
        assert imagem.size == (lado, lado), f"{pessoa}: {imagem.size}"
        assert imagem.mode == "RGB"
        # Os originais carregam GPS, modelo de aparelho e data. Nada disso
        # pode sobreviver num arquivo publicado.
        assert not imagem.getexif(), f"{pessoa} ainda carrega EXIF"


def teste_gerador_e_json_cobrem_a_mesma_gente():
    """A tabela do gerador e o equipe.json sao editados a mao, em momentos
    diferentes. Sem esta amarra, alguem que entra na equipe pode ganhar
    cartao no JSON e nenhuma imagem, ou uma entrada no gerador e nenhum
    cartao — e o unico sintoma seria uma foto quebrada em producao.
    """
    gerador = carregar_gerador()
    equipe = json.loads(
        (RAIZ / "src" / "dados" / "equipe.json").read_text(encoding="utf-8")
    )

    no_json = {p["id"] for p in equipe["pessoas"]}
    no_gerador = set(gerador.RETRATOS) | set(gerador.INICIAIS)
    assert no_json == no_gerador, (
        f"so no JSON: {sorted(no_json - no_gerador)} / "
        f"so no gerador: {sorted(no_gerador - no_json)}"
    )
