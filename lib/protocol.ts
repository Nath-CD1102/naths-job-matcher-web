/**
 * PROTOCOL 1A v3 Detector
 * Cross-references job descriptions against actual R&R background
 */

import profile from "../config/profile.json";

const PROTOCOL = {
  requirements: [
    { id: 1, name: "AI-assisted workflow design and automation", weight: 2 },
    { id: 2, name: "Content team leadership, scaling, and systems-building", weight: 2 },
    { id: 3, name: "Cross-functional coordination across teams and stakeholders", weight: 1 },
    { id: 4, name: "Campaign coordination and multi-channel execution", weight: 1 },
    { id: 5, name: "SOP building and process documentation", weight: 1 },
    { id: 6, name: "Performance reporting and data-driven decision making", weight: 1 },
    { id: 7, name: "SEO and keyword research", weight: 1 },
    { id: 8, name: "Lead generation, conversion tracking, and pipeline attribution", weight: 1 },
    { id: 9, name: "Email operations and newsletter management", weight: 1 },
    { id: 10, name: "Content calendar management and scheduling", weight: 1 },
  ],

  tiers: {
    0: { min: 50, max: 60, name: "Tier 0" },
    1: { min: 60, max: 70, name: "Tier 1" },
    2: { min: 70, max: 80, name: "Tier 2" },
    3: { min: 80, max: 90, name: "Tier 3" },
    4: { min: 90, max: 100, name: "Tier 4" },
  },

  userGreenFlags: profile.core_competencies ? Object.keys(profile.core_competencies) : [],
  userRedFlags: profile.red_flags || [],
};

export interface DetectorInput {
  title: string;
  company: string;
  description: string;
}

export interface DetectorOutput {
  title: string;
  company: string;
  match_percentage: number;
  tier: number | null;
  tier_name: string;
  explicit_matches: number;
  implicit_matches: number;
  green_flags: string[];
  hubspot_status: string;
  recommendation: "APPLY" | "REVIEW" | "PASS";
  recommendation_reason: string;
  auto_excluded: boolean;
  exclusion_reasons: string[];
}

const checkHardFilters = (job: DetectorInput) => {
  const failures: string[] = [];
  const jobText = `${job.title} ${job.company} ${job.description || ""}`.toLowerCase();

  if (!jobText.includes("remote") && !jobText.includes("anywhere") && !jobText.includes("worldwide")) {
    failures.push("Not fully remote");
  }

  if (jobText.includes("500") || jobText.includes("enterprise")) {
    failures.push("Company size likely 500+");
  }

  if ((jobText.includes("series") || jobText.includes("funding")) &&
      !jobText.includes("series a") && !jobText.includes("series b")) {
    failures.push("Likely Series C+ or later stage");
  }

  return {
    passed: failures.length === 0,
    failures,
  };
};

const checkAutoExclude = (job: DetectorInput) => {
  const jobText = `${job.title} ${job.company} ${job.description || ""}`.toLowerCase();
  const reasons: string[] = [];

  if (jobText.includes("gaming") || jobText.includes("entertainment")) {
    reasons.push("Gaming/entertainment vertical");
  }

  if ((jobText.includes("us only") || jobText.includes("north america")) && !jobText.includes("flexible")) {
    reasons.push("US/North America only, no flexibility");
  }

  if (jobText.includes("degree required") && !jobText.includes("flexible")) {
    reasons.push("Degree required, no flexibility");
  }

  if (jobText.includes("500") || jobText.includes("1000")) {
    reasons.push("Large company (500+ employees)");
  }

  if (jobText.includes("series c") || jobText.includes("series d") || jobText.includes("enterprise")) {
    reasons.push("Series C+ or enterprise stage");
  }

  return {
    autoExcluded: reasons.length > 0,
    reasons,
  };
};

