<<<<<<< HEAD
// Type definitions
export interface Answers {
  company_roles: string[];
  primary_focus: string;
  operational_footprint: string;
  company_size: string;
  improvement_areas: string[];
  pressure_areas: string[];
  system_count: string;
  performance_tracking: string;
  leadership_views: string;
  ai_concerns?: Record<string, string>;
  business_goal?: string;
  guided_support?: string;
  company_name?: string;
  email?: string;
}

export interface ScoreResult {
  score: number;
  overallPct: number;
  tier: "Foundation Stage" | "Developing" | "AI-Enhanced";
  maxScore: number;
  sections: Array<{
    id: string;
    label: string;
    score: number;
    max: number;
    pct: number;
  }>;
  breakdown: Record<string, number>;
  breakdownMax: Record<string, number>;
  breakdownPct: Record<string, number>;
  notes: {
    tierAdjustedDueToCoreOpsGate?: boolean;
    gates?: string[];
    redFlags?: string[];
  };
}

export function scoreAnswers(a: Answers): ScoreResult {
  // ----- SECTION CONFIGURATION -----
  const sections = [
    { id: "s1", label: "Technology Infrastructure", max: 12 },
    { id: "s2", label: "Data Foundation", max: 6 },
    { id: "s3", label: "Human Capital", max: 8 },
    { id: "s4", label: "Strategic Planning", max: 10 },
    { id: "s5", label: "Measurement & Analytics", max: 6 },
    { id: "s6", label: "Risk Management", max: 4 },
    { id: "s7", label: "Organizational Support", max: 4 }
  ];

  const sectionScores: Record<string, number> = {};
  const redFlags: string[] = [];
  const gates: string[] = [];

  // ----- HELPERS -----
  const normalize = (v?: string) => (v || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "_");
  const set = (arr?: string[]) => new Set((arr || []).map(normalize));
  const pct = (score: number, max: number) => (max > 0 ? Math.round((score / max) * 100) : 0);

  // ----- SECTION 1: Technology Infrastructure -----
  const improvements = set(a.improvement_areas);
  const pressures = set(a.pressure_areas);
  const overlap = [...improvements].filter(v => pressures.has(v)).length;

  const band = (n: number): number => {
    if (n === 0) return 0;
    if (n <= 2) return 4;
    if (n === 3) return 3;
    if (n === 4) return 2;
    return 1;
  };

  sectionScores["s1"] = Math.min(
    band(improvements.size) + band(pressures.size) + Math.min(overlap * 2, 4),
    12
  );

  // ----- SECTION 2: Data Foundation -----
  const systemMap: Record<string, number> = { one: 5, two_three: 6, more_three: 2 };
  const systemScore = systemMap[normalize(a.system_count)] ?? 0;
  sectionScores["s2"] = systemScore;

  if (systemScore === 0) redFlags.push("System Integration = 0");

  // ----- SECTION 3: Human Capital -----
  const perfMap: Record<string, number> = { dashboards: 8, siloed: 6, manual: 3, no_visibility: 0 };
  const perfScore = perfMap[normalize(a.performance_tracking)] ?? 0;
  sectionScores["s3"] = perfScore;

  if (perfScore === 0) redFlags.push("No visibility into performance");

  // ----- SECTION 4: Strategic Planning -----
  const leadershipMap: Record<string, number> = {
    actively_exploring: 6,
    open_pilots: 4,
    curious_unsure: 2,
    skeptical_resistant: 0
  };
  const leadershipScore = leadershipMap[normalize(a.leadership_views)] ?? 0;

  let concernsScore = 0;
  if (a.ai_concerns) {
    const ratings = Object.values(a.ai_concerns)
      .map(n => parseInt(String(n), 10))
      .filter(n => n >= 1 && n <= 5);

    if (ratings.length) {
      const avg = ratings.reduce((a, b) => a + b) / ratings.length;
      concernsScore = Math.round(((avg - 1) / 4) * 4); // 1 = 0 points, 5 = 4 points
    }
  }

  const strategyScore = Math.min(leadershipScore + concernsScore, 10);
  sectionScores["s4"] = strategyScore;
  if (strategyScore === 0) redFlags.push("No strategic vision or leadership openness");

  // ----- SECTION 5: Measurement & Analytics -----
  const bizGoalMap: Record<string, number> = {
    cost_reduction: 6,
    revenue_growth: 5,
    service_differentiation: 4,
    workforce_stability: 3,
    compliance_risk: 2
  };
  const goalScore = bizGoalMap[normalize(a.business_goal || "")] ?? 0;
  sectionScores["s5"] = goalScore;
  if (goalScore === 0) redFlags.push("No clear business outcome defined");

  // ----- SECTION 6: Risk Management -----
  const supportMap: Record<string, number> = { yes_follow_up: 2, no_browsing: 0 };
  const guided = supportMap[normalize(a.guided_support || "")] ?? 0;
  const sizeMap: Record<string, number> = { under_100: 0, "100_499": 1, "500_999": 1, "1000_plus": 1 };
  const sizeScore = sizeMap[normalize(a.company_size)] ?? 0;
  const alignment = leadershipScore >= 4 ? 2 : leadershipScore >= 2 ? 1 : 0;

  sectionScores["s6"] = Math.min(guided + sizeScore + alignment, 4);

  // ----- SECTION 7: Organizational Support -----
  const maturityScore =
    (perfScore >= 6 ? 1 : 0) +
    (leadershipScore >= 4 ? 1 : 0) +
    (["reducing_cost", "improving_service"].some(p => pressures.has(p)) ? 1 : 0);

  sectionScores["s7"] = Math.min(maturityScore, 4);

  // ----- AGGREGATE -----
  const score = sections.reduce((sum, s) => sum + sectionScores[s.id], 0);
  const maxScore = sections.reduce((sum, s) => sum + s.max, 0);
  const overallPct = pct(score, maxScore);

  // TIERING
  let tier: ScoreResult["tier"] =
    overallPct >= 75 ? "AI-Enhanced" : overallPct >= 50 ? "Developing" : "Foundation Stage";

  // Core integration/visibility gates
  const s2 = sectionScores["s2"];
  const s3 = sectionScores["s3"];
  const s4 = sectionScores["s4"];

  if (tier === "AI-Enhanced" && s2 <= 2) {
    tier = "Developing";
    gates.push("System integration below threshold (≤2)");
  }
  if (tier === "AI-Enhanced" && (s2 === 0 || s3 === 0)) {
    tier = "Developing";
    gates.push("System or tracking = 0 disqualifies AI-Enhanced");
  }
  if (s2 === 0 && s3 === 0) {
    tier = "Foundation Stage";
    gates.push("Both system integration and performance tracking are 0");
  }

  const result: ScoreResult = {
    score,
    overallPct,
    tier,
    maxScore,
    sections: sections.map(s => ({
      id: s.id as any,
      label: s.label,
      score: sectionScores[s.id],
      max: s.max,
      pct: pct(sectionScores[s.id], s.max)
    })),
    breakdown: Object.fromEntries(sections.map(s => [s.id, sectionScores[s.id]])) as any,
    breakdownMax: Object.fromEntries(sections.map(s => [s.id, s.max])) as any,
    breakdownPct: Object.fromEntries(sections.map(s => [s.id, pct(sectionScores[s.id], s.max)])) as any,
    notes: {
      tierAdjustedDueToCoreOpsGate: gates.length > 0 ? true : undefined,
      gates: gates.length ? gates : undefined,
      redFlags: redFlags.length ? redFlags : undefined
    }
  };

  return result;
}
=======
// scoring.ts

