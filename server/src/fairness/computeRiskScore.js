export function computeRiskScore(metrics) {
  const { dir, parityGap, tprGap } = metrics;
  const dirShortfall = Math.max(0, 0.80 - dir);
  const score = Math.round(
    50 * dirShortfall / 0.80 +
    30 * parityGap +
    20 * tprGap
  );
  return Math.min(100, Math.max(0, score));
}