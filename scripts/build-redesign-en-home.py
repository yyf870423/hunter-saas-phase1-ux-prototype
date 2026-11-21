"""The redesign's two homepages:
1. writes the SEO block (canonical, hreflang, Open Graph, JSON-LD, Baidu verification) into the Chinese page
   public/landing-redesign/index.html, between <!-- seo --> and <!-- /seo -->, with the FAQPage taken from the page itself;
2. makes the English page public/landing-redesign/en/index.html from the Chinese one (so the two never drift apart
   in structure) and writes its own English SEO block.
Absolute URLs are the live site's (www.boseekai.com), with the redesign's assets/ served at /assets/.

Every replacement is listed here, in order, and must match; afterwards no Chinese may remain except the
language switch ("中文") and the ICP registration number. Terms follow docs/en-glossary.md.
Run after any change to the Chinese homepage:  python3 scripts/build-redesign-en-home.py
"""
import re, sys, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/landing-redesign/index.html"
OUT = ROOT / "public/landing-redesign/en/index.html"
SITE = "https://www.boseekai.com/"
SEO = re.compile(r"    <!-- seo -->.*?<!-- /seo -->\n", re.S)

ORG = {
    "@type": "Organization", "@id": f"{SITE}#organization", "name": "铂寻 Boseek", "alternateName": ["铂寻", "Boseek"],
    "legalName": "北京铂寻智能科技有限公司", "url": SITE,
    "logo": {"@type": "ImageObject", "url": f"{SITE}apple-touch-icon.png", "width": 180, "height": 180},
    "foundingDate": "2026", "address": {"@type": "PostalAddress", "addressLocality": "北京", "addressCountry": "CN"},
    "email": "hello@boseekai.com",
    "contactPoint": {"@type": "ContactPoint", "contactType": "sales", "email": "hello@boseekai.com", "availableLanguage": ["zh-CN", "en"]},
}
LANGS = {
    "zh": dict(
        home=SITE, lang="zh-CN", og="zh_CN", og_alt="en_US", site_name="铂寻 Boseek", title_cut="｜铂寻 Boseek", baidu=True,
        app="HunterBuddy 是面向 HR 与专业猎头的高阶技术人才寻访 AI 工作台：行业入门、客户研判、组织架构 Mapping、多源寻访、身份核实、人岗双向匹配、人选转介绍和人才库，每条结论都有来源，拿不准的标为待确认。推荐、联系和商务决定由你作出。目前邀请制试用。",
        app_sub="高阶技术人才寻访的 AI 工作台", audience="HR 与专业猎头",
        # the share card (1200×630, the film's last scene): what Feishu, LinkedIn and the like show when the link is pasted
        share="assets/share-card.jpg",
        film=("HunterBuddy 产品演示", "从一个职位需求出发，跟着 HunterBuddy 走完一条高阶技术岗位的寻访链路：客户研判、组织架构 Mapping、多源寻访、人岗双向匹配、身份核实和人才库。", "assets/film-poster.jpg", "assets/hunterbuddy-film.mp4"),
    ),
    "en": dict(
        home=f"{SITE}en/", lang="en", og="en_US", og_alt="zh_CN", site_name="Boseek", title_cut=" | Boseek", baidu=False,
        app="HunterBuddy is the AI workbench for senior tech talent search, built for HR teams and professional headhunters: industry primers, client research, org mapping, multi-source sourcing, identity checks, two-way job matching, referrals and talent pools. Every finding names its source, and anything uncertain is marked “To confirm”. Recommendations, outreach and business decisions are yours. Invitation-only trial.",
        app_sub="AI workbench for senior tech talent search", audience="HR teams and professional headhunters",
        share="assets/share-card-en.jpg",
        film=("HunterBuddy product demo", "Starting from one hiring brief, follow HunterBuddy through a complete senior technical search: client research, org mapping, multi-source sourcing, two-way job matching, identity checks and the talent pool.", "assets/film-poster-en.jpg", "assets/hunterbuddy-film-en.mp4"),
    ),
}

