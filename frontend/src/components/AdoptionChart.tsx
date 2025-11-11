import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AdoptionChartProps {
  data: Array<{ month: string; count: number }>;
  title?: string;
}

const AdoptionChart: React.FC<AdoptionChartProps> = ({ data, title = 'Adoption History' }) => {
  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const chartData = data.map(item => ({
    month: formatMonth(item.month),
    adoptions: item.count,
  }));

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  // Calculate dynamic Y-axis domain based on data
  // Extract all numeric values from the data
  const extractValues = (items: typeof chartData, key: string): number[] => {
    return items
      .map(item => {
        const val = (item as any)[key];
        if (val === null || val === undefined) return null;
        const num = typeof val === 'number' ? val : Number(val);
        return isNaN(num) ? null : num;
      })
      .filter((v): v is number => v !== null);
  };
  
  let values = extractValues(chartData, 'adoptions');
  
  // Fallback to original data if chartData has no valid values
  if (values.length === 0) {
    values = data
      .map(item => {
        const val = item.count;
        if (val === null || val === undefined) return null;
        const num = typeof val === 'number' ? val : Number(val);
        return isNaN(num) ? null : num;
      })
      .filter((v): v is number => v !== null);
  }
  
  // Calculate domain - use undefined for auto-scaling if no valid values found
  let yAxisDomain: [number, number] | undefined = undefined;
  
  if (values.length > 0) {
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // Add padding to the domain (10% on top and bottom)
    const range = maxValue - minValue;
    const padding = range > 0 ? range * 0.1 : Math.max(maxValue * 0.1, 1);
    yAxisDomain = [
      Math.max(0, Math.floor(minValue - padding)), // Start at 0 or slightly below min
      Math.ceil(maxValue + padding) // Add padding above max
    ];
  }

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            domain={yAxisDomain}
            allowDecimals={false}
            type="number"
          />
          <Tooltip 
            formatter={(value: number) => [value, 'Adoptions']}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="adoptions" 
            stroke="#0ea5e9" 
            strokeWidth={2}
            dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#0ea5e9', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdoptionChart;
