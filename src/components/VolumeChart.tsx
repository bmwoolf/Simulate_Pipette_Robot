'use client';

import { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Line
} from 'recharts';
import { PipetteResult } from '@/types/pipette';

interface VolumeChartProps {
  results: PipetteResult[];
}

export default function VolumeChart({ results }: VolumeChartProps) {
  const chartData = useMemo(() => {
    return results.map((result, index) => ({
      index: index + 1,
      sampleId: result.SampleID,
      sampleVolume: result['Volume Sample (µL)'],
      waterVolume: result['Volume Water (µL)'],
      totalVolume: result['Total Volume (µL)'],
      finalConcentration: result['Final Concentration (ng/µL)']
    }));
  }, [results]);

  const volumeStats = useMemo(() => {
    const sampleVolumes = results.map(r => r['Volume Sample (µL)']);
    const waterVolumes = results.map(r => r['Volume Water (µL)']);
    const totalVolumes = results.map(r => r['Total Volume (µL)']);

    return {
      sampleVolume: {
        min: Math.min(...sampleVolumes),
        max: Math.max(...sampleVolumes),
        avg: sampleVolumes.reduce((a, b) => a + b, 0) / sampleVolumes.length
      },
      waterVolume: {
        min: Math.min(...waterVolumes),
        max: Math.max(...waterVolumes),
        avg: waterVolumes.reduce((a, b) => a + b, 0) / waterVolumes.length
      },
      totalVolume: {
        min: Math.min(...totalVolumes),
        max: Math.max(...totalVolumes),
        avg: totalVolumes.reduce((a, b) => a + b, 0) / totalVolumes.length
      }
    };
  }, [results]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">Sample {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(1)} µL
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Volume Distribution Chart */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Sample vs Water Volume Distribution
        </h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="index" 
              label={{ value: 'Sample Index', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Volume (µL)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="sampleVolume" fill="#3B82F6" name="Sample Volume" />
            <Bar dataKey="waterVolume" fill="#10B981" name="Water Volume" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">Sample Volume Statistics</h5>
          <div className="text-sm text-blue-700 space-y-1">
            <p>Min: {volumeStats.sampleVolume.min.toFixed(1)} µL</p>
            <p>Max: {volumeStats.sampleVolume.max.toFixed(1)} µL</p>
            <p>Avg: {volumeStats.sampleVolume.avg.toFixed(1)} µL</p>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h5 className="font-medium text-green-900 mb-2">Water Volume Statistics</h5>
          <div className="text-sm text-green-700 space-y-1">
            <p>Min: {volumeStats.waterVolume.min.toFixed(1)} µL</p>
            <p>Max: {volumeStats.waterVolume.max.toFixed(1)} µL</p>
            <p>Avg: {volumeStats.waterVolume.avg.toFixed(1)} µL</p>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <h5 className="font-medium text-purple-900 mb-2">Total Volume Statistics</h5>
          <div className="text-sm text-purple-700 space-y-1">
            <p>Min: {volumeStats.totalVolume.min.toFixed(1)} µL</p>
            <p>Max: {volumeStats.totalVolume.max.toFixed(1)} µL</p>
            <p>Avg: {volumeStats.totalVolume.avg.toFixed(1)} µL</p>
          </div>
        </div>
      </div>

      {/* Concentration vs Volume Scatter Plot */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Final Concentration vs Total Volume
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="totalVolume" 
              label={{ value: 'Total Volume (µL)', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              label={{ value: 'Final Concentration (ng/µL)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-medium text-gray-900">{data.sampleId}</p>
                      <p className="text-sm text-gray-600">
                        Volume: {data.totalVolume.toFixed(1)} µL
                      </p>
                      <p className="text-sm text-gray-600">
                        Concentration: {data.finalConcentration.toFixed(2)} ng/µL
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter dataKey="finalConcentration" fill="#8B5CF6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 