export type Answers = {
  // Context-only (not scored)
  sector?: string; // "retail" | "financial_services" | "telecom" | "bpo" | "healthcare" | "manufacturing" | "logistics" | "other"
  region?: string; // "na" | "emea" | "apac" | "latam" | "global"

  // Scored items
  q1?: string[]; // multi
  q2?: string;   // single
  q3?: string;   // single
  q4?: string;   // single
  q5?: string[]; // multi
  q6?: string[]; // multi
  q7?: string;   // single

  // Non-scored, used for narrative/qualification
  q8?: string[]; // Challenges (multi)
  q9?: string;   // Urgency (single)
};

export type ScoreResult = {
  score: number;
  overallPct: number; // 0..100
  tier: "AI-Enhanced" | "Developing" | "Foundation Stage";

  // Raw section math
  breakdown: Record<"s1"|"s2"|"s3"|"s4"|"s5"|"s6"|"s7", number>;
  breakdownMax: Record<"s1"|"s2"|"s3"|"s4"|"s5"|"s6"|"s7", number>;
  breakdownPct: Record<"s1"|"s2"|"s3"|"s4"|"s5"|"s6"|"s7", number>;

  // Label-aligned view for rendering/prompt
  sections: Array<{
    id: "s1"|"s2"|"s3"|"s4"|"s5"|"s6"|"s7";
    label:
      | "Technology Infrastructure"
      | "Data Foundation"
      | "Human Capital"
      | "Strategic Planning"
      | "Measurement & Analytics"
      | "Risk Management"
      | "Organizational Support";
    score: number;
    max: number;
    pct: number; // 0..100
  }>;

  maxScore: number;

  notes?: {
    tierAdjustedDueToLowDataMaturity?: boolean;
    redFlags?: string[]; // surfaced for the writer
  };
};