def seo_block(html, key):
    """the SEO block for one homepage, built from that page's own title, description and visible FAQ"""
    L = LANGS[key]
    title = re.search(r"<title>(.*?)</title>", html).group(1)
    desc = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', html).group(1)
    unesc = lambda t: t.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"')
    faq = re.findall(r"<summary><span>(.*?)</span>.*?</summary>\s*<p>(.*?)</p>", html, re.S)
    faq = [(unesc(re.sub(r"<[^>]+>", "", q)), unesc(re.sub(r"<[^>]+>", "", a))) for q, a in faq]
    assert len(faq) == 8, f"{key}: {len(faq)} FAQs"
    home = L["home"]
    graph = [
        ORG,
        {"@type": "WebSite", "@id": f"{SITE}#website", "url": SITE, "name": "铂寻 Boseek", "alternateName": ["HunterBuddy"], "inLanguage": "zh-CN", "publisher": {"@id": f"{SITE}#organization"}},
        {"@type": "WebPage", "@id": f"{home}#webpage", "url": home, "name": unesc(title), "description": unesc(desc), "inLanguage": L["lang"],
         "isPartOf": {"@id": f"{SITE}#website"}, "about": {"@id": f"{SITE}#hunterbuddy"}, "publisher": {"@id": f"{SITE}#organization"}, "video": {"@id": f"{home}#film"}},
        {"@type": "SoftwareApplication", "@id": f"{SITE}#hunterbuddy", "name": "HunterBuddy", "description": L["app"], "applicationCategory": "BusinessApplication",
         "applicationSubCategory": L["app_sub"], "operatingSystem": "Web", "url": SITE, "inLanguage": ["zh-CN", "en"],
         "audience": {"@type": "BusinessAudience", "audienceType": L["audience"]}, "publisher": {"@id": f"{SITE}#organization"}, "creator": {"@id": f"{SITE}#organization"}},
        {"@type": "VideoObject", "@id": f"{home}#film", "name": L["film"][0], "description": L["film"][1], "thumbnailUrl": SITE + L["film"][2], "contentUrl": SITE + L["film"][3],
         "uploadDate": "2026-10-25T00:00:00+08:00", "duration": "PT2M33S", "inLanguage": L["lang"], "publisher": {"@id": f"{SITE}#organization"}},
        {"@type": "FAQPage", "@id": f"{home}#faq", "inLanguage": L["lang"], "isPartOf": {"@id": f"{home}#webpage"},
         "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]},
    ]
    ld = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False, indent=2)
    ld = "\n".join("      " + line for line in ld.splitlines())
    og_title = unesc(title).replace(L["title_cut"], "")
    q = lambda t: t.replace("&", "&amp;").replace('"', "&quot;")
    lines = [
        f'<link rel="canonical" href="{home}" />',
        f'<link rel="alternate" hreflang="zh-CN" href="{SITE}" />',
        f'<link rel="alternate" hreflang="en" href="{SITE}en/" />',
        f'<link rel="alternate" hreflang="x-default" href="{SITE}" />',
        '<meta property="og:type" content="website" />',
        f'<meta property="og:site_name" content="{L["site_name"]}" />',
        f'<meta property="og:title" content="{q(og_title)}" />',
        f'<meta property="og:description" content="{q(unesc(desc))}" />',
        f'<meta property="og:url" content="{home}" />',
        f'<meta property="og:image" content="{SITE}{L["share"]}" />',
        '<meta property="og:image:width" content="1200" />',
        '<meta property="og:image:height" content="630" />',
        f'<meta property="og:locale" content="{L["og"]}" />',
        f'<meta property="og:locale:alternate" content="{L["og_alt"]}" />',
        '<meta name="twitter:card" content="summary_large_image" />',
    ]
    if L["baidu"]:
        lines.append('<!-- 百度搜索资源平台的网站验证，要一直保留（见 docs/seo-geo-plan.md） -->')
        lines.append('<meta name="baidu-site-verification" content="codeva-SxHxeGOeZL" />')
    return ("    <!-- seo -->\n" + "".join(f"    {l}\n" for l in lines)
            + f'    <script type="application/ld+json">\n{ld}\n    </script>\n    <!-- /seo -->\n')

# 1. the Chinese page's SEO block
zh = SRC.read_text()
assert SEO.search(zh), "no <!-- seo --> block in the Chinese page"
zh = SEO.sub(lambda m: seo_block(zh, "zh"), zh)
SRC.write_text(zh)

# 2. the English page starts from the Chinese one, without its SEO block (written afresh at the end)
s = SEO.sub("    <!-- seo -->\n    <!-- /seo -->\n", zh)

# ---------- paths: the page sits one folder deeper ----------
s = s.replace('"../landing-origin/', '"../../landing-origin/').replace('"../landing/', '"../../landing/')
for attr in ("src", "href", "poster"):
    s = re.sub(rf'{attr}="(assets/|redesign\.|vendor/)', rf'{attr}="../\1', s)

R = []  # (old, new) — old must occur at least once; every occurrence is replaced
def r(old, new): R.append((old, new))

# the scenes' avatars carry one Chinese character (a surname, or 你 for “you”); in English, the pinyin initial
AV = {"林": "L", "周": "Z", "陈": "C", "许": "X", "宋": "S", "何": "H", "唐": "T", "吴": "W", "郑": "Z", "韩": "H", "你": "You"}
s = re.sub(r'(<i class="fx-av[^"]*">)([一-鿿])(</i>)', lambda m: m.group(1) + AV[m.group(2)] + m.group(3), s)

# ---------- head ----------
r('<html lang="zh-CN" data-product="HunterBuddy">', '<html lang="en" data-product="HunterBuddy">')
r('<!-- 改版草稿：只用于预览，不收录 -->', '<!-- Redesign draft: preview only, not indexed -->')
r('<title>HunterBuddy · 高阶技术人才寻访的 AI 工作台：多源寻访、人岗匹配、组织架构｜铂寻 Boseek</title>',
  '<title>HunterBuddy · The AI workbench for senior tech talent search: sourcing, job matching, org mapping | Boseek</title>')
r('content="HunterBuddy 是面向 HR 与专业猎头的 AI 人才工作台：从一句岗位需求出发，多源寻访、人岗双向匹配、身份核实、梳理组织架构，每条结论都有来源，把每一次招聘判断沉淀为资产。邀请制试用申请已开放。"',
  'content="HunterBuddy is an AI talent workbench for HR teams and professional headhunters. Starting from a single hiring brief, it runs multi-source sourcing, two-way job matching, identity checks and org mapping. Every finding names its source, and every hiring judgment becomes an asset. Applications for the invitation-only trial are open."')
r('<script defer src="../../landing/shared-ui.js',
  '<script defer src="../../landing-origin/locale-en.js?v=20261024-org"></script>\n    <script defer src="../trial-locale-en.js?v=3"></script>\n    <script defer src="../../landing/shared-ui.js')

# ---------- header ----------
r('<a class="n-skip" href="#main">跳到正文</a>', '<a class="n-skip" href="#main">Skip to content</a>')
r('aria-label="铂寻 Boseek 首页"', 'aria-label="Boseek home"')
r('<img src="../../landing-origin/assets/boseek-b5-dark.svg" alt="Boseek 铂寻" width="150" height="54" />',
  '<img src="../../landing-origin/assets/boseek-b5-en.svg" alt="Boseek" width="150" height="48" />')
