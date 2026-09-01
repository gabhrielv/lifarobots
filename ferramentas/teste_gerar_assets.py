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
    # As fotos dos slides entram junto pelo mesmo motivo dos SVGs: um
    # repo-NN.jpg commitado sobreviveria a uma regressao que parasse de
    # gera-lo, e o teste de enquadramento abaixo passaria sobre o arquivo
    # velho. O hero e os retratos ficam de fora — nao dependem do loop dos
    # slides e ha maquina onde os originais deles nem existem.
    anteriores = list(img.glob("*.svg")) + list(img.glob("repo-*.jpg"))
    for arquivo in anteriores:
        shutil.move(str(arquivo), str(pasta_backup / arquivo.name))

    try:
        resultado = subprocess.run(
            [sys.executable, str(RAIZ / "ferramentas" / "gerar-assets.py")],
            capture_output=True, text=True,
        )
        if resultado.returncode != 0:
            img.mkdir(parents=True, exist_ok=True)
            for arquivo in pasta_backup.iterdir():
                shutil.move(str(arquivo), str(img / arquivo.name))
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
    # Os numeros sao literais de proposito: le-los do gerador faria o teste
    # concordar com o script em vez de com src/dados/repos.json, que e quem
    # define quantos slides existem. Sao nove ao todo — cinco ja com foto de
    # projeto, quatro ainda com o morcego.
    assert len(list(img.glob("repo-*.svg"))) == 4
    assert len(list(img.glob("repo-*.jpg"))) == 5

    # Dois placeholders foram aposentados quando entrou conteudo de verdade:
    # os equipe-NN.svg, quando a grade ganhou gente, e o hero.svg, quando
    # chegou a foto. Se reaparecerem, os loops antigos ressuscitaram.
    assert list(img.glob("equipe-*.svg")) == []
    assert not (img / "hero.svg").exists()

    # Cobre o mesmo tipo de checagem de conteudo para um repo-*, para nao
    # depender so da contagem de arquivos.
    repo = (img / "repo-02.svg").read_text()
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


def teste_fotos_dos_repos_saem_no_quadro_do_slide():
    gerar()
    gerador = carregar_gerador()
    img = RAIZ / "public" / "img"

    for slide, (arquivo, _) in gerador.FOTOS_REPO.items():
        foto = img / f"{slide}.jpg"
        assert foto.exists(), f"faltou a foto de {slide}"
        # O placeholder do slide tem de sumir: dois arquivos para o mesmo
        # slide deixam um orfao em public/img e o JSON aponta so para um.
        assert not (img / f"{slide}.svg").exists(), f"{slide} ficou com os dois"

        imagem = Image.open(foto)
        assert imagem.mode == "RGB"
        # O CSS mostra o slide central em 16/9. Arredondamento de um pixel
        # e inevitavel; qualquer coisa alem disso e enquadramento errado.
        proporcao = imagem.width / imagem.height
        assert abs(proporcao - 16 / 9) < 0.01, f"{slide}: {imagem.size}"
        assert imagem.width <= gerador.LARGURA_REPO, f"{slide} passou do quadro"

        # A origem nunca e ampliada. Um dos dois lados do quadro pode ser
        # maior que o da origem — e a borda da moldura, nao ampliacao —,
        # mas o outro acompanha a imagem: se o menor dos dois passar de 1,
        # a foto em si foi esticada.
        origem = Image.open(gerador.REPOS_ORIGEM / arquivo)
        escala = min(
            imagem.width / origem.width, imagem.height / origem.height
        )
        assert escala <= 1.0, f"{slide} foi ampliada em {escala:.2f}x"
        assert not imagem.getexif(), f"{slide} ainda carrega EXIF"


def teste_gerador_e_repos_json_apontam_para_os_mesmos_arquivos():
    """A tabela de fotos e o repos.json sao editados a mao, um de cada vez.

    Sem esta amarra, trocar a foto de um slide so no gerador deixa o JSON
    apontando para o placeholder que acabou de ser apagado — imagem
    quebrada em producao, e nenhum outro teste olha os dois lados juntos.
    """
    gerador = carregar_gerador()
    repos = json.loads(
        (RAIZ / "src" / "dados" / "repos.json").read_text(encoding="utf-8")
    )

    for slide in repos:
        extensao = "jpg" if slide["id"] in gerador.FOTOS_REPO else "svg"
        assert slide["imagem"] == f"img/{slide['id']}.{extensao}", slide["id"]

    # Uma foto na tabela para um slide que nao existe no JSON nao aparece em
    # lugar nenhum do site — so ocupa espaco em public/img.
    ids = {slide["id"] for slide in repos}
    assert set(gerador.FOTOS_REPO) <= ids, sorted(set(gerador.FOTOS_REPO) - ids)


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
