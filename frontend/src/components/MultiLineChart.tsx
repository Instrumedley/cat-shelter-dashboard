import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface MultiLineChartProps {
  data: Array<{
    month: string;
    [key: string]: string | number;
  }>;
  lines: Array<{
    dataKey: string;
    name: string;
    color: string;
  }>;
  title?: string;
}

const MultiLineChart: React.FC<MultiLineChartProps> = ({ data, lines, title }) => {
  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const chartData = data.map(item => {
    const formatted: any = {
      month: formatMonth(item.month),
    };
    lines.forEach(line => {
      formatted[line.dataKey] = item[line.dataKey] || 0;
    });
    return formatted;
  });

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        No data available
      </div>
    );
  }

  // Calculate dynamic Y-axis domain based on all line values
  const extractNumericValue = (val: any): number | null => {
    if (val === null || val === undefined) return null;
    const num = typeof val === 'number' ? val : Number(val);
    return isNaN(num) ? null : num;
  };
  
  const allValues: number[] = [];
  
  // Try from original data first
  data.forEach(item => {
    lines.forEach(line => {
      const value = item[line.dataKey];
      const numValue = extractNumericValue(value);
      if (numValue !== null) {
        allValues.push(numValue);
      }
    });
  });

  // Handle edge cases - if no values found, try from chartData
  if (allValues.length === 0) {
    // Fallback: try from chartData
    chartData.forEach(item => {
      lines.forEach(line => {
        const value = item[line.dataKey];
        const numValue = extractNumericValue(value);
        if (numValue !== null) {
          allValues.push(numValue);
        }
      });
    });
    
  }

  // Calculate domain - use undefined for auto-scaling if no valid values found
  let yAxisDomain: [number, number] | undefined = undefined;
  
  if (allValues.length > 0) {
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    
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
            formatter={(value: number, name: string) => [value, name]}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Legend />
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={2}
              dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: line.color, strokeWidth: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MultiLineChart;