r('aria-label="主导航"', 'aria-label="Main navigation"')
r('<a href="#film">产品演示</a>', '<a href="#film">Product demo</a>')
r('<a href="#capabilities">核心能力</a>', '<a href="#capabilities">Capabilities</a>')
r('<a href="#belief">产品边界</a>', '<a href="#belief">Boundaries</a>')
r('<a href="#industries">聚焦方向</a>', '<a href="#industries">Focus areas</a>')
r('<a href="#faq">常见问题</a>', '<a href="#faq">FAQ</a>')
r('<a class="n-lang" href="en/" hreflang="en" lang="en" title="Switch to English" aria-label="Switch to English">EN</a>',
  '<a class="n-lang" href="../" hreflang="zh-CN" lang="zh-CN" title="切换到中文" aria-label="切换到中文">中文</a>')
r('>申请试用</a>', '>Request a trial</a>')
r('aria-label="打开导航"', 'aria-label="Open navigation"')

# ---------- hero (HunterBuddy as the eyebrow, the positioning line as the headline) ----------
r('<span aria-hidden="true"></span>邀请制试用，现已开放申请 · 面向专业招聘者', '<span aria-hidden="true"></span>Invitation-only trial, now open for applications · For professional recruiters')
r('<span class="n-role"><span>高阶技术人才寻访的</span> <span>AI 工作台</span></span>', '<span class="n-role"><span>The AI workbench for</span> <span>senior tech talent search</span></span>')
r('<span>洞察行业，辨识人才，连接人脉，</span>', '<span>Read the industry, know the talent, connect the network,</span>')
r('<span>把每一次招聘判断，沉淀为资产。</span>', '<span>and turn every hiring judgment into an asset.</span>')
r('>观看演示</a>', '>Watch the demo</a>')

# ---------- product demo ----------
r('<p class="n-kicker">产品演示</p>', '<p class="n-kicker">Product demo</p>')
r('<h2 class="n-display" id="n-intro-title">从一个需求，到一份能交付的名单</h2>', '<h2 class="n-display" id="n-intro-title">From one brief to a list you can deliver</h2>')
r('<p>HunterBuddy 是一款面向 HR 与专业猎头的 AI 人才工作台。<br />它不替你去沟通，而是让你在开口之前，就知道这个人做过什么、做到什么程度、该从哪里切入。</p>',
  '<p>HunterBuddy is an AI talent workbench for HR teams and professional headhunters.<br />It doesn’t reach out for you. Instead, before you say a word, you already know what this person has done, how far they took it, and where to begin.</p>')
r('<p class="n-film-title">一条高阶技术岗位的完整寻访链路</p>', '<p class="n-film-title">One senior technical search, from start to finish</p>')
r('poster="../assets/film-poster.jpg?v=14"', 'poster="../assets/film-poster-en.jpg?v=10"')
r('src="../assets/hunterbuddy-film.mp4?v=14"', 'src="../assets/hunterbuddy-film-en.mp4?v=10"')
r('aria-label="HunterBuddy 产品演示短片"', 'aria-label="HunterBuddy product demo"')

# ---------- eight capabilities: heading ----------
r('<p class="n-kicker">01 · 核心能力</p>', '<p class="n-kicker">01 · Capabilities</p>')
r('<h2 class="n-h2" id="n-caps-title">看清谁、找到谁、留住谁</h2>', '<h2 class="n-h2" id="n-caps-title">Know them, find them, keep them</h2>')
r('八件事，三步走。先看懂行业、客户和组织，再多源召回、核实身份、人岗匹配，最后把每一次判断沉淀成下次能直接用的资产。每一步都保留来源、状态和人工确认点。',
  'Eight capabilities in three steps. First understand the industry, the client and the organization, then search across sources, confirm identities and match people to roles, and turn every judgment into an asset you can use next time. Every step keeps its sources, its status and the points where you confirm.')
r('<i>找人</i>', '<i>Find</i>')
r('<i>看清</i>', '<i>Know</i>')   # not "Assess": HunterBuddy never judges people
r('<i>沉淀</i>', '<i>Keep</i>')

# 01 multi-source sourcing — scene
r('<span class="fx-cap">读懂需求</span><b>视觉算法负责人 · 机器人方向</b>', '<span class="fx-cap">Brief</span><b>Head of Computer Vision · robotics</b>')
r('</svg>公开网络</li>', '</svg>Public web</li>')
r('</svg>论文专利</li>', '</svg>Papers &amp; patents</li>')
r('</svg>开源痕迹</li>', '</svg>Open source</li>')
r('</svg>授权人才库</li>', '</svg>Your talent pool</li>')
r('<span class="fx-cap">查重补全 · 按优先级排好</span>', '<span class="fx-cap">De-duplicated · by priority</span>')
r('<li><span>先联系</span>', '<li><span>Contact first</span>')
r('<li><span>值得聊</span>', '<li><span>Worth a call</span>')
r('<li><span>再看看</span>', '<li><span>Keep in view</span>')
r('<span class="fx-cap">渠道覆盖</span><span class="fx-cover-done">已找过 4 处</span><span class="fx-cover-gap">空白 · 行业会议</span>',
  '<span class="fx-cap">Coverage</span><span class="fx-cover-done">4 sources searched</span><span class="fx-cover-gap">Gap · industry events</span>')
# 01 text
r('人选散在招聘平台、论文、代码仓库和你自己的库里，翻一遍就是一整天。', 'Candidates are spread across recruiting platforms, papers, code repositories and your own database. One pass through them takes a whole day.')
r('<h3 id="n-step-sourcing">多源寻访：不只搜简历</h3>', '<h3 id="n-step-sourcing">Multi-source sourcing: more than a CV search</h3>')
r('整合公开网络、论文专利、开源痕迹和授权导入的人才库，统一查重、补全、按优先级排序。哪些渠道已经找过、哪些还是空白，也一并标出来，方便你决定下一步去哪里补。',
  'It brings together the public web, papers and patents, open-source footprints and the talent pool you’ve authorized it to import, then de-duplicates, fills in and ranks by priority. It also shows which sources have been searched and which are still blank, so you can decide where to look next.')