const validateRequirements = (job: DetectorInput) => {
  const jobText = `${job.title} ${job.description || ""}`.toLowerCase();
  let explicitWeight = 0;
  let implicitWeight = 0;
  let explicitMatches = 0;
  let implicitMatches = 0;

  PROTOCOL.requirements.forEach((req) => {
    // Explicit match: requirement keyword directly in job text
    const reqKeywords = req.name.toLowerCase().split(/\s+/);
    const hasExplicit = reqKeywords.some((kw) => jobText.includes(kw));

    // Implicit match: cross-reference user's actual background
    let hasImplicit = false;

    if (req.id === 1) {
      // AI workflow: WeMod, DEFRAGG, YOWL all demonstrate this
      hasImplicit = jobText.includes("claude") || jobText.includes("chatgpt") ||
                   jobText.includes("ai-powered") || jobText.includes("ai workflow") ||
                   jobText.includes("automation") || jobText.includes("workflow optimization");
    } else if (req.id === 2) {
      // Team leadership: StardewGuide, GTA-X, AvidGamer all demonstrate this
      hasImplicit = jobText.includes("lead") || jobText.includes("manage team") ||
                   jobText.includes("director") || jobText.includes("head of") ||
                   jobText.includes("team scaling") || jobText.includes("hiring");
    } else if (req.id === 3) {
      // Cross-functional: WeMod coordinated with maps team
      hasImplicit = jobText.includes("cross-functional") || jobText.includes("stakeholder") ||
                   jobText.includes("collaborate") || jobText.includes("coordination");
    } else if (req.id === 4) {
      // Multi-channel: DEFRAGG built multi-channel distribution
      hasImplicit = jobText.includes("multi-channel") || jobText.includes("distribution") ||
                   jobText.includes("campaign") || jobText.includes("channel");
    } else if (req.id === 5) {
      // SOP/Process: All projects demonstrate process documentation
      hasImplicit = jobText.includes("sop") || jobText.includes("documentation") ||
                   jobText.includes("process") || jobText.includes("playbook") ||
                   jobText.includes("template") || jobText.includes("standardiz");
    } else if (req.id === 6) {
      // Analytics: All projects have performance reporting
      hasImplicit = jobText.includes("analytics") || jobText.includes("metrics") ||
                   jobText.includes("reporting") || jobText.includes("data-driven") ||
                   jobText.includes("performance") || jobText.includes("tracking");
    } else if (req.id === 7) {
      // SEO: StardewGuide, GTA-X, YOWL, AvidGamer all SEO-focused
      hasImplicit = jobText.includes("seo") || jobText.includes("keyword") ||
                   jobText.includes("search") || jobText.includes("organic");
    } else if (req.id === 8) {
      // Lead generation/Conversion: DEFRAGG, WeMod both show this
      hasImplicit = jobText.includes("lead") || jobText.includes("conversion") ||
                   jobText.includes("pipeline") || jobText.includes("attribution");
    } else if (req.id === 9) {
      // Email/Newsletter: DEFRAGG managed newsletters
      hasImplicit = jobText.includes("email") || jobText.includes("newsletter") ||
                   jobText.includes("communication") || jobText.includes("messaging");
    } else if (req.id === 10) {
      // Content calendar: All projects managed content planning
      hasImplicit = jobText.includes("calendar") || jobText.includes("schedul") ||
                   jobText.includes("planning") || jobText.includes("content management");
    }

    if (hasExplicit) {
      explicitWeight += req.weight;
      explicitMatches++;
    } else if (hasImplicit) {
      implicitWeight += req.weight;
      implicitMatches++;
    }
  });

  return { explicitMatches, implicitMatches, explicitWeight, implicitWeight };
};

const calculateProtocolMatch = (explicitWeight: number, implicitWeight: number) => {
  const totalWeight = PROTOCOL.requirements.reduce((sum, r) => sum + r.weight, 0);
  const earnedPoints = explicitWeight + implicitWeight;
  const percentage = Math.round((earnedPoints / totalWeight) * 100);
  return Math.min(percentage, 100); // Cap at 100%
};