/* Helpers */
function norm(val?: string) {
  return (val || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function uniq<T>(arr?: T[]) {
  return Array.from(new Set(arr || []));
}

// Enforce "none" exclusivity and de-dupe
function cleanMulti(arr?: string[]) {
  const set = new Set(uniq(arr).map(norm));
  if (set.has("none") && set.size > 1) set.delete("none");
  return Array.from(set);
}

function pct(part: number, max: number) {
  return max > 0 ? Math.round((part / max) * 100) : 0;
}

export function scoreAnswers(a: Answers): ScoreResult {
  // Section labels aligned to the report
  const labels = {
    s1: "Technology Infrastructure",  // q1
    s2: "Data Foundation",            // q2
    s3: "Human Capital",              // q3
    s4: "Strategic Planning",         // q4 (scalability readiness)
    s5: "Measurement & Analytics",    // q5
    s6: "Risk Management",            // q6 (security & compliance)
    s7: "Organizational Support",     // q7 (leadership/budget)
  } as const;

  // Max points (sum = 53)
  const maxes = { s1: 16, s2: 4, s3: 4, s4: 4, s5: 9, s6: 12, s7: 4 } as const;

  // S1 Technology Infrastructure (automation level)
  const q1Set = new Set(cleanMulti(a.q1));
  const s1Keys = ["chatbots", "rpa", "ai_assistants", "qa_analytics", "speech_analytics", "virtual_agents", "predictive_analytics", "intent_detection"];
  const s1Raw = s1Keys.reduce((acc, k) => acc + (q1Set.has(k) ? 1 : 0), 0);
  const s1 = Math.min(s1Raw * 2, maxes.s1); // 2 pts each, cap 16

  // S2 Data Foundation
  const mapQ2: Record<string, number> = {
    fully_integrated: 4,
    crm_dashboards: 2,
    separate_systems: 1,
    no_centralized: 0,
  };
  const s2 = mapQ2[norm(a.q2)] ?? 0;

  // S3 Human Capital (workforce readiness)
  const mapQ3: Record<string, number> = {
    fully_trained: 4,
    some_trained: 2,
    no_training_open: 1,
    resistant: 0,
  };
  const s3 = mapQ3[norm(a.q3)] ?? 0;

  // S4 Strategic Planning (scalability readiness)
  const mapQ4: Record<string, number> = {
    full_scalable: 4,
    extended_multi: 2,
    limited_scaling: 1,
    no_scalability: 0,
  };
  const s4 = mapQ4[norm(a.q4)] ?? 0;

  // S5 Measurement & Analytics (KPI tracking)
  const s5 = Math.min(cleanMulti(a.q5).filter(x => x !== "none").length, maxes.s5);

  // S6 Risk Management (security & compliance)
  const s6 = Math.min(cleanMulti(a.q6).filter(x => x !== "none").length * 2, maxes.s6);

  // S7 Organizational Support (leadership buy-in)
  const mapQ7: Record<string, number> = {
    dedicated_budget: 4,
    pilot_budget: 3,
    interest_no_budget: 2,
    limited_engagement: 0,
  };
  const s7 = mapQ7[norm(a.q7)] ?? 0;

  // Aggregate
  const score = s1 + s2 + s3 + s4 + s5 + s6 + s7;
  const maxScore = Object.values(maxes).reduce((a, b) => a + b, 0); // 53
  const overallPct = pct(score, maxScore);

  const breakdown = { s1, s2, s3, s4, s5, s6, s7 };
  const breakdownMax = { s1: maxes.s1, s2: maxes.s2, s3: maxes.s3, s4: maxes.s4, s5: maxes.s5, s6: maxes.s6, s7: maxes.s7 };
  const breakdownPct = {
    s1: pct(s1, maxes.s1),
    s2: pct(s2, maxes.s2),
    s3: pct(s3, maxes.s3),
    s4: pct(s4, maxes.s4),
    s5: pct(s5, maxes.s5),
    s6: pct(s6, maxes.s6),
    s7: pct(s7, maxes.s7),
  };

  // Sections array for rendering and the prompt
  const sections = (Object.keys(breakdown) as Array<keyof typeof breakdown>).map((id) => ({
    id,
    label: labels[id],
    score: breakdown[id],
    max: breakdownMax[id],
    pct: breakdownPct[id],
  }));

  // Tier by percentage (future-proof if you reweight)
  let tier: ScoreResult["tier"];
  if (overallPct >= 72) tier = "AI-Enhanced";        // ~>= 38/53
  else if (overallPct >= 43) tier = "Developing";    // ~>= 23/53
  else tier = "Foundation Stage";

  const notes: ScoreResult["notes"] = {};

  // Data maturity downgrade: can't be top tier if Data is too low
  if (tier === "AI-Enhanced" && s2 <= 1) {
    tier = "Developing";
    notes.tierAdjustedDueToLowDataMaturity = true;
  }

  // Fundamental gates: zeros in Data/Security block top tier; both zero push to bottom
  if ((s2 === 0 || s6 === 0) && tier === "AI-Enhanced") {
    tier = "Developing";
    notes.tierAdjustedDueToLowDataMaturity = true;
  }
  if (s2 === 0 && s6 === 0) {
    tier = "Foundation Stage";
    notes.tierAdjustedDueToLowDataMaturity = true;
  }

  // Red flags to help the writer call out critical gaps
  const redFlags: string[] = [];
  if (s2 === 0) redFlags.push("Data Foundation is 0/4");
  if (s6 === 0) redFlags.push("Risk Management is 0/12");
  if (s5 === 0) redFlags.push("No KPI tracking");
  if (s7 === 0) redFlags.push("No executive sponsor or budget");
  if (redFlags.length) notes.redFlags = redFlags;

  return { score, overallPct, tier, breakdown, breakdownMax, breakdownPct, sections, maxScore, notes };
}
>>>>>>> 7b549a7c02875b8c09f0b8b8ceaea02e4470cf77
