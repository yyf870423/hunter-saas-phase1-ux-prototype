// Legal pages (English): the privacy policy, terms of service and data processing agreement, a faithful translation of
// ./zh.mjs. Section count and order must match the Chinese; the Chinese version prevails. No Chinese characters here
// (the English pages carry none). **bold** marks the clauses the reader must notice, as in the Chinese.
export const UPDATED = "2026-10-26";
export const EFFECTIVE = "2026-10-26";

const privacy = {
  slug: "privacy",
  name: "Privacy policy",
  title: "Privacy policy | HunterBuddy",
  description:
    "How Beijing Boseek Intelligent Technology Co., Ltd. handles your personal information on its website and in HunterBuddy, and the information about candidates and other people: what we collect, how we use it, where it is stored, how long we keep it, who processes it for us, and how you can access, correct or delete it and close your account.",
  lead: "This policy explains how Beijing Boseek Intelligent Technology Co., Ltd. (“Boseek”, “we”) handles your personal information on www.boseekai.com and in HunterBuddy, and the information about candidates, contacts and other people that you keep in HunterBuddy. Please read it carefully, especially the parts in bold.",
  keys: [
    "**The website uses no cookies and no analytics, advertising or tracking code.** When you browse it, our server only keeps access logs, for security and troubleshooting.",
    "**When you request a trial**, we collect the name, company, phone number, email, role, number of active searches and industry you enter, and use them only to review your request and contact you when trial access opens.",
    "**You decide how the candidates, contacts and other people you keep in HunterBuddy are used.** We process that information for you under the Data processing agreement and use it for nothing else.",
    "**All personal information is stored and processed in mainland China. It never leaves China, is never used to train AI models and is never sold.**",
    "AI results show their sources and how reliable they are. Who to contact and who to put forward is your decision.",
    "You can access, copy, correct and delete your information and close your account. Email privacy@boseekai.com and we will reply within 15 working days.",
  ],
  sections: [
    {
      h2: "Who we are and what this policy covers",
      body: [
        "The personal information handler is Beijing Boseek Intelligent Technology Co., Ltd. For anything about personal information, contact privacy@boseekai.com.",
        "This policy covers the website (the Chinese and English pages of www.boseekai.com), trial requests, and the HunterBuddy service, including accounts, workspaces and the features in them.",
        "HunterBuddy is in an invitation-only trial and some features are still being built. This policy describes the processing we provide now and are preparing to provide. **What the service actually offers is what applies.** When a change in features changes how we process information, we update this policy first (see section 12).",
        { h3: "We act in two different capacities" },
        {
          list: [
            "For information about website visitors, trial applicants and HunterBuddy users themselves, **we are the personal information handler** and follow this policy.",
            "For the information you keep and process in your workspace about candidates, client contacts, paper authors, patent inventors, email correspondents and other people (“other people’s information in your workspace”), **you are the personal information handler and we process it on your behalf**, under the Data processing agreement. Section 9 is written for the people that information is about.",
          ],
        },
        "This policy is made under the Personal Information Protection Law of the People’s Republic of China, the Cybersecurity Law, the Data Security Law, the Regulations on Network Data Security Management, the Interim Measures for the Management of Generative AI Services, the Measures for Labeling AI-Generated Synthetic Content and other laws and regulations.",
      ],
    },
    {
      h2: "What we collect and why",
      body: [
        "We collect only what we need to provide the service. The table lists every situation in which we collect information. Anything marked optional can be left out without affecting other features.",
        {
          table: {
            head: ["When", "What we collect", "Why", "Required?"],
            rows: [
              ["Browsing the website", "Access logs recorded by the server: IP address, time of visit, pages requested, browser and operating system type, referring page", "To keep the website secure, fix faults and keep network logs as the law requires", "Recorded automatically"],
              ["Requesting a trial", "Name, company, phone number, email, role, number of active searches, industry (including anything you add), and the submission time and reference", "To review your request and contact you when trial access opens", "Required. Without it you cannot apply"],
              ["Signing up and signing in", "A mainland China mobile number and SMS code. With WeChat, the account identifier WeChat returns and any nickname and avatar you agree to share. The name you enter when signing up", "To create your account, verify who you are and keep sign-in secure", "Required. One of the two methods"],
              ["Account profile", "Avatar, name, contact email, workspace name, language, time zone, notification settings", "To show your account, send notifications and follow your preferences", "Name required, the rest optional"],
              ["Sign-in security", "Sessions and devices: browser, operating system, approximate city derived from the IP address, last active time", "To let you see and sign out other devices and to spot unusual sign-ins", "Required"],
              ["Using the service", "What you type, the files, images, screenshots, audio and links you upload, the tasks and recurring plans you set, the results the service produces, and a record of each confirmation you give", "To carry out the tasks you start, keep the results and record who confirmed what and when", "Required for the feature you use"],
              ["Usage and runs", "Task and run records, model usage, number of searches, data processing capacity, error information", "To count quota, fix faults and keep the service stable", "Required"],
              ["Connecting a sending mailbox", "Mailbox address, mailbox password or client authorization code, mail server settings", "To send emails from your mailbox after you confirm each one, and to read the replies and attachments to those emails", "Optional"],
              ["Subscription and payment", "Plan, amount, order time and status, the payment result returned by the payment channel, auto-renewal setting", "To complete purchases, manage your subscription and quota and keep transaction records as the law requires", "Required to buy"],
              ["Support and diagnostics", "Problem descriptions, feedback and diagnostic packages you choose to send", "To answer you and find and fix the problem", "Optional"],
            ],
          },
        },
        "**We do not collect your ID number, bank card number, biometric data, location tracks or other sensitive personal information**, and we never read files on your computer that you have not chosen to upload. We do not extract voiceprints from audio or run face recognition on photos. Payment is completed with Alipay or WeChat Pay, and we never see your card number or payment password.",
        { h3: "About the sending mailbox" },
        "Connecting a sending mailbox is optional. **No email is sent until you confirm its recipients, subject, body and attachments**, and automatic mode cannot skip this step. So that you can see replies, we regularly read the replies and attachments in the same conversation as those emails, and nothing else in your mailbox. The mailbox password or authorization code is stored encrypted, is never shown to anyone, and is deleted as soon as you disconnect the mailbox.",
        { h3: "Any other purpose needs your consent first" },
        "If we want to use information for a purpose this policy does not describe, or the purpose, method or type of information changes, we will tell you first and ask for your consent again.",
      ],
    },
    {
      h2: "Cookies and browser storage",
      body: [
        "**The website uses no cookies and does not use browser storage to record what you do.** It has no analytics, advertising or third-party tracking code. Its fonts, videos and scripts are all served from our own server.",
        "The HunterBuddy service uses the cookies and browser storage it needs to keep you signed in and to keep unsent drafts and interface preferences, such as pinned tasks. None of this is used for advertising or profiling. If you clear your browser data, you will need to sign in again and your interface preferences return to their defaults.",
      ],
    },
    {
      h2: "How AI handles your information",
      body: [
        "HunterBuddy uses large language models to understand your requests, parse files, search and organize public information, compare identities, calculate matches, and draft summaries, reports, interview materials and emails.",
        {
          list: [
            "**Models in China only.** To carry out the tasks you start, we send the necessary content to large-model providers in mainland China, and never to models outside China.",
            "**Never used for training.** We do not use what you type, upload or generate, or other people’s information in your workspace, to train or fine-tune any model, and our agreements require the model providers not to either.",
            "**Results are labeled.** Content generated or inferred by AI is marked with labels such as AI-generated, Inferred or To be confirmed, together with the sources it relies on, and is shown apart from verified facts. Exported files are marked too. Section 7 of the Terms of service describes the labels.",
            "**You make the decisions.** Match scores, identity judgments and career-move alerts are for your reference only. HunterBuddy never contacts anyone by itself, and never puts forward, hires or rejects a candidate by itself.",
          ],
        },
        { h3: "Automated processing" },
        "Within the authorization you give, HunterBuddy carries out some processing automatically, for example linking two records of the same person when the evidence is strong, or scoring and ranking candidates against a role. All of it keeps its evidence, and you can review, undo or correct it. In settings you can switch to Analyze only or Confirm before acting, and turn off automatic steps such as matching right after saving. A person who considers that automated processing significantly affects their rights may ask us to explain it, and may refuse a decision made solely by automated means (see section 10).",
      ],
    },
    {
      h2: "Processors, sharing, transfers and disclosure",
      body: [
        "To provide the service, we engage the following types of service providers to process the information they need. Our agreements require them to process it only as we instruct and for the agreed purpose, to keep it secure and to use it for nothing else, and we supervise them.",
        {
          table: {
            head: ["Provider", "Information processed", "Purpose"],
            rows: [
              ["Cloud provider (in China)", "The data needed to store and run the service", "Servers, databases, file storage and backups"],
              ["Large-model provider (in China)", "The input and excerpts needed for a task", "Understanding, parsing, analyzing, generating and translating content"],
              ["Public search service (in China)", "Search terms, such as a role, a company or a person’s name", "Searching public web pages, papers, patents and open-source projects for your tasks"],
              ["SMS provider", "Mobile number, verification code", "Sending sign-in codes"],
              ["WeChat Open Platform (Tencent)", "WeChat account identifier", "Signing in with WeChat"],
              ["Email delivery service", "Contact email, notification summaries (never candidates, contacts, email bodies or other business content)", "Sending account security, subscription and service notifications"],
              ["Feishu (Beijing Feishu Technology Co., Ltd.)", "What you enter in a trial request", "Recording and reviewing trial requests"],
            ],
          },
        },
        "When you pay, you complete the payment on the Alipay or WeChat Pay page, and the payment institution handles the payment information under its own rules. We send it only the order number, plan name and amount. Once you connect a sending mailbox, emails are sent and received through the mailbox provider you chose.",
        { h3: "Sharing" },
        "**Unless a law or administrative regulation requires otherwise, we do not provide your personal information to any third party, and we never sell it.** If we ever need to provide it to another personal information handler, we will first tell you the recipient’s name and contact details, the purpose, the method and the types of information, and obtain your separate consent.",
        "**Each workspace is isolated.** We never give one user’s workspace data to another user or use it in another user’s tasks.",
        { h3: "Transfers" },
        "If personal information has to be transferred because of a merger, division, dissolution or bankruptcy, we will tell you the recipient’s name and contact details and require the recipient to keep to this policy. A recipient that changes the original purpose or method of processing must ask for your consent again.",
        { h3: "Public disclosure" },
        "We do not disclose your personal information publicly.",
        { h3: "When the law does not require consent" },
        "The law allows personal information to be processed without your consent in these cases:",
        {
          list: [
            "Where it is necessary to conclude or perform a contract to which you are a party.",
            "Where it is necessary to fulfil statutory duties or obligations.",
            "Where it is necessary to respond to a public health emergency, or to protect a person’s life, health or property in an emergency.",
            "Where it is done within a reasonable scope for news reporting or public-opinion oversight in the public interest.",
            "Where it concerns information the person has made public, or that has otherwise been lawfully made public, and is processed within a reasonable scope.",
            "Other cases provided by laws and administrative regulations.",
          ],
        },
      ],
    },
    {
      h2: "Where information is stored and for how long",
      body: [
        "**The personal information we collect and generate is stored in the People’s Republic of China and is not provided outside China.** If that ever becomes necessary, we will first tell you the overseas recipient’s name and contact details, the purpose, method and types of information, and how to exercise your rights against it, obtain your separate consent, and complete the procedures the law requires.",
        "We keep personal information only for the shortest time needed for its purpose, then delete or anonymize it. If a retention period set by law or administrative regulation has not ended, or deletion is technically difficult, we only store and protect the information and do not otherwise process it.",
        {
          table: {
            head: ["Information", "How long we keep it"],
            rows: [
              ["Website access logs", "6 months, then deleted"],
              ["Trial requests", "If a trial is opened, kept as account information. Otherwise deleted 12 months after submission. You can ask us to delete it at any time"],
              ["Account information", "While the account exists. Deleted or anonymized within 15 working days after the account is closed"],
              ["Workspace content", "While the account exists. What you delete goes to the recycle bin and is permanently deleted after 30 days, or earlier if you delete it permanently"],
              ["Deleted workspaces", "A 30-day recovery period after you request deletion, then permanently deleted"],
              ["Export files", "Available to download for 7 days after they are generated, then deleted"],
              ["Mailbox password or authorization code", "Deleted as soon as you disconnect the mailbox"],
              ["Diagnostic packages", "Deleted within 30 days after the problem is resolved"],
              ["Security logs and operation audit records", "The shortest period security and compliance require, and at least 6 months"],
              ["Order and payment records", "The period required by accounting, tax and other laws"],
              ["Backups", "Overwritten on a rolling backup cycle and cleared automatically at the end of each cycle"],
            ],
          },
        },
        "If your subscription ends or your account is suspended, your data stays and you can still view and export it. If we stop operating HunterBuddy, we will announce it 30 days in advance and delete or anonymize personal information once the service stops.",
      ],
    },
    {
      h2: "How we protect your information",
      body: [
        {
          list: [
            "The whole site uses HTTPS encryption.",
            "Each workspace is isolated. When data is written, the system checks permissions and workspace boundaries.",
            "Mailbox authorization codes, keys and other credentials are stored encrypted and never shown in the interface.",
            "**Operations staff cannot see your business content**, including candidates, roles, companies, contacts, files, conversations and AI output. They see only what they need to handle accounts, trials, subscriptions and faults. Staff do not access your business content unless you send a diagnostic package, you give explicit permission, or it is necessary to handle a complaint or illegal content as the law requires.",
            "Important actions such as approving trials, suspending accounts, adjusting quota and opening diagnostic packages leave audit records that cannot be changed.",
            "Staff get only the access they need, are bound by confidentiality, and receive security and personal information protection training.",
          ],
        },
        { h3: "If a security incident happens" },
        "If personal information is, or may be, leaked, altered or lost, we will act immediately to contain it and notify you as the law requires: the types of information involved, the cause and possible harm, what we have done, what you can do to reduce the harm, and how to reach us. We will tell you by in-app notice, email or SMS, post a notice on the website where we cannot reach everyone individually, and report to the authorities as required.",
        "No system on the internet is perfectly secure. If you think someone else may be using your account, sign out other sessions at once and contact us.",
      ],
    },
    {
      h2: "Minors",
      body: [
        "HunterBuddy is a work tool for professional headhunters and recruiters and **is not intended for anyone under 18**, and we do not knowingly collect minors’ personal information. If we find we have collected personal information of a child under 14 without a guardian’s consent, we will delete it as soon as possible.",
        "Please do not keep personal information about children under 14 in HunterBuddy.",
      ],
    },
    {
      h2: "For candidates and other people on record",
      body: [
        "If you are a candidate, a contact at a client company, a paper author or a patent inventor, or you have exchanged emails with a HunterBuddy user, some of your information may be kept in a headhunter’s HunterBuddy workspace. This section explains where that information comes from, how it is processed and what you can do.",
        { h3: "Where the information comes from" },
        {
          list: [
            "Material the headhunter uploads or enters, such as a resume you gave them, or their own work notes.",
            "**Public professional information** the headhunter asks HunterBuddy to look up: public web pages, company websites, news, papers, patents and open-source projects that can be read without signing in.",
            "Emails the headhunter confirms and sends from their own mailbox, and the replies to them.",
          ],
        },
        { h3: "What we do not do" },
        {
          list: [
            "**We do not sign in to or operate recruiting or social platforms that require a login**, such as Liepin, Maimai, BOSS Zhipin or LinkedIn, and we do not get around websites’ access restrictions.",
            "We do not collect private information unrelated to work, such as ID numbers, home addresses, family members, health or religious beliefs, and we do not piece scattered private details together to track a person down.",
            "We never contact you by ourselves. Whether and how to contact you is the headhunter’s own decision.",
            "Inferences, such as a possible colleague relationship or a career move, are marked as inferred or to be confirmed and are never treated as facts.",
            "The only structured contact details kept are mobile numbers and emails. Contact details HunterBuddy finds are saved only after the headhunter confirms them.",
          ],
        },
        { h3: "Who is responsible" },
        "The headhunter who keeps your information is its personal information handler. They are responsible for having a lawful basis and for answering your requests. Boseek processes it on the headhunter’s instructions, keeps it secure as the law requires, and helps the headhunter respond to you.",
        { h3: "What you can do" },
        "You can contact the headhunter who keeps your information and ask to access, correct or delete it, or refuse their processing of information you have made public. You can also email privacy@boseekai.com with your name, information that proves who you are, and your request. Once we have verified it, we will pass it to the users concerned and help them handle it within 15 working days, pausing the processing of that information first where needed, and tell you the outcome.",
        "If you expressly refuse our processing of information you have made public, we will record your request and **from then on stop automatically collecting or completing your information from public sources for any user**.",
      ],
    },
    {
      h2: "Your rights",
      body: [
        {
          list: [
            "**Access and copy**: view your information in account settings and on each record page, or download it with Export.",
            "**Portability**: where the legal conditions are met, we provide a way to transfer your personal information to another handler you name.",
            "**Correct and complete**: edit it in account settings, or contact us.",
            "**Delete**: you can delete content in the service. It goes to the recycle bin and is permanently deleted after 30 days, or earlier if you delete it permanently. You can also ask us to delete your information when the purpose has been achieved, we stop providing the service, you withdraw consent, or we process it unlawfully or in breach of our agreement.",
            "**Withdraw consent**: withdrawal does not affect processing already carried out on the basis of your consent. Some features may stop working afterwards.",
            "**Restrict or refuse processing**: you can ask us to restrict or refuse the processing of your personal information, unless laws or administrative regulations provide otherwise.",
            "**Explanations and automated decisions**: see section 4.",
            "**Close your account**: email privacy@boseekai.com. Once we have verified your identity, we close the account within 15 working days and delete or anonymize your personal information, unless the law provides otherwise. **A closed account cannot be restored, so export anything you want to keep first.**",
          ],
        },
        { h3: "How to make a request" },
        "Email privacy@boseekai.com. To protect your information we may first verify your identity, then we reply within 15 working days. There is normally no charge. For transfer requests that are clearly excessive in number or scope, we may charge the necessary cost. If we cannot meet a request, we will tell you why.",
        "If you believe our processing has harmed your rights, you can complain to us, complain to or report to the cyberspace, public security, market regulation or other authorities, or bring a lawsuit in a people’s court.",
      ],
    },
    {
      h2: "Third-party websites",
      body: [
        "The website and service may link to third-party websites, such as the ICP filing lookup. Third parties handle information under their own rules, so please read their privacy policies.",
      ],
    },
    {
      h2: "How this policy is updated",
      body: [
        "We may update this policy when laws change or features change. The new version is published on this page with its update date and effective date. **For significant changes, such as a change in purpose, method, types of information, types of service providers or where information is stored,** we will tell you clearly before they take effect, by in-app notice, email or a notice on the website, and ask for your consent again where that is required.",
        "Earlier versions are available on request by email.",
      ],
    },
    {
      h2: "Contact us",
      body: [
        {
          list: [
            "Company: Beijing Boseek Intelligent Technology Co., Ltd.",
            "Personal information: privacy@boseekai.com",
            "Everything else: hello@boseekai.com",
            "Website: www.boseekai.com",
          ],
        },
        "We reply within 15 working days of receiving your message.",
      ],
    },
  ],
};

