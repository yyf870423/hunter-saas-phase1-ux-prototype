// The sourcing review pre-selects nobody (decision 7: no score tiers); tests tick the
// top-scored rows themselves, the way a hunter would after reading scores and evidence.
export async function selectTopReviewCandidates(page, count = 5) {
  const rows = page.locator(".s2-candidate-table > button");
  for (let index = 0; index < count; index += 1)
    await rows.nth(index).locator('input[type="checkbox"]').check();
}
