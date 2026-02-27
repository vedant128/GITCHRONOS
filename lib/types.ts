export interface FileChange {
  fileName: string;
  insertions: number;
  deletions: number;
  changes: number;
}

export interface CommitData {
  hash: string;
  author_name: string;
  date: string;
  message: string;
  filesChanged: FileChange[];
}

export interface ContributorNode {
  id: string; // author name
  commitCount: number;
}

export interface ContributorLink {
  source: string;
  target: string;
  weight: number;
}

export interface ContributorGraphData {
  nodes: ContributorNode[];
  links: ContributorLink[];
}

export interface FileChurn {
  fileName: string;
  totalChanges: number;
  contributors: string[];
  contributorCount: number;
}

export interface Hotspot extends Omit<FileChurn, 'contributors'> {
  contributors: string[];
  score: number;
}

export interface AIInsight {
  technicalDebtRisks: string[];
  maintenanceHotspots: string[];
  teamProductivityPatterns: string[];
  refactoringSuggestions: string[];
}

export interface BusFactorResult {
  busFactor: number;
  riskLevel: "Low" | "Medium" | "High";
  singlePointOfFailureFiles: string[];
  ownershipData: { author: string; percentage: number; fileCount: number }[];
}

export interface MergeRiskResult {
  file: string;
  concurrentEditors: number;
  riskScore: number;
  recentEditors: string[];
}

export interface HealthScoreResult {
  healthScore: number;
  grade: "A" | "B" | "C" | "D";
  summary: string;
}

export interface ProductivityResult {
  commitsPerDay: { date: string; count: number }[];
  commitsPerHour: { hour: string; count: number }[];
  weekendActivityPercentage: number;
}

export interface CommitSentimentResult {
  sentimentDistribution: {
    Refactor: number;
    BugFix: number;
    Feature: number;
    Hack: number;
    Patch: number;
  };
  reactiveMaintenanceScore: number;
}

export interface BranchComparisonResult {
  commitDelta: number;
  churnDelta: number;
  contributorDelta: number;
  hotspotDelta: number;
  baseCommits: number;
  compareCommits: number;
}
