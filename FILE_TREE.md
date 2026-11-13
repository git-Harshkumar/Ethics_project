# File Tree

```
ai-fairness-checker/
├── package.json                    # Root scripts for install/dev
├── COMPLEXITY_ANALYSIS.md          # Time/space complexity table
├── DRY_RUN_TRACE.md                # 6-applicant dry-run trace
├── FILE_TREE.md                    # This file
├── server/
│   ├── package.json                # Express + Vitest deps
│   └── src/
│       ├── index.js                # Express server, API routes
│       └── fairness/
│           ├── loadApplicants.js   # Synthetic fixture (100 applicants)
│           ├── applyRule.js        # Marks selected/rejected per cutoff
│           ├── selectionRates.js   # Selection rate per group
│           ├── demographicParityGap.js  # Abs difference in rates
│           ├── disparateImpactRatio.js  # Lowest/highest rate ratio
│           ├── fourFifthsCheck.js  # PASS if DIR >= 0.80
│           ├── equalOpportunityGap.js   # TPR gap among qualified
│           ├── computeRiskScore.js     # 0-100 weighted risk
│           ├── mitigateRule.js     # Returns unified cutoff
│           ├── rescuedCandidates.js    # Qualified rejected→selected count
│           ├── explainDecision.js  # Score, cutoff, gap, plain reason
│           ├── auditLog.js         # Timestamped audit trail
│           ├── buildReportCsv.js   # CSV download
│           ├── ruleMap.js          # Function→Principle→Rule mapping
│           └── fairness.test.js    # Vitest unit tests
└── client/
    ├── package.json                # React + Vite + Recharts deps
    ├── vite.config.js              # Vite config with proxy
    ├── index.html                  # HTML entry
    └── src/
        ├── main.jsx                # React root
        ├── index.css               # All styles (plain CSS)
        ├── App.jsx                 # Main app with 4 tabs
        └── hooks/
            └── useApi.js           # Custom hooks for API calls
```

---

## Installation & Run Commands

### Prerequisites
- Node.js 18+
- npm 9+

### One-time Setup
```bash
# From project root
npm run install:all
```
Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

### Development (Two Terminals)

**Terminal 1 - Backend (port 5000):**
```bash
npm run dev:server
# or: cd server && npm run dev
```

**Terminal 2 - Frontend (port 5173):**
```bash
npm run dev:client
# or: cd client && npm run dev
```

### Production Build
```bash
cd client && npm run build
cd ../server && npm start
```

### Run Tests
```bash
npm test
# or: cd server && npm test
```

### API Endpoints
- `GET  /api/applicants` - List all 100 synthetic applicants
- `POST /api/audit` - Run audit with `{alpha, beta}` cutoffs
- `POST /api/compare` - Biased vs fair side-by-side + rescued count
- `GET  /api/explain/:id?alpha=70&beta=79` - Explain one applicant
- `GET  /api/audit-log` - All audit runs (newest first)
- `GET  /api/report.csv` - Download CSV of latest audit
- `GET  /api/rule-map` - Function→Principle→Rule mapping

### Verification Checklist
After starting both servers, open http://localhost:5173 and verify:

1. **Overview tab**: Shows 5 metric cards, bar chart with 80% reference line, Before/After toggle
2. **Default cutoffs (70/79)**: Alpha ~58%, Beta ~4%, DIR ~0.07, EEOC FAIL, Risk ~96
3. **Change to 70/70 and Run Audit**: Alpha ~58%, Beta ~52%, DIR ~0.90, EEOC PASS, Risk ~4
4. **Principles tab**: 6 cards with live PASS/FAIL badges
5. **Explain tab**: Default Malik Patel (ID 51), shows rejected at Beta=79 (gap 2.8), selected at Beta=70
6. **Rule Map tab**: Table from ruleMap.js, audit log, Download Report button
6. **Tests pass**: `npm test` shows all assertions green