# Dry-Run Trace: 6-Applicant Example

## Fixture (3 Alpha, 3 Beta)

| ID | Name | Group | Score | Qualified (≥70) |
|----|------|-------|-------|-----------------|
| 1  | A1   | Alpha | 85.0  | Yes             |
| 2  | A2   | Alpha | 72.0  | Yes             |
| 3  | A3   | Alpha | 68.0  | No              |
| 4  | B1   | Beta  | 76.0  | Yes             |
| 5  | B2   | Beta  | 71.0  | Yes             |
| 6  | B3   | Beta  | 65.0  | No              |

---

## Biased Rule: Alpha=70, Beta=79

### Step 1: `applyRule(applicants, {alpha: 70, beta: 79})`

| ID | Group | Score | Cutoff | Selected | Qualified |
|----|-------|-------|--------|----------|-----------|
| 1  | Alpha | 85.0  | 70     | Yes      | Yes       |
| 2  | Alpha | 72.0  | 70     | Yes      | Yes       |
| 3  | Alpha | 68.0  | 70     | No       | No        |
| 4  | Beta  | 76.0  | 79     | No       | Yes       |
| 5  | Beta  | 71.0  | 79     | No       | Yes       |
| 6  | Beta  | 65.0  | 79     | No       | No        |

### Step 2: `selectionRates(results)`

- Alpha: 2 selected / 3 total = **0.667 (66.7%)**
- Beta: 0 selected / 3 total = **0.000 (0.0%)**
- Returns: `{ Alpha: 0.667, Beta: 0.000 }`

### Step 3: `demographicParityGap(rates)`
- `abs(0.667 - 0.000) = 0.667` → **66.7%**

### Step 4: `disparateImpactRatio(rates)`
- Highest = 0.667, Lowest = 0.000
- Ratio = 0.000 / 0.667 = **0.000**

### Step 5: `fourFifthsCheck(dir)`
- `0.000 >= 0.80` → **FAIL**

### Step 6: `equalOpportunityGap(results)`

Qualified applicants only:
- Alpha qualified: IDs 1, 2 (both selected) → TPR = 2/2 = **1.000**
- Beta qualified: IDs 4, 5 (neither selected) → TPR = 0/2 = **0.000**
- Gap = `abs(1.000 - 0.000)` = **1.000 (100%)**

### Step 7: `computeRiskScore({dir, parityGap, tprGap})`
- DIR shortfall = `max(0, 0.80 - 0.000) = 0.80`
- Score = `round(50 * 0.80/0.80 + 30 * 0.667 + 20 * 1.000)`
- = `round(50 + 20.01 + 20)` = **90**

---

## Fair Rule: Alpha=70, Beta=70

### Step 1: `applyRule(applicants, {alpha: 70, beta: 70})`

| ID | Group | Score | Cutoff | Selected | Qualified |
|----|-------|-------|--------|----------|-----------|
| 1  | Alpha | 85.0  | 70     | Yes      | Yes       |
| 2  | Alpha | 72.0  | 70     | Yes      | Yes       |
| 3  | Alpha | 68.0  | 70     | No       | No        |
| 4  | Beta  | 76.0  | 70     | Yes      | Yes       |
| 5  | Beta  | 71.0  | 70     | Yes      | Yes       |
| 6  | Beta  | 65.0  | 70     | No       | No        |

### Step 2: `selectionRates(results)`

- Alpha: 2/3 = **0.667 (66.7%)**
- Beta: 2/3 = **0.667 (66.7%)**
- Returns: `{ Alpha: 0.667, Beta: 0.667 }`

### Step 3: `demographicParityGap(rates)`
- `abs(0.667 - 0.667) = 0.000` → **0%**

### Step 4: `disparateImpactRatio(rates)`
- Highest = 0.667, Lowest = 0.667
- Ratio = 0.667 / 0.667 = **1.000**

### Step 5: `fourFifthsCheck(dir)`
- `1.000 >= 0.80` → **PASS**

### Step 6: `equalOpportunityGap(results)`

Qualified applicants:
- Alpha qualified: IDs 1, 2 (both selected) → TPR = 1.000
- Beta qualified: IDs 4, 5 (both selected) → TPR = 1.000
- Gap = `abs(1.000 - 1.000)` = **0.000 (0%)**

### Step 7: `computeRiskScore({dir, parityGap, tprGap})`
- DIR shortfall = `max(0, 0.80 - 1.000) = 0`
- Score = `round(50 * 0 + 30 * 0 + 20 * 0)` = **0**

---

## Mitigation & Rescue

### Step 8: `mitigateRule({alpha: 70, beta: 79})`
- `min(70, 79) = 70`
- Returns: `{ alpha: 70, beta: 70 }`

### Step 9: `rescuedCandidates(biasedResults, fairResults)`

Biased rejected but qualified: IDs 4, 5 (Beta, scores 76, 71)
Fair selected: IDs 1, 2, 4, 5
Intersection: IDs 4, 5 → **2 rescued**

---

## Explain: Applicant B1 (ID 4, Beta, Score 76)

### Biased Rule (Beta=79)
- Cutoff: 79
- Gap: 79 - 76 = 3.0 points below
- Selected: No
- Reason: "Score 76.0 is 3.0 points below the Beta cutoff of 79. Rejected."

### Fair Rule (Beta=70)
- Cutoff: 70
- Gap: 76 - 70 = 6.0 points above
- Selected: Yes
- Reason: "Score 76.0 meets the Beta cutoff of 70. Selected."

---

## Audit Log Entry (Biased Run)

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "cutoffs": { "alpha": 70, "beta": 79 },
  "rates": { "Alpha": 0.667, "Beta": 0.000 },
  "parityGap": 0.667,
  "dir": 0.000,
  "eeoc": "FAIL",
  "tprGap": 1.000,
  "riskScore": 90,
  "details": [ ... 6 applicant objects ... ]
}
```