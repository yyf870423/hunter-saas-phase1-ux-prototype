(() => {
  const copy = window.FinesseResearchStoryData;
  if (!copy?.phases?.length) return;
  const photography = [
    {
      src: "assets/research-chapters/research-chapter-evidence-20261008.webp",
      alt: "研究者用蓝色笔交叉核对带来源标签的资料与笔记",
      position: "78% 50%",
    },
    {
      src: "assets/research-chapters/research-chapter-gaps-20261008.webp",
      alt: "猎头对照来源资料，指向研究板上尚待补充的位置",
      position: "77% 50%",
    },
    {
      src: "assets/research-chapters/research-chapter-decision-20261008.webp",
      alt: "猎头审阅选定的资料，在笔记本中决定下一步，手机尚未使用",
      position: "78% 50%",
    },
  ];
  window.FinesseResearchChaptersData = {
    title: copy.title,
    introduction: copy.introduction,
    chapters: copy.phases.map((phase, index) => ({
      label: phase.label,
      title: phase.title,
      titleLines: phase.titleLines,
      copy: phase.copy,
      photo: photography[index],
    })),
  };
})();
