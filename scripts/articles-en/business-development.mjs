// scripts/articles-en/business-development.mjs · English: business development for headhunters
// Translated from the Chinese page as built (scripts/use-cases/pages.mjs, rewritten in scripts/build-redesign-pages.mjs).
export default {
  slug: "business-development",
  name: "Business development for headhunters",
  title: "Business development for headhunters: funding news to new roles | HunterBuddy",
  description:
    "How do headhunters find clients? HunterBuddy tracks funding news in your sectors and finds the role, the hiring manager and who can introduce you, with sources.",
  kicker: "Use case · Business development",
  h1: ["A funding round", "could be your next mandate."],
  answer:
    "New clients often hide in a piece of news that is easy to miss. HunterBuddy keeps watch on the sectors you follow and, starting from the funding news, finds the new role, a possible hiring manager and a route to an introduction, weighs whether the lead is worth pursuing, and names a source for every finding. Who to contact, and what to say, is up to you.",
  teaser: "From a single funding announcement to the new role and its hiring manager.",
  keywords: [
    "business development for headhunters",
    "business development for recruiters",
    "how do headhunters find clients",
    "recruitment business development",
    "how to find hiring managers",
    "client research for business development",
  ],
  related: ["org-chart", "finding-candidates", "ai-assistant-for-headhunters"],
  sections: [
    {
      h2: "How do headhunters usually find new clients?",
      body: [
        "For independent headhunters and senior search consultants, new clients rarely come from cold calls. More often, they come from watching a few familiar sectors closely, noticing which companies are expanding, and working their network to reach the person who has the final say. Broadly, it comes down to five steps:",
        {
          steps: [
            [
              "Watch for signals",
              "Funding news, new roles on a company’s careers page, leadership changes, new business lines and new plants can all be signs that a company is about to hire.",
            ],
            [
              "Check they really are hiring",
              "A role on a careers page is not a mandate. First find out whether it is still open, whether the headcount has been approved and why they are hiring now.",
            ],
            [
              "Find the hiring manager",
              "Work out who leads the team, who has the final say, and which part of the process HR owns.",
            ],
            [
              "Find a route to an introduction",
              "Decide whether to go direct or ask for an introduction. Among your long-standing clients, the investors you know and your former colleagues, who knows the hiring manager well enough to put in a word?",
            ],
            [
              "Do your homework before you talk",
              "Learn what the company does and who the team is missing before you reach out. You are more likely to be taken seriously than if you mass-mail a CV.",
            ],
          ],
        },
      ],
    },
    {
      h2: "The hard part isn’t making the call. It’s knowing who to call.",
      body: [
        {
          cards: [
            [
              "Signals are scattered",
              "Funding news is in the media, roles are on careers pages, people moves are on professional networking platforms. It is hard for one person to check them all every day.",
            ],
            [
              "The details don’t line up",
              "The same company goes by different names in different places, and the same person has different titles on different platforms. Reconciling them takes a lot of time.",
            ],
            [
              "The moment is easy to miss",
              "By the time you notice a company is hiring, another consultant may already be in talks with them.",
            ],
            [
              "Research doesn’t stick",
              "The companies and people you looked into last time are scattered across notes and spreadsheets, so next time you start again from scratch.",
            ],
          ],
        },
      ],
    },
    {
      h2: "How does HunterBuddy help with business development?",
      body: [
        "Here again is the Xingchuan Robotics example from our homepage, one step at a time.",
        {
          steps: [
            [
              "Checks your sectors every week",
              "Tell it which sectors and companies you follow, and have it check for you on a schedule, say every Monday at 9 a.m. When a company raises funding, posts a new role on its careers page or has a change of leadership, it lets you know. Duplicates are merged, and when there is nothing new, it leaves you alone.",
              "This Monday, it lets you know that Xingchuan Robotics has just raised a Series B.",
            ],
            [
              "Matches up the news",
              "It reads the funding news alongside the careers page on the company’s website, to confirm both are about the same company and the same event. Every conclusion names its source, so you can click through to the original.",
              "Xingchuan’s careers page has added a Head of Computer Vision role, and both sources line up: the careers page and the funding news.",
            ],
            [
              "Client research: is it worth pursuing?",
              "It puts the funding news, the founding team, the open roles and other business signals side by side to judge whether the need is real, whether they can afford a search fee and whether working together carries any risk, then maps out the decision chain and priorities. Whatever is backed by a source names it. Whatever is not is marked “To confirm”.",
              "Real need and ability to pay are both backed by sources: a fresh Series B and a new role on the careers page. Risk to the relationship is still to confirm: whether they have worked with headhunters before, and who signs off, is not yet clear.",
            ],
            [
              "Finds the hiring manager",
              "It finds the person who leads the team from public information. Anything without a reliable source is marked “To confirm”, and guesses are never passed off as facts.",
              "Qing Xu, the Technical Lead in charge of the vision team, is very likely the hiring manager for this role. Her direct contact details are still to confirm.",
            ],
            [
              "Finds an introduction in your network",
              "It checks your clients and contacts for anyone who knows the hiring manager well enough to put in a word, and lists that route along with the reasons.",
              "Yuan Zhang is a long-standing client of yours and also an investor in Xingchuan. You could ask him for an introduction.",
            ],
          ],
        },
        {
          demo: {
            context: "Every Monday, 09:00 · Sectors you track",
            title: "Xingchuan Robotics · Possible new role",
            caption: "This is what HunterBuddy hands you. Every line names its source, and anything uncertain is flagged separately.",
            items: [
              ["Role found · 2 sources", "New on the careers page: Head of Computer Vision", "The careers page and the funding news agree."],
              ["Client research · Sourced", "Real need, ability to pay", "A fresh Series B and a new role on the careers page. Risk to the relationship: to confirm."],
              ["Possible hiring manager", "Qing Xu · Technical Lead", "Leads the vision team. Direct contact details to confirm."],
              ["Backup · Route to an introduction", "Yuan Zhang → Qing Xu", "A long-standing client of yours, and a Xingchuan investor."],
            ],
          },
        },
      ],
    },
    {
      h2: "What do you get, and what is yours to confirm?",
      body: [
        "A lead on a role that two sources agree on, a person who is very likely the hiring manager, and a backup route to an introduction. Whether to go direct or ask for an introduction, and what to say, is your call. Only once you have the job description (JD) and have agreed a mandate does it become one of your live searches.",
        "Every company, role and person researched this time is saved, ready to build on when you map the org chart and look for candidates next.",
        {
          list: [
            "Is the role really open? Has the headcount been approved?",
            "Contact Qing Xu directly, or ask Yuan Zhang for an introduction?",
            "Will it be exclusive, and how will you negotiate the fee?",
          ],
        },
        {
          note: "HunterBuddy never contacts anyone on your behalf, and never makes promises for you.",
        },
      ],
    },
  ],
  faq: [
    [
      "Where can headhunters find business development leads?",
      "Funding news, company websites and careers pages, changes in leadership and teams, news of new business lines and new plants, and your own long-standing clients and network. HunterBuddy looks at all of these together and records where every lead came from.",
    ],
    [
      "If a role is on a company’s careers page, can I pitch for the mandate?",
      "Not necessarily. A role on a careers page is only a lead. First confirm whether it is really open, whether the headcount has been approved and who makes the decision. HunterBuddy lists these open questions, but answering them takes a conversation, and that part is yours.",
    ],
    [
      "Will HunterBuddy contact clients for me?",
      "No. It finds the leads, the hiring manager and the route to an introduction, with the reasons and the sources. Who to contact, when to reach out and how to have the conversation are up to you.",
    ],
    [
      "How often does it check my sectors?",
      "You decide, for example once a week. It only alerts you to changes worth your attention, merges duplicates and leaves you alone when there is nothing new.",
    ],
  ],
  faqTitle: ["What people ask", "about business development."],
};
