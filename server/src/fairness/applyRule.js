export function applyRule(applicants, cutoffs) {
  const { alpha, beta } = cutoffs;
  return applicants.map(app => {
    const cutoff = app.group === 'Alpha' ? alpha : beta;
    const selected = app.score >= cutoff;
    return {
      ...app,
      selected,
      cutoff,
      qualified: app.score >= 70
    };
  });
}