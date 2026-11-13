import { loadApplicants } from './loadApplicants.js';
import { applyRule } from './applyRule.js';
import { selectionRates } from './selectionRates.js';
import { demographicParityGap } from './demographicParityGap.js';
import { disparateImpactRatio } from './disparateImpactRatio.js';
import { fourFifthsCheck } from './fourFifthsCheck.js';
import { equalOpportunityGap } from './equalOpportunityGap.js';
import { computeRiskScore } from './computeRiskScore.js';
import { mitigateRule } from './mitigateRule.js';
import { rescuedCandidates } from './rescuedCandidates.js';
import { explainDecision } from './explainDecision.js';
import { appendAuditLog, getAuditLog } from './auditLog.js';
import { buildReportCsv } from './buildReportCsv.js';

export const ruleMap = [
  {
    function: 'loadApplicants()',
    principle: 'Privacy',
    rule: 'No real personal data',
    description: 'Returns synthetic fixture of 100 applicants with no real personal data'
  },
  {
    function: 'applyRule(applicants, cutoffs)',
    principle: 'Transparency',
    rule: 'Thresholds visible and editable',
    description: 'Marks selected/rejected per group cutoff; cutoffs are explicit parameters'
  },
  {
    function: 'selectionRates(results)',
    principle: 'Fairness',
    rule: 'Demographic parity',
    description: 'Computes selection rate per group'
  },
  {
    function: 'demographicParityGap(rates)',
    principle: 'Fairness',
    rule: 'Demographic parity',
    description: 'Absolute difference in selection rates between groups'
  },
  {
    function: 'disparateImpactRatio(rates)',
    principle: 'Fairness',
    rule: 'EEOC four-fifths rule',
    description: 'Ratio of lowest to highest selection rate'
  },
  {
    function: 'fourFifthsCheck(dir)',
    principle: 'Accountability',
    rule: 'US EEOC 29 CFR 1607.4D',
    description: 'PASS if DIR >= 0.80 else FAIL'
  },
  {
    function: 'equalOpportunityGap(results)',
    principle: 'Fairness',
    rule: 'Equal opportunity',
    description: 'Difference in true positive rate among qualified applicants'
  },
  {
    function: 'computeRiskScore(metrics)',
    principle: 'Accountability',
    rule: 'Risk classification',
    description: '0-100 weighted score from DIR shortfall, parity gap, TPR gap'
  },
  {
    function: 'mitigateRule(cutoffs)',
    principle: 'Non-maleficence',
    rule: 'Remove disparate treatment',
    description: 'Returns single unified cutoff (minimum of both)'
  },
  {
    function: 'rescuedCandidates(before, after)',
    principle: 'Non-maleficence',
    rule: 'Merit restored',
    description: 'Count of qualified people rejected before and selected after mitigation'
  },
  {
    function: 'explainDecision(applicant, cutoffs)',
    principle: 'Transparency',
    rule: 'Right to explanation (NYC LL144, EU AI Act)',
    description: 'Returns score, required cutoff, gap in points, plain-English reason'
  },
  {
    function: 'appendAuditLog(run) / getAuditLog()',
    principle: 'Continuous auditing',
    rule: 'Ongoing bias audits',
    description: 'Timestamped record of every audit run, rule and metrics'
  },
  {
    function: 'buildReportCsv(run)',
    principle: 'Accountability',
    rule: 'Evidence for regulators',
    description: 'Downloadable audit report with all metrics and applicant details'
  }
];

export const functions = {
  loadApplicants,
  applyRule,
  selectionRates,
  demographicParityGap,
  disparateImpactRatio,
  fourFifthsCheck,
  equalOpportunityGap,
  computeRiskScore,
  mitigateRule,
  rescuedCandidates,
  explainDecision,
  appendAuditLog,
  getAuditLog,
  buildReportCsv
};