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
        app="先人一步，锁定研发人才。TalentBuddy 是面向猎头顾问、企业 HR 与招聘负责人、CTO 与技术负责人的研发人才招聘 AI，交回人选名单、匹配结论、身份核实结论、BD 客户研判、人才库变动提示和组织架构图，每条都有出处。联系谁、推不推荐，由你决定。目前邀请制试用。",
        app_sub="研发人才招聘 AI", audience="招聘研发与技术人才的猎头顾问、企业 HR 与招聘负责人、CTO 与技术负责人",
        # the share card (1200×630, the film's last scene): what Feishu, LinkedIn and the like show when the link is pasted
        share="assets/share-card.jpg",
        film=("TalentBuddy 产品短片", "从人海里的一个职位出发，跟着 TalentBuddy 走完六件事：BD 客户研判、组织架构梳理、寻访、人岗匹配、身份核实、人才库更新。", "assets/film-poster.jpg", "assets/talentbuddy-film.mp4"),
    ),
    "en": dict(
        home=f"{SITE}en/", lang="en", og="en_US", og_alt="zh_CN", site_name="Boseek", title_cut=" | Boseek", baidu=False,
        app="Be first to the right R&D talent. TalentBuddy is AI for hiring R&D talent, built for search consultants, HR and talent leads, and CTOs and engineering leaders. It hands back candidate lists, match findings, identity checks, BD client research, talent pool change alerts and org charts, each traceable to its source. Who to contact and whom to put forward is always your call. Invitation-only trial.",
        app_sub="AI for hiring R&D talent", audience="Search consultants, HR and talent leads, and CTOs and engineering leaders hiring R&D talent",
        share="assets/share-card-en.jpg",
        film=("TalentBuddy product video", "From one role in a sea of people, follow TalentBuddy through six capabilities: BD client research, org charts, sourcing, job matching, identity checks and talent pool updates.", "assets/film-poster-en.jpg", "assets/talentbuddy-film-en.mp4"),
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
        {"@type": "WebSite", "@id": f"{SITE}#website", "url": SITE, "name": "铂寻 Boseek", "alternateName": ["TalentBuddy", "HunterBuddy"], "inLanguage": "zh-CN", "publisher": {"@id": f"{SITE}#organization"}},
        {"@type": "WebPage", "@id": f"{home}#webpage", "url": home, "name": unesc(title), "description": unesc(desc), "inLanguage": L["lang"],
         "isPartOf": {"@id": f"{SITE}#website"}, "about": {"@id": f"{SITE}#talentbuddy"}, "publisher": {"@id": f"{SITE}#organization"}, "video": {"@id": f"{home}#film"}},
        {"@type": "SoftwareApplication", "@id": f"{SITE}#talentbuddy", "name": "TalentBuddy", "alternateName": "HunterBuddy", "description": L["app"], "applicationCategory": "BusinessApplication",
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
r('<title>TalentBuddy · 研发人才招聘 AI：人选寻访、人岗匹配、组织架构｜铂寻 Boseek</title>',
  '<title>TalentBuddy · AI for hiring R&amp;D talent: sourcing, job matching, org charts | Boseek</title>')
r('content="TalentBuddy 是铂寻 Boseek 推出的研发人才招聘 AI，面向猎头顾问、企业 HR 与招聘负责人、CTO 与技术负责人。给它一个岗位、一家目标公司或一个名字，交回排好序的人选名单、身份核实结论和组织架构图，每条都有出处。覆盖互联网与 AI、智能汽车、工业制造、半导体、医药医疗等行业的研发岗位。目前邀请制试用。"',
  'content="TalentBuddy by Boseek is AI for hiring R&amp;D talent, built for search consultants, HR and talent leads, and CTOs and engineering leaders. Give it a role, a target company or a name, and get back a ranked candidate list, identity checks and an org chart, every item traceable to its source. It covers R&amp;D roles in the internet and AI, smart vehicles, industrial manufacturing, semiconductors, and pharma and medical devices. Invitation-only trial."')
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
r('<a href="#industries">研发领域</a>', '<a href="#industries">R&amp;D fields</a>')
r('<a href="#faq">常见问题</a>', '<a href="#faq">FAQ</a>')
r('<a class="n-lang" href="en/" hreflang="en" lang="en" title="Switch to English" aria-label="Switch to English">EN</a>',
  '<a class="n-lang" href="../" hreflang="zh-CN" lang="zh-CN" title="切换到中文" aria-label="切换到中文">中文</a>')
r('>申请试用</a>', '>Request a trial</a>')
r('aria-label="打开导航"', 'aria-label="Open navigation"')

# ---------- hero ----------
r('<span aria-hidden="true"></span>正在开发中，邀请制试用申请已开放', '<span aria-hidden="true"></span>In development. Applications for the invitation-only trial are open.')
r('<p class="n-role">先人一步，锁定研发人才</p>', '<p class="n-role">Be first to the right R&amp;D talent</p>')
r('<span>论文、专利、代码与简历库，一并检索，</span>', '<span>Papers, patents, code and CV databases, searched together,</span>')
r('<span>交回排好序、条条有出处的人选名单。</span>', '<span>handed back as a ranked shortlist with a source for every name.</span>')
r('>查看交付示例</a>', '>See sample results</a>')

# ---------- intro + film ----------
r('<p class="n-kicker">产品短片 · 2 分 32 秒</p>', '<p class="n-kicker">Product video · 2:32</p>')
r('<span>检索与核对，交给 TalentBuddy。</span>', '<span>Searching and checking go to TalentBuddy.</span>')
r('<span>判断与沟通，留给你。</span>', '<span>Judgment and conversations stay with you.</span>')
r('从客户研判、组织架构、寻访、匹配，到身份核实和人才库更新，每一步都交回有出处的结果。',
  'From BD client research, org charts, sourcing and matching to identity checks and talent pool updates, every step hands back a sourced result.')
r('poster="../assets/film-poster.jpg?v=11"', 'poster="../assets/film-poster-en.jpg?v=8"')
r('src="../assets/talentbuddy-film.mp4?v=11"', 'src="../assets/talentbuddy-film-en.mp4?v=8"')
r('aria-label="TalentBuddy 产品短片"', 'aria-label="TalentBuddy product video"')

# ---------- six capabilities: heading ----------
r('<p class="n-kicker">01 · 核心能力</p>', '<p class="n-kicker">01 · Capabilities</p>')
r('<h2 class="n-h2" id="n-caps-title">六个环节，环环交付</h2>', '<h2 class="n-h2" id="n-caps-title">Six stages, six deliverables</h2>')
r('匹配名单、寻访名单、核实结论、客户研判、变动提示、组织架构图，每条都有出处。联系谁、怎么谈，由你决定。',
  'Matched shortlists, sourced candidate lists, identity checks, BD client research, change alerts and org charts, each with its source. Who to contact, and how to approach them, is your call.')
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
r('JD 只写了技术方向和年限，库里却有几千份简历，逐份对比要花大半天。', 'The JD names a technical field and years of experience, your database holds thousands of CVs, and comparing them one by one takes most of a day.')
r('<h3 id="n-step-match">人岗匹配：千份简历，挑出最匹配的人</h3>', '<h3 id="n-step-match">Job matching: from thousands of CVs to a shortlist</h3>')
r('把 JD 拆成核心技能、行业背景和硬性门槛，在简历全文和结构化信息中一并检索，交回按匹配分排序的推荐名单。每位人选附亮点、风险和推荐理由，一点即可查看原文出处。也可以反过来，为一份简历匹配在手岗位。',
  'It breaks the JD into core skills, industry background and must-haves, then searches the full text of your CVs and their structured fields together. You get back a shortlist ranked by match score, with each candidate’s strengths, risks and why we recommend them, and one click takes you to the original source. It works the other way too: give it a CV and it finds the live searches that fit.')
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
r('研发人才的能力写在论文、专利和代码里，只在招聘平台上搜，很多人找不到。', 'The clearest evidence of R&amp;D talent is in papers, patents and code. Search only on recruiting platforms, and many people never turn up.')
r('<h3 id="n-step-sourcing">寻访：平台之外，也能找到</h3>', '<h3 id="n-step-sourcing">Sourcing: beyond the platforms</h3>')
r('按岗位要求，同时检索公开信息、论文、专利、开源代码和你的简历库，同一个人的多处资料先核对再合并。交回排好序的人选名单，并标明哪些渠道已经找过、哪些尚未覆盖。',
  'Working from the role’s requirements, it searches public information, papers, patents, open-source code and your CV database together, and checks the same person’s records from different places before merging them. You get back a ranked candidate list, with a note of which sources have been searched and which are not yet covered.')
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
r('论文署名是缩写，社区里是花名，代码仓库只有 ID，人到底是谁，往往要来回比对。', 'On papers it’s initials, in forums it’s an alias, and in a code repository it’s only a user ID. Working out who someone really is means comparing back and forth.')
r('<h3 id="n-step-identity">身份核实：花名缩写，查清是谁</h3>', '<h3 id="n-step-identity">Identity checks: who’s behind the alias</h3>')
r('用任职经历、时间线、研究方向和公开作品交叉比对，排除同名。交回核实结论：是谁、依据是什么、排除了哪些同名、把握有多大，以及可行的联系途径。只用公开的职业信息和你提供的资料，拿不准的标为待确认。',
  'It cross-checks career history, timelines, research areas and public work, and rules out namesakes. You get back a written finding: who the person is, what that rests on, which namesakes were ruled out, how sure it is, and how you might reach them. It uses only public professional information and the material you provide, and anything uncertain is marked “To confirm”.')
r('>了解身份核实</a>', '>More on identity checks</a>')

# 04 client research — scene
r('<li>行业前景</li><li>融资动态</li><li>创始人背景</li><li>岗位信号</li><li>业务信号</li>', '<li>Industry outlook</li><li>Funding news</li><li>Founders</li><li>Hiring signals</li><li>Business signals</li>')
r('<span class="fx-cap">客户研判</span><em class="fx-ok">优先级 · 高</em>', '<span class="fx-cap">BD client research</span><em class="fx-ok">Priority · High</em>')
r('<li><span>真实需求</span><i style="--n: 4"></i><b>有依据</b></li>', '<li><span>Real need</span><i style="--n: 4"></i><b>Sourced</b></li>')
r('<li><span>付费潜力</span><i style="--n: 3"></i><b>有依据</b></li>', '<li><span>Ability to pay</span><i style="--n: 3"></i><b>Sourced</b></li>')
r('<li class="is-wait"><span>合作风险</span><i style="--n: 2"></i><b>待确认</b></li>', '<li class="is-wait"><span>Risk</span><i style="--n: 2"></i><b>To confirm</b></li>')
r('<span class="fx-cap">决策链</span><ol><li>创始人</li><li>技术 VP</li><li class="is-wait">用人经理</li></ol>', '<span class="fx-cap">Decision chain</span><ol><li>Founder</li><li>Tech VP</li><li class="is-wait">Hiring manager</li></ol>')
# 04 text
r('融资、新设研发部门、挂出新职位，信号很多，但不是每一条都能变成委托。', 'A funding round, a new R&amp;D department, fresh openings: there are plenty of signals, but not every one turns into a mandate.')
r('<h3 id="n-step-bd">BD 客户研判（猎头适用）：哪家值得跟，心中有数</h3>', '<h3 id="n-step-bd">BD client research (for headhunters): know who’s worth pursuing</h3>')
r('综合行业前景、融资动态、创始人背景、岗位与业务信号，交回客户研判：真实需求、付费潜力、合作风险分别给出“有依据 / 待确认 / 有风险”的结论和理由，附决策链和跟进优先级。跟不跟，由你决定。',
  'It looks at the industry outlook, funding news, the founders’ backgrounds, and hiring and business signals together. You get back BD client research that rates the real need, the ability to pay and the risk in working with them as “Sourced”, “To confirm” or “At risk”, with the reasons, plus the decision chain and a follow-up priority. Whether to pursue it is your call.')
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
r('研发人才换岗、转方向、发新成果都很快，简历库的信息一两年就过时。', 'R&amp;D people change roles, switch fields and publish new work quickly, and what your CV database says goes stale in a year or two.')
r('<h3 id="n-step-network">人才库更新：人选有变，及时提醒</h3>', '<h3 id="n-step-network">Talent pool updates: alerts when candidates move</h3>')
r('定期核对你指定人选的公开履历、论文和专利，任职、方向或职责一有变化，就交回附出处的变动提示。经你确认才写入人才库，不会擅自改动你的资料。',
  'For the candidates you choose, it regularly checks public profiles, papers and patents. When a role, field or responsibility changes, you get a change alert with its source. Nothing goes into your talent pool until you confirm it, and it never edits your records on its own.')
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
r('目标公司的研发部门怎么分、谁负责什么，要从官网、新闻、论文和专利里一点点拼。人一变动，又得重画。', 'How a target company’s R&amp;D is organized, and who is responsible for what, has to be pieced together from its website, the news, papers and patents. When people move, the chart has to be redrawn.')
r('<h3 id="n-step-mapping">组织架构梳理（Mapping）：研发组织，一图看清</h3>', '<h3 id="n-step-mapping">Org charts (mapping): an R&amp;D organization at a glance</h3>')
r('汇总部门、关键岗位、任职人和汇报关系，交回一张组织架构图，可按部门、汇报线、项目切换查看，历史版本全部保留。每个节点附出处，未证实的汇报关系标为待确认。已有的 Excel 架构图可以导入后继续补充。',
  'It gathers departments, key roles, the people in them and reporting lines, and hands back an org chart you can view by department, reporting line or project, with every past version kept. Each node names its source, and any reporting line not yet confirmed is marked “To confirm”. Org charts you already have in Excel can be imported and built on.')
r('>了解组织架构图</a>', '>More on org charts</a>')

# ---------- what we believe ----------
r('<p class="n-kicker">02 · 产品边界</p>', '<p class="n-kicker">02 · Boundaries</p>')
r('它做什么，<br />不做什么。', 'What it does,<br />and what it doesn’t.')
r('<p>查资料、比对、整理，交给它。</p>', '<p>Research, cross-checking and organizing: leave those to it.</p>')
r('<p>人选的意愿和顾虑、用人方没说出口的需求，需要你当面了解。</p>', '<p>A candidate’s intentions and doubts, and what an employer hasn’t said out loud, you learn in person.</p>')
r('alt="一位招聘者和一位人选面对面交谈"', 'alt="A recruiter and a candidate talking face to face"')
r('<h3>TalentBuddy 的三条原则</h3>', '<h3>TalentBuddy’s three principles</h3>')
r('<li><i>01</i>每条结论都有出处，拿不准的标为待确认，不当成定论。</li>', '<li><i>01</i>Every conclusion names its source. Anything uncertain is marked “To confirm”, never presented as settled.</li>')
r('<li><i>02</i>给出有依据的匹配结论，但不替你评判人选。</li>', '<li><i>02</i>It gives sourced match findings, but it does not judge candidates for you.</li>')
r('<li><i>03</i>不替你做任何商务决定。</li>', '<li><i>03</i>It makes no business decisions for you.</li>')
r('和候选人、用人方的沟通，<br />始终由你主导。', 'Conversations with candidates and employers<br />are always yours to lead.')

# ---------- sectors ----------
r('<p class="n-kicker">03 · 研发领域</p>', '<p class="n-kicker">03 · R&amp;D fields</p>')
r('<h2 class="n-h2" id="n-industries-title">跨行研发，一并覆盖</h2>', '<h2 class="n-h2" id="n-industries-title">R&amp;D roles, across industries</h2>')
r('<p class="n-sub">也包括各行业新开设的 AI 与大模型岗位。</p>', '<p class="n-sub">Including the new AI and large-model roles opening in every industry.</p>')
r('<li>人工智能与大模型</li><li>互联网与云计算</li><li>具身智能与机器人</li><li>智能汽车</li><li>半导体与电子</li><li>医药与医疗器械</li><li>工业制造与装备</li><li>新能源与储能</li><li>核聚变</li>',
  '<li>AI &amp; large models</li><li>Internet &amp; cloud</li><li>Embodied AI &amp; robotics</li><li>Smart vehicles</li><li>Semiconductors &amp; electronics</li><li>Pharma &amp; medical devices</li><li>Industrial manufacturing &amp; equipment</li><li>New energy &amp; storage</li><li>Nuclear fusion</li>')

# ---------- FAQ (the live English site's approved answers, terms aligned with the glossary) ----------
r('<p class="n-kicker">04 · 常见问题</p>', '<p class="n-kicker">04 · FAQ</p>')
r('<h2 class="n-h2" id="n-faq-title">常见问题</h2>', '<h2 class="n-h2" id="n-faq-title">FAQ</h2>')
r('其他问题请发邮件至 <a href="mailto:hello@boseekai.com">hello@boseekai.com</a>。', 'Anything else? Email <a href="mailto:hello@boseekai.com">hello@boseekai.com</a>.')
FAQ = [
 ("TalentBuddy 适合谁使用？", "Who is TalentBuddy for?",
  "招聘研发与技术人才的个人用户。猎头顾问可以使用全部能力，包括 BD 客户研判。企业 HR 与招聘负责人常用寻访、人岗匹配和人才库更新。CTO 与技术负责人可以梳理同行的研发组织，按论文、专利、代码寻找领域专家，核实人选的技术履历。覆盖互联网与 AI、智能汽车与工业制造、半导体与电子、医药与医疗器械等行业的研发岗位，包括 AI 与大模型岗位。按个人账号使用。",
  "Individuals who hire R&amp;D and technical talent. Search consultants can use every capability, including BD client research. HR and talent leads mostly use sourcing, job matching and talent pool updates. CTOs and engineering leaders can map peer companies’ R&amp;D organizations, find domain experts through papers, patents and code, and check a candidate’s technical track record. It covers R&amp;D roles in the internet and AI, smart vehicles and industrial manufacturing, semiconductors and electronics, and pharma and medical devices, including AI and large-model roles. Each person uses their own account."),
 ("和直接用豆包、DeepSeek、ChatGPT 这类通用 AI，有什么不同？", "How is it different from just using a general-purpose AI like Doubao, DeepSeek or ChatGPT?",
  "通用 AI 回答一个问题，TalentBuddy 交回一份完整结果。它从你的候选人、熟悉的公司和已梳理的组织出发，完成检索、身份核实、去重和比对，交回有出处的人选名单、结论或架构图，并保存在你的账号里，下次接着用。",
  "A general-purpose AI answers a question. TalentBuddy hands back a complete result. It starts from your candidates, the companies you know and the org charts you’ve mapped, does the searching, identity checks, de-duplication and comparison, and hands back a sourced candidate list, finding or org chart. It’s all kept in your account, ready for next time."),
 ("它会替我盯着市场和候选人吗？", "Can it keep an eye on the market and my candidates for me?",
  "可以。设置周期任务即可，比如每周检查某个技术方向的融资动态、目标公司招聘页的变化，或指定人选的公开履历和新发表的成果。每一轮只交回有依据的变化，重复的会合并，没有变化就不提示。下一步做什么，由你决定。",
  "Yes. You can set up recurring tasks, such as checking funding news in a technical field each week, changes on a target company’s careers page, or the public profiles and new publications of the candidates you name. Each round hands back only changes it can source, merges duplicates and stays quiet when nothing has changed. What happens next is your call."),
 ("人选和线索从哪些渠道来？", "Where do candidates and leads come from?",
  "已有候选人、梳理过的组织架构、公开网络与招聘页、论文与专利、开源项目，以及你上传的简历和资料。每条线索都记着来自哪里。不同渠道里的同一个人，先核对再合并。哪些渠道找过了、哪些还是空白，也会标出来，方便你决定下一步去哪里补。",
  "From your existing candidates and org charts, the public web and careers pages, papers and patents, open-source projects, and the CVs and documents you upload. Every lead keeps a note of where it came from. When the same person turns up in different sources, the records are checked before they are merged. It also shows which sources have been searched and where the gaps are, so you can decide what to fill in next."),
 ("我手上的候选人库和组织架构图能带进来吗？", "Can I bring in my own candidate database and org charts?",
  "可以。简历支持单份或批量上传，Excel 等格式的组织架构图可以导入后继续补充。带进来的资料同样会核对身份、查重合并，也可以对你所有的在手职位做一次匹配。",
  "Yes. Upload CVs one at a time or in bulk, and import org charts from Excel or similar formats to keep building on them. Everything you bring in goes through the same identity checks and de-duplication, and can be matched against all your live searches in one go."),
 ("匹配结果可以直接相信吗？", "Can I take the match results at face value?",
  "匹配结果附依据和风险，每条理由都能点回去看原始资料。没有可靠来源的信息标为“待确认”，不会把猜测当成事实。实际管理多大范围、本人想不想动，这类只有聊了才知道的事，由你判断。",
  "Match results come with their reasons and risks, and every reason links back to the original material. Anything without a reliable source is marked “To confirm”, and guesses are never presented as facts. Things you only learn by talking to the person, such as how much they really manage or whether they’re open to a move, are yours to judge."),
 ("和猎聘、领英、脉脉这些招聘平台是什么关系？", "How does it fit with recruiting platforms like Liepin, LinkedIn and Maimai?",
  "招聘平台用来发布职位、搜索和联系候选人，TalentBuddy 不替代它们，它交回的是找人之前和找人过程中的结果：核实过的人选、关联关系和有出处的判断，帮你决定先找谁、怎么切入。从这些平台下载的简历，也可以上传进来一起核对。",
  "Recruiting platforms are where you post roles, search for candidates and contact them, and TalentBuddy doesn’t replace them. What it hands back are results from before and during a search: verified candidates, how people are connected, and sourced findings, to help you decide who to approach first and how. CVs downloaded from these platforms can be uploaded too and checked along with everything else."),
 ("和招聘管理系统（ATS）、猎头 CRM 有什么不同？", "How is it different from an ATS or a recruitment CRM?",
  "ATS 和猎头 CRM 记录职位、候选人和招聘进度（猎头 CRM 还记录客户），管的是已经在做的事。TalentBuddy 交回寻访和研判的结果：找到的人、核实过的身份、有出处的判断。两者可以配合着用。在 TalentBuddy 里确认过的人和关系，照样记进你的系统。",
  "An ATS or a recruitment CRM records roles, candidates and hiring progress (a headhunter’s CRM also records clients). It manages work already under way. TalentBuddy hands back the results of sourcing and research: the people found, verified identities and sourced findings. The two can be used together. People and relationships you confirm in TalentBuddy go into your system as usual."),
]
for qz, qe, az, ae in FAQ:
    r(f'<span>{qz}</span>', f'<span>{qe}</span>')
    r(f'<p>{az}</p>', f'<p>{ae}</p>')

# ---------- footer ----------
r('<img src="../../landing-origin/assets/boseek-b5.svg" alt="Boseek 铂寻" width="150" height="54" loading="lazy" />',
  '<img src="../assets/boseek-b5-en-light.svg" alt="Boseek" width="150" height="46" loading="lazy" />')
r('<p>TalentBuddy：先人一步，锁定研发人才。</p>', '<p>TalentBuddy: be first to the right R&amp;D talent.</p>')
r('<p>铂寻为猎头顾问、企业 HR 与招聘负责人、CTO 与技术负责人打造。</p>', '<p>Built by Boseek for search consultants, HR and talent leads, and CTOs and engineering leaders.</p>')
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
allowed = ("中文", "京ICP备", "京公网安备11011302008508号")
bad = [h for h in han if not any(a in h for a in allowed)]
if bad:
    sys.exit("Chinese left:\n  " + "\n  ".join(bad))
if "；" in s:
    sys.exit("Chinese semicolon left")
s = SEO.sub(lambda m: seo_block(s, "en"), s)
OUT.write_text(s)
print("wrote", OUT.relative_to(ROOT), f"({len(R)} replacements)")
