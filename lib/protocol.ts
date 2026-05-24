/**
 * PROTOCOL 1A v3 Detector
 * Validates job descriptions against PROTOCOL rules
 */

const PROTOCOL = {
  requirements: [
    { id: 1, name: "AI-assisted workflow design and automation", weight: 2 },
    { id: 2, name: "Content team leadership, scaling, and systems-building", weight: 2 },
    { id: 3, name: "Cross-functional coordination across teams and stakeholders", weight: 1 },
    { id: 4, name: "Campaign coordination and multi-channel execution", weight: 1 },
    { id: 5, name: "SOP building and process documentation", weight: 1 },
    { id: 6, name: "Performance reporting and data-driven decision making", weight: 1 },
    { id: 7, name: "SEO and keyword research (multilingual: EN, ES, DE, FR, PT, JA)", weight: 1 },
    { id: 8, name: "Lead generation, conversion tracking, and pipeline attribution", weight: 1 },
    { id: 9, name: "Email operations and newsletter management", weight: 1 },
    { id: 10, name: "Content calendar management and scheduling", weight: 1 },
  ],

  greenFlags: [
    { keyword: "hubspot", category: "HubSpot ✓" },
    { keyword: "ai", category: "AI tools" },
    { keyword: "sop", category: "SOP building" },
    { keyword: "healthcare", category: "[Target Vertical: Healthcare]" },
    { keyword: "fintech", category: "[Fintech]" },
    { keyword: "legal tech", category: "[Legal Tech]" },
    { keyword: "edtech", category: "[EdTech]" },
    { keyword: "insurtech", category: "[InsurTech]" },
    { keyword: "usd", category: "USD-denominated pay" },
    { keyword: "series a", category: "Seed to Series B" },
    { keyword: "series b", category: "Seed to Series B" },
    { keyword: "lean", category: "Small team/lean startup" },
    { keyword: "anywhere", category: "[Worldwide]" },
    { keyword: "worldwide", category: "[Worldwide]" },
  ],

  tiers: {
    0: { min: 50, max: 60, name: "Tier 0" },
    1: { min: 60, max: 70, name: "Tier 1" },
    2: { min: 70, max: 80, name: "Tier 2" },
    3: { min: 80, max: 90, name: "Tier 3" },
    4: { min: 90, max: 100, name: "Tier 4" },
  },
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
    const keywords = req.name.toLowerCase().split(/\s+/);

    if (keywords.some((kw) => jobText.includes(kw))) {
      explicitWeight += req.weight;
      explicitMatches++;
    } else if (
      (req.id === 1 && (jobText.includes("automat") || jobText.includes("workflow") || jobText.includes("process"))) ||
      (req.id === 2 && (jobText.includes("lead") || jobText.includes("manage") || jobText.includes("team"))) ||
      (req.id === 3 && (jobText.includes("cross-functional") || jobText.includes("stakeholder") || jobText.includes("collaborat"))) ||
      (req.id === 4 && (jobText.includes("campaign") || jobText.includes("multi-channel") || jobText.includes("channel"))) ||
      (req.id === 5 && (jobText.includes("documentation") || jobText.includes("playbook") || jobText.includes("guideline"))) ||
      (req.id === 6 && (jobText.includes("analytic") || jobText.includes("metric") || jobText.includes("reporting") || jobText.includes("data"))) ||
      (req.id === 7 && (jobText.includes("seo") || jobText.includes("keyword") || jobText.includes("ranking") || jobText.includes("organic"))) ||
      (req.id === 8 && (jobText.includes("lead") || jobText.includes("conversion") || jobText.includes("pipeline") || jobText.includes("attribution"))) ||
      (req.id === 9 && (jobText.includes("email") || jobText.includes("newsletter") || jobText.includes("communication"))) ||
      (req.id === 10 && (jobText.includes("calendar") || jobText.includes("schedul") || jobText.includes("planning")))
    ) {
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
  const seenCategories = new Set<string>();

  PROTOCOL.greenFlags.forEach((flag) => {
    if (jobText.includes(flag.keyword) && !seenCategories.has(flag.category)) {
      flags.push(flag.category);
      seenCategories.add(flag.category);
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
