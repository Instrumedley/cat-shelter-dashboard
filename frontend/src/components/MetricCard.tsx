import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value?: number;
  subtitle?: string;
  min?: {
    count: number;
    month: string;
  } | null;
  max?: {
    count: number;
    month: string;
  } | null;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value = 0,
  subtitle,
  min,
  max,
}) => {
  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      
      <div className="text-3xl font-bold text-primary-600 mb-2">
        {value.toLocaleString()}
      </div>
      
      {subtitle && (
        <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
      )}

      {(min || max) && (
        <div className="space-y-2 text-sm">
          {min && (
            <div className="flex items-center text-gray-600">
              <TrendingDown className="h-4 w-4 text-red-500 mr-2" />
              <span>Min: {min.count} in {formatMonth(min.month)}</span>
            </div>
          )}
          {max && (
            <div className="flex items-center text-gray-600">
              <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
              <span>Max: {max.count} in {formatMonth(max.month)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
