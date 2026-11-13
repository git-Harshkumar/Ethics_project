export function equalOpportunityGap(results) {
  const groups = { Alpha: [], Beta: [] };
  results.forEach(r => groups[r.group].push(r));
  
  const tpr = {};
  Object.entries(groups).forEach(([group, apps]) => {
    const qualified = apps.filter(a => a.qualified);
    const tp = qualified.filter(a => a.selected).length;
    tpr[group] = qualified.length ? tp / qualified.length : 0;
  });
  
  return Math.abs((tpr.Alpha || 0) - (tpr.Beta || 0));
}