r('>了解多源寻访</a>', '>More on multi-source sourcing</a>')

# 02 two-way job matching — scene
r('<p class="fx-dir"><span class="is-on">岗位找人</span><i>⇄</i><span>简历找岗位</span></p>', '<p class="fx-dir"><span class="is-on">Role to people</span><i>⇄</i><span>CV to roles</span></p>')
r('<span class="fx-cap">岗位 JD</span><span class="fx-cap fx-hi">拆成四项</span>', '<span class="fx-cap">Job description</span><span class="fx-cap fx-hi">4 parts</span>')
r('<b class="fx-title">视觉算法负责人</b>', '<b class="fx-title">Head of Computer Vision</b>')
r('<div><dt>核心技能</dt><dd>视觉算法 · 量产落地</dd></div>', '<div><dt>Core skills</dt><dd>Vision · mass production</dd></div>')
r('<div><dt>行业经验</dt><dd>机器人 / 智能硬件</dd></div>', '<div><dt>Industry</dt><dd>Robotics, smart hardware</dd></div>')
r('<div><dt>项目职责</dt><dd>感知模块从 0 到 1</dd></div>', '<div><dt>Projects</dt><dd>Built perception from scratch</dd></div>')
r('<div><dt>硬性门槛</dt><dd>带过 10 人以上团队</dd></div>', '<div><dt>Must-haves</dt><dd>Has led a team of 10+</dd></div>')
r('<p class="fx-pipe"><span>结构化检索</span><span>语义匹配</span></p>', '<p class="fx-pipe"><span>Structured search</span><span>Semantic matching</span></p>')
r('<span class="fx-cap">匹配结果</span><span class="fx-cap">附依据与风险</span>', '<span class="fx-cap">Matches</span><span class="fx-cap">With reasons &amp; risks</span>')
r('<b>人选 A</b>', '<b>Candidate A</b>')
r('<b>人选 B</b>', '<b>Candidate B</b>')
r('<b>人选 C</b>', '<b>Candidate C</b>')
r('<u>优势</u>', '<u>Strength</u>')
r('<u class="is-risk">待确认</u>', '<u class="is-risk">To confirm</u>')
r('<p>匹配依据 · 四项要求都对上，带过量产项目</p>', '<p>Why · Meets all four, has led mass production</p>')
# 02 text
r('人才库里躺着几千份简历，最合适的那个，往往搜不出来。', 'Thousands of CVs sit in your talent pool, and the best fit often never turns up in a search.')
r('<h3 id="n-step-match">人岗双向匹配：<br />简历找岗位，岗位也找简历</h3>', '<h3 id="n-step-match">Two-way job matching: CVs find roles, roles find CVs</h3>')
r('把 JD 拆成核心技能、行业经验、项目职责和硬性门槛，用结构化检索与语义匹配一起找人。反过来，也能为一份简历找到库里更合适的岗位。每条结果附匹配依据、明确优势和待确认的风险。',
  'It breaks the JD into core skills, industry experience, project responsibilities and must-haves, and uses structured search and semantic matching together to find people. It works the other way too: give it a CV and it finds better-fitting roles in your database. Every result comes with the reasons for the match, its clear strengths and the risks still to confirm.')
r('>了解人岗匹配</a>', '>More on two-way job matching</a>')

# 03 identity checks — scene
r('<li><small>社区</small>花名 · 阿越</li>', '<li><small>Forum</small>Alias · A-Yue</li>')
r('<li><small>论文</small>Lin Y.</li>', '<li><small>Paper</small>Lin Y.</li>')
r('<span>林越 · 电商运营</span><em>同名 · 已排除</em>', '<span>Yue Lin · E-commerce ops</span><em>Namesake · ruled out</em>')
r('<b>林越</b><span>工业视觉 · 团队负责人</span></div><em class="fx-ok">已核实</em>', '<b>Yue Lin</b><span>Industrial vision · Team lead</span></div><em class="fx-ok">Verified</em>')
r('<li>三处来源交叉核验</li>', '<li>Three sources cross-checked</li>')
r('<li>履历时间线吻合</li>', '<li>Career timeline matches</li>')
r('<li>同名两位，已排除</li>', '<li>Two namesakes ruled out</li>')
r('<li class="is-wait">现任职级<em>待确认</em></li>', '<li class="is-wait">Current level<em>To confirm</em></li>')
r('<span class="fx-cap">相关人选</span><span>论文合著者 2 位</span>', '<span class="fx-cap">Related</span><span>2 paper co-authors</span>')
# 03 text
r('手上只有一个花名、一个 GitHub ID，人到底是谁，往往要猜上半天。', 'All you have is an alias and a GitHub ID, and working out who the person really is can take half a day of guesswork.')
r('<h3 id="n-step-identity">身份核实：一个 ID，还原成一个真人</h3>', '<h3 id="n-step-identity">Identity checks: from one ID to one real person</h3>')
r('用多个来源交叉核验、排除同名，还原候选人的真实姓名与身份，再沿履历和合作线索找到相关人选。确认不了的不猜：拼音不反推汉字，同名不当同人，拿不准的标为待确认。',
  'It cross-checks several sources and rules out namesakes to establish a candidate’s real name and identity, then follows their career and collaborations to related candidates. What it can’t confirm, it doesn’t guess: no reading Chinese characters from pinyin, no treating namesakes as one person, and anything uncertain is marked “To confirm”.')
r('>了解身份核实</a>', '>More on identity checks</a>')

# 04 org mapping — scene
r('<p class="fx-legend"><span class="is-core">在职核心</span><span class="is-dual">双聘</span><span class="is-joint">联合培养</span><span class="is-left">已离职</span></p>',
  '<p class="fx-legend"><span class="is-core">Core, current</span><span class="is-dual">Dual appointment</span><span class="is-joint">Joint training</span><span class="is-left">Left</span></p>')
