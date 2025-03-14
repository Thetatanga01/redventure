export interface SimulationInputs {
  initialMAU: number;
  growthRate: number;
  standardDeviation: number;
  revenuePerUser: number;
}

export interface ScenarioData {
  name: string;
  initialMAU: number;
  growthRate: number;
  yearlyRevenue: number;
  similarity?: number;
}

export interface SimulationResults {
  mauProjection: number[];
  percentile95: number[];
  minMax: {
    min: number[];
    max: number[];
  };
  finalMAU: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  closestScenario: string;
  scenarioSimilarity: {
    initialMAU: number;
    growthRate: number;
    finalMAU: number;
    revenue: number;
  };
} 