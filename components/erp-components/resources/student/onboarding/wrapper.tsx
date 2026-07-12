'use client';

import { useState } from 'react';
import SingleStudentForm from './single-upload';
import BulkStudentUpload from './bulk-upload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function StudentOnboardingWrapper() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');

  return (
    <Card className="w-full max-w-4xl mx-auto border shadow-sm">
      <CardHeader className="text-center space-y-2 pb-4">
        <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-300">
          Student Onboarding Dashboard
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Select your preferred method to onboard new students into the system ledger.
        </CardDescription>
        
        {/* Styled Segmented Mode Toggles Selector (Faculty Theme Match) */}
        <div className="flex justify-center pt-2">
          <div className="inline-flex rounded-lg border p-1 bg-slate-100">
            <button
              onClick={() => setMode('single')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                mode === 'single'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Single Student Profile
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                mode === 'bulk'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulk CSV Upload
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="mt-2 transition-all duration-200">
        {mode === 'single' ? <SingleStudentForm /> : <BulkStudentUpload />}
      </CardContent>
    </Card>
  );
}