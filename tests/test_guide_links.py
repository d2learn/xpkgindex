"""A guide's relative links resolve on the site, not only on GitHub.

Guides are the repository's own markdown, written to read on GitHub, so they
link whatever file of the repository explains the point: another guide, a
descriptor, a skill, a directory. Only links to a configured guide used to be
rewritten; every other one was emitted as written, resolved against
`/docs/<slug>/`, and was a 404 on the site.
"""

from __future__ import annotations

import os
import re

import pytest

from xpkgindex.build import build
from xpkgindex.render import render

from conftest import commit, init_repo, write_config, write_descriptor

REPO = "https://github.com/acme/index"


def _write(root, rel, text):
    full = os.path.join(root, rel)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(text)


@pytest.fixture
def repo(tmp_path):
    root = str(tmp_path / "index")
    os.makedirs(root)
    init_repo(root)
    write_config(root, languages=["en", "zh"], links={"github": REPO}, docs={"entries": [
        {"slug": "guide", "title": "Guide", "path": "docs/README.md",
         "translations": {"zh": "docs/zh/README.md"}},
        {"slug": "types", "title": "Types", "path": "docs/types.md"}]})
    _write(root, "docs/README.md",
           "# Guide\n\n"
           "[types](types.md) "
           "[section](types.md#shapes) "
           "[descriptor](../pkgs/w/alpha.widget.lua) "
           "[skill](../.agents/skills/add/SKILL.md) "
           "[top readme](../README.md#examples) "
           "[translations](zh/) "
           "[pkgs dir](../pkgs/)\n")
    _write(root, "docs/zh/README.md",
           "# 指南\n\n[英文版](../) [类型](../types.md#形态)\n")
    _write(root, "docs/types.md", "# Types\n\n## Shapes\n")
    _write(root, ".agents/skills/add/SKILL.md", "# skill\n")
    _write(root, "README.md", "# index\n")
    write_descriptor(root, "alpha", "widget")
    commit(root, "docs that link around the repository")
    return root


def _hrefs(out, page):
    """The links of the guide body only, not of the site chrome around it."""
    text = open(os.path.join(out, page), encoding="utf-8").read()
    body = text[text.index('<article class="prose">'):]
    body = body[:body.index("</article>")]
    return re.findall(r'href="([^"]+)"', body)


def _site(tmp_path, repo, **kw):
    site, config = build(repo, offline=True, **kw)
    out = str(tmp_path / "out")
    render(site, config, out)
    return site, out


def test_every_link_lands_somewhere(tmp_path, repo):
    site, out = _site(tmp_path, repo)
    en = _hrefs(out, os.path.join("docs", "guide", "index.html"))

    assert "../../docs/types/" in en
    assert "../../docs/types/#shapes" in en
    # A descriptor is shown as its package, not as Lua source.
    assert "../../packages/widget/" in en
    # Everything else is shown where the author pointed: the repository.
    assert f"{REPO}/blob/HEAD/.agents/skills/add/SKILL.md" in en
    assert f"{REPO}/blob/HEAD/README.md#examples" in en
    assert f"{REPO}/tree/HEAD/pkgs" in en
    # A directory whose README is a guide is that guide.
    assert "../../docs/guide/" in en
    assert not [w for w in site.warnings if "guide" in w], site.warnings


def test_a_translation_resolves_from_its_own_directory(tmp_path, repo):
    _, out = _site(tmp_path, repo)
    zh = _hrefs(out, os.path.join("zh", "docs", "guide", "index.html"))
    # `../` from docs/zh/ is docs/, whose README is this same guide.
    assert "../../docs/guide/" in zh
    # Resolved from zh/docs/guide/, so the reader stays in zh/.
    assert any(h.startswith("../../docs/types/#") for h in zh), zh
    assert not any(h.startswith("../../../") for h in zh), zh


def test_file_style_reaches_the_package_page_itself(tmp_path, repo):
    _, out = _site(tmp_path, repo, url_style="file")
    en = _hrefs(out, os.path.join("docs", "guide", "index.html"))
    assert "../../packages/widget/index.html" in en


def test_a_link_to_nothing_is_reported(tmp_path, repo):
    _write(repo, "docs/types.md", "# Types\n\n[gone](missing.md)\n")
    commit(repo, "a dead link", date="2026-01-02")
    site, _ = _site(tmp_path, repo)
    assert any("docs/types.md" in w and "missing.md" in w for w in site.warnings), site.warnings


def test_without_a_repository_the_link_is_reported_not_guessed(tmp_path, repo):
    import json
    cfg_path = os.path.join(repo, ".xpkgindex.json")
    cfg = json.load(open(cfg_path, encoding="utf-8"))
    cfg.pop("links")
    json.dump(cfg, open(cfg_path, "w", encoding="utf-8"))
    commit(repo, "no repository link", date="2026-01-02")
    site, out = _site(tmp_path, repo)
    en = _hrefs(out, os.path.join("docs", "guide", "index.html"))
    assert "../.agents/skills/add/SKILL.md" in en
    assert any("links.github" in w for w in site.warnings), site.warnings
