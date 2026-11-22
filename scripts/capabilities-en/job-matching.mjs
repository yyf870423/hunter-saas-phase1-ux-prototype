// scripts/capabilities-en/job-matching.mjs · Capability 05: two-way job matching
export default {
  slug: "job-matching",
  no: "05",
  group: "Find the right person",
  name: "Two-way job matching",
  title: "Two-way job matching: CVs find roles, roles find CVs | HunterBuddy",
  description:
    "Two-way job matching turns a role into conditions you can judge and checks each one against the candidate’s evidence. Give it a CV, and it finds better-fitting roles too.",
  kicker: "Capability 05 · Find the right person",
  h1: "Two-way job matching: CVs find roles, roles find CVs",
  definition:
    "Two-way job matching is a capability that breaks a role’s requirements into conditions that can be judged, then checks each one against the candidate’s evidence. It also works in reverse: give it one CV and it finds better-fitting roles in your database.",
  intro: [
    "The bigger the CV database, the more you rely on memory and keywords. And the more you rely on keywords, the more people you miss who never described themselves that way. HunterBuddy works out “why this fits” piece by piece, and spells out “why it doesn’t”.",
  ],
  teaser: "Thousands of CVs sit in your database, and the best fit often never turns up in a search.",
  pains: {
    h2: "Why more CVs make matching harder",
    intro: [],
    items: [
      ["The right person is already in your database", "The bigger the database, the more you rely on memory and keywords. Someone you spoke with but set aside is easy to miss again when a new role comes in."],
      ["A lot of “AI matching” can’t be trusted", "Traditional systems mostly run keyword searches, and some AI features just find similar words. You get plenty of results, few you can act on, and you still have to reread every CV."],
      ["Terms that look alike, candidates who aren’t", "Large models and AI infrastructure, algorithm research and engineering delivery, perception algorithms and robot control: they look related, but the depth and the delivery context they demand are very different."],
      ["Several roles at once, CVs easily mismatched", "A CV may suit another role in your database, but if it doesn’t fit the current one, it gets skipped. With several searches running, every CV has to be compared again and again."],
      ["Hard to read a technical CV, harder to write the case", "Most HR and headhunters don’t come from a technical background. Faced with complex projects and tech stacks, it’s hard to say what the strengths and risks are, or how to answer a probing question, and the recommendation report turns into a CV summary."],
      ["Private CVs stuck in Excel, notes going unused", "The bigger the spreadsheet, the slower it opens and the harder it is to search. Personal details, conversation records and notes sit in different cells, and past material never feeds the next match."],
    ],
  },
  how: {
    h2: "How HunterBuddy judges a match",
    intro: [
      "A match shouldn’t be an unexplained total score. HunterBuddy splits the judgment into four layers: role requirements, candidate evidence, role calibration and the recommendation.",
    ],
    items: [
      ["First, turn the role into conditions that can actually be judged", "It breaks the JD into must-haves, core skills, industry experience, project responsibilities and nice-to-haves, and separates hard conditions, flexible conditions and points to confirm. What the JD says and what the client really insists on are recorded separately."],
      ["Beyond keywords: what the person has actually done", "It focuses on the candidate’s most recent, sustained and leading responsibilities: their role on projects, the scale, the results and the tech stack. “Not on the CV” is never treated as “can’t do it”. Only a clear conflict is marked as not supported."],
      ["Ability first, without being swayed by titles or company names", "It rates core skills, domain experience, project depth, how similar the responsibilities are and how transferable they are, each on its own. A “lead” at a small company may manage three people, while a senior engineer at a large company may already run a team."],
      ["Level, years and education calibrated separately", "Once ability is matched, it checks whether the candidate’s real level, career track and kind of work fit the role. Years of experience and education are scored on their own, never double-counted against ability."],
      ["A recommendation level, reasons, risks and points to verify", "You get more than a score. It explains why it recommends someone, which strengths are clear, which experience is only transferable, the main risks, and what to verify in the interview."],
      ["CVs, notes and conversations turned into reusable assets", "A candidate’s CV, project history, conversation records and past notes go into one profile. When their details change, you update one place, and the next match uses it directly."],
    ],
  },
  boundary:
    "HunterBuddy makes clear what the role needs, what the candidate has done, why they match and what the risks are. Whether to recommend them, whether to reach out and how to present them to the client are still your calls.",
  next: "same-name-candidates",
};
