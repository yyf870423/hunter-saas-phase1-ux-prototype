// scripts/capabilities-en/org-chart.mjs · Capability 04: org mapping
export default {
  slug: "org-chart",
  no: "04",
  group: "Know",
  name: "Org mapping",
  title: "Org mapping: from a group of people to an org chart | HunterBuddy",
  description:
    "Org mapping turns public clues into a traceable org chart, separating current core members, dual appointments, joint training and leavers, and checking each lead is still in post.",
  kicker: "Capability 04 · Know",
  h1: "Org mapping: from a group of people to an org chart",
  definition:
    "Org mapping is a capability that turns public clues into a traceable org chart. It separates current core members, people with dual appointments, joint-training students and people who have left, and checks that each lead is still in post.",
  intro: [
    "Talent mapping means piecing things together from company websites and the news, and the finished chart ends up saved in several versions. HunterBuddy turns “search everywhere, assemble by hand, redraw again and again” into “find people automatically, check where they belong, infer the structure, keep reusing it”.",
  ],
  teaser: "Mapping means piecing things together from websites and the news, and the finished chart lives on in several versions.",
  pains: {
    h2: "Why mapping always starts from a blank page",
    intro: [],
    items: [
      ["More opportunities, more mapping", "Since large models and embodied AI took off, there are more roles and even more companies. Professors start companies with their labs, senior people leave big firms, and new entities keep appearing, while a consultant’s time stays the same."],
      ["One technology, spread across several entities", "The group works on it, a business unit works on it, a department works on it, and outside there are incubators and independent labs. In a small company it’s easy to find the right people. In a big one, layer upon layer, it’s easy to put someone in the wrong department."],
      ["One mapping serves one role", "The people and structures you gathered sit on your computer once the search moves on. Pull them together into a company-wide chart, and they don’t fit."],
      ["People keep moving, and upkeep is manual", "Who left and who joined changes every day. A chart finished once starts going out of date the next day."],
      ["Reporting lines are hidden, and they’re what matters", "Technical CVs almost never mention who someone reports to. Without that, you can’t judge the scope of a position or how much room it has to grow."],
      ["Tools keep improving, but they don’t update themselves", "Mind-map tools import easily, but exports are often limited, notes get lost, and some can’t import Excel. Every organizational change means another round of manual checking and redrawing."],
    ],
  },
  how: {
    h2: "How HunterBuddy maps an organization",
    intro: [],
    items: [
      ["First, find the entity really doing the R&D", "It identifies the target organization’s English name, other names, sub-labs and public accounts, and works out which teams are really working on the target direction. The first question it answers is which entity people belong to."],
      ["Find the relevant people in several sources", "It brings together the public web, official websites, news and public talks, papers and patents, and your authorized talent pool. Records of the same person are checked on name, organization, direction and collaboration history before they are merged."],
      ["Where someone belongs comes before where they go on the chart", "Appearing on a paper doesn’t mean someone is still there. A byline at the target organization may belong to a joint-training student, an intern, a visiting scholar or an outside collaborator. It separates these, so past members don’t end up in the current team."],
      ["Likely teams and leads, inferred automatically", "From co-authorship, project collaboration, public titles and seniority, it identifies likely sub-teams and their leads. When no current lead meets the criteria, it says so plainly instead of forcing a name in."],
      ["An org chart with sources and status", "When it’s done, you get a visual org chart, a structured working draft and a member list. Confirmed facts, inferences and gaps are shown separately, so you can see at a glance what’s usable and what still needs asking."],
      ["One mapping, kept as a lasting asset", "The result becomes the baseline for the target company’s talent and organization. The next time you work on a neighboring direction or research a competitor, you build on the same draft."],
    ],
  },
  boundary:
    "HunterBuddy doesn’t produce “official” org charts. What it gives you is an inferred working draft with sources and status, and the final relationships are yours to verify.",
  next: "business-development",
};
