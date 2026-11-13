import React, { useState } from 'react';
import { useApplicants } from './hooks/useApi';
import { useAudit } from './hooks/useApi';
import { useCompare } from './hooks/useApi';
import { useExplain } from './hooks/useApi';
import { useAuditLog } from './hooks/useApi';
import { useRuleMap } from './hooks/useApi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'principles', label: 'Principles' },
  { id: 'explain', label: 'Explain' },
  { id: 'rulemap', label: 'Rule Map' }
];

const PRINCIPLES = [
  { key: 'fairness', name: 'Fairness', metric: 'parityGap', threshold: 0.1, unit: '%' },
  { key: 'accountability', name: 'Accountability', metric: 'eeoc', threshold: 'PASS' },
  { key: 'transparency', name: 'Transparency', metric: 'cutoffsVisible', threshold: true },
  { key: 'nonmaleficence', name: 'Non-maleficence', metric: 'rescued', threshold: 0 },
  { key: 'privacy', name: 'Privacy', metric: 'syntheticData', threshold: true },
  { key: 'continuous', name: 'Continuous Auditing', metric: 'auditLog', threshold: 0 }
];

function Overview({ audit, compare, viewMode, setViewMode }) {
  if (!audit) return <div>Loading...</div>;
  
  const { rates, dir, eeoc, parityGap, tprGap, riskScore, cutoffs } = audit;
  const alphaRate = (rates.Alpha * 100).toFixed(1);
  const betaRate = (rates.Beta * 100).toFixed(1);
  const parityGapPct = (parityGap * 100).toFixed(1);
  const dirVal = dir.toFixed(2);
  const tprGapPct = (tprGap * 100).toFixed(1);

  const chartData = [
    { group: 'Alpha', rate: rates.Alpha * 100 },
    { group: 'Beta', rate: rates.Beta * 100 }
  ];
  const maxRate = Math.max(rates.Alpha, rates.Beta) * 100;
  const eightyPercentLine = maxRate * 0.8;

  return (
    <div>
      <div className="cutoff-display">
        <strong>Current Cutoffs:</strong> Alpha = {cutoffs.alpha}, Beta = {cutoffs.beta}
      </div>
      
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-value">{alphaRate}%</div>
          <div className="metric-label">Alpha Selection Rate</div>
          <div className="metric-meta">Principle: Fairness · Rule: Demographic parity · Function: selectionRates()</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{betaRate}%</div>
          <div className="metric-label">Beta Selection Rate</div>
          <div className="metric-meta">Principle: Fairness · Rule: Demographic parity · Function: selectionRates()</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{dirVal}</div>
          <div className="metric-label">Disparate Impact Ratio</div>
          <div className="metric-meta">Principle: Fairness · Rule: EEOC four-fifths · Function: disparateImpactRatio()</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            <span className={`badge ${eeoc === 'PASS' ? 'badge-pass' : 'badge-fail'}`}>{eeoc}</span>
          </div>
          <div className="metric-label">EEOC Four-Fifths Rule</div>
          <div className="metric-meta">Principle: Accountability · Rule: US EEOC 29 CFR 1607.4D · Function: fourFifthsCheck()</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{riskScore}/100</div>
          <div className="metric-label">Risk Score</div>
          <div className="metric-meta">Principle: Accountability · Rule: Risk classification · Function: computeRiskScore()</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Selection Rate by Group</div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e0ddd8" />
              <XAxis type="number" tickFormatter={v => `${v}%`} />
              <YAxis dataKey="group" type="category" width={60} />
              <Tooltip formatter={v => [`${v.toFixed(1)}%`, 'Selection Rate']} />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]} fill="#1f4e4a">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#1f4e4a' : '#2d6b66'} />
                ))}
              </Bar>
              <ReferenceLine x={eightyPercentLine} stroke="#c62828" strokeDasharray="5 5" strokeWidth={2} label={{ value: '80% of top group', position: 'top', fill: '#c62828', fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {compare && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Before vs After Mitigation</div>
          </div>
          <div className="toggle-group">
            <button className={`toggle-btn ${viewMode === 'biased' ? 'active' : ''}`} onClick={() => setViewMode('biased')}>Biased Rule</button>
            <button className={`toggle-btn ${viewMode === 'biased' ? '' : 'active'}`} onClick={() => setViewMode('fair')}>Fair Rule</button>
          </div>
          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-value">{((viewMode === 'biased' ? compare.biased.rates.Alpha : compare.fair.rates.Alpha) * 100).toFixed(1)}%</div>
              <div className="metric-label">Alpha Rate</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{((viewMode === 'biased' ? compare.biased.rates.Beta : compare.fair.rates.Beta) * 100).toFixed(1)}%</div>
              <div className="metric-label">Beta Rate</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{(viewMode === 'biased' ? compare.biased.dir : compare.fair.dir).toFixed(2)}</div>
              <div className="metric-label">DIR</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">
                <span className={`badge ${(viewMode === 'biased' ? compare.biased.eeoc : compare.fair.eeoc) === 'PASS' ? 'badge-pass' : 'badge-fail'}`}>
                  {viewMode === 'biased' ? compare.biased.eeoc : compare.fair.eeoc}
                </span>
              </div>
              <div className="metric-label">EEOC</div>
            </div>
            <div className="metric-card">
              <div className="metric-value">{compare.rescued}</div>
              <div className="metric-label">Rescued Candidates</div>
              <div className="metric-meta">Principle: Non-maleficence · Rule: Merit restored · Function: rescuedCandidates()</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Principles({ audit, compare }) {
  if (!audit) return <div>Loading...</div>;
  
  const { rates, dir, eeoc, parityGap, tprGap, cutoffs } = audit;
  const rescued = compare?.rescued || 0;

  const checks = [
    { 
      name: 'Fairness', 
      pass: parityGap < 0.1, 
      reason: `Parity gap ${(parityGap * 100).toFixed(1)}% ${parityGap < 0.1 ? 'within' : 'exceeds'} 10% threshold` 
    },
    { 
      name: 'Accountability', 
      pass: eeoc === 'PASS', 
      reason: `EEOC Four-Fifths: ${eeoc} (DIR: ${dir.toFixed(2)})` 
    },
    { 
      name: 'Transparency', 
      pass: true, 
      reason: `Cutoffs visible and editable: Alpha=${cutoffs.alpha}, Beta=${cutoffs.beta}` 
    },
    { 
      name: 'Non-maleficence', 
      pass: rescued > 0, 
      reason: `${rescued} qualified candidates rescued after mitigation` 
    },
    { 
      name: 'Privacy', 
      pass: true, 
      reason: 'Synthetic fixture only; no real personal data used' 
    },
    { 
      name: 'Continuous Auditing', 
      pass: true, 
      reason: 'Every audit run timestamped and stored in audit log' 
    }
  ];

  return (
    <div className="principles-grid">
      {checks.map(p => (
        <div key={p.name} className="principle-card">
          <div className="principle-name">{p.name}</div>
          <div className="principle-status">
            <span className={`badge ${p.pass ? 'badge-pass' : 'badge-fail'}`}>
              {p.pass ? 'PASS' : 'FAIL'}
            </span>
          </div>
          <div className="principle-reason">{p.reason}</div>
        </div>
      ))}
    </div>
  );
}

function Explain({ applicants, audit, cutoffs }) {
  const [searchId, setSearchId] = useState(51);
  const { data: explanation, loading, error } = useExplain(searchId, cutoffs);

  const malik = applicants.find(a => a.id === 51);

  if (!audit) return <div>Loading...</div>;

  const handleSearch = (e) => {
    e.preventDefault();
    const id = parseInt(searchId);
    const found = applicants.find(a => a.id === id);
    if (found) {
      // trigger re-fetch by updating searchId
      setSearchId(id);
    }
  };

  if (!explanation) return <div className="card">Loading explanation...</div>;

  const scorePct = (explanation.score / 100) * 100;
  const cutoffPct = (explanation.cutoff / 100) * 100;

  return (
    <div>
      <form className="explain-search" onSubmit={handleSearch}>
        <label>
          Applicant ID
          <input type="number" value={searchId} onChange={e => setSearchId(e.target.value)} min="1" max="100" />
        </label>
        <button type="submit">Explain</button>
      </form>

      <div className="card">
        <div className="card-header">
          <div className="card-title">{explanation.applicant} (Group {explanation.group})</div>
        </div>
        <div className="explain-details">
          <div className="explain-row">
            <span className="label">Score</span>
            <span className="value">{explanation.score.toFixed(1)}</span>
          </div>
          <div className="explain-row">
            <span className="label">Required Cutoff</span>
            <span className="value">{explanation.cutoff}</span>
          </div>
          <div className="explain-row">
            <span className="label">Gap</span>
            <span className="value">{explanation.gap.toFixed(1)} points {explanation.selected ? 'above' : 'below'}</span>
          </div>
          <div className="explain-row">
            <span className="label">Status</span>
            <span className="value">
              <span className={`badge ${explanation.selected ? 'badge-pass' : 'badge-fail'}`}>
                {explanation.selected ? 'Selected' : 'Rejected'}
              </span>
            </span>
          </div>
          <div className="explain-reason">{explanation.reason}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Score vs Cutoff Track</div>
        </div>
        <div className="track-container">
          <div className="track">
            <div className="track-fill" style={{ width: `${Math.min(cutoffPct, 100)}%` }} />
          </div>
          <div className="track-marker" style={{ left: `${cutoffPct}%` }} data-label={`Cutoff: ${explanation.cutoff}`} />
          <div className="score-marker" style={{ left: `${scorePct}%` }} title={`Score: ${explanation.score.toFixed(1)}`} />
        </div>
        <p style={{ fontSize: '13px', color: '#5a5a5a' }}>
          Teal marker = applicant score | Red line = group cutoff
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Biased vs Fair Rule Comparison</div>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {[
            { label: 'Biased Rule (Beta=79)', alpha: 70, beta: 79 },
            { label: 'Fair Rule (Beta=70)', alpha: 70, beta: 70 }
          ].map(rule => {
            const cutoff = explanation.group === 'Alpha' ? rule.alpha : rule.beta;
            const selected = explanation.score >= cutoff;
            const gap = Math.abs(cutoff - explanation.score);
            return (
              <div key={rule.label} style={{ flex: 1, minWidth: '200px' }}>
                <strong>{rule.label}</strong>
                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                  Cutoff: {cutoff} | 
                  <span className={`badge ${selected ? 'badge-pass' : 'badge-fail'}`} style={{ marginLeft: '8px' }}>
                    {selected ? 'Selected' : 'Rejected'}
                  </span>
                  {gap > 0 && !selected && <span style={{ marginLeft: '8px', color: '#c62828' }}>Short by {gap.toFixed(1)} pts</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RuleMap({ ruleMap, auditLog }) {
  return (
    <div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Function → Principle → Rule/Law Mapping</div>
        </div>
        <table className="rule-map-table">
          <thead>
            <tr>
              <th>Function</th>
              <th>Principle</th>
              <th>Rule / Law</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {ruleMap.map((row, i) => (
              <tr key={i}>
                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{row.function}</td>
                <td>{row.principle}</td>
                <td>{row.rule}</td>
                <td style={{ color: '#5a5a5a', fontSize: '12px' }}>{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Audit Log</div>
          <a href="/api/report.csv" className="download-btn" download>Download Report</a>
        </div>
        {auditLog.length === 0 ? (
          <p style={{ color: '#5a5a5a' }}>No audit runs yet. Run an audit from the Overview tab.</p>
        ) : (
          auditLog.map((entry, i) => (
            <div key={i} className="audit-log-entry">
              <div className="audit-log-header">
                <span>{new Date(entry.timestamp).toLocaleString()}</span>
                <span>
                  <span className={`badge ${entry.eeoc === 'PASS' ? 'badge-pass' : 'badge-fail'}`}>{entry.eeoc}</span>
                  Risk: {entry.riskScore}/100
                </span>
              </div>
              <div className="audit-log-metrics">
                <span>Alpha: {(entry.rates.Alpha * 100).toFixed(1)}%</span>
                <span>Beta: {(entry.rates.Beta * 100).toFixed(1)}%</span>
                <span>DIR: {entry.dir.toFixed(2)}</span>
                <span>Parity Gap: {(entry.parityGap * 100).toFixed(1)}%</span>
                <span>TPR Gap: {(entry.tprGap * 100).toFixed(1)}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [cutoffs, setCutoffs] = useState({ alpha: 70, beta: 79 });
  const [viewMode, setViewMode] = useState('fair');

  const { data: applicants } = useApplicants();
  const { data: audit, run: runAudit } = useAudit(cutoffs);
  const { data: compare } = useCompare();
  const { data: auditLog } = useAuditLog();
  const { data: ruleMap } = useRuleMap();

  const handleCutoffChange = (group, value) => {
    const num = parseInt(value) || 0;
    setCutoffs(prev => ({ ...prev, [group]: Math.max(0, Math.min(100, num)) }));
  };

  const handleRunAudit = () => {
    runAudit();
  };

  if (!applicants) return <div>Loading...</div>;

  return (
    <div>
      <header>
        <h1>AI Fairness Checker</h1>
        <p style={{ color: '#5a5a5a', fontSize: '14px', marginTop: '4px' }}>
          Auditing hiring algorithm bias with legal metrics and explainability
        </p>
      </header>

      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          <div className="card">
            <div className="card-header">
              <div className="card-title">Cutoff Configuration</div>
            </div>
            <div className="input-group">
              <label>
                Alpha Cutoff
                <input type="number" value={cutoffs.alpha} onChange={e => handleCutoffChange('alpha', e.target.value)} min="0" max="100" />
              </label>
              <label>
                Beta Cutoff
                <input type="number" value={cutoffs.beta} onChange={e => handleCutoffChange('beta', e.target.value)} min="0" max="100" />
              </label>
              <button onClick={handleRunAudit} style={{ alignSelf: 'flex-end', padding: '8px 16px', background: '#1f4e4a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Run Audit
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#5a5a5a' }}>
              Qualified = score ≥ 70. Try Alpha=70, Beta=79 (biased) vs Alpha=70, Beta=70 (fair).
            </p>
          </div>
          <Overview audit={audit} compare={compare} viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      )}

      {activeTab === 'principles' && <Principles audit={audit} compare={compare} />}

      {activeTab === 'explain' && <Explain applicants={applicants} audit={audit} cutoffs={cutoffs} />}

      {activeTab === 'rulemap' && <RuleMap ruleMap={ruleMap || []} auditLog={auditLog} />}
    </div>
  );
}

export default App;