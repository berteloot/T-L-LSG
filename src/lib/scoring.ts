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
