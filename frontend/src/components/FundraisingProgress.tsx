import React from 'react';

interface FundraisingProgressProps {
  campaign: {
    title: string;
    currentAmount: number;
    targetAmount: number;
    currency: string;
    progress: number;
  };
}

const FundraisingProgress: React.FC<FundraisingProgressProps> = ({ campaign }) => {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {campaign.title}
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{campaign.progress.toFixed(1)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(campaign.progress, 100)}%` }}
          ></div>
        </div>
        
        <div className="flex justify-between text-lg font-semibold">
          <span className="text-primary-600">
            {formatCurrency(campaign.currentAmount, campaign.currency)}
          </span>
          <span className="text-gray-500">
            of {formatCurrency(campaign.targetAmount, campaign.currency)}
          </span>
        </div>
        
        <div className="text-sm text-gray-600">
          {formatCurrency(campaign.targetAmount - campaign.currentAmount, campaign.currency)} remaining
        </div>
      </div>
    </div>
  );
};

export default FundraisingProgress;
