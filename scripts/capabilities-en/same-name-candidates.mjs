// scripts/capabilities-en/same-name-candidates.mjs · Capability 03: identity checks
export default {
  slug: "same-name-candidates",
  no: "03",
  group: "Know",
  name: "Identity checks",
  title: "Identity checks: from one ID to one real person | HunterBuddy",
  description:
    "Identity checks work back from an alias, a handle or an English name to a real person, ruling out namesakes by cross-checking sources, never by guessing from pinyin.",
  kicker: "Capability 03 · Know",
  h1: "Identity checks: from one ID to one real person",
  definition:
    "Identity checks are a capability that works back from an alias, an English name, a community handle or a platform username to a person’s real name and identity. They rule out namesakes by cross-checking several sources, and never guess Chinese characters from pinyin.",
  intro: [
    "Senior technical people often appear under an English name, an alias or a GitHub ID. Without the real name, none of the papers, patents, career history or colleague connections that follow can be linked up. HunterBuddy turns this step into reasoning you can check, not a single guess.",
  ],
  teaser: "All you have is an alias and a GitHub ID. Working out who the person really is can take half a day of guesswork.",
  pains: {
    h2: "Why one name is so hard to confirm",
    intro: [],
    items: [
      ["One person, three or four identities", "A Maimai nickname, a GitHub ID, an English name, a Chinese name and platform usernames all differ. The material is spread across platforms, and duplicate records keep piling up."],
      ["Pinyin fits many characters, and one wrong guess finds the wrong person", "“Li Wei” could be any of several Chinese names. Guessing characters from pinyin has an error rate no one can control, and a wrong guess raises no alarm."],
      ["Too many namesakes, and a shared name isn’t a shared person", "One Chinese name may belong to two engineers at one company and a researcher at another. Merge on name alone, and two people become one profile."],
      ["The person behind the alias is often the one you want", "The more senior the engineer, the more likely they go by an English name or a community ID. These people have the thinnest public records, and they’re exactly the ones most worth finding."],
      ["Checking platform by platform is costly and never reused", "Confirming one person can mean reading papers, searching patents, looking at GitHub commits and comparing education. Once it’s done, the next person means starting over."],
      ["Getting the wrong person costs more than not finding them", "Reaching out to the wrong person costs more than time. It costs your standing in a small professional circle."],
    ],
  },
  how: {
    h2: "How HunterBuddy works out who someone is",
    intro: [],
    items: [
      ["Anchors first, the name second", "It compares anchors such as education, work history, timeline, technical direction and collaborators to judge whether several records belong to the same person. The more anchors, the firmer the conclusion."],
      ["The name is the result, the evidence is the basis", "Every identity finding names its sources: which paper, which stint, which public talk. You can click through to the original material."],
      ["Namesakes ruled out before anything is confirmed", "It compares organizations, dates, research directions and collaboration networks to tell different people with the same name apart. Where a namesake can’t be ruled out, the records are marked “To confirm” and kept apart."],
      ["No guessing characters from pinyin", "It never infers a Chinese name from pinyin. Without character-by-character evidence, it keeps the name as found and says what evidence is still missing."],
      ["From one person to a circle of people", "Once an identity is confirmed, it follows co-authored papers, shared patents, the same team and the same projects to find related candidates and possible ways in."],
      ["Every check on record, ready to reuse", "Each identity check records which anchors and sources were used and what is still to confirm. When the same person turns up again, there’s no need to start from scratch."],
    ],
  },
  boundary:
    "HunterBuddy never invents identities, and never writes “possibly” as “confirmed”. It shows how strong the evidence is, and you decide whether it’s good enough to act on.",
  next: "org-chart",
};
