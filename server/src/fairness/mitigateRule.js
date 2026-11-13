export function mitigateRule(cutoffs) {
  const unified = Math.min(cutoffs.alpha, cutoffs.beta);
  return { alpha: unified, beta: unified };
}