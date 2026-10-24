"""补全官网中文标题字体子集（public/landing-origin/assets/fonts/noto-serif-sc-subset.woff2）。

标题（h1、h2、深色卡片标题、常见问题的问题、文章列表标题）用思源宋体子集，只含用到的字。
这个脚本把现有子集里的字，加上 scripts/articles/heading-chars.txt（node scripts/build-articles.mjs 写出的文章标题用字）
和命令行额外给的字，一起从思源宋体 SC Regular（Noto Serif CJK SC 2.002，和现有子集同一版本）重新切出子集。
只会多字、不会少字。

用法：python3 scripts/subset-origin-chinese.py [额外的字]
需要 fontTools 和 brotli；思源宋体用系统里的 /usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc（第 3 个字体，SC）。
"""
import sys
from pathlib import Path

from fontTools import subset
from fontTools.ttLib import TTCollection, TTFont

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "public/landing-origin/assets/fonts/noto-serif-sc-subset.woff2"
CHARS = ROOT / "scripts/articles/heading-chars.txt"
SOURCE = Path("/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc")

current = TTFont(TARGET)
have = set(current.getBestCmap())
want = set(have)
if CHARS.exists():
    want |= {ord(c) for c in CHARS.read_text(encoding="utf-8").strip()}
for extra in sys.argv[1:]:
    want |= {ord(c) for c in extra}

collection = TTCollection(SOURCE)
font = next(f for f in collection.fonts if f["name"].getDebugName(4) == "Noto Serif CJK SC")
available = set(font.getBestCmap())
missing = sorted(want - available)
if missing:
    print("not in the source font, skipped:", "".join(chr(c) for c in missing))
want &= available

added = sorted(want - have)
options = subset.Options()
options.flavor = "woff2"
options.layout_features = ["*"]
options.name_IDs = ["*"]
options.notdef_outline = True
subsetter = subset.Subsetter(options)
subsetter.populate(unicodes=sorted(want))
subsetter.subset(font)
font.flavor = "woff2"
font.save(TARGET)
print(f"{len(have)} -> {len(want)} characters (+{len(added)}), {TARGET.stat().st_size // 1024} KB")
if added:
    print("added:", "".join(chr(c) for c in added))
