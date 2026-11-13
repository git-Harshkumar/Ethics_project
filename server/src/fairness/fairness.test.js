import { describe, it, expect, beforeEach } from 'vitest';
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

describe('Fairness Functions', () => {
  let applicants;
  let biasedResults;
  let fairResults;
  let biasedRates;
  let fairRates;

  beforeEach(() => {
    applicants = loadApplicants();
    biasedResults = applyRule(applicants, { alpha: 70, beta: 79 });
    fairResults = applyRule(applicants, { alpha: 70, beta: 70 });
    biasedRates = selectionRates(biasedResults);
    fairRates = selectionRates(fairResults);
  });

  describe('loadApplicants', () => {
    it('returns 100 applicants', () => {
      expect(applicants.length).toBe(100);
    });

    it('has 50 Alpha and 50 Beta', () => {
      const alpha = applicants.filter(a => a.group === 'Alpha').length;
      const beta = applicants.filter(a => a.group === 'Beta').length;
      expect(alpha).toBe(50);
      expect(beta).toBe(50);
    });

    it('both groups have mean score 73.5', () => {
      const alphaScores = applicants.filter(a => a.group === 'Alpha').map(a => a.score);
      const betaScores = applicants.filter(a => a.group === 'Beta').map(a => a.score);
      const alphaMean = alphaScores.reduce((a, b) => a + b, 0) / alphaScores.length;
      const betaMean = betaScores.reduce((a, b) => a + b, 0) / betaScores.length;
      expect(alphaMean).toBeCloseTo(73.5, 1);
      expect(betaMean).toBeCloseTo(73.5, 1);
    });

    it('includes Malik Patel, Group Beta, score 76.2', () => {
      const malik = applicants.find(a => a.name === 'Malik Patel');
      expect(malik).toBeDefined();
      expect(malik.group).toBe('Beta');
      expect(malik.score).toBe(76.2);
    });
  });

  describe('Biased rule (Alpha 70, Beta 79)', () => {
    it('Alpha selection rate 58% (29/50)', () => {
      expect(biasedRates.Alpha).toBeCloseTo(0.58, 2);
    });

    it('Beta selection rate 4% (2/50)', () => {
      expect(biasedRates.Beta).toBeCloseTo(0.04, 2);
    });

    it('Demographic parity gap 54%', () => {
      const gap = demographicParityGap(biasedRates);
      expect(gap).toBeCloseTo(0.54, 2);
    });

    it('Disparate Impact Ratio 0.07', () => {
      const dir = disparateImpactRatio(biasedRates);
      expect(dir).toBeCloseTo(0.07, 2);
    });

    it('EEOC Four-Fifths FAIL', () => {
      const dir = disparateImpactRatio(biasedRates);
      expect(fourFifthsCheck(dir)).toBe('FAIL');
    });

    it('Equal opportunity gap (TPR) 92.3%', () => {
      const gap = equalOpportunityGap(biasedResults);
      expect(gap).toBeCloseTo(0.923, 3);
    });

    it('Risk score about 96', () => {
      const dir = disparateImpactRatio(biasedRates);
      const parityGap = demographicParityGap(biasedRates);
      const tprGap = equalOpportunityGap(biasedResults);
      const risk = computeRiskScore({ dir, parityGap, tprGap });
      expect(risk).toBeCloseTo(96, 0);
    });
  });

  describe('Fair rule (Alpha 70, Beta 70)', () => {
    it('Alpha selection rate 58% (29/50)', () => {
      expect(fairRates.Alpha).toBeCloseTo(0.58, 2);
    });

    it('Beta selection rate 52% (26/50)', () => {
      expect(fairRates.Beta).toBeCloseTo(0.52, 2);
    });

    it('Disparate Impact Ratio 0.90', () => {
      const dir = disparateImpactRatio(fairRates);
      expect(dir).toBeCloseTo(0.90, 2);
    });

    it('EEOC Four-Fifths PASS', () => {
      const dir = disparateImpactRatio(fairRates);
      expect(fourFifthsCheck(dir)).toBe('PASS');
    });

    it('Rescued candidates 24', () => {
      const rescued = rescuedCandidates(biasedResults, fairResults);
      expect(rescued).toBe(24);
    });

    it('Risk score about 4', () => {
      const dir = disparateImpactRatio(fairRates);
      const parityGap = demographicParityGap(fairRates);
      const tprGap = equalOpportunityGap(fairResults);
      const risk = computeRiskScore({ dir, parityGap, tprGap });
      expect(risk).toBeCloseTo(4, 0);
    });
  });

  describe('explainDecision', () => {
    it('Malik Patel rejected at Beta cutoff 79, short by 2.8 points', () => {
      const malik = applicants.find(a => a.name === 'Malik Patel');
      const explanation = explainDecision(malik, { alpha: 70, beta: 79 });
      expect(explanation.selected).toBe(false);
      expect(explanation.gap).toBeCloseTo(2.8, 1);
      expect(explanation.reason).toContain('2.8');
      expect(explanation.reason).toContain('Rejected');
    });

    it('Malik Patel selected at Beta cutoff 70', () => {
      const malik = applicants.find(a => a.name === 'Malik Patel');
      const explanation = explainDecision(malik, { alpha: 70, beta: 70 });
      expect(explanation.selected).toBe(true);
      expect(explanation.gap).toBe(0);
      expect(explanation.reason).toContain('Selected');
    });
  });

  describe('mitigateRule', () => {
    it('returns unified cutoff as minimum of both', () => {
      const result = mitigateRule({ alpha: 70, beta: 79 });
      expect(result).toEqual({ alpha: 70, beta: 70 });
    });
  });

  describe('auditLog', () => {
    it('appends and retrieves audit runs', () => {
      appendAuditLog({ test: 'run1' });
      appendAuditLog({ test: 'run2' });
      const log = getAuditLog();
      expect(log.length).toBeGreaterThanOrEqual(2);
      expect(log[0].test).toBe('run2');
      expect(log[1].test).toBe('run1');
    });
  });

  describe('buildReportCsv', () => {
    it('generates CSV with expected headers', () => {
      const run = {
        timestamp: '2024-01-01T00:00:00.000Z',
        cutoffs: { alpha: 70, beta: 79 },
        rates: { Alpha: 0.58, Beta: 0.04 },
        parityGap: 0.54,
        dir: 0.07,
        eeoc: 'FAIL',
        tprGap: 0.923,
        riskScore: 96,
        rescued: 24,
        details: []
      };
      const csv = buildReportCsv(run);
      expect(csv).toContain('AI Fairness Audit Report');
      expect(csv).toContain('Demographic Parity Gap');
      expect(csv).toContain('Disparate Impact Ratio');
    });
  });
});