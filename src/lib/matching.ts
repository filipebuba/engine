import { SECTORS, STAGES, COMPANY_SIZES } from "./utils";

interface CompanyProfile {
  name: string;
  cnpj: string;
  sector: string;
  stage: string;
  companySize: string;
  revenue: number;
  employees: number;
  location: string;
  state: string;
  city: string;
  goals: string[];
  existingFunding: string[];
}

interface Edital {
  id: string;
  title: string;
  agency: string;
  sector: string;
  stages: string[];
  companySizes: string[];
  locations: string[];
  fundingType: string;
  maxValue: number;
  deadline: string;
  requirements: string[];
  keywords: string[];
}

interface MatchResult {
  score: number;
  eligible: boolean;
  eliminationReasons: string[];
  breakdown: {
    thematicAlignment: number;
    impactPotential: number;
    competitiveness: number;
    technicalViability: number;
    successHistory: number;
    diversity: number;
    deadlineFactor: number;
    valueFactor: number;
  };
}

export function calculateMatch(profile: CompanyProfile, edital: Edital): MatchResult {
  const eliminationReasons: string[] = [];
  let eligible = true;

  // Hard eliminations
  if (
    edital.companySizes.length > 0 &&
    !edital.companySizes.includes(profile.companySize)
  ) {
    eliminationReasons.push(
      `Porte da empresa (${profile.companySize}) não compatível. Portes elegíveis: ${edital.companySizes.join(", ")}`
    );
    eligible = false;
  }

  if (
    edital.sector &&
    !edital.sector.toLowerCase().includes(profile.sector.toLowerCase()) &&
    !profile.sector.toLowerCase().includes(edital.sector.toLowerCase())
  ) {
    eliminationReasons.push(
      `Setor (${profile.sector}) não compatível com o edital (${edital.sector})`
    );
    eligible = false;
  }

  if (
    edital.stages.length > 0 &&
    !edital.stages.includes(profile.stage)
  ) {
    eliminationReasons.push(
      `Estágio da empresa (${profile.stage}) não elegível`
    );
    eligible = false;
  }

  if (
    edital.locations.length > 0 &&
    !edital.locations.includes(profile.state) &&
    !edital.locations.includes("BR")
  ) {
    eliminationReasons.push(
      `Localização (${profile.state}) não coberta pelo edital`
    );
    eligible = false;
  }

  if (!eligible) {
    return {
      score: 0,
      eligible: false,
      eliminationReasons,
      breakdown: {
        thematicAlignment: 0,
        impactPotential: 0,
        competitiveness: 0,
        technicalViability: 0,
        successHistory: 0,
        diversity: 0,
        deadlineFactor: 0,
        valueFactor: 0,
      },
    };
  }

  // Soft scoring
  const thematicAlignment = calculateThematicAlignment(profile, edital);
  const impactPotential = calculateImpactPotential(profile, edital);
  const competitiveness = calculateCompetitiveness(profile, edital);
  const technicalViability = calculateTechnicalViability(profile, edital);
  const successHistory = calculateSuccessHistory(profile, edital);
  const diversity = calculateDiversity(profile, edital);
  const deadlineFactor = calculateDeadlineFactor(edital);
  const valueFactor = calculateValueFactor(profile, edital);

  const score = Math.round(
    thematicAlignment +
      impactPotential +
      competitiveness +
      technicalViability +
      successHistory +
      diversity +
      deadlineFactor +
      valueFactor
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    eligible: true,
    eliminationReasons: [],
    breakdown: {
      thematicAlignment,
      impactPotential,
      competitiveness,
      technicalViability,
      successHistory,
      diversity,
      deadlineFactor,
      valueFactor,
    },
  };
}

function calculateThematicAlignment(profile: CompanyProfile, edital: Edital): number {
  let score = 0;

  // Direct sector match
  if (
    edital.sector.toLowerCase().includes(profile.sector.toLowerCase()) ||
    profile.sector.toLowerCase().includes(edital.sector.toLowerCase())
  ) {
    score += 15;
  }

  // Keyword match with goals
  const editalKeywords = edital.keywords.map((k) => k.toLowerCase());
  const goalMatches = profile.goals.filter((g) =>
    editalKeywords.some((k) => k.includes(g.toLowerCase()) || g.toLowerCase().includes(k))
  );
  score += Math.min(10, goalMatches.length * 3);

  return Math.min(25, score);
}

