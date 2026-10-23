// 四个使用场景页的正文（中英文一一对应）。顺序就是星川机器人故事的顺序：客户开发 → 人才地图 → 职位寻访 → 人选维护。
// 每页：title / description（搜索结果里显示）、h1 和 lead（首屏）、method（一般怎么做）、hard（难在哪里）、
// how（HunterBuddy 怎么帮你，每步一句例子，最后一张深色结果卡片）、result（你会拿到什么、还要你确认）、faq（本页常见问题）。
// 英文按“信达雅”译，用词和首页英文版一致（talent map、live searches、unconfirmed 等）。

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
        "客户开发常常从一条不起眼的消息开始。HunterBuddy 帮你盯着关注的赛道，从一条融资新闻出发，找到新职位、用人经理和引荐路线，每条线索都写明来源。联系谁、怎么开口，由你决定。",
      method: {
        label: "一般怎么做",
        h2: "猎头客户开发，一般怎么做",
        intro:
          "独立猎头和资深顾问的新客户，很少来自陌生电话。更多时候，靠的是一直留意几个熟悉的赛道，看到哪家公司在扩张，再顺着人脉找到能拍板的人。大致分五步：",
        steps: [
          ["盯住信号", "融资新闻、官网招聘页上的新职位、高管变动、新业务和新工厂，都可能说明一家公司要招人了。"],
          ["判断是不是真的要招", "招聘页上的职位不等于委托。这个职位还在不在招、HC 批没批、为什么现在招，都要先弄清楚。"],
          ["找到用人经理", "弄清谁负责这个团队、谁说了算，HR 在流程里管哪一段。"],
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
            "星川官网招聘页新增了视觉算法负责人一职，招聘页和融资新闻两处来源都能对上。",
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
      teaser: "Start from a funding round and find the new role and its hiring manager.",
      title: "Recruiter business development: from funding news to the hiring manager | HunterBuddy",
      ogTitle: "Business development for recruiters · HunterBuddy",
      description:
        "How do recruiters find new clients? HunterBuddy keeps watch on the sectors you follow, spots growing companies in funding news and on careers pages, and finds the new role, the hiring manager and a route to a warm introduction, with a source for every lead. Who to contact, and what to say, is up to you.",
      kicker: "Use case · Business development",
      h1: ["A funding round", "could be your next mandate."],
      lead:
        "New business often starts with a piece of news that’s easy to miss. HunterBuddy keeps watch on the sectors you follow. From a single funding announcement, it finds the new role, the hiring manager and a route to a warm introduction, with a source for every lead. Who to contact, and what to say, is up to you.",
      method: {
        label: "The usual approach",
        h2: "How business development usually works",
        intro:
          "Independent recruiters and senior search consultants rarely win new clients through cold calls. More often, they keep a close eye on a few familiar sectors, notice which companies are growing, and work their network to reach the decision-maker. Broadly, it comes down to five steps:",
        steps: [
          ["Watch for signals", "Funding news, new roles on a careers page, leadership changes, new business lines and new plants can all mean a company is about to hire."],
          ["Check the role is real", "A job posting is not a mandate. Find out whether the role is still open, whether the headcount is approved and why they are hiring now."],
          ["Find the hiring manager", "Work out who leads the team, who makes the decision, and which part of the process HR owns."],
          ["Find a way in", "Go direct, or ask for an introduction. Among your clients, the investors you know and your former colleagues, who knows the hiring manager well enough to put you in touch?"],
          ["Do your homework first", "Learn what the company does and who the team needs before you reach out. You’ll be taken more seriously than if you mass-mail CVs."],
        ],
      },
      hard: {
        label: "Where it gets hard",
        h2: "The hard part isn’t the call. It’s knowing who to call.",
        items: [
          ["Signals are scattered", "Funding news is in the media, roles are on careers pages, people moves are on LinkedIn and Maimai. It’s hard for one person to check them all every day."],
          ["Details don’t match", "The same company goes by different names in different places, and the same person has different titles on different platforms. Matching them up takes a lot of time."],
          ["The moment is easy to miss", "By the time you notice a company is hiring, another recruiter may already be talking to them."],
          ["Research gets lost", "The companies and people you looked into last time are scattered across notes and spreadsheets, so next time you start from scratch."],
        ],
      },
      how: {
        label: "How HunterBuddy helps",
        h2: "How HunterBuddy helps with business development",
        intro: "Here is the Xingchuan Robotics example from the homepage, step by step.",
        steps: [
          [
            "Checks your sectors every week",
            "Tell it which sectors and companies you follow, and have it check for you regularly, say every Monday at 9 a.m. When a company raises funding, posts a new role or has a change of leadership, it lets you know. Duplicates are merged, and it stays quiet when there’s nothing new.",
            "This Monday, it flags that Xingchuan Robotics has just raised a Series B.",
          ],
          [
            "Cross-checks the sources",
            "It reads the funding news alongside the company’s careers page to confirm they describe the same company and the same development. Every finding cites its source, so you can click through to the original.",
            "Xingchuan’s careers page has a new opening for Head of Computer Vision, and it matches the funding news.",
          ],
          [
            "Finds the hiring manager",
            "It uses public information to identify who leads the team. Anything without a reliable source is marked as unconfirmed, and guesses are never presented as facts.",
            "The hiring manager is Qing Xu, the Technical Lead in charge of the vision team. Her direct contact details are not yet confirmed.",
          ],
          [
            "Finds an introduction in your network",
            "It checks your clients and contacts for anyone who knows the hiring manager, and lists that route along with the reasons.",
            "Yuan Zhang is your client and a Xingchuan investor. You could ask him for an introduction.",
          ],
        ],
        card: {
          context: "Every Monday, 09:00 · Sectors you track",
          title: "Xingchuan Robotics · Likely hiring",
          caption: "This is what HunterBuddy hands you. Every line cites its source, and anything uncertain is flagged separately.",
          items: [
            ["Opening found · Two sources", "New on the careers page: Head of Computer Vision", "Careers page and funding news agree."],
            ["Hiring manager", "Qing Xu · Technical Lead", "Leads the vision team. Direct contact details not yet confirmed."],
            ["Backup route · Warm introduction", "Yuan Zhang → Qing Xu", "Your client, and a Xingchuan investor."],
          ],
        },
      },
      result: {
        label: "What you get",
        h2: "What you get, and what’s yours to confirm",
        paras: [
          "A confirmed opening, the hiring manager and a backup route in. Whether to go direct or through an introduction, and what to say, is your call. Only once you have the JD and an agreed mandate does it become a live search.",
          "Every company, role and person you looked into is saved, ready for the talent mapping and sourcing that come next.",
        ],
        confirmTitle: "For you to confirm",
        confirm: [
          "Is the role live, and is the headcount approved?",
          "Contact Qing Xu directly, or ask Yuan Zhang for an introduction?",
          "Will it be exclusive, and what is the fee?",
        ],
        note: "HunterBuddy never contacts anyone for you, and never makes promises on your behalf.",
      },
      faq: {
        h2: ["What people ask", "about business development."],
        items: [
          [
            "Where can recruiters find business development leads?",
            "Funding news, company websites and careers pages, leadership and team changes, news of new business lines and plants, and your own clients and network. HunterBuddy puts them side by side and notes where each lead came from.",
          ],
          [
            "If a role is on the careers page, can I pitch for the mandate?",
            "Not necessarily. A job posting is only a lead. First confirm whether the role is really open, whether the headcount is approved and who makes the decision. HunterBuddy lists what still needs confirming, and you confirm it by talking to people.",
          ],
          [
            "Will it contact clients for me?",
            "No. It finds the leads, the hiring manager and the route in, with reasons and sources. Who to contact, when to reach out and how to pitch are up to you.",
          ],
          [
            "How often does it check my sectors?",
            "You decide, for example once a week. It only alerts you to changes worth your time, merges duplicates and stays quiet when there’s nothing new.",
          ],
        ],
      },
    },
  },
  {
    slug: "talent-mapping",
    zh: {
      name: "人才地图",
      teaser: "把目标团队按组织架构排好，和你的候选人对上号。",
      title: "人才地图怎么做：把目标团队按组织架构排好｜HunterBuddy",
      ogTitle: "人才地图 · HunterBuddy",
      description:
        "人才地图怎么做？HunterBuddy 帮猎头把目标公司和对标公司按组织架构排好，标出谁在什么位置、消息从哪来、哪里还是空白，再和你库里的候选人对上号。Excel 人才地图也能导进来接着补。",
      kicker: "使用场景 · 人才地图",
      h1: ["想摸清一个团队，", "资料却东一块西一块。"],
      lead:
        "做人才地图，是把一家公司的团队按组织架构一层层排出来：谁在什么位置、向谁汇报、消息从哪来。HunterBuddy 帮你把散在各处的资料拼起来，和你库里的候选人对上号，空白的地方标得清清楚楚。",
      method: {
        label: "一般怎么做",
        h2: "人才地图怎么做",
        intro: "人才地图（Mapping）是猎头的基本功。接了委托要做，平时为了熟悉一个赛道也要做。通常是这样几步：",
        steps: [
          ["定范围", "先定下目标公司和对标公司，以及要看的部门和职级。范围定得太大，图永远画不完。"],
          ["搭架构", "从官网、团队页、新闻稿、招聘页里，拼出部门和汇报线。"],
          ["填名字", "每个位置上是谁、在这个岗位多久、之前在哪里。公开资料、论文作者、专利发明人都是线索。"],
          ["核对", "同一个人在不同地方的名字和头衔可能不一样，要确认是同一个人、现在还在职。"],
          ["标出空白", "知道有这个岗位、但不知道是谁的地方，单独标出来，下次去补。"],
        ],
      },
      hard: {
        label: "难在哪里",
        h2: "难的不是找资料，是把资料拼对",
        items: [
          ["资料东一块西一块", "团队页、新闻稿、论文、招聘页、社交平台，每处只有一小块。"],
          ["同名同姓、头衔不一", "重名的人容易被当成同一个，同一个人在不同地方的写法又不一样。合错了，整张图都会跟着错。"],
          ["过时得快", "部门调整、人员流动，半年前做的图可能已经不准了。"],
          ["和候选人库是两张皮", "图上的人是不是你库里的某位候选人，往往要一个个手动对。"],
        ],
      },
      how: {
        label: "怎么帮你",
        h2: "HunterBuddy 怎么帮你做人才地图",
        intro: "还是用星川机器人的例子：把星川和两家对标公司排出来。",
        steps: [
          [
            "按组织架构排好",
            "告诉它要看哪些公司和团队，它从公开资料里找出部门和汇报线，把人放到对应的位置上。",
            "星川机器人，以及拓界机器人、穹顶智能两家对标公司，按团队一层层排开。",
          ],
          [
            "每个位置都写明来源",
            "谁在什么位置、消息从哪来，都写在旁边。线索来自论文作者、专利发明人的，会标明身份还要核对。",
            "穹顶智能控制团队里的一位，线索来自论文作者，身份还要核对。",
          ],
          [
            "和你库里的候选人对上号",
            "它把图上的人和你的简历库对照，核对身份后再合并，不会因为名字一样就当成同一个人。",
            "拓界机器人视觉团队的负责人，官网和团队页都能对上，就是你库里的林越。",
          ],
          [
            "标出空白",
            "知道有这个岗位、还不知道是谁的地方，会单独标出来，方便你决定下一步去哪里补。",
            "星川机器人的产品交付团队，知道有这个岗位，还不知道是谁。",
          ],
        ],
        card: {
          context: "目标公司 · 人才地图",
          title: "星川和两家对标公司",
          caption: "这是 HunterBuddy 交给你的人才地图的一角。确认过的、待核实的、还是空白的，分开标出来。",
          items: [
            ["负责人已确认", "拓界机器人 · 视觉团队", "官网和团队页都能对上，就是你库里的林越。"],
            ["在职情况待核实", "穹顶智能 · 控制团队", "线索来自论文作者，身份还要核对。"],
            ["信息空白", "星川机器人 · 产品交付", "知道有这个岗位，还不知道是谁。"],
          ],
        },
      },
      result: {
        label: "你会拿到什么",
        h2: "你会拿到什么，哪些要你确认",
        paras: [
          "一张人才地图：组织架构和汇报线、谁在什么位置、消息从哪来、哪里还是空白。你手上的 Excel 人才地图也能导进来接着补。",
          "图上的人和你库里的候选人对上了号，接下来做职位寻访，可以直接从这张图出发。",
        ],
        confirmTitle: "还要你确认",
        confirm: ["部门名称和汇报线还对吗？", "这些名字和你库里的候选人是同一个人吗？", "哪些空白值得下次去补？"],
        note: "一起写过论文，不等于有汇报关系。HunterBuddy 会把推断和确认分开写，最后由你判断。",
      },
      faq: {
        h2: ["关于人才地图，", "大家常问这些。"],
        items: [
          [
            "人才地图一般包括哪些内容？",
            "目标公司和团队的组织架构、汇报线，每个位置上是谁、在这个岗位多久、之前在哪里，以及每条信息的来源和哪里还是空白。",
          ],
          [
            "已经有 Excel 做的人才地图，能接着用吗？",
            "可以。Excel 等格式的人才地图可以导入后接着补。带进来的资料同样会核对身份、查重合并。",
          ],
          [
            "人才地图多久要更新一次？",
            "没有固定的标准，部门调整和人员流动都会让图变旧。你可以让 HunterBuddy 定期帮你看，比如目标公司招聘页的变化、你关注的人公开履历的更新，有值得看的变化再提醒你。",
          ],
          [
            "论文和专利里的人，能直接放进人才地图吗？",
            "可以作为线索放进去，但要先核对身份。一起写过论文，不等于有汇报关系。HunterBuddy 会标出哪些还待核实。",
          ],
        ],
      },
    },
    en: {
      name: "Talent mapping",
      teaser: "Map target teams by org structure and match the people to your candidates.",
      title: "Talent mapping: how to map a team by org structure | HunterBuddy",
      ogTitle: "Talent mapping for recruiters · HunterBuddy",
      description:
        "How do you build a talent map? HunterBuddy lays out target and peer companies by org structure, shows who holds each role, where each detail comes from and what is still missing, and matches people to your candidate database. You can also import existing Excel talent maps and keep building on them.",
      kicker: "Use case · Talent mapping",
      h1: ["Mapping a team means", "piecing together scattered information."],
      lead:
        "A talent map lays out a company’s teams by org structure, level by level: who holds each role, who they report to and where each detail comes from. HunterBuddy pieces together information from scattered sources, matches people to your candidate database and clearly marks the gaps.",
      method: {
        label: "The usual approach",
        h2: "How to build a talent map",
        intro:
          "Talent mapping is a core recruiting skill. You do it when a mandate comes in, and between mandates you do it to get to know a sector. It usually goes like this:",
        steps: [
          ["Set the scope", "Choose the target and peer companies, and the functions and levels to cover. Make the scope too wide and the map will never be finished."],
          ["Build the structure", "Piece together teams and reporting lines from company websites, team pages, press releases and careers pages."],
          ["Fill in the names", "Work out who holds each role, how long they’ve been in it and where they were before. Public profiles, paper author lists and patent filings are all leads."],
          ["Verify", "The same person may appear under different names and titles in different places. Confirm the records really are one person, and that they still work there."],
          ["Mark the gaps", "Where you know a role exists but not who holds it, flag it separately so you can fill in the name later."],
        ],
      },
      hard: {
        label: "Where it gets hard",
        h2: "The hard part isn’t finding information. It’s getting the pieces to fit.",
        items: [
          ["Information is scattered", "Team pages, press releases, papers, careers pages and social platforms each hold only a small piece."],
          ["Same names, different titles", "People who share a name get mistaken for one person, and one person’s name and title appear differently in different places. Merge the wrong records and the whole map is thrown off."],
          ["Maps go stale", "Reorganizations and people moving on mean a map from six months ago may already be out of date."],
          ["Disconnected from your database", "You often have to check by hand, one by one, whether someone on the map is already in your database."],
        ],
      },
      how: {
        label: "How HunterBuddy helps",
        h2: "How HunterBuddy helps with talent mapping",
        intro: "Back to Xingchuan Robotics: mapping Xingchuan and two peer companies.",
        steps: [
          [
            "Lays out the org structure",
            "Tell it which companies and teams to cover. It finds teams and reporting lines in public information and puts each person in the right spot on the map.",
            "Xingchuan Robotics and two peers, Tuojie Robotics and Qiongding AI, are laid out team by team, level by level.",
          ],
          [
            "Cites a source for every role",
            "Each role shows who holds it and where that information comes from. Leads from paper author lists or patents are flagged as needing an identity check.",
            "One name on Qiongding AI’s controls team was found in a paper’s author list. Their identity still needs checking.",
          ],
          [
            "Matches people to your database",
            "It checks the people on the map against your CV database and merges records only after verifying identity, never just because the names match.",
            "The company site and team page both confirm that the head of Tuojie Robotics’ vision team is Yue Lin, who is already in your database.",
          ],
          [
            "Marks the gaps",
            "Where you know a role exists but not yet who holds it, it’s flagged separately, so you can decide where to look next.",
            "Xingchuan Robotics, product delivery: the role is known, but not who holds it.",
          ],
        ],
        card: {
          context: "Target companies · Talent map",
          title: "Xingchuan and two peer companies",
          caption: "This is a corner of the talent map HunterBuddy hands you. What’s confirmed, what’s unverified and what’s missing are marked separately.",
          items: [
            ["Team lead verified", "Tuojie Robotics · Vision team", "Company site and team page agree: Yue Lin, already in your database."],
            ["Current employment unverified", "Qiongding AI · Controls team", "A lead from a paper’s author list. Identity still to verify."],
            ["An information gap", "Xingchuan Robotics · Product delivery", "The role is known, but not who holds it."],
          ],
        },
      },
      result: {
        label: "What you get",
        h2: "What you get, and what’s yours to confirm",
        paras: [
          "A talent map showing the org structure and reporting lines, who holds each role, where each detail comes from and what is still missing. You can also import an existing Excel talent map and keep building on it.",
          "With the people on the map matched to your candidate database, your next search can start right from the map.",
        ],
        confirmTitle: "For you to confirm",
        confirm: [
          "Are the team names and reporting lines still accurate?",
          "Are these the same people as the candidates in your database?",
          "Which information gaps are worth filling next?",
        ],
        note: "Co-authoring a paper doesn’t mean one reports to the other. HunterBuddy keeps what it infers apart from what is confirmed, and leaves the final call to you.",
      },
      faq: {
        h2: ["What people ask", "about talent mapping."],
        items: [
          [
            "What goes into a talent map?",
            "The org structure and reporting lines of the target companies and teams, who holds each role, how long they have been in it and where they were before, plus the source of each detail and where the gaps are.",
          ],
          [
            "I already have talent maps in Excel. Can I keep using them?",
            "Yes. You can import talent maps in Excel and other formats and keep building on them. Imported records go through the same identity checks and de-duplication.",
          ],
          [
            "How often should a talent map be updated?",
            "There’s no fixed rule. Reorganizations and people moving on both make a map go stale. You can have HunterBuddy check regularly for things like changes to a target company’s careers page or updates to the public profiles of people you follow, and alert you when something is worth a look.",
          ],
          [
            "Can people found in papers and patents go straight onto the map?",
            "They can go on as leads, but their identity needs checking first. Co-authoring a paper doesn’t mean one reports to the other. HunterBuddy marks what is still unverified.",
          ],
        ],
      },
    },
  },
  {
    slug: "sourcing",
    zh: {
      name: "职位寻访",
      teaser: "JD 到手，先看你手上已经有谁，再去补齐。",
      title: "人才寻访：JD 到手，先从你已有的人里找｜HunterBuddy",
      ogTitle: "人才寻访 · HunterBuddy",
      description:
        "候选人寻访怎么做更快？HunterBuddy 先查你的人才地图和简历库，再去论文、专利和开源社区补齐，给出带匹配理由和来源的目标人选名单，哪里还不清楚也写在旁边。先联系谁，由你判断。",
      kicker: "使用场景 · 人才寻访",
      h1: ["JD 到手，", "先看你手上已经有谁。"],
      lead:
        "做人才寻访，合适的人很多时候早就在你手上，只是一时想不起来、搜不出来。HunterBuddy 先从你的人才地图和简历库里找，再去公开资料里补齐，每位人选的匹配理由和来源都写在旁边。",
      method: {
        label: "一般怎么做",
        h2: "人才寻访，一般怎么做",
        intro: "拿到一个新职位，有经验的顾问通常会这样推进：",
        steps: [
          ["读懂 JD", "和用人经理聊清楚，哪些是硬性要求（Must），哪些是加分项（Prefer），团队现在真正缺什么。"],
          ["定目标公司和团队", "合适的人最可能来自哪些公司、哪些团队，哪些公司不能碰（Off-limits）。"],
          ["先看手上已经有谁", "翻一遍人才地图和简历库，做过的功课先用上。"],
          ["再去外面找", "公开网络、招聘页、论文、专利、开源社区，补上库里没有的人。"],
          ["排出长名单", "按匹配程度排好，写下为什么合适、还有哪些要确认，再决定先联系谁。"],
        ],
      },
      hard: {
        label: "难在哪里",
        h2: "难的不是找人，是确认找对了人",
        items: [
          ["手上的资源用不起来", "简历库里明明有合适的人，但搜不出来，或者忘了他。"],
          ["简历和现状对不上", "两年前的简历，职位和项目可能早就变了。"],
          ["同一个人出现好几次", "简历库、招聘平台、论文里各有一份，合不起来就会重复联系。"],
          ["光看纸面判断不了", "论文写得好，不等于做过量产或带过团队。"],
        ],
      },
      how: {
        label: "怎么帮你",
        h2: "HunterBuddy 怎么帮你做人才寻访",
        intro: "接着星川机器人的例子：许晴发来了视觉算法负责人的 JD。",
        steps: [
          [
            "先查你已经有的",
            "它先查人才地图和你的简历库，做过的功课先用上，不从零开始。",
            "许晴发来 JD。HunterBuddy 先在之前做的人才地图里找到了林越。",
          ],
          [
            "再去公开资料里补齐",
            "库里不够，再去论文、专利和开源社区找，每条线索都记着来自哪里。",
            "从机器人感知方向的论文里，找到了周宁。",
          ],
          [
            "核对、合并同一个人",
            "散在不同渠道里的同一个人，先核对身份再合并，不会重复出现。",
            "林越在简历库、团队页和论文里各有一份资料，三处合并成一个人。",
          ],
          [
            "写清为什么合适、还要确认什么",
            "每位人选都附上匹配理由和来源，拿不准的单独列出来。",
            "陈思带过跨团队的项目，最近在做什么、想不想动，还要确认。",
          ],
        ],
        card: {
          context: "星川机器人 · 视觉算法负责人",
          title: "值得接触的目标人选",
          caption: "这是 HunterBuddy 交给你的名单。为什么合适、还要确认什么，都写在旁边。",
          items: [
            ["工业视觉 · 团队负责人", "林越", "带过产线视觉团队，三处资料已合并。待确认：团队规模和汇报线。"],
            ["机器人感知 · 技术骨干", "周宁", "有相关论文和项目经历。待确认：有没有做过量产。"],
            ["视觉算法 · 项目负责人", "陈思", "带过跨团队的项目。待确认：最近在做什么、想不想动。"],
          ],
        },
      },
      result: {
        label: "你会拿到什么",
        h2: "你会拿到什么，哪些要你确认",
        paras: [
          "一份目标人选名单。匹配理由、消息从哪来、哪里还不清楚，都写在旁边。先联系谁，你来判断。",
          "从招聘平台下载的简历，也可以上传进来一起核对。聊完把新简历发给它，资料和匹配都会更新，下一个职位接着用。",
        ],
        confirmTitle: "还要你确认",
        confirm: [
          "JD 里哪些是硬性要求（Must），哪些是加分项（Prefer）？",
          "人选现在的职位和负责的项目准确吗？",
          "本人想不想动？他的公司在不在你的 Off-limits 名单上？",
        ],
        note: "论文写得好，不等于做过量产或带过团队。本人想不想动，要你去问。",
      },
      faq: {
        h2: ["关于人才寻访，", "大家常问这些。"],
        items: [
          [
            "候选人寻访可以从哪些渠道找人？",
            "已有候选人、人才地图、公开网络与招聘页、论文与专利、开源项目，以及你上传的简历和资料。每条线索都记着来自哪里，哪些渠道找过了、哪些还是空白，也会标出来。",
          ],
          [
            "它会替我联系候选人吗？",
            "不会。它给出目标人选名单、匹配理由和来源。先联系谁、怎么开口，由你决定。",
          ],
          [
            "和在招聘平台上直接搜人有什么不同？",
            "招聘平台是搜索和联系候选人的渠道，HunterBuddy 不替代它们。它做的是找人之前和找人过程中的研究：先用上你已有的资源，再把公开资料放在一起核对身份、写明来源。从平台下载的简历也能上传进来一起核对。",
          ],
          [
            "匹配结果可以直接相信吗？",
            "把它当作带来源的参考，而不是最终结论。没有可靠来源的信息会标为“待确认”。像实际带多大团队、本人想不想动，这类只有聊了才知道的事，会明确留给你。",
          ],
        ],
      },
    },
    en: {
      name: "Sourcing",
      teaser: "When the JD lands, start with the people you already know, then fill the gaps.",
      title: "Candidate sourcing: start with who you already know | HunterBuddy",
      ogTitle: "Candidate sourcing · HunterBuddy",
      description:
        "How can you source candidates faster? HunterBuddy checks your talent maps and CV database first, then fills the gaps from papers, patents and open-source communities, giving you a longlist with the reasons, sources and open questions for each candidate. Who to approach first is your call.",
      kicker: "Use case · Sourcing",
      h1: ["The JD is in.", "Start with the people you already know."],
      lead:
        "Often the right person is already in your database. You just can’t think of them at the moment, or your search doesn’t bring them up. HunterBuddy starts with your talent maps and CV database, then fills the gaps from public sources. Every candidate comes with the reasons for the match and the sources.",
      method: {
        label: "The usual approach",
        h2: "How candidate sourcing usually works",
        intro: "When a new search comes in, experienced recruiters usually work like this:",
        steps: [
          ["Understand the JD", "Talk it through with the hiring manager: which requirements are must-haves, which are nice-to-haves, and what the team is really missing."],
          ["Pick target companies and teams", "Work out which companies and teams the right people are most likely to come from, and which companies are off-limits."],
          ["Start with who you already have", "Go through your talent maps and CV database, and put past research to work first."],
          ["Then look further afield", "Use the public web, careers pages, papers, patents and open-source communities to find the people your database is missing."],
          ["Build the longlist", "Rank by fit, note why each person fits and what still needs confirming, then decide who to approach first."],
        ],
      },
      hard: {
        label: "Where it gets hard",
        h2: "The hard part isn’t finding people. It’s knowing they’re the right ones.",
        items: [
          ["Your own resources sit unused", "The right person is in your CV database, but the search doesn’t surface them, or you’ve forgotten them."],
          ["CVs fall out of date", "A CV from two years ago may no longer reflect someone’s current role or projects."],
          ["The same person, several times", "Your database, recruiting platforms and papers each hold a version. Without merging them, you end up contacting the same person twice."],
          ["Looking good on paper isn’t enough", "Strong papers don’t prove mass-production or leadership experience."],
        ],
      },
      how: {
        label: "How HunterBuddy helps",
        h2: "How HunterBuddy helps with sourcing",
        intro: "Continuing the Xingchuan Robotics example: Qing Xu has sent over the JD for Head of Computer Vision.",
        steps: [
          [
            "Checks what you already have",
            "It searches your talent maps and CV database first, so past research is put to work and you don’t start from zero.",
            "Qing Xu sends the JD. HunterBuddy finds Yue Lin on the talent map you built earlier.",
          ],
          [
            "Fills the gaps from public sources",
            "When your database falls short, it looks in papers, patents and open-source communities, and notes where each lead came from.",
            "Papers in robotics perception turn up Ning Zhou.",
          ],
          [
            "Verifies and merges duplicates",
            "When the same person turns up in different sources, it checks their identity before merging the records, so no one appears twice.",
            "Yue Lin has records in your CV database, on a team page and in a paper. The three are merged into one.",
          ],
          [
            "Spells out the fit and the open questions",
            "Every candidate comes with the reasons for the match and the sources, and anything uncertain is listed separately.",
            "Si Chen has led cross-functional projects. Their current work and openness to a move still need confirming.",
          ],
        ],
        card: {
          context: "Xingchuan Robotics · Head of Computer Vision",
          title: "Longlist · Worth approaching",
          caption: "This is the list HunterBuddy hands you. Next to each name: why they fit and what still needs confirming.",
          items: [
            ["Industrial vision · Team lead", "Yue Lin", "Has led production-line vision teams. Three records merged into one. To verify: team size and reporting line."],
            ["Robotics perception · Senior engineer", "Ning Zhou", "Relevant publications and project experience. To verify: production experience."],
            ["Computer vision · Project lead", "Si Chen", "Has led cross-functional projects. To verify: current work and openness to a move."],
          ],
        },
      },
      result: {
        label: "What you get",
        h2: "What you get, and what’s yours to confirm",
        paras: [
          "A longlist with the rationale, sources and open questions alongside each candidate. You decide who to approach first.",
          "CVs downloaded from recruiting platforms can be uploaded and checked along with everything else. After a conversation, send HunterBuddy the new CV. The profile and matches will update, ready for your next search.",
        ],
        confirmTitle: "For you to confirm",
        confirm: [
          "Which JD requirements are must-haves, and which are nice-to-haves?",
          "Are their current role and projects still accurate?",
          "Are they open to a move? Is their company on your off-limits list?",
        ],
        note: "Strong papers don’t prove mass-production or leadership experience. You need to ask whether someone is open to a move.",
      },
      faq: {
        h2: ["What people ask", "about sourcing."],
        items: [
          [
            "Where can recruiters source candidates from?",
            "Your existing candidates and talent maps, the public web and careers pages, papers and patents, open-source projects, and the CVs and documents you upload. HunterBuddy notes where each lead came from, and marks which channels have been searched and which haven’t yet.",
          ],
          [
            "Will it contact candidates for me?",
            "No. It gives you a longlist with the reasons and sources. Who to approach first, and how, is up to you.",
          ],
          [
            "How is it different from searching on a recruiting platform?",
            "Recruiting platforms are where you search for and contact candidates, and HunterBuddy doesn’t replace them. It does the research before and during a search: putting your own resources to work first, then bringing public information together to check identities and cite sources. CVs downloaded from these platforms can be uploaded and checked too.",
          ],
          [
            "Can I take the match results at face value?",
            "Treat them as sourced guidance, not a final verdict. Anything without a reliable source is marked as unconfirmed. Some things you only find out by talking to the person, such as how big a team they really lead or whether they’re open to a move. HunterBuddy leaves those explicitly to you.",
          ],
        ],
      },
    },
  },
  {
    slug: "candidate-nurturing",
    zh: {
      name: "人选维护",
      teaser: "重点人选有了变化，对照你的在手职位。",
      title: "候选人维护：重点人选有了变化，对照你的在手职位｜HunterBuddy",
      ogTitle: "候选人维护 · HunterBuddy",
      description:
        "候选人维护怎么做？HunterBuddy 帮你留意重点人选的公开履历和所在团队的变化，对照你的在手职位和人脉里的机会，找出有理有据的下一站。打不打这通电话、推不推荐，由你决定。",
      kicker: "使用场景 · 候选人维护",
      h1: ["半年后，", "林越的团队变了。"],
      lead:
        "好的候选人关系，靠的是在对的时候出现。HunterBuddy 帮你留意重点人选的变化，对照你的在手职位和人脉里的机会，给出有理有据的下一站。打不打这通电话，你说了算。",
      method: {
        label: "一般怎么做",
        h2: "候选人维护，一般怎么做",
        intro: "候选人维护是猎头的长期功课。今天不想动的人，半年后可能就是你的下一个成功推荐。通常要做这几件事：",
        steps: [
          ["分出重点人选", "不是每个人都要常联系。先挑出你最看重、最可能合作的一批。"],
          ["留意变化", "团队调整、换了负责人、在岗满几年、公开履历更新，这些都可能是该聊一聊的时候。"],
          ["对照在手职位", "有变化时，看看手上有没有合适的职位，或者人脉里有没有新机会。"],
          ["聊清楚动机", "团队调整不等于想走。这次看机会，他真正在意的是什么。"],
          ["更新资料", "聊完把新的情况记下来，下一次接着用。"],
        ],
      },
      hard: {
        label: "难在哪里",
        h2: "难的不是保持联系，是知道什么时候该联系",
        items: [
          ["人太多，顾不过来", "库里的简历越攒越多，重点人选也不少，很难一个个盯着。"],
          ["变化看不到", "团队调整、在岗年限这类信号散在公开资料里，不主动去查就不知道。"],
          ["机会和人对不上", "手上有职位，却想不起库里谁合适。"],
          ["资料越放越旧", "两年前的简历，和他现在的情况可能已经差得很远。"],
        ],
      },
      how: {
        label: "怎么帮你",
        h2: "HunterBuddy 怎么帮你做候选人维护",
        intro: "半年后，回到星川机器人的故事：林越是你的重点人选。",
        steps: [
          [
            "留意重点人选的变化",
            "你可以让它定期帮你看关注的候选人，公开履历有没有更新、所在团队有没有调整。只有值得你看的变化才会提醒你。",
            "它发现林越的团队并进了新平台部，而他在现在的岗位上已满四年。",
          ],
          [
            "对照你的在手职位",
            "有变化时，它把这个人和你手上的职位放在一起看，方向和经历对不对得上，都写明理由。",
            "穹顶智能的视觉平台负责人，方向和带团队经历都对得上，薪资期望待确认。",
          ],
          [
            "找出人脉里的新机会",
            "它也会看你熟悉的客户里，有没有相关的新机会。",
            "星川机器人的新产线视觉团队，和他的产线经历相关，HC 待确认。",
          ],
          [
            "把迹象和结论分开",
            "团队调整不等于想走。它只把迹象和理由摆出来，本人意向要你去问。",
            "林越本人想不想动，现在还不知道，要你去问。",
          ],
        ],
        card: {
          context: "重点人选 · 林越",
          title: "林越 · 可以聊的下一站",
          caption: "这是 HunterBuddy 交给你的结果。有理有据的机会，和还要你去问的事，分开写。",
          items: [
            ["在手职位", "穹顶智能 · 视觉平台负责人", "方向和带团队经历都对得上，薪资期望待确认。"],
            ["人脉里的新机会", "星川机器人 · 新产线视觉团队", "和他的产线经历相关，HC 待确认。"],
            ["只是迹象", "本人意向", "团队调整不等于想走，要你去问。"],
          ],
        },
      },
      result: {
        label: "你会拿到什么",
        h2: "你会拿到什么，哪些要你确认",
        paras: [
          "几个有理有据的机会。打不打这通电话、推不推荐，你说了算。",
          "聊完把新简历发给它，资料和匹配都会更新，下一次接着用。",
        ],
        confirmTitle: "还要你确认",
        confirm: ["这次看机会，他的核心动机是什么？", "这些机会的职责和要求核实过吗？", "推荐报告里的内容，他确认并授权了吗？"],
        note: "HunterBuddy 不会替你联系候选人，也不会替你做任何推荐。",
      },
      faq: {
        h2: ["关于候选人维护，", "大家常问这些。"],
        items: [
          [
            "候选人维护，多久联系一次合适？",
            "没有固定的标准。比起定期问候，在对的时候出现更重要。团队调整、换了负责人、在岗满几年，往往是聊一聊的好时机，HunterBuddy 会在这些变化出现时提醒你。",
          ],
          [
            "它怎么知道候选人有了变化？",
            "它看的是公开资料，比如公开履历的更新、所在公司的组织调整和招聘页的变化。你可以让它定期帮你看，只有值得你看的变化才会提醒你，没有新消息就不打扰你。",
          ],
          [
            "发现了变化，是不是说明他想走？",
            "不是。团队调整不等于想走。HunterBuddy 只把迹象和理由摆出来，本人想不想动、核心动机是什么，要你去问。",
          ],
          [
            "聊完的新情况怎么更新？",
            "聊完把新简历发给它，资料和匹配都会更新。你也可以把候选人库和人才地图带进来，同样会核对身份、查重合并。",
          ],
        ],
      },
    },
    en: {
      name: "Candidate nurturing",
      teaser: "When a priority candidate’s situation changes, check your live searches.",
      title: "Candidate nurturing: spot changes, check your live searches | HunterBuddy",
      ogTitle: "Candidate nurturing · HunterBuddy",
      description:
        "How do you nurture candidate relationships? HunterBuddy watches for changes to your priority candidates’ public profiles and teams, checks them against your live searches and openings in your network, and suggests well-founded next moves. Whether to call, and whether to put them forward, is up to you.",
      kicker: "Use case · Candidate nurturing",
      h1: ["Six months on,", "Yue Lin’s team has changed."],
      lead:
        "Strong candidate relationships come from showing up at the right moment. HunterBuddy watches for changes affecting your priority candidates, checks them against your live searches and openings in your network, and suggests well-founded next moves. Whether to make the call is up to you.",
      method: {
        label: "The usual approach",
        h2: "How candidate nurturing usually works",
        intro:
          "Candidate nurturing is a long game. Someone who isn’t looking today may be your next placement six months from now. It usually involves these steps:",
        steps: [
          ["Pick your priority candidates", "Not everyone needs regular contact. Start with the people you value most and are most likely to work with."],
          ["Watch for changes", "A reorganization, a new manager, several years in the same role, an updated public profile: any of these can be the moment to talk."],
          ["Check your live searches", "When something changes, see whether you have a suitable role, or whether a new opening has come up in your network."],
          ["Understand their motivation", "A team change doesn’t mean someone wants to leave. Find out what really matters to them this time."],
          ["Keep the record current", "After the conversation, note what has changed so it’s there next time."],
        ],
      },
      hard: {
        label: "Where it gets hard",
        h2: "The hard part isn’t staying in touch. It’s knowing when to get in touch.",
        items: [
          ["Too many people to follow", "Your database keeps growing, and so does your list of priority candidates. Keeping an eye on each one is hard."],
          ["Changes go unnoticed", "Signals like team changes and time in role are scattered across public sources. Unless you go looking, you won’t know."],
          ["Roles and people don’t connect", "You have a role on your desk but can’t think who in your database would fit."],
          ["Records go stale", "A CV from two years ago may be a long way from where the candidate is now."],
        ],
      },
      how: {
        label: "How HunterBuddy helps",
        h2: "How HunterBuddy helps with candidate nurturing",
        intro: "Six months later, back to the Xingchuan Robotics story: Yue Lin is one of your priority candidates.",
        steps: [
          [
            "Watches for changes",
            "You can have it check regularly on the candidates you follow: whether their public profile has been updated or their team has changed. It only alerts you to changes worth your time.",
            "It notices that Yue Lin’s team has moved into a new platform division, and that he is now four years into his role.",
          ],
          [
            "Checks your live searches",
            "When something changes, it puts the person alongside your live searches to see whether their focus and experience fit, and spells out the reasoning either way.",
            "Qiongding AI, Head of Vision Platform: a fit on both technical focus and team leadership. Salary expectations to confirm.",
          ],
          [
            "Finds openings in your network",
            "It also looks for relevant new openings among clients you know well.",
            "Xingchuan Robotics’ new production-line vision team is relevant to his production-line experience. Headcount still to confirm.",
          ],
          [
            "Keeps signals apart from conclusions",
            "A team change doesn’t mean someone wants to leave. HunterBuddy lays out the signals and the reasons. Asking what they actually want is up to you.",
            "Whether Yue Lin wants to move is still unknown. You need to ask.",
          ],
        ],
        card: {
          context: "Priority candidate · Yue Lin",
          title: "Yue Lin · Possible next steps",
          caption: "This is what HunterBuddy hands you: well-founded opportunities, kept apart from what you still need to ask.",
          items: [
            ["Your live searches", "Qiongding AI · Head of Vision Platform", "Strong technical and leadership fit. Salary expectations to confirm."],
            ["An opportunity in your network", "Xingchuan Robotics · New production vision team", "Fits his production-line experience. Headcount still to confirm."],
            ["A signal, not a conclusion", "Candidate interest", "A team change doesn’t mean he wants to leave. You need to ask."],
          ],
        },
      },
      result: {
        label: "What you get",
        h2: "What you get, and what’s yours to confirm",
        paras: [
          "A few well-founded opportunities. Whether to make the call, and whether to put him forward, is up to you.",
          "After you talk, send HunterBuddy his new CV. His profile and matches will update, ready for next time.",
        ],
        confirmTitle: "For you to confirm",
        confirm: [
          "What is really driving him to look this time?",
          "Have the responsibilities and requirements of these roles been verified?",
          "Has he reviewed the candidate report and agreed to be submitted?",
        ],
        note: "HunterBuddy never contacts candidates for you, and never puts anyone forward on your behalf.",
      },
      faq: {
        h2: ["What people ask", "about candidate nurturing."],
        items: [
          [
            "How often should I keep in touch with candidates?",
            "There’s no fixed rule. Showing up at the right moment matters more than regular check-ins. A team change, a new manager or several years in the same role are often good reasons to talk, and HunterBuddy alerts you when it spots changes like these.",
          ],
          [
            "How does it know a candidate’s situation has changed?",
            "It looks at public information, such as profile updates, reorganizations at the candidate’s company and changes to its careers page. You can have it check regularly. It only alerts you to changes worth your time, and stays quiet when there’s nothing new.",
          ],
          [
            "Does a change mean they want to move?",
            "No. A team change doesn’t mean someone wants to leave. HunterBuddy lays out the signals and the reasons. You need to ask whether they’re open to a move and what really drives them.",
          ],
          [
            "How do I update a candidate’s record after we talk?",
            "Send HunterBuddy their new CV. Their profile and matches will update. You can also bring in your candidate database and talent maps, which go through the same identity checks and de-duplication.",
          ],
        ],
      },
    },
  },
];