r('<div class="fx-node fx-top"><b>具身智能研究院</b></div>', '<div class="fx-node fx-top"><b>Embodied AI Institute</b></div>')
r('<b>技术负责人</b><span>韩征 · 在职核心 · 已核实</span>', '<b>Head of Technology</b><span>Zheng Han · core · verified</span>')
r('<b>视觉团队</b>', '<b>Vision</b>')
r('<b>控制团队</b>', '<b>Controls</b>')
r('<em>疑似团队</em>', '<em>Likely team</em>')
r('<b>产品交付</b><em>负责人待补</em>', '<b>Delivery</b><em>Lead to fill</em>')
r('<p class="fx-src">来源 · 官网 · 新闻 · 论文署名 · 公开演讲</p>', '<p class="fx-src">Sources · Website · News · Bylines · Talks</p>')
# 04 text
r('Mapping 要对着官网和新闻一点点拼，画完的图还存着好几个版本。', 'Mapping means piecing things together from websites and the news, and the finished chart lives on in several versions.')
r('<h3 id="n-step-mapping">组织架构 Mapping：<br />把一群人还原成一张组织图</h3>', '<h3 id="n-step-mapping">Org mapping: from a group of people to an org chart</h3>')
r('先确认真正的研发主体，再判断每个人是在职核心、双聘、高校联合培养还是已离职，最后推断疑似团队与负责人。一键生成架构图，每个位置保留来源与确认状态。',
  'It first establishes which entity really does the R&amp;D, then works out whether each person is a current core member, holds a dual appointment, is a joint-training student from a university or has left, and finally infers likely teams and their leads. The org chart is generated in one click, and every position keeps its source and confirmation status.')
r('>了解组织架构图</a>', '>More on org mapping</a>')

# 05 client research — scene
r('<li>融资动态</li><li>在招岗位</li><li>创始团队</li><li>业务变化</li><li>公开风险</li>', '<li>Funding news</li><li>Open roles</li><li>Founding team</li><li>Business changes</li><li>Public risks</li>')
r('<span class="fx-cap">客户研判</span><em class="fx-ok">优先跟进</em>', '<span class="fx-cap">Client research</span><em class="fx-ok">Follow up first</em>')
r('<li><span>真实需求</span><i style="--n: 4"></i><b>有依据</b></li>', '<li><span>Real need</span><i style="--n: 4"></i><b>Sourced</b></li>')
r('<li><span>付费能力</span><i style="--n: 3"></i><b>有依据</b></li>', '<li><span>Ability to pay</span><i style="--n: 3"></i><b>Sourced</b></li>')
r('<li class="is-wait"><span>交付可行性</span><i style="--n: 2"></i><b>待确认</b></li>', '<li class="is-wait"><span>Deliverability</span><i style="--n: 2"></i><b>To confirm</b></li>')
r('<span class="fx-cap">接洽顺序</span><ol><li>创始人</li><li>技术 VP</li><li class="is-wait">用人经理</li></ol>', '<span class="fx-cap">Order of approach</span><ol><li>Founder</li><li>Tech VP</li><li class="is-wait">Hiring manager</li></ol>')
# 05 text
r('有的客户岗位不少，跟下去才发现需求、预算或决策链还没准备好。', 'Some clients have plenty of openings, and only after chasing them do you find the need, the budget or the decision chain isn’t ready.')
r('<h3 id="n-step-bd">客户研判：先判断值不值得跟</h3>', '<h3 id="n-step-bd">Client research: first, decide if it’s worth pursuing</h3>')
r('把融资、在招岗位、创始团队、业务变化和公开风险放在一起看，判断真实需求、付费能力与交付可行性，再理清决策链和接洽顺序。少做无用奔波。',
  'It looks at funding, open roles, the founding team, business changes and public risks together, judges the real need, the ability to pay and whether you can deliver, then lays out the decision chain and the order of approach. Fewer wasted trips.')
r('>了解客户研判</a>', '>More on client research</a>')

# 06 referrals — scene
r('</i>前同事</span>', '</i>Ex-colleague</span>')
r('</i>论文合著</span>', '</i>Co-author</span>')
r('</i>同门</span>', '</i>Lab mate</span>')
r('<span class="fx-cap">桥接人排序</span><span class="fx-cap">关系强度 · 可达性 · 意愿信号</span>', '<span class="fx-cap">Bridges, ranked</span><span class="fx-cap">Strength · reach · willingness</span>')
r('<b>周宁</b><span>同团队共事 3 年</span><em class="fx-ok">优先</em>', '<b>Ning Zhou</b><span>3 years on the same team</span><em class="fx-ok">Ask first</em>')
r('<b>陈思</b><span>合著论文 2 篇</span><em class="fx-ok">可找</em>', '<b>Si Chen</b><span>2 papers together</span><em class="fx-ok">Worth asking</em>')
r('<b>许晴</b><span>同一实验室</span><em>待确认</em>', '<b>Qing Xu</b><span>Same lab</span><em>To confirm</em>')
# 06 text
r('能想起谁转介绍，取决于自己记忆，而不是谁真的认识他。', 'Who comes to mind for a referral depends on your memory, not on who really knows the person.')
r('<h3 id="n-step-referral">人选转介绍：谁最可能认识他</h3>', '<h3 id="n-step-referral">Referrals: who is most likely to know them</h3>')
r('把同事、同门、论文合著、共同专利和组织关联连成一张关系网，沿 1 到 3 跳寻找桥接人，再按关系强度、可达性和意愿信号排序。每条路径写明依据，也写明哪里还没确认。',
  'It connects colleagues, lab mates, paper co-authors, shared patents and organizational ties into one network, looks for bridges within one to three steps, and ranks them by relationship strength, reachability and signs of willingness. Every route says what it rests on, and what hasn’t been confirmed yet.')
r('>了解人选转介绍</a>', '>More on referrals</a>')

