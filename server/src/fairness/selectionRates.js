export function selectionRates(results) {
  const groups = { Alpha: [], Beta: [] };
  results.forEach(r => groups[r.group].push(r));
  
  const rates = {};
  Object.entries(groups).forEach(([group, apps]) => {
    const selected = apps.filter(a => a.selected).length;
    rates[group] = apps.length ? selected / apps.length : 0;
  });
  return rates;
}