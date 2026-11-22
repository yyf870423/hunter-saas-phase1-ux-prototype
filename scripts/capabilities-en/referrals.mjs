// scripts/capabilities-en/referrals.mjs · Capability 07: referrals
export default {
  slug: "referrals",
  no: "07",
  group: "Keep",
  name: "Referrals",
  title: "Referrals: who is most likely to know them | HunterBuddy",
  description:
    "Referrals connects colleagues, lab mates, co-authors, shared patents and past interactions into a network, then finds and ranks bridges within one to three steps.",
  kicker: "Capability 07 · Keep",
  h1: "Referrals: who is most likely to know them",
  definition:
    "Referrals is a capability that connects colleagues, classmates from the same lab, paper co-authors, shared patents and past interactions into a network. It looks for bridges within one to three steps, and ranks them by relationship strength and how reachable they are.",
  intro: [
    "Who you think of depends on your memory, not on who actually knows the person. Starting from the people you already know and the data you’ve authorized, HunterBuddy shows “might know them” and “will definitely help” separately.",
  ],
  teaser: "Who comes to mind for a referral depends on your memory, not on who really knows the person.",
  pains: {
    h2: "Why referrals always feel like luck",
    intro: [],
    items: [
      ["Who you think of depends on memory", "Consultants can only try to recall former colleagues, lab mates or co-authors. The people who really know the target may never come to mind."],
      ["How close a relationship is comes down to a feeling", "Two people may both be listed as “former colleagues”: one worked on the same team for years, the other just overlapped at the same company. Without evidence, who would make the better introduction is a guess."],
      ["Referrals spend personal credibility", "The person introducing you worries the relationship isn’t close enough, or that the timing is bad, or gets turned down without knowing why."],
      ["Candidates are cautious too", "Candidates will only recommend people who are already looking. They hesitate to pass on high-value people who are happy where they are, in case they get poached or the talks go badly and it reflects on them."],
      ["A name is often only the start", "Many referrals come as a WeChat contact or “you could talk to him”, with no company, team or title. The consultant still has to confirm the identity and fill in the career history from scratch."],
      ["Nothing is kept afterwards", "Who you asked, who agreed to help, who they introduced and how it went are scattered across chat histories. Without looking back, you never learn which kinds of bridges work best."],
    ],
  },
  how: {
    h2: "How HunterBuddy finds a bridge",
    intro: [],
    items: [
      ["Start from who might know them, not from your memory", "It identifies different kinds of relationships in your existing candidates, org charts, past interactions and authorized data, and follows the network to find routes one to three steps long."],
      ["Check how strong a relationship is before calling it close", "It checks whether two people sat at the same level of the organization, then whether their teams, functions and time there overlapped. Having worked at the same company doesn’t automatically make them acquaintances."],
      ["Ranked by “can you reach them, is it worth it, will they help”", "Bridges aren’t ranked by closeness alone. It weighs how reachable they are, their influence in the target team, how strong past collaboration was, whether the relationship is still active and whether there’s a non-compete risk."],
      ["Shorter routes, with the risks spelled out", "Each route says who is best placed to ask, why them, what each step rests on and what still needs confirming."],
      ["A good way to open the conversation", "It suggests lower-pressure ways to ask, giving the other person room to decide before anything moves to a formal introduction. It doesn’t reveal anything about the target that doesn’t need sharing."],
      ["Results go back into the profile, closing the loop", "Each approach records the bridge, the target, the channel, the status and the result. Successes, refusals and no replies all shape the next ranking."],
    ],
  },
  boundary:
    "HunterBuddy never invents relationships, and never reaches out for you. It makes clear who might know them, why to ask that person, how to open, and how it turned out.",
  next: "talent-pool",
};