# 07 talent pool — scene
r('>换了公司</span>', '>New company</span>')
r('>换了团队</span>', '>New team</span>')
r('>新的职位</span>', '>New role</span>')
r('<b>周宁</b><span>视觉算法 · 团队负责人</span></div><em class="fx-ok">已更新</em>', '<b>Ning Zhou</b><span>Vision · Team lead</span></div><em class="fx-ok">Updated</em>')
r('<p class="fx-merge-note"><span class="fx-cap">一人一档</span><span>3 份资料已归并</span></p>', '<p class="fx-merge-note"><span class="fx-cap">One profile</span><span>3 records merged</span></p>')
r('<li><i>2024</i><b>收到简历</b><span>视觉算法 · 高级工程师</span></li>', '<li><i>2024</i><b>CV received</b><span>Senior vision engineer</span></li>')
r('<li><i>2025</i><b>换了团队</b><span>并入新平台部</span></li>', '<li><i>2025</i><b>Changed teams</b><span>Into the new platform division</span></li>')
r('<li class="is-now"><i>2026</i><b>新的职位</b><span>带起一支新团队</span></li>', '<li class="is-now"><i>2026</i><b>New role</b><span>Building a new team</span></li>')
# 07 text
r('当年聊过的人换了公司、换了赛道，你的库还停在入库那天。', 'The people you spoke with years ago have changed companies and fields, and your database is still stuck on the day they were added.')
r('<h3 id="n-step-network">人才库：一人一档，随时间更新</h3>', '<h3 id="n-step-network">Talent pool: one profile per person, kept current</h3>')
r('候选人不同平台身份自动查重归并，线索不足时用公开信息补全档案。公司、团队或职位变化会被识别为关注信号，由 Agent 自主更新并沉淀至同一时间线。人员信息一处更新，后续匹配自动复用。',
  'A candidate’s identities on different platforms are de-duplicated and merged automatically, and where clues are thin, public information fills in the profile. A change of company, team or role is picked up as a signal worth watching, and the agent updates the profile on its own, on a single timeline. Update a person once, and every later match uses it.')
r('>了解人才库</a>', '>More on talent pools</a>')

# 08 industry primer — scene
r('<div class="fx-node fx-ind-root"><b>具身智能</b><span>产业链</span></div>', '<div class="fx-node fx-ind-root"><b>Embodied AI</b><span>Value chain</span></div>')
r('<li><b>上游</b><span>核心零部件</span><span>传感器</span></li>', '<li><b>Upstream</b><span>Core parts</span><span>Sensors</span></li>')
r('<li><b>中游</b><span>整机本体</span><span>运动控制</span></li>', '<li><b>Midstream</b><span>Robot body</span><span>Motion control</span></li>')
r('<li><b>下游</b><span>场景集成</span><span>工业 / 家用</span></li>', '<li><b>Downstream</b><span>Integration</span><span>Industry, home</span></li>')
r('<span class="fx-cap">岗位地图</span><em class="fx-ok">已用 JD 校准</em>', '<span class="fx-cap">Role map</span><em class="fx-ok">Checked against JDs</em>')
r('<p class="fx-tags"><em>感知算法</em><em>运动控制</em><em>整机测试</em><em>灵巧手</em></p>', '<p class="fx-tags"><em>Perception</em><em>Motion control</em><em>System testing</em><em>Dexterous hands</em></p>')
r('<p class="fx-ind-note"><span class="fx-cap">导出</span><span>可编辑的思维导图</span></p>', '<p class="fx-ind-note"><span class="fx-cap">Export</span><span>Editable mind map</span></p>')
# 08 text
r('新赛道术语成堆，产业链看不清，JD 里的黑话听不懂。', 'A new sector means piles of jargon, a value chain you can’t see clearly and JDs full of insider terms.')
r('<h3 id="n-step-industry">行业入门：从陌生赛道到能开口</h3>', '<h3 id="n-step-industry">Industry primer: from an unfamiliar sector to a confident first call</h3>')
r('从一条产业链的上下游开始，把产品、公司、岗位逐层摊开，再用真实 JD 校准，最后收成一张可编辑的思维导图。招聘从业者拿到的不是研报，是一张能直接开口的行业地图。',
  'Starting from one value chain, upstream and downstream, it lays out the products, companies and roles layer by layer, checks them against real JDs, and wraps it all up in an editable mind map. What recruiters get isn’t a research report. It’s an industry map they can start a conversation from.')
r('>了解行业入门</a>', '>More on industry primers</a>')

# ---------- boundaries ----------
r('<p class="n-kicker">02 · 产品边界</p>', '<p class="n-kicker">02 · Boundaries</p>')
r('<span>招聘从业者的专业判断，</span><span>无法被算法替代</span>', '<span>A recruiter’s professional judgment</span><span>can’t be replaced by an algorithm</span>')
r('<p>信息可以自动抓取，但一个人的期待、顾虑和抱负提取不出来。</p>', '<p>Information can be gathered automatically, but a person’s hopes, doubts and ambitions can’t be extracted.</p>')
r('<p>客户的隐性诉求、人选没说出口的偏好，只能靠面对面的沟通去感知。</p>', '<p>A client’s unspoken needs and a candidate’s unsaid preferences can only be sensed in face-to-face conversation.</p>')
r('alt="一位招聘者和一位人选面对面交谈"', 'alt="A recruiter and a candidate talking face to face"')
r('<h3>所以，HunterBuddy 有自己的边界</h3>', '<h3>So HunterBuddy keeps to clear boundaries</h3>')
r('<li><i>01</i>它把所有信息整理成有来源的证据链。拿不准的地方明确标出，不包装成确定结论。</li>', '<li><i>01</i>It turns all information into a chain of evidence with sources. Anything uncertain is clearly marked, never dressed up as a firm conclusion.</li>')
r('<li><i>02</i>它不绕过平台权限，不伪造身份，不自动群发，也不替你联系任何人。</li>', '<li><i>02</i>It never bypasses platform permissions, never fakes an identity, never sends mass messages, and never contacts anyone for you.</li>')
r('<li><i>03</i>它不替你做推荐、录用或商务决定。</li>', '<li><i>03</i>It makes no recommendation, hiring or business decisions for you.</li>')
r('我们懂你独自赶路的消耗。<br />同行的路上，可以把力气留给更重要的事。', 'We know how draining it is to go it alone.<br />With company on the road, save your energy for what matters most.')

