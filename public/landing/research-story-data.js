(() => {
  const work = window.FinesseHomepageData?.works.find(
    (item) => item.id === "search",
  );
  if (!work?.rows[0]) return;

  window.FinesseResearchStoryData = {
    title: ["理由和来源写在一起，", "拿不准的单独列出来。"],
    introduction: [
      "每个判断都写着从哪来，没查到的不会被当成事实。",
      "HunterBuddy 把资料整理好，联系谁、怎么说，还是由你来定。",
    ],
    context: work.context,
    person: work.rows[0],
    evidence: work.evidence,
    gaps: [
      { title: "实际带多大团队", state: "待了解" },
      { title: "身份和现在的职位", state: "待核实" },
      { title: "本人想不想动", state: "待确认" },
    ],
    questions: [
      "实际带多大团队、负责哪些项目？",
      "现在的职位和负责的项目准确吗？",
      "本人想不想动、能不能联系，问过了吗？",
    ],
    phases: [
      {
        label: "有来源",
        detail: "来源和匹配理由",
        title: "给出结论，也给出来源。",
        titleLines: ["给出结论，", "也给出来源。"],
        copy: "候选人的经历、岗位要求、公司的变化，都和出处放在一起。哪里对得上、为什么值得聊，一眼就能看到，不用只凭一份名单做判断。",
      },
      {
        label: "待确认",
        detail: "已有的依据和待确认的事",
        title: "拿不准的，不当成事实。",
        titleLines: ["拿不准的，", "不当成事实。"],
        copy: "身份、现在的职位、带多大团队、想不想动，每一项都写着依据。没查到的标“待确认”，你知道还要问什么。",
      },
      {
        label: "你来定",
        detail: "什么时候开口、推不推荐",
        title: "联系谁、何时开口，你说了算。",
        titleLines: ["联系谁、何时开口，", "你说了算。"],
        copy: "哪些人值得联系、哪些公司值得跟进、要不要正式推荐，都由你决定。它给你理由，不替你做承诺。",
      },
    ],
  };
})();
