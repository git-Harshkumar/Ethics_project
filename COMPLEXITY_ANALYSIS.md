# Complexity Analysis

Time and space complexity for each backend fairness function, where:
- n = number of applicants (100 in fixture)
- g = number of groups (2: Alpha, Beta)
- k = number of audit log entries

| Function | Time Complexity | Space Complexity | Notes |
|----------|----------------|------------------|-------|
| `loadApplicants()` | O(n) | O(n) | Returns copy of fixture array |
| `applyRule(applicants, cutoffs)` | O(n) | O(n) | Single pass, creates new objects |
| `selectionRates(results)` | O(n) | O(g) | Groups by group, counts selections |
| `demographicParityGap(rates)` | O(1) | O(1) | Simple arithmetic on 2 values |
| `disparateImpactRatio(rates)` | O(1) | O(1) | Min/max of 2 values |
| `fourFifthsCheck(dir)` | O(1) | O(1) | Single comparison |
| `equalOpportunityGap(results)` | O(n) | O(g) | Filters qualified, computes TPR per group |
| `computeRiskScore(metrics)` | O(1) | O(1) | Weighted arithmetic |
| `mitigateRule(cutoffs)` | O(1) | O(1) | Min of two numbers |
| `rescuedCandidates(before, after)` | O(n) | O(n) | Set lookup for O(1) membership |
| `explainDecision(applicant, cutoffs)` | O(1) | O(1) | Single applicant, simple math |
| `appendAuditLog(run)` | O(1) amortized | O(k) | Push to array |
| `getAuditLog()` | O(k) | O(k) | Returns reversed copy |
| `buildReportCsv(run)` | O(n) | O(n) | Iterates details for CSV rows |

## Overall Audit Pipeline
- **Time**: O(n) - dominated by `applyRule`, `selectionRates`, `equalOpportunityGap`
- **Space**: O(n) - stores results array and audit log entries

All functions are pure (no side effects except `appendAuditLog`) and use no external dependencies.