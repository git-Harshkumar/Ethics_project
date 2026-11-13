export function rescuedCandidates(before, after) {
  const beforeRejectedQualified = before.filter(a => a.qualified && !a.selected);
  const afterSelected = new Set(after.filter(a => a.selected).map(a => a.id));
  return beforeRejectedQualified.filter(a => afterSelected.has(a.id)).length;
}