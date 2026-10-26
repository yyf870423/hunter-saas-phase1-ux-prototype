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
        app="猎头的 AI 工作伙伴。HunterBuddy 帮独立猎头和资深顾问做人岗匹配、自动寻访、定位真实姓名、BD 客户研判、简历库更新和组织架构梳理，每个判断都写明来源。联系谁、推不推荐，由猎头决定。目前邀请制试用。",
        app_sub="猎头 AI 助手", audience="独立猎头和资深猎头顾问",
        # the share card (1200×630, the film's last scene): what Feishu, LinkedIn and the like show when the link is pasted
        share="assets/share-card.jpg",
        film=("HunterBuddy 产品短片", "从人海里的一个职位出发，跟着 HunterBuddy 走完六件事：BD 客户研判、组织架构梳理、自动寻访、人岗智能匹配、定位真实姓名、简历库更新。", "assets/film-poster.jpg", "assets/hunterbuddy-film.mp4"),
    ),
    "en": dict(
        home=f"{SITE}en/", lang="en", og="en_US", og_alt="zh_CN", site_name="Boseek", title_cut=" | Boseek", baidu=False,
        app="The AI partner for headhunters. HunterBuddy helps independent headhunters and senior search consultants with job matching, sourcing, identity checks, BD client research, CV updates and org charts, and names the source of every finding. Who to contact and whom to put forward is always the headhunter’s call. Invitation-only trial.",
        app_sub="AI assistant for headhunters", audience="Independent headhunters and senior search consultants",
        share="assets/share-card-en.jpg",
        film=("HunterBuddy product video", "From one role in a sea of people, follow HunterBuddy through six jobs: BD client research, org mapping, automated sourcing, job matching, finding the real name, and keeping CVs current.", "assets/film-poster-en.jpg", "assets/hunterbuddy-film-en.mp4"),
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
        {"@type": "WebSite", "@id": f"{SITE}#website", "url": SITE, "name": "铂寻 Boseek", "alternateName": "HunterBuddy", "inLanguage": "zh-CN", "publisher": {"@id": f"{SITE}#organization"}},
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

# ---------- head ----------
r('<html lang="zh-CN">', '<html lang="en">')
r('<!-- 改版草稿：只用于预览，不收录 -->', '<!-- Redesign draft: preview only, not indexed -->')
r('<title>HunterBuddy · 猎头 AI 助手：人岗匹配、人才寻访、组织架构梳理｜铂寻 Boseek</title>',
  '<title>HunterBuddy · AI assistant for headhunters: matching, sourcing, org charts | Boseek</title>')
r('content="HunterBuddy 是铂寻 Boseek 为独立猎头和资深顾问打造的猎头 AI 助手。人岗匹配、自动寻访、定位真实姓名、BD 客户研判、简历库更新、组织架构梳理，费时间的事交给它，你把心力留给识人和读懂客户。"',
  'content="HunterBuddy by Boseek is an AI assistant for independent headhunters and senior search consultants. It helps with job matching, sourcing, identity checks, BD client research, CV database updates and org charts, so you can focus on people and clients."')
r('<script defer src="../../landing/shared-ui.js',
  '<script defer src="../../landing-origin/locale-en.js?v=20261024-org"></script>\n    <script defer src="../trial-locale-en.js?v=1"></script>\n    <script defer src="../../landing/shared-ui.js')

# ---------- header ----------
r('<a class="n-skip" href="#main">跳到正文</a>', '<a class="n-skip" href="#main">Skip to content</a>')
r('aria-label="铂寻 Boseek 首页"', 'aria-label="Boseek home"')
r('<img src="../../landing-origin/assets/boseek-b5-dark.svg" alt="Boseek 铂寻" width="150" height="54" />',
  '<img src="../../landing-origin/assets/boseek-b5-en.svg" alt="Boseek" width="150" height="48" />')
r('aria-label="主导航"', 'aria-label="Main navigation"')
r('<a href="#film">产品短片</a>', '<a href="#film">Product video</a>')
r('<a href="#capabilities">核心能力</a>', '<a href="#capabilities">Capabilities</a>')
r('<a href="#belief">产品边界</a>', '<a href="#belief">Boundaries</a>')
r('<a href="#industries">行业赛道</a>', '<a href="#industries">Sectors</a>')
r('<a href="#faq">常见问题</a>', '<a href="#faq">FAQ</a>')
r('<a class="n-lang" href="en/" hreflang="en" lang="en" title="Switch to English" aria-label="Switch to English">EN</a>',
  '<a class="n-lang" href="../" hreflang="zh-CN" lang="zh-CN" title="切换到中文" aria-label="切换到中文">中文</a>')
r('>申请试用</a>', '>Request a trial</a>')
r('aria-label="打开导航"', 'aria-label="Open navigation"')

# ---------- hero ----------
r('<span aria-hidden="true"></span>正在开发中，邀请制试用申请已开放', '<span aria-hidden="true"></span>In development. Applications for the invitation-only trial are open.')
r('<p class="n-role">猎头的 AI 工作伙伴</p>', '<p class="n-role">The AI partner for headhunters</p>')
r('<span>我们懂你独自赶路的消耗。</span>', '<span>We know how draining the road can be when you travel alone.</span>')
r('<span>同行的路上，你可以把力气留给更重要的事。</span>', '<span>Travel together, and save your strength for what matters more.</span>')
r('>看看它能做什么</a>', '>See what it can do</a>')

# ---------- intro + film ----------
r('<p class="n-kicker">HunterBuddy 能做什么</p>', '<p class="n-kicker">What HunterBuddy does</p>')
r('<span>费时间的事，交给它。</span>', '<span>Leave the legwork to it.</span>')
r('<span>你的心力，留给识人和读懂客户。</span>', '<span>Save your energy for reading people and understanding clients.</span>')
r('人岗智能匹配、自动寻访、定位真实姓名、BD 客户研判、简历库更新、组织架构梳理，HunterBuddy 都能帮你搞定。你专注判断真正有价值的机会。',
  'Job matching, automated sourcing, finding the real name behind an alias, BD client research, keeping your CV database current, mapping org charts: HunterBuddy helps you get all of it done, so you can focus on judging which opportunities are truly worth it.')
r('poster="../assets/film-poster.jpg?v=9"', 'poster="../assets/film-poster-en.jpg?v=6"')
r('src="../assets/hunterbuddy-film.mp4?v=9"', 'src="../assets/hunterbuddy-film-en.mp4?v=6"')
r('aria-label="HunterBuddy 产品短片"', 'aria-label="HunterBuddy product video"')

# ---------- six capabilities: heading ----------
r('<p class="n-kicker">01 · 核心能力</p>', '<p class="n-kicker">01 · Capabilities</p>')
r('六件最耗人的事，<br />HunterBuddy 替你扛下来。', 'Six jobs that wear you down.<br />HunterBuddy takes them on.')
r('每一件都写着来源，拿不准的单独标出来。最后联系谁、怎么开口，还是你说了算。',
  'Every finding names its source, and anything uncertain is flagged on its own. Who to contact, and how to open the conversation, is still your call.')
r('<i>找人</i>', '<i>Find</i>')
r('<i>看清</i>', '<i>Know</i>')   # not "Assess": HunterBuddy never judges people
r('<i>沉淀</i>', '<i>Keep</i>')

# 01 job matching — scene
r('<span class="fx-cap">岗位 JD</span><span class="fx-cap fx-hi">拆成三项</span>', '<span class="fx-cap">Job description</span><span class="fx-cap fx-hi">3 parts</span>')
r('<b class="fx-title">视觉算法负责人</b>', '<b class="fx-title">Head of Computer Vision</b>')
r('<div><dt>核心技能</dt><dd>视觉算法 · 量产落地</dd></div>', '<div><dt>Core skills</dt><dd>Vision · mass production</dd></div>')
r('<div><dt>行业背景</dt><dd>机器人 / 智能硬件</dd></div>', '<div><dt>Industry</dt><dd>Robotics, smart hardware</dd></div>')
r('<div><dt>硬性门槛</dt><dd>带过 10 人以上团队</dd></div>', '<div><dt>Must-haves</dt><dd>Has led a team of 10+</dd></div>')
r('<p class="fx-pipe"><span>结构化检索</span><span>全文召回</span><span>语义匹配</span></p>', '<p class="fx-pipe"><span>Structured search</span><span>Full-text recall</span><span>Semantic matching</span></p>')
r('<span class="fx-cap">匹配结果</span><span class="fx-cap">按匹配分排序</span>', '<span class="fx-cap">Matches</span><span class="fx-cap">By match score</span>')
r('<b>人选 A</b>', '<b>Candidate A</b>')
r('<b>人选 B</b>', '<b>Candidate B</b>')
r('<b>人选 C</b>', '<b>Candidate C</b>')
r('<u>亮点</u>', '<u>Strength</u>')
r('<u class="is-risk">风险</u>', '<u class="is-risk">Risk</u>')
r('<p>推荐理由 · 三项要求都对上，带过量产项目</p>', '<p>Why · Meets all three, has led mass production</p>')
# 01 text
r('JD 只有寥寥几行，库里却攒着几千份简历，一份份比对到深夜。', 'The JD runs to a few lines, your database holds thousands of CVs, and you compare them one by one late into the night.')
r('<h3 id="n-step-match">智能人岗匹配</h3>', '<h3 id="n-step-match">Job matching</h3>')
r('把岗位 JD 拆开，提炼核心技能、行业背景和硬性门槛，再用结构化检索、全文召回和语义匹配一起找人。每位人选都附上匹配分、亮点、潜在风险和推荐理由，省去反复比对。反过来，也能为一份简历找到合适的岗位。',
  'It breaks the JD down into core skills, industry background and must-haves, then searches with structured search, full-text recall and semantic matching together. Every candidate comes with a match score, strengths, possible risks and the reasons for recommending them, so you stop comparing the same CVs over and over. It works the other way too: give it a CV and it finds the roles that fit.')
r('>了解人岗匹配</a>', '>More on job matching</a>')

# 02 sourcing — scene
r('<span class="fx-cap">读懂需求</span><b>视觉算法负责人 · 机器人方向</b>', '<span class="fx-cap">Brief</span><b>Head of Computer Vision · robotics</b>')
r('</svg>公开信息</li>', '</svg>Public web</li>')
r('</svg>专利论文</li>', '</svg>Patents &amp; papers</li>')
r('</svg>代码痕迹</li>', '</svg>Code</li>')
r('</svg>你的简历库</li>', '</svg>Your CVs</li>')
r('<span class="fx-cap">合并去重 · 排好优先级</span>', '<span class="fx-cap">Merged · by priority</span>')
r('<li><span>先联系</span>', '<li><span>Contact first</span>')
r('<li><span>值得聊</span>', '<li><span>Worth a call</span>')
r('<li><span>再看看</span>', '<li><span>Keep in view</span>')
for zh, en in [("林", "L"), ("周", "Z"), ("陈", "C"), ("许", "X"), ("宋", "S"), ("何", "H"), ("唐", "T"), ("吴", "W"), ("郑", "Z"), ("韩", "H")]:
    r(f'<i class="fx-av">{zh}</i>', f'<i class="fx-av">{en}</i>')
    r(f'<i class="fx-av fx-av-lg">{zh}</i>', f'<i class="fx-av fx-av-lg">{en}</i>') if zh in "陈林" else None
r('<b>陈屿</b><span>视觉算法 · 机器人感知</span></div><em class="fx-ok">先联系</em>', '<b>Yu Chen</b><span>Vision · robotics perception</span></div><em class="fx-ok">Contact first</em>')
r('<span class="fx-cap">三处来源合成一份</span><span class="fx-tags"><em>专利论文</em><em>代码痕迹</em><em>你的简历库</em></span>',
  '<span class="fx-cap">3 sources, 1 profile</span><span class="fx-tags"><em>Papers</em><em>Code</em><em>Your CVs</em></span>')
# 02 text
r('人选散在招聘平台、论文、代码仓库和自己的简历库里，翻一遍就是一整天。', 'Candidates are scattered across recruiting platforms, papers, code repositories and your own CV database. Going through them all takes a whole day.')
r('<h3 id="n-step-sourcing">读懂你的需求，自动寻访</h3>', '<h3 id="n-step-sourcing">It reads your brief and sources for you</h3>')
r('整合公开信息、专利论文、代码痕迹，以及你多年沉淀的简历库，把人选收拢到一起，排好优先级。检索比对的事交给它，你安心把精力留给识人沟通。',
  'It brings together public information, patents and papers, code footprints and the CV database you have built over the years, gathers the candidates in one place and puts them in order of priority. Leave the searching and comparing to it, and keep your energy for judging people and talking to them.')
r('>了解猎头怎么找人</a>', '>How headhunters find candidates</a>')

# 03 identity — scene
r('<li><small>社区</small>花名 · 阿越</li>', '<li><small>Forum</small>Alias · A-Yue</li>')
r('<li><small>论文</small>Lin Y.</li>', '<li><small>Paper</small>Lin Y.</li>')
r('<li><small>代码仓库</small>lin-yue</li>', '<li><small>Repo</small>lin-yue</li>')
r('<span>林越 · 电商运营</span><em>同名 · 已排除</em>', '<span>Yue Lin · E-commerce ops</span><em>Namesake · ruled out</em>')
r('<b>林越</b><span>工业视觉 · 团队负责人</span></div><em class="fx-ok">已核实</em>', '<b>Yue Lin</b><span>Industrial vision · Team lead</span></div><em class="fx-ok">Verified</em>')
r('<li>三处来源对得上</li>', '<li>Three sources agree</li>')
r('<li>履历时间线吻合</li>', '<li>Career timeline matches</li>')
r('<li>同名两位，已排除</li>', '<li>Two namesakes ruled out</li>')
r('<li class="is-wait">现任职级<em>待你确认</em></li>', '<li class="is-wait">Current level<em>To confirm</em></li>')
r('<span class="fx-cap">触达路径</span><span>前同事引荐</span>', '<span class="fx-cap">Way in</span><span>Intro through an ex-teammate</span>')
# 03 text
r('手上只有一个花名、一个 ID，人到底是谁，往往要猜上半天。', 'All you have is a workplace alias or a user ID. Working out who the person really is can take hours of guesswork.')
r('<h3 id="n-step-identity">还原花名背后的真实姓名</h3>', '<h3 id="n-step-identity">Find the real name behind an alias</h3>')
r('即便只有花名、化名或昵称，HunterBuddy 也会用多个来源交叉验证、排除同名，还原候选人的真实姓名和身份，再沿着履历和关系线索找到相关人选，推荐合适的触达路径。拿不准的地方，会标出来等你确认。',
  'Even with only an alias, a pen name or a nickname, HunterBuddy cross-checks several sources, rules out namesakes and establishes the candidate’s real name and identity. It then follows their career and connections to related candidates and suggests a suitable way to reach them. Anything it isn’t sure of is flagged for you to confirm.')
r('>了解身份核实</a>', '>More on identity checks</a>')

# 04 client research — scene
r('<li>行业前景</li><li>融资动态</li><li>创始团队</li><li>岗位信号</li><li>业务信号</li>', '<li>Industry outlook</li><li>Funding news</li><li>Founding team</li><li>Hiring signals</li><li>Business signals</li>')
r('<span class="fx-cap">客户研判</span><em class="fx-ok">优先级 · 高</em>', '<span class="fx-cap">BD client research</span><em class="fx-ok">Priority · High</em>')
r('<li><span>真实需求</span><i style="--n: 4"></i><b>有依据</b></li>', '<li><span>Real need</span><i style="--n: 4"></i><b>Sourced</b></li>')
r('<li><span>付费潜力</span><i style="--n: 3"></i><b>有依据</b></li>', '<li><span>Ability to pay</span><i style="--n: 3"></i><b>Sourced</b></li>')
r('<li class="is-wait"><span>合作风险</span><i style="--n: 2"></i><b>待确认</b></li>', '<li class="is-wait"><span>Risk</span><i style="--n: 2"></i><b>To confirm</b></li>')
r('<span class="fx-cap">决策链</span><ol><li>创始人</li><li>技术 VP</li><li class="is-wait">用人经理</li></ol>', '<span class="fx-cap">Decision chain</span><ol><li>Founder</li><li>Tech VP</li><li class="is-wait">Hiring manager</li></ol>')
# 04 text
r('有的客户岗位不少，跟下去才发现需求、预算或决策链还没准备好。', 'Some clients have plenty of openings, and only once you follow up do you find that the need, the budget or the decision chain isn’t ready.')
r('<h3 id="n-step-bd">BD 客户研判，先看清再出发</h3>', '<h3 id="n-step-bd">BD client research: know before you go</h3>')
r('HunterBuddy 整理行业前景、融资动态、创始团队、岗位和业务信号，帮你判断真实需求、付费潜力和合作风险，再理清决策链和优先级，为下一步接洽提供参考。少做无用奔波，把精力留给值得的机会。',
  'HunterBuddy pulls together the industry outlook, funding news, the founding team, and hiring and business signals, helping you judge the real need, the ability to pay and the risk in working with them. It then lays out the decision chain and priorities to inform your next approach. Fewer wasted trips, and more energy for the opportunities that deserve it.')
r('>了解客户开发</a>', '>More on business development</a>')

# 05 network — scene
r('>换了团队</span>', '>New team</span>')
r('>换了赛道</span>', '>New field</span>')
r('>新的职责</span>', '>New role</span>')
r('<b>周宁</b><span>视觉算法 · 团队负责人</span></div><em class="fx-ok">已更新</em>', '<b>Ning Zhou</b><span>Vision · Team lead</span></div><em class="fx-ok">Updated</em>')
r('<li><i>2024</i><b>收到简历</b><span>视觉算法 · 高级工程师</span></li>', '<li><i>2024</i><b>CV received</b><span>Senior vision engineer</span></li>')
r('<li><i>2025</i><b>换了团队</b><span>并入新平台部</span></li>', '<li><i>2025</i><b>Changed teams</b><span>Into the new platform division</span></li>')
r('<li class="is-now"><i>2026</i><b>承担新职责</b><span>带起一支新团队</span></li>', '<li class="is-now"><i>2026</i><b>New role</b><span>Building a new team</span></li>')
# 05 text
r('当年聊过的人，换了工作、换了赛道，你的简历库却还停在两年前。', 'People you spoke to years ago have changed jobs and changed fields, but your CV database is stuck two years in the past.')
r('<h3 id="n-step-network">守住你的人脉资产</h3>', '<h3 id="n-step-network">Keep your network current</h3>')
r('你认识的每一个人，都是长期的财富。人选换工作、换赛道、承担新职责，信息会悄悄更新。不用你费力记录维护，你的人才库跟着时间一起生长。',
  'Everyone you know is a lasting asset. When candidates change jobs, switch fields or take on new responsibilities, their records quietly update. No tedious upkeep: your talent pool grows with time.')
r('>了解人才库管理</a>', '>More on talent pools</a>')

# 06 org chart — scene
r('<p class="fx-tabs"><span class="is-on">按部门</span><span>按汇报线</span><span>按项目</span></p>', '<p class="fx-tabs"><span class="is-on">By department</span><span>By reporting line</span><span>By project</span></p>')
r('<div class="fx-node fx-top"><b>创始人</b></div>', '<div class="fx-node fx-top"><b>Founder</b></div>')
r('<b>技术负责人</b><span>韩征 · 2019 年加入</span>', '<b>Head of Technology</b><span>Zheng Han · joined 2019</span>')
r('<b>视觉团队</b>', '<b>Vision</b>')
r('<b>控制团队</b>', '<b>Controls</b>')
r('<b>产品交付</b><em>负责人待补</em>', '<b>Delivery</b><em>Lead to fill</em>')
r('<p class="fx-src">来源 · 官网 · 新闻 · 公开演讲</p>', '<p class="fx-src">Sources · Website · News · Public talks</p>')
# 06 text
r('做 Mapping 要对着官网和新闻一点点拼，画完的图还存着好几个版本。', 'Mapping a company means piecing it together from its website and the news, and once it’s drawn you’re left keeping several versions of the chart.')
r('<h3 id="n-step-mapping">组织架构梳理，轻松做 Mapping</h3>', '<h3 id="n-step-mapping">Org charts and talent mapping, made easy</h3>')
r('自动汇总人员、部门、岗位和汇报关系，一键生成架构图，省去反复核对、画图、维护多个版本的麻烦。搭配多维度视图，团队脉络一目了然，人才盘点和招聘 Mapping 都更轻松。',
  'It gathers people, departments, roles and reporting lines automatically and builds the org chart in one click, sparing you the repeated checking, drawing and juggling of versions. With views along several dimensions, each team’s shape is clear at a glance, and both talent reviews and recruitment mapping get easier.')
r('>了解组织架构图</a>', '>More on org charts</a>')

# ---------- what we believe ----------
r('<p class="n-kicker">02 · 产品边界</p>', '<p class="n-kicker">02 · Boundaries</p>')
r('猎头的价值，<br />无法被算法替代。', 'What a headhunter brings,<br />no algorithm can replace.')
r('<p>信息可以自动抓取，但一个人的期待、顾虑和抱负，没有办法被提取。</p>', '<p>Information can be gathered automatically. A person’s hopes, doubts and ambitions cannot be extracted.</p>')
r('<p>客户的隐性诉求、人选没说出口的选择偏好，只能靠面对面的沟通去感知。</p>', '<p>A client’s unspoken needs and a candidate’s unvoiced preferences can only be sensed face to face.</p>')
r('alt="一位猎头和一位人选面对面交谈"', 'alt="A headhunter and a candidate talking face to face"')
r('<h3>所以，HunterBuddy 有自己的边界</h3>', '<h3>So HunterBuddy keeps to its own limits</h3>')
r('<li><i>01</i>所有信息都标注来源，拿不准的地方，不会包装成确定的结论。</li>', '<li><i>01</i>Every piece of information is sourced. Nothing uncertain is dressed up as a firm conclusion.</li>')
r('<li><i>02</i>它只做信息的整理者，不做人才的评判者。</li>', '<li><i>02</i>It organizes information. It does not judge people.</li>')
r('<li><i>03</i>它不替你做任何商务决定。</li>', '<li><i>03</i>It makes no business decisions for you.</li>')
r('安静站在你的身后，陪你赶路，<br />而不是站在你和人选、客户中间。', 'It stands quietly behind you and keeps you company on the road,<br />never between you and your candidates or clients.')

# ---------- sectors ----------
r('<p class="n-kicker">03 · 行业赛道</p>', '<p class="n-kicker">03 · Sectors</p>')
r('<h2 class="n-h2" id="n-industries-title">深耕各行赛道</h2>', '<h2 class="n-h2" id="n-industries-title">Deep in every sector</h2>')
r('<p class="n-sub">与你并肩，奔赴每一场人才相逢。</p>', '<p class="n-sub">Side by side with you, on the road to every great hire.</p>')
r('<li>互联网</li><li>人工智能</li><li>具身智能</li><li>云计算</li><li>医药</li><li>核聚变</li><li>半导体</li><li>能源与稀有资源</li><li>新型储能</li>',
  '<li>Internet</li><li>AI</li><li>Embodied AI</li><li>Cloud</li><li>Pharma</li><li>Nuclear fusion</li><li>Semiconductors</li><li>Energy &amp; rare resources</li><li>Energy storage</li>')

# ---------- FAQ (the live English site's approved answers, terms aligned with the glossary) ----------
r('<p class="n-kicker">04 · 常见问题</p>', '<p class="n-kicker">04 · FAQ</p>')
r('试用之前，<br />大家常问这些。', 'What people ask<br />before they try it.')
r('还有别的想问，写信到 <a href="mailto:hello@boseekai.com">hello@boseekai.com</a>。', 'Anything else? Write to <a href="mailto:hello@boseekai.com">hello@boseekai.com</a>.')
FAQ = [
 ("HunterBuddy 适合谁使用？", "Who is HunterBuddy for?",
  "独立猎头和资深顾问，尤其是同时在做客户开发和交付、手上有几个难做的职位、库里攒了不少候选人的人。线索散在融资新闻、招聘页、简历库、论文和开源社区里，一个人很难天天盯着、一一读完。做过的功课会存下来，下一件事接着用。",
  "Independent headhunters and senior search consultants, especially those who handle both business development and delivery, with a few hard-to-fill roles on their desk and a candidate database built up over the years. Leads are scattered across funding news, careers pages, CV databases, papers and open-source communities, too many for one person to watch every day and read in full. The research you’ve done is kept, ready for the next search."),
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
r('<p>HunterBuddy，猎头的 AI 工作伙伴。</p>', '<p>HunterBuddy, the AI partner for headhunters.</p>')
r('<p>铂寻为独立猎头和资深顾问打造。</p>', '<p>Built by Boseek for independent headhunters and senior search consultants.</p>')
r('<p class="n-footer-mail">联系我们：<a href="mailto:hello@boseekai.com">hello@boseekai.com</a></p>', '<p class="n-footer-mail">Contact: <a href="mailto:hello@boseekai.com">hello@boseekai.com</a></p>')
r('<h2>产品</h2>', '<h2>Product</h2>')  # its links are the header's, already replaced above
r('<h2>使用场景</h2>', '<h2>Use cases</h2>')
r('>客户开发</a></li>', '>Business development</a></li>')
r('>组织架构图</a></li>', '>Org charts</a></li>')
r('>猎头怎么找人</a></li>', '>Finding candidates</a></li>')
r('>人岗匹配</a></li>', '>Job matching</a></li>')
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
allowed = ("中文", "京ICP备")
bad = [h for h in han if not any(a in h for a in allowed)]
if bad:
    sys.exit("Chinese left:\n  " + "\n  ".join(bad))
if "；" in s:
    sys.exit("Chinese semicolon left")
s = SEO.sub(lambda m: seo_block(s, "en"), s)
OUT.write_text(s)
print("wrote", OUT.relative_to(ROOT), f"({len(R)} replacements)")
