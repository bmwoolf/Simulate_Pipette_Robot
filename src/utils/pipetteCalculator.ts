import { SampleInput, PipetteResult, SimulationConfig } from '@/types/pipette';

export class PipetteCalculator {
  private config: SimulationConfig;

  constructor(config: SimulationConfig) {
    this.config = config;
  }

  /**
   * Calculate pipette volumes for a single sample using dilution formula
   * C1 * V1 = C2 * V2
   * Where:
   * C1 = original concentration
   * C2 = target concentration (20 ng/µL)
   * V2 = total volume (≤ 50 µL)
   * V1 = sample volume
   * V_water = V2 - V1
   */
  calculateSampleVolumes(sample: SampleInput): PipetteResult {
    const { targetConcentration, maxTotalVolume, volumePrecision } = this.config;
    const originalConcentration = sample['Concentration (ng/µL)'];
    const minSampleVolume = 1.0;

    // If concentration is already at target, use minimum volume
    if (Math.abs(originalConcentration - targetConcentration) < 0.01) {
      const sampleVolume = this.roundToPrecision(minSampleVolume, volumePrecision);
      const waterVolume = this.roundToPrecision(maxTotalVolume - sampleVolume, volumePrecision);
      return {
        SampleID: sample.SampleID,
        'Volume Sample (µL)': sampleVolume,
        'Volume Water (µL)': waterVolume,
        'Total Volume (µL)': this.roundToPrecision(sampleVolume + waterVolume, volumePrecision),
        'Final Concentration (ng/µL)': targetConcentration
      };
    }

    // Calculate required sample volume using dilution formula
    // C1 * V1 = C2 * V2
    // V1 = (C2 * V2) / C1
    let totalVolume = maxTotalVolume;
    let sampleVolume = (targetConcentration * totalVolume) / originalConcentration;
    let waterVolume = totalVolume - sampleVolume;

    // If sample volume exceeds total volume, use all sample, no water
    if (sampleVolume > maxTotalVolume) {
      sampleVolume = maxTotalVolume;
      waterVolume = 0;
      totalVolume = maxTotalVolume;
    }

    // If sample volume is less than minimum, use minimum sample, rest water
    if (sampleVolume < minSampleVolume) {
      sampleVolume = minSampleVolume;
      waterVolume = maxTotalVolume - minSampleVolume;
      totalVolume = maxTotalVolume;
    }

    // Round volumes to precision
    sampleVolume = this.roundToPrecision(sampleVolume, volumePrecision);
    waterVolume = this.roundToPrecision(waterVolume, volumePrecision);
    totalVolume = this.roundToPrecision(totalVolume, volumePrecision);

    // If water volume is negative, set to 0 and sample to total
    if (waterVolume < 0) {
      waterVolume = 0;
      sampleVolume = totalVolume;
    }

    // Calculate actual final concentration
    const finalConcentration = (originalConcentration * sampleVolume) / totalVolume;

    return {
      SampleID: sample.SampleID,
      'Volume Sample (µL)': sampleVolume,
      'Volume Water (µL)': waterVolume,
      'Total Volume (µL)': totalVolume,
      'Final Concentration (ng/µL)': this.roundToPrecision(finalConcentration, 0.01)
    };
  }

  /**
   * Process all samples and return results
   */
  processSamples(samples: SampleInput[]): PipetteResult[] {
    return samples.map(sample => this.calculateSampleVolumes(sample));
  }

  /**
   * Robust round number to specified precision
   */
  private roundToPrecision(value: number, precision: number): number {
    return Math.round((value + Number.EPSILON) / precision) * precision;
  }

  /**
   * Generate CSV content from results
   */
  generateCSV(results: PipetteResult[]): string {
    const headers = ['SampleID', 'Volume Sample (µL)', 'Volume Water (µL)'];
    const csvRows = [headers.join(',')];
    
    results.forEach(result => {
      const row = [
        result.SampleID,
        result['Volume Sample (µL)'].toString(),
        result['Volume Water (µL)'].toString()
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  }
} 