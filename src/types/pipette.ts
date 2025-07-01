export interface SampleInput {
  SampleID: string;
  'Concentration (ng/µL)': number;
}

export interface PipetteResult {
  SampleID: string;
  'Volume Sample (µL)': number;
  'Volume Water (µL)': number;
  'Total Volume (µL)': number;
  'Final Concentration (ng/µL)': number;
}

export interface SimulationConfig {
  targetConcentration: number;
  maxTotalVolume: number;
  volumePrecision: number;
} 