# ---------- focus areas ----------
r('<p class="n-kicker">03 · 聚焦方向</p>', '<p class="n-kicker">03 · Focus areas</p>')
r('<h2 class="n-h2" id="n-industries-title">与你并肩，<br />奔赴每一场人才相逢。</h2>', '<h2 class="n-h2" id="n-industries-title">By your side,<br />on the road to every great match.</h2>')
r('<li>互联网</li><li>人工智能</li><li>具身智能</li><li>云计算</li><li>医药</li><li>核聚变</li><li>半导体</li><li>能源与稀有资源</li><li>新型储能</li>',
  '<li>Internet</li><li>Artificial intelligence</li><li>Embodied AI</li><li>Cloud computing</li><li>Pharmaceuticals</li><li>Nuclear fusion</li><li>Semiconductors</li><li>Energy and rare resources</li><li>New energy storage</li>')

# ---------- FAQ (the live English site's approved answers, terms aligned with the glossary) ----------
r('<p class="n-kicker">04 · 常见问题</p>', '<p class="n-kicker">04 · FAQ</p>')
r('试用之前，<br />大家常问这些。', 'What people ask<br />before they try it.')
r('还有别的想问，写信到 <a href="mailto:hello@boseekai.com">hello@boseekai.com</a>。', 'Anything else? Write to <a href="mailto:hello@boseekai.com">hello@boseekai.com</a>.')
FAQ = [
 ("HunterBuddy 适合谁使用？", "Who is HunterBuddy for?",
  "HR 与专业猎头，尤其是在招高阶技术岗位、手上有几个难做的职位、库里攒了不少候选人的人。线索散在融资新闻、招聘页、简历库、论文和开源社区里，一个人很难天天盯着、一一读完。做过的功课会存下来，下一件事接着用。",
  "HR teams and professional headhunters, especially those hiring for senior technical roles, with a few hard-to-fill roles on their desk and a candidate database built up over the years. Leads are scattered across funding news, careers pages, CV databases, papers and open-source communities, too many for one person to watch every day and read in full. The research you’ve done is kept, ready for the next search."),
 ("和直接用豆包、DeepSeek、ChatGPT 这类通用 AI，有什么不同？", "How is it different from just using a general-purpose AI like Doubao, DeepSeek or ChatGPT?",
  "通用 AI 擅长回答单个问题，但它不知道你手上有哪些客户和候选人，摸过哪些公司的组织架构。它给的名单里，人是不是同一个、消息从哪来，往往还得你自己再查一遍。HunterBuddy 每次都从你手上的资源出发：熟悉的公司、做过的候选人、梳理过的组织架构和能帮你引荐的人。不同地方的同一个人会先核对再合并，每个判断都写着来源。做完的事会存下来，下一次更快。",
  "General-purpose AI is good at answering one question at a time, but it doesn’t know your clients and candidates, or which companies you’ve already mapped. When it gives you a list of names, you often still have to check for yourself whether two entries are the same person and where each piece of information came from. HunterBuddy always starts from what you already have: the companies you know, the candidates you’ve worked with, the org charts you’ve mapped and the people who can introduce you. When the same person turns up in different places, the records are checked before they are merged, and every finding names its source. The work you finish is kept, so the next search goes faster."),
 ("它会替我盯着市场和候选人吗？", "Can it keep an eye on the market and my candidates for me?",
  "可以。你可以让它定期帮你看，比如每周看一次某个赛道有没有新公司拿到融资、目标公司的招聘页有没有变化，或你关注的候选人公开履历有没有更新。只有值得你看的变化才会提醒你，重复的会合并，没有新消息就不打扰你。它不会自己动手，下一步做什么由你决定。",
  "Yes. You can have it check for you regularly, say once a week: whether any new companies in a sector you follow have raised funding, whether a target company’s careers page has changed, or whether a candidate you’re watching has updated their public profile. It only alerts you to changes worth your time, merges duplicates and stays quiet when there’s nothing new. It never acts on its own. What happens next is your call."),
 ("人选和线索从哪些渠道来？", "Where do candidates and leads come from?",
  "已有候选人、梳理过的组织架构、公开网络与招聘页、论文与专利、开源项目，以及你上传的简历和资料。每条线索都记着来自哪里。散在不同渠道里的同一个人，会先核对再合并。哪些渠道找过了、哪些还是空白，也会标出来，方便你决定下一步去哪里补。",
  "From your existing candidates and org charts, the public web and careers pages, papers and patents, open-source projects, and the CVs and documents you upload. Every lead keeps a note of where it came from. When the same person turns up in different sources, the records are checked before they are merged. It also shows which sources have been searched and where the gaps are, so you can decide what to fill in next."),
 ("我手上的候选人库和组织架构图能带进来吗？", "Can I bring in my own candidate database and org charts?",
  "可以。简历可以单份或批量上传，Excel 等格式的组织架构图可以导入后接着补。带进来的资料同样会核对身份、查重合并，也可以对你所有的在手职位做一次匹配。",
  "Yes. Upload CVs one at a time or in bulk, and import org charts from Excel or similar formats to keep building on them. Everything you bring in goes through the same identity checks and de-duplication, and can be matched against all your live searches in one go."),
 ("匹配结果可以直接相信吗？", "Can I take the match results at face value?",
  "把它当作带来源的参考，而不是最终结论。每条匹配理由都附上来源，你可以点回去看原始资料。没有可靠来源的信息会标为“待确认”，不会把猜测当成事实。像实际带多大团队、本人想不想动，这类只有聊了才知道的事，HunterBuddy 会明确留给你。",
  "Treat them as sourced guidance, not a final verdict. Every reason for a match comes with its source, so you can click through to the original material. Anything without a reliable source is marked “To confirm”, and guesses are never presented as facts. Some things you only find out by talking to the person, such as how big a team they really lead or whether they’re open to a move. HunterBuddy leaves those explicitly to you."),
 ("和猎聘、领英、脉脉这些招聘平台是什么关系？", "How does it fit with recruiting platforms like Liepin, LinkedIn and Maimai?",
  "它们是发布职位、搜索和联系候选人的渠道，HunterBuddy 不替代它们。HunterBuddy 做的是找人之前和找人过程中的研究：把公开资料和你手上的资源放在一起，核对身份、连起关系、写明来源，帮你判断先找谁、怎么开口。从这些平台下载的简历，也可以上传进来一起核对。",
  "Those are where you post roles, search for candidates and get in touch with them, and HunterBuddy doesn’t replace them. It does the research before and during a search: putting public information alongside what you already have, verifying identities, mapping connections and citing sources, to help you decide who to approach first and what to say. CVs downloaded from these platforms can be uploaded too and checked along with everything else."),
 ("和猎头管理系统（CRM、ATS）有什么不同？", "How is it different from a recruitment CRM or ATS?",
  "猎头管理系统记录客户、职位、候选人和推荐进度，管的是已经在做的事。HunterBuddy 帮你找到下一件值得做的事：从公开资料和你手上的资源里找线索、连关系，给出带来源的判断。两者可以配合着用。在 HunterBuddy 里确认过的人和关系，照样记进你的管理系统。",
  "A CRM or ATS records your clients, roles and candidates, and where each submission stands. It manages work already under way. HunterBuddy helps you find what’s worth doing next: it looks for leads and connections in public information and your own resources, and gives you findings backed by sources. The two can be used together. People and relationships you’ve confirmed in HunterBuddy go into your CRM or ATS as usual."),
]
for qz, qe, az, ae in FAQ:
    r(f'<span>{qz}</span>', f'<span>{qe}</span>')
    r(f'<p>{az}</p>', f'<p>{ae}</p>')