function calculateImpactPotential(profile: CompanyProfile, edital: Edital): number {
  let score = 0;

  // Revenue vs max value ratio
  if (edital.maxValue > 0) {
    const ratio = edital.maxValue / Math.max(profile.revenue, 1);
    if (ratio >= 0.5) score += 10;
    else if (ratio >= 0.2) score += 7;
    else if (ratio >= 0.1) score += 4;
  }

  // Stage alignment
  if (profile.stage === STAGES[0] || profile.stage === STAGES[1]) {
    // Early stage benefits more from funding
    score += 6;
  } else {
    score += 3;
  }

  // Employee count suggests capacity
  if (profile.employees >= 5 && profile.employees <= 50) {
    score += 4;
  } else if (profile.employees > 0) {
    score += 2;
  }

  return Math.min(20, score);
}

function calculateCompetitiveness(profile: CompanyProfile, edital: Edital): number {
  let score = 10; // Base

  // Smaller companies often face less competition in specific programs
  if (profile.companySize === "MEI" || profile.companySize === "ME") {
    score += 5;
  } else if (profile.companySize === "EPP") {
    score += 3;
  }

  // Fewer requirements = less competition filter
  if (edital.requirements.length <= 3) {
    score += 5;
  } else if (edital.requirements.length <= 6) {
    score += 3;
  }

  return Math.min(20, score);
}

function calculateTechnicalViability(profile: CompanyProfile, edital: Edital): number {
  let score = 0;

  // Revenue stability indicator
  if (profile.revenue > 0) {
    score += 8;
  }

  // Existing funding history shows capability
  if (profile.existingFunding.length > 0) {
    score += 5;
  }

  // Employee base for execution
  if (profile.employees >= 3) {
    score += 2;
  }

  return Math.min(15, score);
}

function calculateSuccessHistory(_profile: CompanyProfile, _edital: Edital): number {
  // In a real system, this would check historical approval rates
  // For now, return a base score
  return 5;
}

function calculateDiversity(profile: CompanyProfile, edital: Edital): number {
  let score = 0;

  // Location diversity - if in less represented region
  const lessRepresentedStates = ["AC", "AP", "AM", "PA", "RO", "RR", "TO", "MA", "PI", "CE", "PB", "PE", "AL", "SE", "BA"];
  if (lessRepresentedStates.includes(profile.state)) {
    score += 6;
  } else {
    score += 3;
  }

  // Sector diversity
  const prioritySectors = ["Agronegócio", "Sustentabilidade", "Tecnologia da Informação", "Saúde"];
  if (prioritySectors.includes(profile.sector)) {
    score += 4;
  } else {
    score += 2;
  }

  return Math.min(10, score);
}

function calculateDeadlineFactor(edital: Edital): number {
  const now = new Date();
  const deadline = new Date(edital.deadline);
  const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) return 0;
  if (daysLeft <= 7) return 2;
  if (daysLeft <= 14) return 4;
  if (daysLeft <= 30) return 5;
  return 3; // Too far away, less urgency
}

function calculateValueFactor(profile: CompanyProfile, edital: Edital): number {
  if (edital.maxValue <= 0) return 0;

  const ratio = edital.maxValue / Math.max(profile.revenue, 1);

  if (ratio >= 1) return 8;
  if (ratio >= 0.5) return 6;
  if (ratio >= 0.2) return 4;
  if (ratio >= 0.1) return 2;
  return 1;
}

export function calculateFundingPotentialScore(profile: CompanyProfile): number {
  let score = 0;

  // Company size factor
  const sizeIndex = COMPANY_SIZES.indexOf(
    COMPANY_SIZES.find((s) => s === profile.companySize) ?? ""
  );
  if (sizeIndex >= 0 && sizeIndex <= 1) {
    score += 25; // MEI/ME have many specific programs
  } else if (sizeIndex === 2) {
    score += 20; // EPP
  } else {
    score += 10; // Larger companies
  }

  // Revenue factor
  if (profile.revenue > 0 && profile.revenue <= 360000) {
    score += 25;
  } else if (profile.revenue <= 4800000) {
    score += 20;
  } else if (profile.revenue <= 78000000) {
    score += 15;
  } else {
    score += 10;
  }

  // Sector factor
  const highPrioritySectors = [
    "Tecnologia da Informação",
    "Agronegócio",
    "Sustentabilidade",
    "Saúde",
    "Educação",
  ];
  if (highPrioritySectors.includes(profile.sector)) {
    score += 25;
  } else {
    score += 15;
  }

  // Location factor
  const priorityLocations = ["Norte", "Nordeste", "Centro-Oeste"];
  if (priorityLocations.some((loc) => profile.state.includes(loc))) {
    score += 15;
  } else {
    score += 10;
  }

  // Goals alignment with common funding types
  const fundingGoals = [
    "crescimento",
    "expansão",
    "tecnologia",
    "inovação",
    "sustentabilidade",
    "capacitação",
  ];
  const matchingGoals = profile.goals.filter((g) =>
    fundingGoals.some((fg) => g.toLowerCase().includes(fg))
  );
  score += Math.min(10, matchingGoals.length * 3);

  return Math.min(100, score);
}
