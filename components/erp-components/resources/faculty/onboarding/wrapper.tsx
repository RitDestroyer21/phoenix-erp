'use client';

import { useState, useEffect } from 'react';
import { Department, GetAllDeptDetails } from '@/lib/db/management/departments';
import SingleFacultyForm from './single-upload';
import BulkFacultyUpload from './bulk-upload';

export function FacultyOnboardingWrapper() {
  const [activeTab, setActiveTab] = useState<'SINGLE' | 'BULK'>('SINGLE');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initComponentContext() {
      try {
        setLoading(true);
        const data = await GetAllDeptDetails();
        setDepartments(data);
      } catch (err: any) {
        setError('Failed to fetch foundational department metadata.');
      } finally {
        setLoading(false);
      }
    }
    initComponentContext();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-sm text-muted-foreground animate-pulse">Initializing Faculty Intake Systems...</div>;
  }

  if (error) {
    return <div className="max-w-md mx-auto my-6 p-4 text-center text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-2 py-4">
      {/* Header Profile Title Details */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-300">Faculty Onboarding Dashboard</h1>
        <p className="text-sm text-muted-foreground">Register incoming academic staff members individually or sync complete roster batches.</p>
      </div>

      {/* Styled Segmented Mode Toggles Selector */}
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

      {/* Dynamic Content Switching Layer */}
      <div className="mt-4 transition-all duration-200">
        {activeTab === 'SINGLE' ? (
          <SingleFacultyForm departments={departments} />
        ) : (
          <BulkFacultyUpload departments={departments} />
        )}
      </div>
    </div>
  );
}