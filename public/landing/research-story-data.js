(() => {
  const work = window.FinesseHomepageData?.works.find(
    (item) => item.id === "search",
  );
  if (!work?.rows[0]) return;

  window.FinesseResearchStoryData = {
    title: ["看得更清楚，", "走得更从容。"],
    introduction: [
      "不只看到结果，也看清依据与缺口。",
      "HunterBuddy 整理信息，关键判断和对外沟通仍由你掌握。",
    ],
    context: work.context,
    person: work.rows[0],
    evidence: work.evidence,
    gaps: [
      { title: "实际管理范围", state: "待了解" },
      { title: "身份与当前任职", state: "待核实" },
      { title: "本人求职意向", state: "待确认" },
    ],
    questions: [
      "实际负责哪些项目与团队？",
      "当前任职与项目职责是否准确？",
      "本人求职意向及联系许可是否已确认？",
    ],
    phases: [
      {
        label: "查看依据",
        detail: "资料来源与匹配理由",
        title: "给出结论，也保留依据。",
        titleLines: ["给出结论，", "也保留依据。"],
        copy: "候选人的经历、岗位要求和公司变化，与对应来源一起呈现。看清哪里匹配、为什么值得关注，不必只凭一份名单做判断。",
      },
      {
        label: "看清缺口",
        detail: "已有依据与待确认事项",
        title: "标明缺口，不把推测当事实。",
        titleLines: ["标明缺口，", "不把推测当事实。"],
        copy: "身份、任职、管理范围和求职意向，分别标明依据与缺口。暂时没有的信息保持待确认，让你知道还需要问什么。",
      },
      {
        label: "决定推进",
        detail: "联系时机与推荐判断",
        title: "找谁、何时联系，由你决定。",
        titleLines: ["找谁、何时联系，", "由你决定。"],
        copy: "哪些人值得联系、哪些公司值得跟进、是否对外推荐，由你决定。研究结果为判断提供支持，不替你做承诺。",
      },
    ],
  };
})();
