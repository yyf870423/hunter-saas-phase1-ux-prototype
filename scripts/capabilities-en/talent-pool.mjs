// scripts/capabilities-en/talent-pool.mjs · Capability 08: talent pool
export default {
  slug: "talent-pool",
  no: "08",
  group: "Keep",
  name: "Talent pool",
  title: "Talent pool: one profile per person, kept current | HunterBuddy",
  description:
    "The talent pool merges one person’s identities, career history and conversations into a single profile, de-duplicating automatically and tracking changes on one timeline.",
  kicker: "Capability 08 · Keep",
  h1: "Talent pool: one profile per person, kept current",
  definition:
    "The talent pool is a capability that merges one person’s identities, career history and conversation records from different platforms into a single profile. It de-duplicates automatically, tracks changes, and keeps every conversation on the same timeline.",
  intro: [
    "What makes a talent pool costly isn’t storage. It’s drift. The database holds three CVs and two aliases for the same person, and nobody knows which one is current.",
  ],
  teaser: "The people you spoke with years ago have changed companies and fields, and your database is still stuck on the day they were added.",
  pains: {
    h2: "Why talent pools go stale the more you use them",
    intro: [],
    items: [
      ["One person, several names in the database", "A Maimai nickname, a GitHub ID, an English name and a Chinese name all differ. The material is spread across platforms, there’s no way to tell whether it’s the same person, and duplicate records keep piling up."],
      ["People found at summits, in papers and in communities come with a single clue", "Press coverage and conference speaker lists often give only a name, a company and a field. To judge whether someone is worth pursuing, you still have to fill in their education, projects, papers and contact details."],
      ["The CV hasn’t changed, but the person may have moved", "The record stops on the day it was added. Whether they’re still at the same company, which business unit they’re in and whether their level has changed are hard to track by hand. Recommending from old records means, at best, inaccuracy and, at worst, the wrong person."],
      ["Big news at a company, and nobody in the database is flagged", "Funding, reorganizations, cutbacks and new labs all affect who moves. This information usually stays in the news and never gets connected to the people in your database."],
      ["The most valuable conversation notes sit in Excel, recordings and chats", "What a candidate’s company is really like, how options and bonuses are paid, why they left and their concerns about moving are often the most valuable details, and the hardest to find again."],
    ],
  },
  how: {
    h2: "How HunterBuddy keeps a talent pool running",
    intro: [],
    items: [
      ["One profile per person: identify first, then merge", "From company, education, work history and skills, it judges whether several CVs belong to the same person. It supports merging, splitting and undoing, and keeps the original material and the merge history."],
      ["From a short clue to a profile you can read", "When a summit speaker or a paper author comes with a single line of information, it fills in the profile and turns the additions into suggestions for your review, each with its source. It never overwrites the original material, and conflicts are flagged separately for you to confirm."],
      ["Changes rechecked continuously, without waiting for candidates to update their CVs", "For the candidates, target companies or technical directions you follow, it keeps checking public information and spots changes in company, team and role. Changes are shown as signals to look at. It never infers that someone wants to move."],
      ["Company news linked to the people in your database", "When a target company raises money, cuts staff, reorganizes or changes leaders, it picks out the people and teams involved, matches them against your database and marks them “Worth reviewing”."],
      ["Conversation records kept on one timeline", "After each conversation, the company situation, pay structure, reasons for leaving, preferences and next follow-up date go into the same profile. When the role changes, those records are still there to use."],
    ],
  },
  boundary:
    "HunterBuddy never treats a namesake as the same person, never guesses Chinese names from pinyin, and never reads a public change as a wish to move.",
  next: null,
};
