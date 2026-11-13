export function demographicParityGap(rates) {
  const alpha = rates.Alpha || 0;
  const beta = rates.Beta || 0;
  return Math.abs(alpha - beta);
}