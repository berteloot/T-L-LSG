<<<<<<< HEAD
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
You are an industry-grade AI analyst writing a professional readiness report for a Transportation & Logistics organization. Your audience includes decision-makers evaluating AI transformation.

## OUTPUT GOAL
Generate a structured, evidence-based report analyzing AI readiness. Support insights with named 2023+ sources. Do not fabricate benchmarks. If no valid source, write qualitatively and add: [no 2023+ source found].

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
=======
// reportPrompt.ts
import { ScoreResult, Answers } from "./scoring";

export function buildReportPrompt(score: ScoreResult, answers: Answers) {
  // Helpers
  const fmtPct = (n: number) => `${Math.round(n)}%`;
  const safeList = (arr?: string[]) => (Array.isArray(arr) && arr.length ? arr.join(", ") : "not specified");

  // Sort sections for stable rendering
  const sectionsSorted = [...score.sections].sort((a, b) => a.label.localeCompare(b.label));

  // Thresholds
  const HIGH_PCT = 75;
  const LOW_PCT = 50;

  const highSections =
    score.sections
      .filter(s => s.pct >= HIGH_PCT)
      .map(s => `${s.label} ${s.score}/${s.max} (${fmtPct(s.pct)})`)
      .join("; ") || "not specified";

  const lowSections =
    score.sections
      .filter(s => s.pct < LOW_PCT)
      .map(s => `${s.label} ${s.score}/${s.max} (${fmtPct(s.pct)})`)
      .join("; ") || "not specified";

  const sectionBreakdownList = sectionsSorted
    .map(s => `         - ${s.label}: ${s.score}/${s.max} (${fmtPct(s.pct)})`)
    .join("\n");

  // Pretty labels
  const sectorLabelMap: Record<string, string> = {
    retail_ecommerce: "Retail & eCommerce",
    financial_services_fintech: "Financial Services & Fintech",
    telecommunications: "Telecommunications",
    healthcare: "Healthcare",
    media_entertainment: "Media & Entertainment",
    energy_utilities: "Energy & Utilities",
    logistics_transportation: "Logistics & Transportation",
    manufacturing: "Manufacturing",
    other: "Other / Not Listed",
  };
  const regionLabelMap: Record<string, string> = {
    na: "North America",
    emea: "EMEA (Europe, Middle East & Africa)",
    apac: "APAC (Asia-Pacific)",
    latam: "LATAM (Latin America)",
    global: "Global / Multi-region",
  };

  const sectorLabel = answers.sector ? (sectorLabelMap[answers.sector] || answers.sector) : "not specified";
  const regionLabel = answers.region ? (regionLabelMap[answers.region] || answers.region) : "not specified";

  // Fallback benchmark note
  const sectorSpecified = sectorLabel !== "not specified";
  const regionSpecified = regionLabel !== "not specified";
  const noSpecificBenchmarkNote = !sectorSpecified && !regionSpecified
    ? "No sector or region-specific benchmark found; using cross-industry reference."
    : sectorSpecified && !regionSpecified
      ? "No region-specific benchmark found; using sector reference."
      : !sectorSpecified && regionSpecified
        ? "No sector-specific benchmark found; using region reference."
        : "";

  const painPoints = Array.isArray(answers.q8) && answers.q8.length ? answers.q8.join(", ") : "not specified";
  const urgency = answers.q9 || "not specified";

  // KPI mapping used for CX outcome line and per-section hints
  type Kpi =
    | "CSAT"
    | "AHT"
    | "Retention"
    | "Cost per contact"
    | "FCR"
    | "NPS"
    | "Agent productivity";

  const sectionKpiMap: Record<string, Kpi[]> = {
    "Technology Infrastructure": ["AHT", "Cost per contact", "CSAT"],
    "Data Foundation": ["AHT", "Cost per contact", "FCR"],
    "Human Capital": ["Agent productivity", "CSAT", "FCR"],
    "Strategic Planning": ["Cost per contact", "FCR", "Agent productivity"],
    "Measurement & Analytics": ["FCR", "NPS", "Cost per contact"],
    "Risk Management": ["Retention"],
    "Organizational Support": ["Retention", "NPS"],
  };

  function buildCxOutcomeLine(sections: ScoreResult["sections"]): string {
    const weights: Record<Kpi, number> = {
      CSAT: 0,
      AHT: 0,
      Retention: 0,
      "Cost per contact": 0,
      FCR: 0,
      NPS: 0,
      "Agent productivity": 0,
    };
    sections.forEach(s => {
      (sectionKpiMap[s.label] || []).forEach(k => { weights[k] += s.pct; });
    });
    const top = Object.entries(weights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => k);
    return `CX outcomes most affected: ${top.join(", ")}.`;
  }

  function kpiHintForSection(label: string): string {
    const list = sectionKpiMap[label] || [];
    return list.length ? `CX KPIs to watch: ${list.join(", ")}.` : "CX KPIs to watch: not specified.";
  }

  function peerStanding(s: ScoreResult): string {
    const pct = s.overallPct; // already 0..100
    if (pct >= 75) {
      return `${s.score}/${s.maxScore} places you in ${s.tier}. Comparable to top-quartile CX orgs adopting AI at scale.`;
    }
    if (pct >= 50) {
      return `${s.score}/${s.maxScore} places you in ${s.tier}. Consistent with many mid-market CX orgs early in their AI adoption.`;
    }
    return `${s.score}/${s.maxScore} places you in ${s.tier}. Similar to peers at the foundation stage beginning data and workflow modernization.`;
  }

  const cxOutcomeLine = buildCxOutcomeLine(score.sections);
  const peerLine = peerStanding(score);

  // Build a per-section KPI hint list as a displayable block if needed
  const perSectionKpiHints = sectionsSorted
    .map(s => `         - ${s.label}: ${kpiHintForSection(s.label)}`)
    .join("\n");

  return `
Critical Rule:
  • Never fabricate statistics, quotes, or information.
  • Use only verifiable data from reputable sources.
  • Statistics and benchmarks must be from 2023 or newer. Foundational frameworks older than 2023 may be cited only if still standard and named.
  • Do not include personal names, emails, or company identifiers unless provided in Inputs.
  • Preferred organizations include (not limited to): McKinsey, Gartner, Deloitte, PwC, Accenture, Forrester, World Economic Forum, OECD, MIT Technology Review, Harvard Business Review, Stanford AI Index, or equivalent of similar caliber. Use 2023+ publications when citing quantitative claims.

Citation Requirements (strict):
  • When citing, include the organization AND the exact report/publication name and year if available (e.g., "McKinsey — The State of AI in 2024", 2024).
  • If the exact report/publication title cannot be determined, cite the organization and a clear publication type (e.g., "Gartner — 2024 industry note").
  • Only if neither is available, fall back to the organization or domain alone (e.g., "mckinsey.com").
  • Cite-or-Skip rule: if you cannot attach a named publication to a quantitative claim, do not use a number; use a qualitative insight and add "[no reliable 2023+ benchmark found]".
  • Claim to source proximity: place the citation immediately at the end of the sentence containing the claim, not grouped later.
  • Never include full URLs.
  • Do not write generic claims like "studies show" without a citation formatted as above.

Sector and Region Benchmarking:
  • Prefer sector-specific (${sectorLabel}) and region-specific (${regionLabel}) data when selecting benchmarks and vignettes.
  • ${noSpecificBenchmarkNote}
  • Avoid mixing sectors or regions in a way that confuses applicability. Make applicability explicit.

Style and Evidence Rules:
  • For each section, write one short narrative paragraph, 3 to 5 sentences, following Insight → Evidence → Implication.
  • Vary sentence openings and verbs. Avoid repeating the same phrasing across sections.
  • Use at most one quantified stat per section. Executive Summary may include two.
  • Do not use phrases like "up to X%", "~X%", or "Yx more likely" unless they appear exactly in a 2023+ cited publication.
  • Provide at least two sections that use a brief qualitative vignette from a cited publication instead of a percentage.
  • Avoid citing the same organization in consecutive sections when a comparable source exists. Prioritize accuracy over variety.
  • End each section with one line: "If unchanged: ...".
  • For sections scoring 75% or higher, the "If unchanged" line should state what to preserve and the risk of backsliding.
  • Recommendations must tie only to sections or pain points with a direct causal link.
  • Prioritize CX outcomes and metrics when relevant: CSAT, AHT, FCR, NPS, agent productivity, retention, cost per contact.
  • After each section paragraph and before "If unchanged", append the provided KPI hint: "CX KPIs to watch: ...". Do not invent KPIs.

Task:
  Generate a report grounded in current, verifiable research with varied narrative. Use the inputs below exactly.

Report Structure:
  1) Executive Summary
     • One tight paragraph with overall score and tier, where the organization is strong vs fragile, and what that means in practice.
     • Benchmark comparison with at most two stats, each cited with organization plus report or publication name (2023+).
     • Include the CX outcomes line from Inputs: "${cxOutcomeLine}"
     • Include the peer benchmark from Inputs: "${peerLine}"
     • Limitations and Assumptions: call out missing sector or region and any other input gaps.

  2) Readiness Score and Tier Interpretation
     • Total score: ${score.score}/${score.maxScore} (${fmtPct(score.overallPct)}).
     • Tier: ${score.tier}.
     • Tier adjustment note: ${score.notes?.tierAdjustedDueToLowDataMaturity ? "Adjusted due to low data maturity" : "No adjustment"}.
     • Section scores:
${sectionBreakdownList}
     • Interpret what this tier means in practical business terms, citing a 2023+ framework or maturity model. Name the framework or publication.

  3) Detailed Section Analysis
     • Use the Insight → Evidence → Implication paragraph pattern.
     • Tie the analysis to these pain points where relevant: ${painPoints}.
     • Include at most one quantified 2023+ stat with a named publication, or use a qualitative vignette with a citation.
     • Treat high-scoring sections as preserve and guard against backsliding: ${highSections}.
     • Treat low-scoring sections as priority fixes: ${lowSections}.
     • Reference sections by their labels exactly as listed above.
     • After each section paragraph, add the KPI hint for that section from Inputs, then add the "If unchanged" line on likely consequences in 6 to 12 months.

  4) Pain Points Analysis
     • Reflect the selected pain points: ${painPoints}.
     • Explicitly map each pain point to low-scoring section or sections. Example: "Scaling bottlenecks → Strategic Planning 0/4; KPI gaps → Measurement and Analytics 0/5".
     • Use one 2023+ cited stat with a publication name and one brief case or vignette. Avoid stacking percentages.

  5) Recommendations and Next Steps
     • Provide 3 to 5 items. For each:
       - Action: clear and specific.
       - Owner and horizon: who; 30, 60, or 90 days.
       - Tied scores or pains with a direct link. Example: "Addresses Data Foundation and Measurement and Analytics; pain: SLA misses".
       - Evidence: one 2023+ publication with organization and title. No URLs.
       - Expected benefit or leading indicator to watch.
     • Benchmark the maturity tier using the provided peer benchmark sentence from Inputs.
     • Close with a call to action, such as a link to book a consult or to explore tailored recommendations.

  6) Sources
     • List each organization once with the publication name or names and year or years used, for example:
       - McKinsey - "The State of AI in 2024"
       - Gartner - "AI in Retail Analytics 2023"; "Risk and Compliance Outlook 2024"
     • If a publication title was not available, indicate: (title unavailable - domain cited)

  7) Evidence Ledger (claim to source check)
     • List 3 to 6 of the most important quantitative claims as bullet points.
     • For each, restate the claim in 20 words or fewer and attach the exact citation token used in the text.
       Example:
       - "AI TRiSM adopters improve model adoption by about 50% by 2026." → (Gartner - "Top Strategic Technology Trends 2023", 2023)
     • If any claim lacked a named publication, include:
       - [audit flag] Publication title unavailable for: "<short claim>" (used organization-level fallback).

Tone:
  • Consulting, factual, succinct. No hype.
  • Vary sentence structure. Avoid repetitive templates.

Inputs:
  • Sector: ${sectorLabel}
  • Region: ${regionLabel}
  • AI and Automation Tools (Q1): ${safeList(answers.q1)}
  • Data Infrastructure Maturity (Q2): ${answers.q2 || "not specified"}
  • Workforce AI Adoption Readiness (Q3): ${answers.q3 || "not specified"}
  • Scalability of CX Operations (Q4): ${answers.q4 || "not specified"}
  • KPI Tracking Sophistication (Q5): ${safeList(answers.q5)}
  • Security and Compliance (Q6): ${safeList(answers.q6)}
  • Budget and Executive Buy-In (Q7): ${answers.q7 || "not specified"}
  • Challenges (Q8): ${painPoints}
  • Urgency Assessment (Q9): ${urgency}
  • Scoring guide: Max ${score.maxScore}; Tiers: AI-Enhanced / Developing / Foundation Stage.
  • CX Outcomes Line: ${cxOutcomeLine}
  • Peer Benchmark: ${peerLine}
  • Per-Section KPI Hints:
${perSectionKpiHints}
`;
}
>>>>>>> 7b549a7c02875b8c09f0b8b8ceaea02e4470cf77
