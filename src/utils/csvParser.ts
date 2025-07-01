import Papa from 'papaparse';
import { SampleInput } from '@/types/pipette';

export class CSVParser {
  /**
   * Parse CSV file content and return array of samples
   */
  static parseSampleData(csvContent: string): SampleInput[] {
    const result = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value, field) => {
        // Convert concentration to number
        if (field === 'Concentration (ng/µL)') {
          return parseFloat(value) || 0;
        }
        return value;
      }
    });

    if (result.errors.length > 0) {
      throw new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
    }

    return result.data as SampleInput[];
  }

  /**
   * Validate sample data
   */
  static validateSamples(samples: SampleInput[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (samples.length === 0) {
      errors.push('No samples found in CSV file');
    }

    samples.forEach((sample, index) => {
      if (!sample.SampleID) {
        errors.push(`Sample ${index + 1}: Missing SampleID`);
      }
      
      if (sample['Concentration (ng/µL)'] <= 0) {
        errors.push(`Sample ${sample.SampleID}: Concentration must be greater than 0`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate sample CSV template
   */
  static generateTemplate(): string {
    const template = [
      'SampleID,Concentration (ng/µL)',
      'Sample01,48.7',
      'Sample02,12.3',
      'Sample03,35.2',
      'Sample04,8.9',
      'Sample05,42.1'
    ];
    return template.join('\n');
  }
} 