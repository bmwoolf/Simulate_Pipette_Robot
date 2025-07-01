'use client';

import { useState, useCallback } from 'react';
import { CSVParser } from '@/utils/csvParser';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  error: string;
}

export default function FileUpload({ onFileUpload, isProcessing, error }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'));
    
    if (csvFile) {
      onFileUpload(csvFile);
    }
  }, [onFileUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const downloadTemplate = () => {
    const template = CSVParser.generateTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_concentrations_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">
        Upload Sample Data
      </h2>
      
      <div className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            <div className="text-gray-600">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isProcessing ? 'Processing...' : 'Upload your CSV file'}
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop a CSV file here, or click to browse
              </p>
            </div>

            {!isProcessing && (
              <div>
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
                  Browse Files
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isProcessing}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowTemplate(!showTemplate)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showTemplate ? 'Hide' : 'Show'} CSV format requirements
          </button>
          
          <button
            type="button"
            onClick={downloadTemplate}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            Download Template
          </button>
        </div>

        {showTemplate && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">CSV Format Requirements:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Header row: <code className="bg-gray-200 px-1 rounded">SampleID,Concentration (ng/µL)</code></p>
              <p>• SampleID: Unique identifier for each sample</p>
              <p>• Concentration: Positive number in ng/µL</p>
              <p>• Example: <code className="bg-gray-200 px-1 rounded">Sample01,48.7</code></p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700 whitespace-pre-line">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 