const assignTier = (matchPercentage: number) => {
  for (const [tierNum, tierDef] of Object.entries(PROTOCOL.tiers)) {
    if (matchPercentage >= tierDef.min && matchPercentage <= tierDef.max) {
      return parseInt(tierNum);
    }
  }
  return -1;
};

const extractGreenFlags = (job: DetectorInput) => {
  const jobText = `${job.title} ${job.description || ""}`.toLowerCase();
  const flags: string[] = [];
  const seenFlags = new Set<string>();

  // Check for user's core competencies
  const competencies = [
    { keyword: ["team", "leadership", "lead", "director", "head of"], flag: "Team Leadership ✓" },
    { keyword: ["ai", "claude", "chatgpt", "automat"], flag: "AI/Automation ✓" },
    { keyword: ["seo", "keyword", "organic"], flag: "SEO Expertise" },
    { keyword: ["analytics", "metrics", "reporting", "data"], flag: "Analytics ✓" },
    { keyword: ["conversion", "lead", "pipeline"], flag: "Conversion/Lead Gen ✓" },
    { keyword: ["email", "newsletter"], flag: "Email/Newsletter" },
    { keyword: ["hubspot"], flag: "HubSpot Integration" },
    { keyword: ["sop", "process", "documentation", "template"], flag: "Process Optimization ✓" },
  ];

  competencies.forEach((comp) => {
    if (comp.keyword.some((kw) => jobText.includes(kw)) && !seenFlags.has(comp.flag)) {
      flags.push(comp.flag);
      seenFlags.add(comp.flag);
    }
  });

  // Check for target company stage
  if ((jobText.includes("series a") || jobText.includes("series b")) && !seenFlags.has("Series A/B ✓")) {
    flags.push("Series A/B ✓");
    seenFlags.add("Series A/B ✓");
  }

  // Check for industry focus
  const targetVerticals = ["healthcare", "fintech", "legal tech", "edtech", "insurtech", "saas"];
  targetVerticals.forEach((vertical) => {
    if (jobText.includes(vertical) && !seenFlags.has(`[${vertical}]`)) {
      flags.push(`[${vertical}]`);
      seenFlags.add(`[${vertical}]`);
    }
  });

  return flags;
};

export const detectProtocolCompliance = (job: DetectorInput): DetectorOutput => {
  const autoExclude = checkAutoExclude(job);
  const { explicitMatches, implicitMatches, explicitWeight, implicitWeight } = validateRequirements(job);
  const protocolMatch = calculateProtocolMatch(explicitWeight, implicitWeight);
  const tier = assignTier(protocolMatch);
  const greenFlags = extractGreenFlags(job);

  let recommendation: "APPLY" | "REVIEW" | "PASS" = "PASS";
  if (!autoExclude.autoExcluded) {
    if (protocolMatch >= 70) recommendation = "APPLY";
    else if (protocolMatch >= 50) recommendation = "REVIEW";
  }

  return {
    title: job.title,
    company: job.company,
    match_percentage: protocolMatch,
    tier: tier >= 0 ? tier : null,
    tier_name: tier >= 0 ? PROTOCOL.tiers[tier as keyof typeof PROTOCOL.tiers].name : "Below Tier 0",
    explicit_matches: explicitMatches,
    implicit_matches: implicitMatches,
    green_flags: greenFlags,
    hubspot_status: greenFlags.some((f) => f.includes("HubSpot")) ? "HubSpot ✓" : "No HubSpot",
    recommendation,
    recommendation_reason:
      autoExclude.autoExcluded ? `Auto-excluded: ${autoExclude.reasons.join(", ")}`
        : protocolMatch < 50 ? `Below 50% threshold (${protocolMatch}%)`
        : protocolMatch >= 70 ? `Strong match (${protocolMatch}% - Tier ${tier})`
        : `Moderate match (${protocolMatch}% - Tier ${tier})`,
    auto_excluded: autoExclude.autoExcluded,
    exclusion_reasons: autoExclude.reasons,
  };
};
