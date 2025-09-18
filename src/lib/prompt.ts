// lib/prompt.ts
import type { ScoreResult, Answers } from "./scoring";

// Format helpers
function fmtPct(n: number): string {
  return `${Math.round(n)}%`;
}

function safeList(arr?: string[]): string {
  return Array.isArray(arr) && arr.length ? arr.join(", ") : "not specified";
}

export function buildPrompt(score: ScoreResult, answers: Answers): string {
  const HIGH_THRESHOLD = 75;
  const LOW_THRESHOLD = 50;

  const sectorLabel = getSectorLabel(answers.company_roles);
  const regionLabel = getRegionLabel(answers.operational_footprint);
  const noBenchmarkNote = getBenchmarkNote(sectorLabel, regionLabel);

  const highSections = score.sections
    .filter((s: any) => s.pct >= HIGH_THRESHOLD)
    .map((s: any) => `${s.label} (${s.score}/${s.max} = ${fmtPct(s.pct)})`)
    .join("; ") || "not specified";

  const lowSections = score.sections
    .filter((s: any) => s.pct < LOW_THRESHOLD)
    .map((s: any) => `${s.label} (${s.score}/${s.max} = ${fmtPct(s.pct)})`)
    .join("; ") || "not specified";

  const sectionBreakdownList = score.sections
    .map((s: any) => `- ${s.label}: ${s.score}/${s.max} (${fmtPct(s.pct)})`)
    .join("\n");

  const peerLine = getPeerBenchmark(score);
  const tnlOutcomeLine = getTnlOutcomeLine(score.sections);
  const progressBar = getProgressBar(score.overallPct);
  const sectionIcons = getSectionIcons();

  const ctaLine =
    answers.guided_support === "yes_follow_up"
      ? "Schedule a 30-min working session to create a 90-day plan."
      : "Explore a tailored roadmap template for internal use.";

  const topSections = score.sections
    .filter((s: any) => s.pct >= HIGH_THRESHOLD)
    .map((s: any) => `${s.label} (${fmtPct(s.pct)})`)
    .join(", ");

  const bottomSections = score.sections
    .filter((s: any) => s.pct < LOW_THRESHOLD)
    .map((s: any) => `${s.label} (${fmtPct(s.pct)})`)
    .join(", ");

  return `
## ROLE
You are an industry-grade AI analyst writing a professional AI Readiness Quick Check report for a Transportation & Logistics organization. Your audience includes decision-makers evaluating AI transformation.

## OUTPUT GOAL
Generate a structured, evidence-based AI Readiness Quick Check report. Support insights with named 2023+ sources. Do not fabricate benchmarks. If no valid source, write qualitatively and add: [no 2023+ source found].

## CONTEXT
- Sector: ${sectorLabel}
- Region: ${regionLabel}
- Benchmark Note: ${noBenchmarkNote}
- Company Size: ${answers.company_size || "not specified"}
- Primary Focus: ${answers.primary_focus || "not specified"}
- Score: ${score.score}/${score.maxScore} = ${fmtPct(score.overallPct)}, Tier: ${score.tier}
- Preserve (≥${HIGH_THRESHOLD}%): ${highSections}
- Fix First (<${LOW_THRESHOLD}%): ${lowSections}
- T&L Outcomes Affected: ${tnlOutcomeLine}
- Peer Benchmark: ${peerLine}

## USER RESPONSES SNAPSHOT
- Improvement Areas: ${safeList(answers.improvement_areas)}
- Pressure Areas: ${safeList(answers.pressure_areas)}
- System Count: ${answers.system_count || "not specified"}
- Performance Tracking: ${answers.performance_tracking || "not specified"}
- Leadership Views: ${answers.leadership_views || "not specified"}
- Top AI Concerns: ${getTopConcerns(answers)}
- Business Goal: ${answers.business_goal || "not specified"}
- Guided Support: ${answers.guided_support || "not specified"}

## STRUCTURE
### 1. Executive Summary
- One paragraph: score, tier, key strengths/weaknesses.
- Include: ${tnlOutcomeLine}
- Include: ${peerLine}
- Mention specific strong areas: ${topSections || "none"}
- Mention specific weak areas: ${bottomSections || "none"}
- Add one numerical benchmark if available (e.g., "aligned with ~30% of sector peers")
- Include explicit tier advancement path: ${getTierAdvancementPath(score)}
- End with: ${ctaLine}

### 2. Score Breakdown & Tier Interpretation
${progressBar}

${sectionBreakdownList}
- Explain tier using a 2023+ maturity model (e.g. Gartner, Deloitte).
- Use EXACT max values from the scoring data (not hardcoded numbers).

### 3. Detailed Section Analysis
For each of the 7 readiness sections:
- 3–5 sentences using: Insight → Evidence → Implication
- Tie to improvement or pressure areas
- Include exactly one cited 2023+ stat or case per section
- End each section with: Ops KPIs to watch: [list] (vary formatting - use sentences or bulleted blocks)
- For sections scoring <50%: Add "If unchanged, [specific consequence] will occur in 6–12 months."

### 4. Pain Points Mapping
Map user's improvement/pressure selections to lowest-scoring sections. For each:
- 1 stat + 1 case (no stacking)
- Show business consequence
- Explicitly connect to low-scoring sections: "This aligns with [Section Name] (X/Y = Z%)"
- Tie back to user input: "This confirms your chosen priority area: [specific improvement area]"
- Reference: Low-scoring sections are ${getLowScoringSections(score)}

### 5. Actionable Recommendations
Give 3–5 prioritized actions. Each should include:
- Action (consider using section icons: ⚙️📊🧑‍💼🎯📈⚠️🤝)
- Owner + 30/60/90 day timeline
- Linked sections
- Cited 2023+ source
- Expected KPI Movement: [Metric name] → +[X]% (use consistent format: "Expected KPI Movement: [Metric] → +[X]%")

### 6. Source List
List full names of cited reports (e.g. McKinsey, "AI in Logistics," 2023)
- Use inline reference tags: (McKinsey, 2023)[1] to tie to Evidence Ledger

### 7. Evidence Ledger
List 3–6 evidence claims used in the report with source tokens.
- Number each entry [1], [2], [3] for easy cross-referencing

## STYLE GUIDANCE
- Avoid marketing tone or fluffy adjectives.
- Use full sentences, not only bullets.
- Assume the reader has limited technical knowledge.
- Define key KPIs (OTIF, etc.) on first use for clarity.

## BEGIN REPORT
`.trim();
}

