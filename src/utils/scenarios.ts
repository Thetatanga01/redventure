import { ScenarioData } from '../types';

export const predefinedScenarios: ScenarioData[] = [
  {
    name: 'Assertive',
    initialMAU: 10,
    growthRate: 30,
    yearlyRevenue: 180,
  },
  {
    name: 'Realistic',
    initialMAU: 10,
    growthRate: 10,
    yearlyRevenue: 60,
  },
  {
    name: 'Optional',
    initialMAU: 5,
    growthRate: 3,
    yearlyRevenue: 9,
  },
  {
    name: 'Conservative',
    initialMAU: 5,
    growthRate: 1,
    yearlyRevenue: 3,
  },
  {
    name: 'Minimum',
    initialMAU: 1,
    growthRate: 1,
    yearlyRevenue: 0.6,
  },
]; 