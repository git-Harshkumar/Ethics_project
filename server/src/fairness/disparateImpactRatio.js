export function disparateImpactRatio(rates) {
  const alpha = rates.Alpha || 0;
  const beta = rates.Beta || 0;
  if (alpha === 0 && beta === 0) return 1;
  const highest = Math.max(alpha, beta);
  const lowest = Math.min(alpha, beta);
  return highest === 0 ? 0 : lowest / highest;
}