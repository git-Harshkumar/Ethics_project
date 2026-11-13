const auditLog = [];

export function appendAuditLog(run) {
  const entry = {
    timestamp: new Date().toISOString(),
    ...run
  };
  auditLog.push(entry);
  return entry;
}

export function getAuditLog() {
  return [...auditLog].reverse();
}