// === Helper functions ===

function getSectorLabel(roles?: string[]): string {
  if (!roles || roles.length === 0) return "Transportation & Logistics";
  const map: Record<string, string> = {
    freight_brokerage: "Freight brokerage",
    carrier: "Carrier",
    freight_forwarding: "Freight forwarding",
    warehousing_fulfillment: "Warehousing and fulfillment",
    shipper_brand: "Shipper or manufacturer",
    other: "Other"
  };
  return `Transportation & Logistics (${roles.map(r => map[r] || r).join(", ")})`;
}

function getRegionLabel(region?: string): string {
  const map: Record<string, string> = {
    us_based: "United States",
    regional: "Regional (LATAM or EMEA)",
    global: "Global or multinational"
  };
  return map[region || ""] || "not specified";
}

function getBenchmarkNote(sector: string, region: string): string {
  if (!sector || sector === "not specified") {
    return region === "not specified"
      ? "No sector or region-specific benchmark found; using cross-industry reference."
      : "No sector-specific benchmark found; using region reference.";
  }
  if (region === "not specified") {
    return "No region-specific benchmark found; using sector reference.";
  }
  return "";
}

function getPeerBenchmark(score: ScoreResult): string {
  const { score: s, maxScore, tier, overallPct } = score;
  
  // Dynamic percentile calculation
  let percentile = 0;
  if (overallPct >= 75) {
    percentile = 85 + Math.floor((overallPct - 75) / 25 * 15); // 85-100%
  } else if (overallPct >= 50) {
    percentile = 45 + Math.floor((overallPct - 50) / 25 * 40); // 45-85%
  } else {
    percentile = Math.floor(overallPct / 50 * 45); // 0-45%
  }
  
  if (overallPct >= 75) {
    return `${s}/${maxScore} places you in ${tier} (top ${100-percentile}% of T&L organizations). Comparable to top-quartile T&L organizations scaling AI in core operations.`;
  } else if (overallPct >= 50) {
    return `${s}/${maxScore} places you in ${tier} (above ${percentile}% of sector peers). Consistent with mid-market peers piloting AI in select workflows.`;
  } else {
    return `${s}/${maxScore} places you in ${tier} (above ${percentile}% of foundation-stage peers). Similar to foundation-stage peers modernizing data and processes.`;
  }
}

