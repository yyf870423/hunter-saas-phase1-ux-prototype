(() => {
  const page = window.SuperhumanHomepage;
  const root = document.querySelector("#homepage");
  const data = window.FinesseHomepageData;
  const research = window.FinesseResearchStoryData;
  const ledger = window.SuperhumanLedger;
  const trial = window.FinesseTrial;
  if (
    !page ||
    !root ||
    !data ||
    !research ||
    !ledger ||
    !trial ||
    !window.FinesseResearchChapters
  )
    return;
  root.classList.remove("sh-static");
  root.innerHTML = page.render(data, research, ledger, trial);
  page.mount(root, data, research, ledger, trial);
})();
