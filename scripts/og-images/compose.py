"""Article images for the use-case pages: the matching capability scene from the homepage, set beside the article's own
kicker and headline (1600x900). The three overview articles get all six scenes.
Run from a work folder that holds fig_<zh|en>_<step>.png (from shoot_figs.py, with the site served on :8765),
inter-400/500.woff2, alimama-shuheiti-bold-latin.woff2 and boseek-b5-dark.svg; writes assets/use-cases/[en/]<slug>.jpg."""
import re, html, os, sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT = Path(__file__).resolve().parents[2] / "public" / "landing-redesign"
HERE = Path.cwd()
SCENE = {"business-development": "bd", "org-chart": "mapping", "finding-candidates": "sourcing", "job-matching": "match",
         "same-name-candidates": "identity", "talent-pool": "network"}
SLUGS = list(SCENE) + ["headhunter-consultant", "ai-assistant-for-headhunters", "ai-tools-compared"]
SIX = ["match", "sourcing", "identity", "bd", "network", "mapping"]
CSS = """
@font-face { font-family: "Inter"; src: url("inter-400.woff2") format("woff2"); font-weight: 400; }
@font-face { font-family: "Inter"; src: url("inter-500.woff2") format("woff2"); font-weight: 500 700; }
@font-face { font-family: "HB Wordmark"; src: url("alimama-shuheiti-bold-latin.woff2") format("woff2"); font-weight: 700; }
html, body { margin: 0; width: 1600px; height: 900px; background: #0b0c0f; overflow: hidden; }
.stage { position: relative; width: 1600px; height: 900px; color: #f5f5f7; font-family: "Inter", "Noto Sans CJK SC", sans-serif;
  background: radial-gradient(70% 90% at 78% 50%, rgba(209,201,255,.10), rgba(209,201,255,0) 60%), radial-gradient(60% 60% at 10% 100%, rgba(255,156,134,.06), rgba(0,0,0,0) 70%), #0b0c0f; }
.left { position: absolute; left: 96px; top: 0; bottom: 0; width: 600px; display: flex; flex-direction: column; justify-content: center; }
.lock { position: absolute; left: 96px; top: 76px; display: flex; align-items: center; gap: 18px; }
.lock img { height: 40px; } .lock .rule { width: 1.5px; height: 32px; background: rgba(255,255,255,.35); }
.lock .name { font-family: "HB Wordmark", "Inter", sans-serif; font-weight: 700; font-size: 31px; color: #fff; }
.kicker { font-size: 24px; letter-spacing: .04em; color: #d1c9ff; margin-bottom: 26px; }
h1 { margin: 0; font-weight: 600; letter-spacing: -.005em; line-height: 1.24; }
h1 span { display: block; text-wrap: balance; } h1 span + span { color: rgba(228,226,239,.8); } .zh h1 span { white-space: nowrap; }
.solo .left { width: 610px; } .six .left { width: 640px; }
.zh h1 { font-size: 54px; } .en h1 { font-size: 48px; line-height: 1.2; }
.url { position: absolute; left: 96px; bottom: 70px; font-size: 20px; letter-spacing: .08em; color: rgba(201,199,214,.7); }
.panel { position: absolute; right: 80px; top: 80px; width: 748px; height: 740px; border-radius: 22px; overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.07); }
.panel img { width: 100%; height: 100%; object-fit: cover; display: block; }
.grid { position: absolute; right: 80px; top: 50%; transform: translateY(-50%); width: 690px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
.grid img { width: 100%; border-radius: 14px; display: block; box-shadow: 0 16px 40px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.07); }
"""
def info(lang, slug):
    t = (ROOT / ("en/" if lang == "en" else "") / "use-cases" / slug / "index.html").read_text()
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", t, re.S).group(1)
    lines = [html.unescape(re.sub(r"<[^>]+>", "", x)).strip() for x in re.split(r"<br\s*/?>", h1)]
    k = html.unescape(re.search(r'class="[^"]*kicker[^"]*"[^>]*>(.*?)<', t).group(1))
    return k, [l.replace('-', '\u2011') for l in lines if l]
def page(lang, slug):
    k, lines = info(lang, slug)
    right = (f'<div class="panel"><img src="fig_{lang}_{SCENE[slug]}.png"></div>' if slug in SCENE
             else '<div class="grid">' + "".join(f'<img src="fig_{lang}_{s}.png">' for s in SIX) + "</div>")
    return f"""<!doctype html><html lang="{'zh-CN' if lang == 'zh' else 'en'}"><head><meta charset="utf-8"><style>{CSS}</style></head><body>
<div class="stage {lang} {'solo' if slug in SCENE else 'six'}"><div class="lock"><img src="boseek-b5-dark.svg"><span class="rule"></span><span class="name">HunterBuddy</span></div>
<div class="left"><div class="kicker">{html.escape(k)}</div><h1>{''.join(f'<span>{html.escape(l)}</span>' for l in lines)}</h1></div>
<div class="url">BOSEEKAI.COM</div>{right}</div></body></html>"""
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1600, "height": 900})
    for lang in ("zh", "en"):
        out = ROOT / "assets" / "use-cases" / ("en" if lang == "en" else ""); out.mkdir(parents=True, exist_ok=True)
        for slug in SLUGS:
            f = HERE / f"og_{lang}_{slug}.html"; f.write_text(page(lang, slug))
            pg.goto(f.as_uri()); pg.wait_for_load_state("networkidle"); pg.evaluate("document.fonts.ready"); pg.evaluate("() => { const h = document.querySelector('.zh h1'); if (!h) return; let f = 56; const W = h.parentElement.clientWidth; while (f > 38 && Math.max(...[...h.children].map(s => s.scrollWidth)) > W) { f -= 1; h.style.fontSize = f + 'px'; } }"); pg.wait_for_timeout(150)
            png = HERE / f"og_{lang}_{slug}.png"; pg.screenshot(path=str(png))
            os.system(f'convert "{png}" -quality 86 -strip "{out / (slug + ".jpg")}"')
            print(lang, slug, (out / (slug + ".jpg")).stat().st_size)
    b.close()
