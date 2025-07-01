'use client';

import { useState, useMemo } from 'react';
import { PipetteResult } from '@/types/pipette';

interface ResultsTableProps {
  results: PipetteResult[];
}

type SortField = keyof PipetteResult;
type SortDirection = 'asc' | 'desc';

export default function ResultsTable({ results }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('SampleID');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle numeric sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }, [results, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const formatVolume = (value: number) => `${value.toFixed(1)} µL`;
  const formatConcentration = (value: number) => `${value.toFixed(2)} ng/µL`;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {[
              { key: 'SampleID', label: 'Sample ID' },
              { key: 'Volume Sample (µL)', label: 'Sample Volume' },
              { key: 'Volume Water (µL)', label: 'Water Volume' },
              { key: 'Total Volume (µL)', label: 'Total Volume' },
              { key: 'Final Concentration (ng/µL)', label: 'Final Concentration' }
            ].map(({ key, label }) => (
              <th
                key={key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort(key as SortField)}
              >
                <div className="flex items-center space-x-1">
                  <span>{label}</span>
                  <SortIcon field={key as SortField} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedResults.map((result, index) => (
            <tr key={result.SampleID} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {result.SampleID}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatVolume(result['Volume Sample (µL)'])}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatVolume(result['Volume Water (µL)'])}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatVolume(result['Total Volume (µL)'])}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatConcentration(result['Final Concentration (ng/µL)'])}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 