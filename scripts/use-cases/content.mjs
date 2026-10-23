// 使用场景页的文案。改完运行 node scripts/build-use-cases.mjs 重新生成页面。
// 规矩：不用中文分号“；”。例子沿用首页和短片里的星川机器人，只是讲清用法的场景，不写成客户案例。
// 中文标题（h1、h2、深色卡片标题、常见问题的问题）用的是思源宋体子集，加了新字要重新生成子集。

export const COMMON = {
  zh: {
    homeName: "铂寻 Boseek",
    homeLabel: "铂寻 Boseek 首页",
    homeShort: "首页",
    casesShort: "能做什么",
    crumbsLabel: "当前位置",
    skip: "跳到正文",
    navLabel: "主导航",
    nav: [
      ["产品短片", "film"],
      ["能做什么", "work"],
      ["工作方式", "research"],
      ["人和关系", "assets"],
      ["常见问题", "faq"],
      ["关于铂寻", "about"],
    ],
    switchTitle: "Switch to English",
    switchLabel: "EN",
    apply: "申请试用",
    menuOpen: "打开导航",
    menuClose: "关闭导航",
    seeHow: "看看怎么做",
    example: "星川机器人",
    faqKicker: "常见问题",
    fourKicker: "四件事",
    fourTitle: ["以星川机器人为例，", "把四件事走一遍。"],
    here: "你在这里",
    nextUp: "下一步",
    trialTitle: "申请 HunterBuddy 试用",
    trialBody: "目前采用邀请制试用。留下你的信息，我们会逐一审核，并在开通时与你联系。",
    footerNotes: ["HunterBuddy，猎头的 AI 工作伙伴。", "铂寻为独立猎头和资深顾问打造。"],
    footerProduct: "产品",
    footerCases: "使用场景",
    footerLegal: "法律",
    legal: ["隐私政策", "服务条款", "数据处理协议"],
    metaLabel: "版权、网站主体与备案信息",
    meta: [
      '&copy; <span data-footer-year>2026</span> 铂寻 Boseek',
      "网站域名：www.boseekai.com",
      "网站主体：北京铂寻智能科技有限公司",
    ],
  },
  en: {
    homeName: "Boseek",
    homeLabel: "Boseek home",
    homeShort: "Home",
    casesShort: "Use cases",
    crumbsLabel: "Breadcrumb",
    skip: "Skip to content",
    navLabel: "Main navigation",
    nav: [
      ["Product video", "film"],
      ["Use cases", "work"],
      ["How it works", "research"],
      ["Knowledge network", "assets"],
      ["FAQ", "faq"],
      ["About Boseek", "about"],
    ],
    switchTitle: "切换到中文",
    switchLabel: "中文",
    apply: "Request a trial",
    menuOpen: "Open navigation",
    menuClose: "Close navigation",
    seeHow: "See how it works",
    example: "Xingchuan Robotics",
    faqKicker: "FAQ",
    fourKicker: "Four use cases",
    fourTitle: ["One company,", "four use cases."],
    here: "You are here",
    nextUp: "Next",
    trialTitle: "Request a HunterBuddy trial",
    trialBody:
      "Trial access is by invitation. Leave your details and we will review each application, then contact you when your access is ready.",
    footerNotes: [
      "HunterBuddy. Your AI partner in recruitment.",
      "For independent recruiters and senior search consultants.",
    ],
    footerProduct: "Product",
    footerCases: "Use cases",
    footerLegal: "Legal",
    legal: ["Privacy policy", "Terms of service", "Data processing agreement"],
    metaLabel: "Copyright, operator &amp; registration",
    meta: [
      '&copy; <span data-footer-year>2026</span> Boseek',
      "www.boseekai.com",
      "Operated by Beijing Boseek Intelligent Technology Co., Ltd.",
    ],
  },
};

