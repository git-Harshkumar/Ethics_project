import express from 'express';
import cors from 'cors';
import { functions, ruleMap } from './fairness/ruleMap.js';
import { loadApplicants } from './fairness/loadApplicants.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

function validateCutoffs(body) {
  const { alpha, beta } = body || {};
  if (typeof alpha !== 'number' || typeof beta !== 'number') {
    return { error: 'Cutoffs alpha and beta must be numbers' };
  }
  if (alpha < 0 || alpha > 100 || beta < 0 || beta > 100) {
    return { error: 'Cutoffs must be between 0 and 100' };
  }
  return { alpha, beta };
}

function runAudit(cutoffs) {
  const applicants = loadApplicants();
  const results = functions.applyRule(applicants, cutoffs);
  const rates = functions.selectionRates(results);
  const parityGap = functions.demographicParityGap(rates);
  const dir = functions.disparateImpactRatio(rates);
  const eeoc = functions.fourFifthsCheck(dir);
  const tprGap = functions.equalOpportunityGap(results);
  const riskScore = functions.computeRiskScore({ dir, parityGap, tprGap });
  
  return {
    cutoffs,
    rates,
    parityGap,
    dir,
    eeoc,
    tprGap,
    riskScore,
    details: results
  };
}

app.get('/api/applicants', (req, res) => {
  const applicants = loadApplicants();
  res.json(applicants);
});

app.post('/api/audit', (req, res) => {
  const validation = validateCutoffs(req.body);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }
  const run = runAudit(validation);
  functions.appendAuditLog(run);
  res.json(run);
});

app.post('/api/compare', (req, res) => {
  const biasedCutoffs = { alpha: 70, beta: 79 };
  const fairCutoffs = { alpha: 70, beta: 70 };
  
  const biased = runAudit(biasedCutoffs);
  const fair = runAudit(fairCutoffs);
  const rescued = functions.rescuedCandidates(biased.details, fair.details);
  
  res.json({ biased, fair, rescued });
});

app.get('/api/explain/:id', (req, res) => {
  const { id } = req.params;
  const { alpha, beta } = req.query;
  
  if (!alpha || !beta) {
    return res.status(400).json({ error: 'Query parameters alpha and beta required' });
  }
  
  const applicants = loadApplicants();
  const applicant = applicants.find(a => a.id === parseInt(id));
  
  if (!applicant) {
    return res.status(404).json({ error: 'Applicant not found' });
  }
  
  const cutoffs = { alpha: parseFloat(alpha), beta: parseFloat(beta) };
  const explanation = functions.explainDecision(applicant, cutoffs);
  res.json(explanation);
});

app.get('/api/audit-log', (req, res) => {
  res.json(functions.getAuditLog());
});

app.get('/api/rule-map', (req, res) => {
  res.json(ruleMap);
});

app.get('/api/report.csv', (req, res) => {
  const log = functions.getAuditLog();
  if (log.length === 0) {
    return res.status(404).json({ error: 'No audit runs available' });
  }
  const csv = functions.buildReportCsv(log[0]);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="fairness-report.csv"');
  res.send(csv);
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});