function getTnlOutcomeLine(sections: ScoreResult["sections"]): string {
  const weights: Record<string, number> = {};
  const kpiMap: Record<string, string[]> = {
    "Technology Infrastructure": ["OTIF", "Cost per load", "Invoice cycle time"],
    "Data Foundation": ["Tender acceptance", "OTIF"],
    "Human Capital": ["Pick and pack accuracy", "OTIF"],
    "Strategic Planning": ["Tender acceptance", "Invoice cycle time"],
    "Measurement & Analytics": ["Fill rate", "Order cycle time"],
    "Risk Management": ["Dwell time", "Claims rate"],
    "Organizational Support": ["On-time pickup", "Empty miles"]
  };

  for (const section of sections) {
    const kpis = kpiMap[section.label] || [];
    for (const kpi of kpis) {
      weights[kpi] = (weights[kpi] || 0) + section.pct;
    }
  }

  const topKpis = Object.keys(weights)
    .map(key => [key, weights[key]] as [string, number])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([kpi]) => kpi);

  return `Operational outcomes most affected: ${topKpis.join(", ")}.`;
}

function getTopConcerns(a: Answers): string {
  if (!a.ai_concerns) return "not specified";
  const ranked = Object.keys(a.ai_concerns)
    .map(key => [key, a.ai_concerns![key]] as [string, string])
    .map(([k, v]) => [k, parseInt(String(v), 10)] as [string, number])
    .filter(([, n]) => Number.isFinite(n))
    .sort((a, b) => a[1] - b[1])
    .map(([k]) => {
      const map: Record<string, string> = {
        workflow_disruption: "workflow disruption",
        cost_unclear_roi: "cost or unclear ROI",
        staff_resistance: "staff resistance",
        data_privacy_compliance: "data privacy or compliance",
        not_concerned: "not concerned"
      };
      return map[k] || k;
    });

  return ranked.slice(0, 2).join(", ") || "not specified";
}

function getSectionConsequence(section: any): string {
  const consequences: Record<string, string> = {
    "Technology Infrastructure": "operational inefficiencies will compound, leading to 15-20% higher costs and missed delivery windows",
    "Data Foundation": "AI initiatives will fail due to poor data quality, resulting in 30-40% lower ROI on technology investments",
    "Human Capital": "employee resistance will increase, causing 25-35% slower adoption of new processes and higher turnover",
    "Strategic Planning": "AI projects will lack direction, leading to 40-50% wasted resources and missed market opportunities",
    "Measurement & Analytics": "decision-making will remain reactive, causing 20-30% slower response to market changes",
    "Risk Management": "compliance issues will escalate, resulting in regulatory penalties and 15-25% higher operational risk",
    "Organizational Support": "change initiatives will stall, leading to 30-40% slower digital transformation progress"
  };
  
  return consequences[section.label] || "operational performance will continue to decline";
}

function getLowScoringSections(score: ScoreResult): string {
  const lowSections = score.sections
    .filter((s: any) => s.pct < 50)
    .map((s: any) => `${s.label} (${s.score}/${s.max} = ${fmtPct(s.pct)})`)
    .join(", ");
  
  return lowSections || "none";
}

function getProgressBar(overallPct: number): string {
  const filled = Math.floor(overallPct / 5); // 20 segments of 5% each
  const empty = 20 - filled;
  const bar = "▓".repeat(filled) + "░".repeat(empty);
  return `Readiness Score: ${bar} ${overallPct}%`;
}

function getSectionIcons(): Record<string, string> {
  return {
    "Technology Infrastructure": "⚙️",
    "Data Foundation": "📊", 
    "Human Capital": "🧑‍💼",
    "Strategic Planning": "🎯",
    "Measurement & Analytics": "📈",
    "Risk Management": "⚠️",
    "Organizational Support": "🤝"
  };
}

function getTierAdvancementPath(score: ScoreResult): string {
  const { tier, overallPct } = score;
  
  if (tier === "Foundation Stage") {
    return "To advance to Developing tier, focus on building data integration and performance tracking capabilities.";
  } else if (tier === "Developing") {
    return "To advance to AI-Enhanced tier, focus on building measurement and strategic alignment capabilities.";
  } else {
    return "To maintain AI-Enhanced status, focus on scaling AI initiatives and optimizing operational metrics.";
  }
}

// Legacy function name for backward compatibility
export const buildReportPrompt = buildPrompt;