export const PAGES = [
  {
    slug: "business-development",
    zh: {
      name: "客户开发",
      teaser: "从一条融资新闻，找到新职位和用人经理。",
      title: "猎头客户开发：从一条融资新闻找到新职位和用人经理｜HunterBuddy",
      ogTitle: "猎头客户开发 · HunterBuddy",
      description:
        "猎头怎么找客户？HunterBuddy 帮你盯着关注的赛道，从融资新闻和招聘页里发现正在扩张的公司，找到新职位、用人经理和引荐路线，每条线索都写明来源。联系谁、怎么开口，由你决定。",
      kicker: "使用场景 · 猎头客户开发",
      h1: ["一条融资新闻，", "可能就是下一个职位委托。"],
      lead:
        "客户开发常常从一条不起眼的消息开始。HunterBuddy 帮你盯着关注的赛道，从融资新闻和招聘页里找到新职位、用人经理和引荐路线，每条线索都写明来源。联系谁、怎么开口，由你决定。",
      method: {
        label: "一般怎么做",
        h2: "猎头客户开发，一般怎么做",
        intro:
          "独立猎头和资深顾问的新客户，很少来自陌生电话。更多时候，是一直留意几个熟悉的赛道，看到哪家公司在扩张，再顺着人脉找到能拍板的人。大致分五步：",
        steps: [
          ["盯住信号", "融资新闻、官网招聘页上的新职位、高管变动、新业务和新工厂，都可能说明一家公司要招人了。"],
          ["判断是不是真的要招", "招聘页上的职位不等于委托。这个职位还在不在招、HC 批没批、为什么现在招，都要先弄清楚。"],
          ["找到用人经理", "谁负责这个团队、谁说了算，HR 在流程里管哪一段。"],
          ["找到引荐路线", "直接联系，还是请人引荐。你的老客户、投资人、前同事里，谁和他说得上话。"],
          ["带着功课去聊", "先了解这家公司在做什么、团队缺什么人，再开口。比群发一份简历更容易被认真对待。"],
        ],
      },
      hard: {
        label: "难在哪里",
        h2: "难的不是打电话，是知道该打给谁",
        items: [
          ["信号太散", "融资新闻在媒体上，职位在招聘页，人事变动在领英和脉脉上，一个人很难每天都看一遍。"],
          ["消息对不上", "同一家公司在不同地方叫法不一样，同一个人在不同平台上的头衔也不一样，核对很花时间。"],
          ["时机容易错过", "等你注意到一家公司在招人，别的顾问可能已经聊上了。"],
          ["功课留不下来", "上次查过的公司和人散在笔记和表格里，下次又要从头找。"],
        ],
      },
      how: {
        label: "怎么帮你",
        h2: "HunterBuddy 怎么帮你做客户开发",
        intro: "还是用首页里星川机器人的例子，一步步看。",
        steps: [
          [
            "每周替你看一遍赛道",
            "告诉它你关注哪些赛道和公司，让它定期帮你看，比如每周一早上 9 点。有公司拿到融资、招聘页上了新职位、负责人有变动，它会提醒你。重复的会合并，没有新消息就不打扰你。",
            "这周一，它提醒你：星川机器人刚拿到 B 轮融资。",
          ],
          [
            "把消息对上",
            "它把融资新闻和公司官网的招聘页放在一起看，确认说的是同一家公司、同一件事。每条结论都写着出处，你可以点回去看原文。",
            "星川官网招聘页新增了视觉算法负责人，招聘页和融资新闻两处来源都能对上。",
          ],
          [
            "找到用人经理",
            "它从公开资料里找出负责这个团队的人。没有可靠来源的信息会标为“待确认”，不会把猜测当成事实。",
            "用人经理是技术负责人许晴，负责视觉团队，直接联系方式还待确认。",
          ],
          [
            "从你的人脉里找引荐",
            "它会对照你手上的客户和人脉，看谁和对方说得上话，把这条路线和理由一起列出来。",
            "张远是你的老客户，也是星川的投资人，可以请他引荐。",
          ],
        ],
        card: {
          context: "每周一 09:00 · 帮你盯着的赛道",
          title: "星川机器人 · 可能有新职位",
          caption: "这是 HunterBuddy 交给你的结果。每一条都写着来源，拿不准的单独标出来。",
          items: [
            ["找到职位 · 两处来源", "官网招聘页新增视觉算法负责人", "招聘页和融资新闻都能对上。"],
            ["用人经理", "许晴 · 技术负责人", "负责视觉团队，直接联系方式待确认。"],
            ["备用 · 引荐路线", "张远 → 许晴", "你的老客户，也是星川的投资人。"],
          ],
        },
      },
      result: {
        label: "你会拿到什么",
        h2: "你会拿到什么，哪些要你确认",
        paras: [
          "一个确认过的职位、一位用人经理，加一条备用的引荐路线。直接联系还是请人引荐、怎么开口，你说了算。拿到 JD、谈妥委托，它才是你手上的正式职位。",
          "这次查过的公司、职位和人都会存下来。接下来做人才地图、找候选人，可以接着用。",
        ],
        confirmTitle: "还要你确认",
        confirm: ["这个职位真的在招吗？HC 批下来了吗？", "直接联系许晴，还是请张远引荐？", "做不做独家、服务费怎么谈？"],
        note: "HunterBuddy 不会替你联系任何人，也不会替你做承诺。",
      },
      faq: {
        h2: ["关于客户开发，", "大家常问这些。"],
        items: [
          [
            "猎头做客户开发，可以从哪里找线索？",
            "融资新闻、公司官网和招聘页、高管和团队变动、新业务和新工厂的消息，还有你自己的老客户和人脉。HunterBuddy 会把这些放在一起看，每条线索都记着来自哪里。",
          ],
          [
            "招聘页上有职位，就可以去谈委托了吗？",
            "不一定。招聘页上的职位只是线索。这个职位是不是真的在招、HC 有没有批下来、谁是决策人，都要先确认。HunterBuddy 会把这些待确认的事列出来，确认要靠你去聊。",
          ],
          [
            "它会替我联系客户吗？",
            "不会。它帮你找到线索、用人经理和引荐路线，给出理由和来源。联系谁、什么时候开口、怎么谈，由你决定。",
          ],
          [
            "它多久帮我看一次赛道？",
            "由你来定，比如每周一次。只有值得你看的变化才会提醒你，重复的会合并，没有新消息就不打扰你。",
          ],
        ],
      },
    },
    en: {
      name: "Business development",
      teaser: "From a funding round to a new role and the hiring manager.",
    },
  },
  {
    slug: "talent-mapping",
    zh: { name: "人才地图", teaser: "把目标团队按组织架构排好，和你的候选人对上号。" },
    en: { name: "Talent mapping", teaser: "Map target teams by org structure and match them to your candidates." },
  },
  {
    slug: "sourcing",
    zh: { name: "职位寻访", teaser: "JD 到手，先看你手上已经有谁，再去补齐。" },
    en: { name: "Sourcing", teaser: "When the JD lands, start with the people you already know." },
  },
  {
    slug: "candidate-nurturing",
    zh: { name: "人选维护", teaser: "重点人选有了变化，对照你的在手职位。" },
    en: { name: "Candidate nurturing", teaser: "When a priority candidate’s situation changes, check your live searches." },
  },
];