const terms = {
  slug: "terms",
  name: "Terms of service",
  title: "Terms of service | HunterBuddy",
  description:
    "The terms for using HunterBuddy: what the service does, accounts, trials, subscriptions and auto-renewal, your responsibility for candidates’ information, labeling and checking AI-generated content, limits of liability, complaints and disputes.",
  lead: "These terms are the agreement between you and Beijing Boseek Intelligent Technology Co., Ltd. (“Boseek”, “we”) for using HunterBuddy. Please read them carefully, especially the clauses in bold that exclude or limit liability or deal with disputes. By signing up, signing in or using HunterBuddy, you confirm that you have read and agree to these terms, the Privacy policy and the Data processing agreement.",
  keys: [
    "HunterBuddy is an AI work tool for headhunters, currently in an invitation-only trial.",
    "**It never contacts anyone, and never puts candidates forward or makes business decisions, for you.** No email is sent until you confirm it.",
    "**You decide how candidates’ and other people’s information is used, and you are responsible for doing so lawfully.**",
    "**AI results can be wrong, so check them before you rely on them.** We mark what is AI-generated, inferred or to be confirmed.",
    "Subscriptions renew automatically by default. You can turn renewal off at any time, and we remind you at least 5 days before each renewal.",
    "**Top-ups and separately purchased credits are valid for 12 months from the day they are credited. Anything unused by then is withdrawn and not refunded.**",
    "The law of the People’s Republic of China applies, and disputes go to the people’s court where Boseek is domiciled.",
  ],
  sections: [
    {
      h2: "Scope of these terms",
      body: [
        "These terms apply to your use of HunterBuddy, including the web service, accounts, workspaces and their features. The Privacy policy, the Data processing agreement and the rules we publish in the service form part of these terms.",
        "**You must be at least 18 and have full civil capacity.** If you use HunterBuddy for an organization, you must be authorized by it, and these terms bind that organization too.",
        "We use bold type to draw your attention to clauses that exclude or limit liability or otherwise significantly affect you. If anything is unclear, contact us before you agree and we will explain it.",
      ],
    },
    {
      h2: "What the service does",
      body: [
        "HunterBuddy is an AI work tool for headhunters and recruiters, for recruiting work. Its main uses are: analyzing roles, finding people in your own material and in public information, bringing records of the same person together and removing duplicates, matching candidates to roles, mapping company org charts, assessing potential clients, keeping a talent pool current, and drafting reports, interview materials and emails.",
        "**HunterBuddy never contacts anyone for you.** Who to contact, who to put forward and how to talk to them is your decision. Once you connect a sending mailbox, no email leaves your mailbox until you confirm its recipients, subject, body and attachments.",
        "**HunterBuddy does not sign in to or operate recruiting or social platforms that require a login.** You can upload resumes you have lawfully obtained from those platforms yourself.",
        "The service is in an invitation-only trial and some features are still being built. **The features, quota and scope actually offered in the service are what apply.** We may change, add or retire features, and will tell you in advance of changes that significantly affect you.",
      ],
    },
    {
      h2: "Your account",
      body: [
        {
          list: [
            "You sign up and sign in with a mainland China mobile number and SMS code, or by scanning a WeChat QR code. HunterBuddy has no sign-in password.",
            "Please give true and accurate information and keep it up to date.",
            "**Your account is for you alone. Do not lend, transfer, sell or share it.** You bear losses caused by your own failure to keep it safe, except where we are at fault.",
            "If you notice anything unusual, such as someone else using your account, sign out other sessions at once and contact us.",
            "You can ask to close your account at any time, as described in section 10 of the Privacy policy.",
          ],
        },
      ],
    },
    {
      h2: "Trials",
      body: [
        {
          list: [
            "Trials are by invitation, and submitting a request does not open a trial. We review requests against available places and fit, and decide whether to open one.",
            "The length and quota of a trial are those we tell you when it opens. **During a trial the service is free and provided as it is, and features may change, be interrupted or be limited by quota.**",
            "If you do not subscribe when the trial ends, paid features are limited, your data stays, and you can still view and export it.",
          ],
        },
      ],
    },
    {
      h2: "Subscriptions and payment",
      body: [
        {
          list: [
            "Prices, plan contents and quota are those shown on the purchase page, and the price at the time of your order is recorded in the order.",
            "We currently accept Alipay and WeChat Pay. A failed payment is never treated as paid.",
            "**Auto-renewal: auto-renewal is on by default when you first subscribe and when you change plans, and this is shown clearly before you pay. You can turn it off in settings at any time. The current period is unaffected and you will not be charged again when it ends. We remind you by in-app notice and email at least 5 days before each automatic renewal.** To change the payment method used for renewal, turn auto-renewal off and subscribe again when the period ends.",
            "An upgrade takes effect as soon as you confirm payment, and any remaining quota carries over.",
            "When your quota is used up, you cannot start new paid tasks, but you can still view and export your data. Time spent waiting for outside replies does not use quota.",
            "**Top-ups and separately purchased credits are valid for 12 months: money added to your account, and credits bought separately from a plan, are valid for 12 months from the day they are credited. Whatever is left unused when they expire lapses and is withdrawn. It can no longer be used and is not refunded.** We show the validity period clearly before you buy. Usage comes out of your plan\u2019s quota for the current period first, then out of separately purchased credits, earliest expiry first. The expiry date of each purchase is shown on the Subscription and usage page, and we remind you by in-app notice and email 30 days and 7 days before it. Free or compensation credits are valid for the period stated when they are granted, or 12 months if none is stated.",
            "When a subscription ends, new paid operations such as the Agent stop working, your data stays, and you can view and export it.",
            "**Refunds: once a subscription has started, fees paid are generally not refundable, unless the law provides otherwise.** If you cannot use the service normally because of us, we will, at your choice, extend your subscription by the time affected or refund the unused period pro rata.",
            "If you need an invoice, contact us.",
          ],
        },
      ],
    },
    {
      h2: "How you may use the service",
      body: [
        "You must comply with laws and regulations, respect public morality and not harm the lawful rights of others.",
        { h3: "Candidates’ and other people’s information" },
        "**For the personal information of candidates, contacts and other people that you upload, enter, look up and use in HunterBuddy, you decide the purpose and method of processing, and you are its personal information handler.** You must comply with the Personal Information Protection Law and other laws and regulations, including:",
        {
          list: [
            "Having a lawful basis, such as the person’s consent, or processing information they have made public within a reasonable scope.",
            "Informing the person as the law requires, and answering their requests to access, correct or delete their information.",
            "Stopping processing of information a person has made public when they expressly refuse it.",
            "**Not uploading sensitive personal information unrelated to recruiting**, such as ID numbers, health, religious beliefs or bank accounts. Where processing it is truly necessary, obtaining the person’s separate consent first. Not uploading information about children under 14.",
          ],
        },
        "The Data processing agreement sets out both sides’ rights and obligations here. If your business needs a human resources service license or other qualification by law, you must obtain it and operate within it.",
        { h3: "What you must not do" },
        {
          list: [
            "Treat candidates unlawfully or unreasonably differently on grounds such as ethnicity, race, sex, religious belief, disability, health, marital or childbearing status, household registration or age.",
            "Carry out background checks without the person’s consent, or follow or locate a particular person, or pry into private life unrelated to work.",
            "Sell or unlawfully provide personal information, or use it for fraud or harassment, or to send commercial emails people have not agreed to receive.",
            "Upload or generate unlawful content, or content that infringes others’ intellectual property, trade secrets, reputation, privacy or other lawful rights.",
            "Harvest data from the service with crawlers or scripts, reverse engineer, crack or interfere with the service, or get around quota or security measures.",
            "Use the service or its output to build a product that competes with HunterBuddy, or to train other models.",
            "Lend or resell your account or the service.",
          ],
        },
        "If you break these rules, we may, depending on the case, warn you, limit features, or suspend or end the service, and report to the authorities as the law requires. You are liable as the law provides for losses you cause us or others.",
      ],
    },
    {
      h2: "AI-generated content",
      body: [
        { h3: "Check before you rely on it" },
        "HunterBuddy’s results are produced by models and programs from the material you provide and from public information, **and may be incomplete, out of date or wrong. A match score is not a probability of being hired, and identity judgments and inferred relationships can be mistaken. You must check results before you use them, and you are responsible for the decisions you make based on them.**",
        { h3: "How we label it" },
        {
          list: [
            "**In the interface**: content generated or inferred by AI is shown with text labels such as AI-generated, Inferred or To be confirmed, with the sources it relies on and when it was generated, and apart from verified facts and what you entered yourself.",
            "**In generated files**: reports, interview materials and other files HunterBuddy generates state that they were generated by HunterBuddy with AI, and carry an implicit label in their metadata.",
          ],
        },
        "We do not provide generated content with the labels removed. **When you publish generated content or give it to others, you must say that it was generated by AI, and you must not delete, alter, forge or hide the labels.**",
        { h3: "Rights in content" },
        "To the extent the law allows, what you input and the results generated for you belong to you and are yours to use. You authorize us to process them as far as needed to provide the service. **We never use them to train models.** Generated content may resemble other people’s content, so take care not to infringe anyone’s rights when you use it.",
        { h3: "Unlawful content" },
        "If we find unlawful content, we stop generating it, stop transmitting it, remove it, and report it to the authorities as the law requires.",
      ],
    },
    {
      h2: "Data",
      body: [
        "How we handle your personal information is set out in the Privacy policy. Personal information about candidates and other people that you entrust to us is covered by the Data processing agreement.",
        {
          list: [
            "**Your data is yours.** You can view and export it at any time. What you delete goes to the recycle bin and is permanently deleted after 30 days.",
            "Deleting a workspace: after you request deletion there is a 30-day recovery period, during which you can contact us to restore it. After that it is permanently deleted and cannot be restored.",
            "If the service ends, we give you at least 30 days to export your data, then delete it.",
          ],
        },
      ],
    },
    {
      h2: "Intellectual property",
      body: [
        "The intellectual property in HunterBuddy’s software, interface, text, graphics, trademarks and brand, and in material we provide, belongs to Boseek or the relevant rights holders. You may not copy, modify, distribute or commercially use them without permission.",
        "You keep your rights in what you upload, and you must make sure you are entitled to upload and use it.",
      ],
    },
    {
      h2: "Changes, interruptions and ending the service",
      body: [
        {
          list: [
            "Maintenance and upgrades may require the service to pause. We will give notice in advance where we can.",
            "If the service is interrupted for reasons we are not responsible for, such as force majeure, telecom or third-party failures or cyberattacks, we will restore it as soon as possible.",
            "If you break these terms, we may limit or end the service. Except in an emergency, we will tell you first and give you a chance to put things right.",
            "You can stop using the service and close your account at any time.",
            "If we decide to stop providing HunterBuddy, we will announce it 30 days in advance, refund fees paid for any unused period, and give you time to export your data.",
          ],
        },
      ],
    },
    {
      h2: "Limits of liability",
      body: [
        "**HunterBuddy is provided as it is. We do our best to keep the service stable and its results grounded in evidence, but we do not guarantee that you will find the right candidate, fill a role or reach your business goals, or that public sources are complete, accurate or current.**",
        "**Disputes and claims arising from your processing of other people’s personal information, your emails or your use of generated content in breach of the law or these terms are your responsibility. If we incur liability or losses because of them, you must compensate us.**",
        "**To the extent the law allows, our liability to you is limited to the fees you actually paid for HunterBuddy in the 12 months before the loss occurred. During a free trial, it is limited to the minimum the law allows. We are not liable for indirect losses or loss of expected profits.**",
        "**These limits do not apply to property losses caused by our intent or gross negligence, or to personal injury, and they do not exclude the rights you have as a consumer under the law.**",
      ],
    },
    {
      h2: "Complaints and reports",
      body: [
        "You can email hello@boseekai.com to complain or report anything, including unlawful content, infringing content and problems with the service. For personal information, you can also write to privacy@boseekai.com.",
        "How we handle it: we confirm receipt, look into it, take action, and tell you the outcome within 15 working days.",
      ],
    },
    {
      h2: "Changes to these terms",
      body: [
        "We may change these terms when laws or the service change, and publish the new version on this page. **For changes that significantly affect you, we will tell you at least 7 days before they take effect, by in-app notice, email or a notice on the website.** If you do not agree, you can stop using the service and close your account before they take effect. If you keep using the service after they take effect, you accept the changed terms.",
      ],
    },
    {
      h2: "Governing law and disputes",
      body: [
        "**These terms are governed by the law of the People’s Republic of China. For the purpose of these terms, that excludes the law of the Hong Kong and Macao Special Administrative Regions and of Taiwan.**",
        "**Any dispute arising from these terms will first be settled through friendly negotiation. If that fails, either party may bring a lawsuit in the people’s court with jurisdiction over the place where Boseek is domiciled.**",
      ],
    },
    {
      h2: "Other terms",
      body: [
        {
          list: [
            "If any part of these terms is found invalid, the rest remains in force.",
            "These terms exist in Chinese and English. If they differ, the Chinese version prevails.",
            "Contact us: hello@boseekai.com. Personal information: privacy@boseekai.com.",
          ],
        },
      ],
    },
  ],
};

