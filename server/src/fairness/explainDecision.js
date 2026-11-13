export function explainDecision(applicant, cutoffs) {
  const cutoff = applicant.group === 'Alpha' ? cutoffs.alpha : cutoffs.beta;
  const gap = cutoff - applicant.score;
  const selected = applicant.score >= cutoff;
  const reason = selected
    ? `Score ${applicant.score.toFixed(1)} meets the ${applicant.group} cutoff of ${cutoff}. Selected.`
    : `Score ${applicant.score.toFixed(1)} is ${Math.abs(gap).toFixed(1)} points below the ${applicant.group} cutoff of ${cutoff}. Rejected.`;
  return {
    applicant: applicant.name,
    group: applicant.group,
    score: applicant.score,
    cutoff,
    gap: Math.abs(gap),
    selected,
    reason
  };
}