# ---------- footer ----------
r('<img src="../../landing-origin/assets/boseek-b5.svg" alt="Boseek 铂寻" width="150" height="54" loading="lazy" />',
  '<img src="../assets/boseek-b5-en-light.svg" alt="Boseek" width="150" height="46" loading="lazy" />')
r('<p>HunterBuddy，高阶技术人才寻访的 AI 工作台。</p>', '<p>HunterBuddy, the AI workbench for senior tech talent search.</p>')
r('<p>由铂寻 Boseek 为 HR 与专业猎头打造。</p>', '<p>Built by Boseek for HR teams and professional headhunters.</p>')
r('<p class="n-footer-mail">联系我们：<a href="mailto:hello@boseekai.com">hello@boseekai.com</a></p>', '<p class="n-footer-mail">Contact: <a href="mailto:hello@boseekai.com">hello@boseekai.com</a></p>')
r('<h2>产品</h2>', '<h2>Product</h2>')  # its links are the header's, already replaced above
r('<h2>使用场景</h2>', '<h2>Use cases</h2>')
r('>多源寻访</a></li>', '>Multi-source sourcing</a></li>')
r('>人岗双向匹配</a></li>', '>Two-way job matching</a></li>')
r('>身份核实</a></li>', '>Identity checks</a></li>')
r('>组织架构 Mapping</a></li>', '>Org mapping</a></li>')
r('>客户研判</a></li>', '>Client research</a></li>')
r('>人选转介绍</a></li>', '>Referrals</a></li>')
r('>人才库</a></li>', '>Talent pool</a></li>')
r('>行业入门</a></li>', '>Industry primer</a></li>')
r('>全部 &gt;&gt;</a></li>', '>All &gt;&gt;</a></li>')
r('<h2>法律</h2>', '<h2>Legal</h2>')
r('<a href="privacy/">隐私政策</a>', '<a href="privacy/">Privacy policy</a>')
r('<a href="terms/">服务条款</a>', '<a href="terms/">Terms of service</a>')
r('<a href="dpa/">数据处理协议</a>', '<a href="dpa/">Data processing agreement</a>')
r('aria-label="版权、网站主体与备案信息"', 'aria-label="Copyright, operator and registration"')
r('<li>&copy; <span data-footer-year>2026</span> 铂寻 Boseek</li>', '<li>&copy; <span data-footer-year>2026</span> Boseek</li>')
r('<li>网站域名：www.boseekai.com</li>', '<li>www.boseekai.com</li>')
r('<li>网站主体：北京铂寻智能科技有限公司</li>', '<li>Operated by Beijing Boseek Intelligent Technology Co., Ltd.</li>')

missing = []
for old, new in R:
    if old not in s:
        missing.append(old[:80])
        continue
    s = s.replace(old, new)
if missing:
    sys.exit("not found:\n  " + "\n  ".join(missing))

body = re.sub(r"<!--.*?-->", "", s, flags=re.S)
han = [line.strip() for line in body.splitlines() if re.search(r"[一-鿿]", line)]
allowed = ("中文", "京ICP备", "京公网安备11011302008508号")
bad = [h for h in han if not any(a in h for a in allowed)]
if bad:
    sys.exit("Chinese left:\n  " + "\n  ".join(bad))
if "；" in s:
    sys.exit("Chinese semicolon left")
s = SEO.sub(lambda m: seo_block(s, "en"), s)
OUT.write_text(s)
print("wrote", OUT.relative_to(ROOT), f"({len(R)} replacements)")
