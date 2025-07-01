'use client';

import { useState } from 'react';
import { PipetteCalculator } from '@/utils/pipetteCalculator';
import { CSVParser } from '@/utils/csvParser';
import { SampleInput, PipetteResult } from '@/types/pipette';
import ResultsTable from '@/components/ResultsTable';
import VolumeChart from '@/components/VolumeChart';
import FileUpload from '@/components/FileUpload';

export default function Home() {
  const [samples, setSamples] = useState<SampleInput[]>([]);
  const [results, setResults] = useState<PipetteResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const config = {
    targetConcentration: 20,
    maxTotalVolume: 50,
    volumePrecision: 0.1
  };

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setError('');

    try {
      const text = await file.text();
      const parsedSamples = CSVParser.parseSampleData(text);
      const validation = CSVParser.validateSamples(parsedSamples);

      if (!validation.isValid) {
        setError(validation.errors.join('\n'));
        return;
      }

      setSamples(parsedSamples);
      
      // Run simulation
      const calculator = new PipetteCalculator(config);
      const simulationResults = calculator.processSamples(parsedSamples);
      setResults(simulationResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadCSV = () => {
    if (results.length === 0) return;

    const calculator = new PipetteCalculator(config);
    const csvContent = calculator.generateCSV(results);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipette_protocol.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Robotic Pipetting Protocol Simulator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simulate liquid-handling robot protocols for normalizing DNA concentrations 
            to a target of 20 ng/µL with volume constraints and precision requirements.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <FileUpload 
            onFileUpload={handleFileUpload} 
            isProcessing={isProcessing}
            error={error}
          />

          {results.length > 0 && (
            <div className="mt-8 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Simulation Results
                  </h2>
                  <button
                    onClick={downloadCSV}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    Download CSV
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Samples Processed</div>
                    <div className="text-2xl font-bold text-blue-900">{results.length}</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Target Concentration</div>
                    <div className="text-2xl font-bold text-green-900">20 ng/µL</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Max Total Volume</div>
                    <div className="text-2xl font-bold text-purple-900">50 µL</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm text-orange-600 font-medium">Volume Precision</div>
                    <div className="text-2xl font-bold text-orange-900">0.1 µL</div>
                  </div>
                </div>

                <ResultsTable results={results} />
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Volume Distribution Analysis
                </h3>
                <VolumeChart results={results} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