const dpa = {
  slug: "dpa",
  name: "Data processing agreement",
  title: "Data processing agreement | HunterBuddy",
  description:
    "The data processing agreement for HunterBuddy users who entrust Beijing Boseek Intelligent Technology Co., Ltd. with the personal information of candidates, contacts and other people: roles, purpose, duration, methods, types of information, safeguards, sub-processing, security incidents and deletion.",
  lead: "This agreement sets out the rights and obligations of you, the HunterBuddy user, and Beijing Boseek Intelligent Technology Co., Ltd. (“Boseek”, “we”) when you entrust us with processing other people’s personal information in your workspace. It forms part of the Terms of service and takes effect when you accept them.",
  keys: [
    "You decide the purpose and method of processing. **You are the personal information handler and Boseek processes on your behalf.**",
    "We process only on your instructions and only to provide HunterBuddy to you. **Nothing is used for training, nothing leaves China, and nothing is given to other users.**",
    "Every type of sub-processor we use is listed here, and we tell you 15 days before adding or changing one.",
    "If a security incident happens, we notify you within 24 hours of confirming it.",
    "When the agreement ends, we delete the entrusted personal information and keep none of it.",
  ],
  sections: [
    {
      h2: "Definitions and scope",
      body: [
        "“Entrusted personal information” means personal information about natural persons, such as candidates, people of interest, client contacts, paper authors, patent inventors and email correspondents, that you upload, enter or import into your HunterBuddy workspace, or instruct HunterBuddy to look up, generate and save.",
        "Your own account information is outside this agreement and is handled under the Privacy policy.",
        "This agreement is made under Article 21 of the Personal Information Protection Law, Article 12 of the Regulations on Network Data Security Management and other provisions. Anything it does not cover is governed by the Terms of service.",
      ],
    },
    {
      h2: "Roles",
      body: [
        {
          list: [
            "**You decide the purpose and method of processing**, for example which role to search for, what material to upload, whom to keep and whether to make contact. You are the personal information handler of the entrusted personal information.",
            "**Boseek processes it on your behalf**, as this agreement and your instructions provide, and never beyond the agreed purpose, method and scope.",
            "Your instructions are the actions and settings you make through the service, such as starting tasks, confirming what is saved, setting recurring plans and authorization modes, and anything both sides agree in writing.",
            "If we believe an instruction breaks the law, we will tell you and may pause carrying it out.",
          ],
        },
      ],
    },
    {
      h2: "Purpose",
      body: [
        "We process entrusted personal information only to provide HunterBuddy to you, including to:",
        {
          list: [
            "Find people in your material and in public information for your tasks.",
            "Bring records of the same person together, check for and merge duplicates, and complete records.",
            "Match candidates to roles, score the match and explain why.",
            "Map org charts, relationships between people and introduction paths.",
            "Draft summaries, reports, interview materials and emails, and translate.",
            "Check, on the recurring plans you set, for changes in the public information of people you follow, and raise alerts for you to confirm.",
            "Send emails after you confirm each one, and receive the replies.",
            "Store, export and delete records.",
          ],
        },
        "**We never process this information for our own purposes, use it for marketing, profiling or model training, or use it in other users’ tasks.** To keep the service running securely and count usage, we process only de-identified run information that contains no business content.",
      ],
    },
    {
      h2: "Duration",
      body: [
        "From when you start using HunterBuddy until this agreement ends, plus the deletion period in section 11.",
        "What you delete goes to the recycle bin and is permanently deleted after 30 days, together with its files. At that point that person’s personal information is also cleared from version history and task records, leaving only a note that the record was deleted.",
      ],
    },
    {
      h2: "Methods",
      body: [
        "Processing consists of collecting, storing, parsing (resumes, files, images and audio), analyzing and comparing (bringing identities together, checking duplicates, matching, mapping relationships), generating, sending emails once you confirm them, exporting and deleting.",
        "When looking up public information, we access only public web pages, papers, patents and open-source projects that can be read without signing in, limit how often we access them, do not get around access restrictions and do not disrupt websites. **We never sign in to or operate recruiting or social platforms that require a login.**",
        "Automated processing such as identity judgments and matching follows the authorization mode you choose, keeps its evidence and can be undone.",
      ],
    },
    {
      h2: "Types of personal information",
      body: [
        {
          table: {
            head: ["Category", "What it includes"],
            rows: [
              ["Identity", "Name, aliases and names in other languages, avatar"],
              ["Career", "Current and past companies, departments, titles, levels and dates, work and project history, skills, industry"],
              ["Education", "Schools, fields of study, degrees and dates"],
              ["Public work", "Papers, patents, open-source projects, and co-author and co-inventor relationships"],
              ["Contact details", "Mobile numbers, emails, links to public profiles"],
              ["Basic details", "City, and where the material includes them, year of birth and sex"],
              ["Job search", "Job-seeking status, preferred location, salary expectation, availability"],
              ["Your work records", "Notes, assessments, communication records, interview arrangements and feedback, emails, match scores and reasons, stage in a role’s process"],
              ["Relationships", "Colleague, reporting, collaboration and other relationships, and introduction paths"],
              ["Files", "Resumes, portfolios, certificates, recommendation reports and other originals, and the text parsed from them"],
            ],
          },
        },
        "**HunterBuddy is not designed to process sensitive personal information.** It does not extract ID numbers, health, religious beliefs, biometric data, financial accounts, location tracks and the like into structured data, and it runs no face or voiceprint recognition. Resumes and other files may contain such information. **You should avoid uploading it, and where processing it is truly necessary, you must first obtain the person’s separate consent. You must not upload personal information about children under 14.**",
      ],
    },
    {
      h2: "Your obligations",
      body: [
        {
          list: [
            "Make sure processing has a lawful basis, such as the person’s consent or processing public information within a reasonable scope, and inform the person as the law requires.",
            "Make sure the material you provide was obtained lawfully, for example by following a platform’s rules and the scope of the person’s authorization when you download a resume from it.",
            "Stop processing information a person has made public when they expressly refuse it, and delete it from HunterBuddy.",
            "Answer people’s requests to access, correct or delete their information. We will help you.",
            "Have a person review AI results, and do not make decisions that significantly affect someone’s rights on automated results alone.",
            "Carry out any personal information protection impact assessment the law requires, for example for entrusted processing or automated decision-making. We will provide the information you need.",
          ],
        },
      ],
    },
    {
      h2: "Boseek’s obligations",
      body: [
        {
          list: [
            "Process as this agreement and your instructions provide, and never beyond the agreed purpose, method and scope.",
            "**Never use it to train or fine-tune any model.**",
            "**Store and process it in the People’s Republic of China, and never provide it outside China.**",
            "**Never provide it to other users or third parties, and never sell it**, unless laws or administrative regulations require otherwise.",
            "Keep workspaces isolated. Operations staff cannot see your business content unless you send a diagnostic package, you give explicit permission, or it is necessary to handle a complaint or illegal content as the law requires.",
            "Protect the information with encryption, access control, auditing and other technical and organizational measures. Everyone with access is bound by confidentiality.",
            "Help you meet your personal information protection obligations, including answering individuals’ requests, carrying out impact assessments and handling security incidents.",
            "Pass on to you, and help with, any request an individual makes to us directly. Where a person expressly refuses processing of information they have made public, record it and from then on stop automatically collecting or completing their information from public sources for any user.",
            "Accept your supervision. You can ask us to explain our processing, and we will provide the compliance information you need.",
            "Where the authorities lawfully require access to the data, notify you first where the law allows.",
          ],
        },
      ],
    },
    {
      h2: "Sub-processing",
      body: [
        "You agree that we may engage the following types of service providers to process entrusted personal information. All of them are in mainland China. Our agreements require them to protect it at least as strictly as this agreement does, and we supervise them.",
        {
          table: {
            head: ["Provider", "What it processes", "Purpose"],
            rows: [
              ["Cloud provider", "The stored data", "Servers, databases, file storage and backups"],
              ["Large-model provider", "The excerpts a task needs", "Understanding, parsing, analyzing, generating and translating"],
              ["Public search service", "Search terms, which may include names, companies and titles", "Searching public web pages, papers and patents"],
            ],
          },
        },
        "We will publish any new or changed type of provider on this page and tell you 15 days before it takes effect. If you do not agree, you can stop using the service, export your data and close your account before then.",
        "Once you connect a sending mailbox, emails are sent and received through the mailbox provider you chose. That is not sub-processing by us.",
      ],
    },
    {
      h2: "Security incidents",
      body: [
        "If entrusted personal information is, or may be, leaked, altered or lost, we will act immediately to contain it **and notify you within 24 hours of confirming it**, stating the types of information involved, the cause and possible harm, what we have done, what individuals can do to reduce the harm, and our contact person. We will help you notify the people concerned and report to the authorities as the law requires.",
      ],
    },
    {
      h2: "Deletion when the agreement ends",
      body: [
        "This agreement ends when the Terms of service end, when you close your account or when you delete your workspace. Before then you can export your data. If we decide to stop providing the service, we will tell you 30 days in advance.",
        "**When the agreement ends, we delete the entrusted personal information and keep none of it.** For a deleted workspace, deletion follows the 30-day recovery period. For a closed account, deletion happens within 15 working days. Copies in backups are cleared on the rolling backup cycle. If a retention period set by law or administrative regulation has not ended, or deletion is technically difficult, we only store and protect the information and do not otherwise process it.",
      ],
    },
    {
      h2: "Liability",
      body: [
        "Each side is liable for losses caused by its own breach of this agreement or the law. Losses caused by your unlawful instructions or material are your responsibility. Other questions of liability are governed by the Terms of service.",
      ],
    },
    {
      h2: "Other terms",
      body: [
        {
          list: [
            "Where this agreement and the Terms of service differ on personal information protection, this agreement prevails.",
            "Organizations that need a separately signed written data processing agreement can contact us.",
            "This agreement exists in Chinese and English. If they differ, the Chinese version prevails.",
            "Contact us: privacy@boseekai.com.",
          ],
        },
      ],
    },
  ],
};

export const LEGAL_EN = [privacy, terms, dpa];
