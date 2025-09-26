import React from 'react';
import { BatchSummary } from '../components/BatchSummary';

export const BatchSummaryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <BatchSummary />
    </div>
  );
};