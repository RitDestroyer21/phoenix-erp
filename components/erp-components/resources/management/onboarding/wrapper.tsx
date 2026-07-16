'use client';

import { useState } from 'react';
import SingleManagementForm from './single-upload';
import BulkManagementUpload from './bulk-upload';

export function ManagementOnboardingWrapper() {
  const [activeTab, setActiveTab] = useState<'SINGLE' | 'BULK'>('SINGLE');

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2 py-4">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-300">Management Onboarding Dashboard</h1>
        <p className="text-sm text-muted-foreground">Register executive management staff members individually or sync complete roster batches.</p>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border p-1 bg-slate-100">
          <button
            onClick={() => setActiveTab('SINGLE')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'SINGLE'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Single Member Profile
          </button>
          <button
            onClick={() => setActiveTab('BULK')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'BULK'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bulk Spreadsheet Upload
          </button>
        </div>
      </div>

      <div className="mt-4 transition-all duration-200">
        {activeTab === 'SINGLE' ? (
          <SingleManagementForm />
        ) : (
          <BulkManagementUpload />
        )}
      </div>
    </div>
  );
}