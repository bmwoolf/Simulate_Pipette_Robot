import { PipetteCalculator } from '../pipetteCalculator';
import { SampleInput, SimulationConfig } from '@/types/pipette';

describe('PipetteCalculator', () => {
  const defaultConfig: SimulationConfig = {
    targetConcentration: 20,
    maxTotalVolume: 50,
    volumePrecision: 0.1
  };

  let calculator: PipetteCalculator;

  beforeEach(() => {
    calculator = new PipetteCalculator(defaultConfig);
  });

  describe('calculateSampleVolumes', () => {
    it('should calculate correct volumes for a sample with concentration higher than target', () => {
      const sample: SampleInput = {
        SampleID: 'Test01',
        'Concentration (ng/µL)': 40
      };

      const result = calculator.calculateSampleVolumes(sample);

      expect(result['Volume Sample (µL)']).toBeCloseTo(25.0, 2);
      expect(result['Volume Water (µL)']).toBeCloseTo(25.0, 2);
      expect(result['Total Volume (µL)']).toBeCloseTo(50.0, 2);
      expect(result['Final Concentration (ng/µL)']).toBeCloseTo(20.0, 2);
    });

    it('should calculate correct volumes for a sample with concentration lower than target', () => {
      const sample: SampleInput = {
        SampleID: 'Test02',
        'Concentration (ng/µL)': 10
      };

      const result = calculator.calculateSampleVolumes(sample);

      // Should use all sample, no water, final concentration < target
      expect(result['Volume Sample (µL)']).toBeCloseTo(50.0, 2);
      expect(result['Volume Water (µL)']).toBeCloseTo(0.0, 2);
      expect(result['Total Volume (µL)']).toBeCloseTo(50.0, 2);
      expect(result['Final Concentration (ng/µL)']).toBeCloseTo(10.0, 2);
    });

    it('should handle sample already at target concentration', () => {
      const sample: SampleInput = {
        SampleID: 'Test03',
        'Concentration (ng/µL)': 20
      };

      const result = calculator.calculateSampleVolumes(sample);

      expect(result['Volume Sample (µL)']).toBeCloseTo(1.0, 2);
      expect(result['Volume Water (µL)']).toBeCloseTo(49.0, 2);
      expect(result['Total Volume (µL)']).toBeCloseTo(50.0, 2);
      expect(result['Final Concentration (ng/µL)']).toBeCloseTo(20.0, 2);
    });

    it('should round volumes to specified precision', () => {
      const sample: SampleInput = {
        SampleID: 'Test04',
        'Concentration (ng/µL)': 33.333
      };

      const result = calculator.calculateSampleVolumes(sample);

      // Should be rounded to 0.1 µL precision
      expect(Math.abs(result['Volume Sample (µL)'] % 0.1)).toBeLessThan(0.11);
      expect(Math.abs(result['Volume Water (µL)'] % 0.1)).toBeLessThan(0.11);
      expect(Math.abs(result['Total Volume (µL)'] % 0.1)).toBeLessThan(0.11);
    });

    it('should handle edge case with very high concentration', () => {
      const sample: SampleInput = {
        SampleID: 'Test05',
        'Concentration (ng/µL)': 1000
      };

      const result = calculator.calculateSampleVolumes(sample);

      expect(result['Volume Sample (µL)']).toBeCloseTo(1.0, 2);
      expect(result['Volume Water (µL)']).toBeCloseTo(49.0, 2);
      expect(result['Total Volume (µL)']).toBeCloseTo(50.0, 2);
    });

    it('should handle edge case with very low concentration (min sample volume)', () => {
      const sample: SampleInput = {
        SampleID: 'Test06',
        'Concentration (ng/µL)': 0.5
      };

      const result = calculator.calculateSampleVolumes(sample);

      // Should use all sample, no water, final concentration < target
      expect(result['Volume Sample (µL)']).toBeCloseTo(50.0, 2);
      expect(result['Volume Water (µL)']).toBeCloseTo(0.0, 2);
      expect(result['Total Volume (µL)']).toBeCloseTo(50.0, 2);
      expect(result['Final Concentration (ng/µL)']).toBeCloseTo(0.5, 2);
    });
  });

  describe('processSamples', () => {
    it('should process multiple samples correctly', () => {
      const samples: SampleInput[] = [
        { SampleID: 'Sample01', 'Concentration (ng/µL)': 40 },
        { SampleID: 'Sample02', 'Concentration (ng/µL)': 10 },
        { SampleID: 'Sample03', 'Concentration (ng/µL)': 20 }
      ];

      const results = calculator.processSamples(samples);

      expect(results).toHaveLength(3);
      expect(results[0].SampleID).toBe('Sample01');
      expect(results[1].SampleID).toBe('Sample02');
      expect(results[2].SampleID).toBe('Sample03');
    });
  });

  describe('generateCSV', () => {
    it('should generate correct CSV format', () => {
      const results = [
        {
          SampleID: 'Test01',
          'Volume Sample (µL)': 25.0,
          'Volume Water (µL)': 25.0,
          'Total Volume (µL)': 50.0,
          'Final Concentration (ng/µL)': 20.0
        }
      ];

      const csv = calculator.generateCSV(results);
      const expected = 'SampleID,Volume Sample (µL),Volume Water (µL)\nTest01,25,25';

      expect(csv).toBe(expected);
    });
  });

  describe('custom configuration', () => {
    it('should work with different target concentration', () => {
      const customConfig: SimulationConfig = {
        targetConcentration: 15,
        maxTotalVolume: 50,
        volumePrecision: 0.1
      };

      const customCalculator = new PipetteCalculator(customConfig);
      const sample: SampleInput = {
        SampleID: 'Test07',
        'Concentration (ng/µL)': 30
      };

      const result = customCalculator.calculateSampleVolumes(sample);

      expect(result['Volume Sample (µL)']).toBeCloseTo(25.0, 2);
      expect(result['Volume Water (µL)']).toBeCloseTo(25.0, 2);
      // Actual final concentration is 15 due to correct rounding
      expect(result['Final Concentration (ng/µL)']).toBeCloseTo(15.0, 2);
    });

    it('should work with different max total volume', () => {
      const customConfig: SimulationConfig = {
        targetConcentration: 20,
        maxTotalVolume: 100,
        volumePrecision: 0.1
      };

      const customCalculator = new PipetteCalculator(customConfig);
      const sample: SampleInput = {
        SampleID: 'Test08',
        'Concentration (ng/µL)': 10
      };

      const result = customCalculator.calculateSampleVolumes(sample);

      // Should use all sample, no water, final concentration < target
      expect(result['Volume Sample (µL)']).toBeCloseTo(100.0, 2);
      expect(result['Volume Water (µL)']).toBeCloseTo(0.0, 2);
      expect(result['Total Volume (µL)']).toBeCloseTo(100.0, 2);
      expect(result['Final Concentration (ng/µL)']).toBeCloseTo(10.0, 2);
    });
  });
}); 