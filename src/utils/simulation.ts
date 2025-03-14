import { SimulationInputs, SimulationResults, ScenarioData } from '../types';
import { predefinedScenarios } from './scenarios';

const MONTHS = 12;
const SIMULATIONS = 1000;

function normalRandom(mean: number, stdDev: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  
  const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return num * stdDev + mean;
}

function calculateSimilarity(a: number, b: number): number {
  const maxDiff = Math.max(a, b) * 0.5;
  const actualDiff = Math.abs(a - b);
  return Math.max(0, 100 * (1 - actualDiff / maxDiff));
}

export function runMonteCarloSimulation(inputs: SimulationInputs): SimulationResults {
  const { initialMAU, growthRate, standardDeviation, revenuePerUser } = inputs;
  
  const allSimulations: number[][] = [];
  
  // Run simulations
  for (let i = 0; i < SIMULATIONS; i++) {
    const simulation: number[] = [initialMAU];
    for (let month = 1; month < MONTHS; month++) {
      const monthlyGrowth = normalRandom(growthRate / 12, standardDeviation / Math.sqrt(12));
      const prevMAU = simulation[month - 1];
      const newMAU = prevMAU * (1 + monthlyGrowth / 100);
      simulation.push(newMAU);
    }
    allSimulations.push(simulation);
  }

  // Calculate statistics
  const mauProjection: number[] = new Array(MONTHS).fill(0);
  const percentile95: number[] = new Array(MONTHS).fill(0);
  const minMax = { min: new Array(MONTHS).fill(Infinity), max: new Array(MONTHS).fill(-Infinity) };

  for (let month = 0; month < MONTHS; month++) {
    const monthValues = allSimulations.map(sim => sim[month]).sort((a, b) => a - b);
    mauProjection[month] = monthValues.reduce((a, b) => a + b) / SIMULATIONS;
    percentile95[month] = monthValues[Math.floor(SIMULATIONS * 0.95)];
    minMax.min[month] = monthValues[0];
    minMax.max[month] = monthValues[SIMULATIONS - 1];
  }

  const finalMAU = mauProjection[MONTHS - 1];
  const monthlyRevenue = finalMAU * revenuePerUser;
  const yearlyRevenue = monthlyRevenue * 12;

  // Find closest scenario
  let closestScenario = '';
  let bestSimilarityScore = -1;
  const scenarioSimilarity = {
    initialMAU: 0,
    growthRate: 0,
    finalMAU: 0,
    revenue: 0,
  };

  predefinedScenarios.forEach(scenario => {
    const initialMAUSimilarity = calculateSimilarity(initialMAU, scenario.initialMAU);
    const growthRateSimilarity = calculateSimilarity(growthRate, scenario.growthRate);
    const finalMAUSimilarity = calculateSimilarity(finalMAU, scenario.initialMAU * Math.pow(1 + scenario.growthRate / 100, 1));
    const revenueSimilarity = calculateSimilarity(yearlyRevenue, scenario.yearlyRevenue);

    const totalSimilarity = (initialMAUSimilarity + growthRateSimilarity + finalMAUSimilarity + revenueSimilarity) / 4;

    if (totalSimilarity > bestSimilarityScore) {
      bestSimilarityScore = totalSimilarity;
      closestScenario = scenario.name;
      scenarioSimilarity.initialMAU = initialMAUSimilarity;
      scenarioSimilarity.growthRate = growthRateSimilarity;
      scenarioSimilarity.finalMAU = finalMAUSimilarity;
      scenarioSimilarity.revenue = revenueSimilarity;
    }
  });

  return {
    mauProjection,
    percentile95,
    minMax,
    finalMAU,
    monthlyRevenue,
    yearlyRevenue,
    closestScenario,
    scenarioSimilarity,
  };
} 