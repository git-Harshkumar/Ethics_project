export function buildReportCsv(run) {
  const lines = [
    'AI Fairness Audit Report',
    `Timestamp,${run.timestamp}`,
    '',
    'Cutoffs',
    `Alpha,${run.cutoffs.alpha}`,
    `Beta,${run.cutoffs.beta}`,
    '',
    'Selection Rates',
    `Alpha,${(run.rates.Alpha * 100).toFixed(1)}%`,
    `Beta,${(run.rates.Beta * 100).toFixed(1)}%`,
    '',
    'Metrics',
    `Demographic Parity Gap,${(run.parityGap * 100).toFixed(1)}%`,
    `Disparate Impact Ratio,${run.dir.toFixed(4)}`,
    `EEOC Four-Fifths,${run.eeoc}`,
    `Equal Opportunity Gap (TPR),${(run.tprGap * 100).toFixed(1)}%`,
    `Risk Score,${run.riskScore}/100`,
    '',
    'Rescued Candidates',
    `Count,${run.rescued}`,
    '',
    'Applicant Details',
    'ID,Name,Group,Score,Cutoff,Selected,Qualified'
  ];
  
  run.details.forEach(d => {
    lines.push(`${d.id},${d.name},${d.group},${d.score},${d.cutoff},${d.selected},${d.qualified}`);
  });
  
  return lines.join('\n');
}