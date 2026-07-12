'use client';

import { useState } from 'react';
import { onboardSingleFaculty, FacultyOnboardPayload } from '@/lib/db/resourcelist/faculty';
import { Department } from '@/lib/db/management/departments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';


interface BulkFacultyUploadProps {
  departments: Department[];
}

interface ProcessingResult extends FacultyOnboardPayload {
  status: 'SUCCESS' | 'FAILED';
  remarks: string;
}

export default function BulkFacultyUpload({ departments }: BulkFacultyUploadProps) {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [results, setResults] = useState<ProcessingResult[]>([]);

  const downloadCleanTemplate = () => {
    const headers = 'firstName,middleName,lastName,dob,gender,phone1,phone2,mail1,mail2\n';
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'bulk_faculty_onboarding_template.csv');
    a.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
      setResults([]);
    }
  };

  const handleBulkUploadProcess = async () => {
    if (!file || !selectedDeptId) return;

    setProcessing(true);
    setError(null);
    setSuccess(null);
    setResults([]);

    try {
      const text = await file.text();
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length <= 1) {
        throw new Error('The uploaded CSV file does not contain any valid data rows.');
      }

      const headers = lines[0].split(',');

      const basePayloads = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        if (values.length < headers.length) return null;

        // DOB Parsing conversion (DD/MM/YYYY -> YYYY-MM-DD)
        const rawDob = values[3]?.trim();
        const dobParts = rawDob.split('/');
        if (dobParts.length !== 3) return null;
        const [day, month, year] = dobParts;

        return {
          firstName: values[0]?.trim(),
          middleName: values[1]?.trim() || null,
          lastName: values[2]?.trim(),
          dob: `${year}-${month}-${day}`,
          gender: values[4]?.trim()?.toUpperCase(),
          phone1: Number(values[5]),
          phone2: values[6] ? Number(values[6]) : null,
          mail1: values[7]?.trim(),
          mail2: values[8]?.trim() || null,
          deptId: selectedDeptId, // Global dynamic injection
        };
      }).filter(Boolean) as FacultyOnboardPayload[];

      if (basePayloads.length === 0) {
        throw new Error('No valid records could be extracted from your sheet.');
      }

      const outputReport: ProcessingResult[] = [];
      let successCount = 0;

      for (const payload of basePayloads) {
        try {
          await onboardSingleFaculty(payload);
          outputReport.push({
            ...payload,
            status: 'SUCCESS',
            remarks: 'Onboarded Successfully!',
          });
          successCount++;
        } catch (err: any) {
          outputReport.push({
            ...payload,
            status: 'FAILED',
            remarks: err.message || 'Data integrity allocation failure.',
          });
        }
      }

      setResults(outputReport);
      setSuccess(`Successfully synchronized ${successCount} out of ${basePayloads.length} faculty profiles.`);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Error occurred while running file analysis processes.');
    } finally {
      setProcessing(false);
    }
  };

  const downloadResponseReport = () => {
    if (results.length === 0) return;

    const header = 'firstName,middleName,lastName,dob,gender,phone1,phone2,mail1,mail2,status,remarks\n';
    const csvRows = results.map(row => {
      const [year, month, day] = row.dob.split('-');
      return [
        row.firstName, row.middleName || '', row.lastName, `${day}/${month}/${year}`,
        row.gender, row.phone1, row.phone2 || '', row.mail1, row.mail2 || '',
        row.status, `"${row.remarks.replace(/"/g, '""')}"`
      ].join(',');
    }).join('\n');

    const blob = new Blob([header + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `faculty_onboard_report_${new Date().toISOString().slice(0,10)}.csv`);
    a.click();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2">
      {error && <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">{error}</div>}
      {success && <div className="p-3 text-sm text-green-500 bg-green-50 border border-green-200 rounded">{success}</div>}

      <div className="bg-slate-50 border p-4 rounded-lg space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">1. Define Target Administrative Domain</h3>
        <div>
          <Label htmlFor="bulkDeptId">Target Department</Label>
          <select 
            id="bulkDeptId" 
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
          >
            <option value="">-- Select Department Context --</option>
            {departments.map((d) => (
              <option key={d.dept_id} value={d.dept_id}>
                {d.dept_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-dashed p-4 rounded-lg bg-slate-50 text-center">
        <h3 className="text-sm font-semibold mb-1">2. Download Standard Template</h3>
        <p className="text-xs text-muted-foreground mb-3">Obtain a clean data entry spreadsheet template.</p>
        <Button variant="outline" size="sm" onClick={downloadCleanTemplate}>
          Download Clean CSV Template
        </Button>
      </div>

      <div className="border border-dashed p-5 rounded-lg bg-slate-50 space-y-4">
        <h3 className="text-sm font-semibold text-center">3. Upload Completed Roster</h3>
        <div>
          <Label htmlFor="csvFile">Choose Populated CSV File</Label>
          <Input id="csvFile" type="file" accept=".csv" onChange={handleFileChange} className="mt-1 bg-background" disabled={!selectedDeptId || processing} />
          {!selectedDeptId && <p className="text-[11px] text-amber-600 mt-1">Please select an administration department target above to unlock parsing modules.</p>}
        </div>
        <Button className="w-full" disabled={!file || !selectedDeptId || processing} onClick={handleBulkUploadProcess}>
          {processing ? 'Processing Bulk Operations Ledger...' : 'Parse and Onboard Bulk Faculty'}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Batch Faculty Processing Report</h3>
            <Button variant="secondary" size="sm" onClick={downloadResponseReport}>Export Report CSV</Button>
          </div>
          <div className="overflow-x-auto border rounded-lg max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b font-semibold text-slate-700">
                  <th className="p-2">Faculty Member</th>
                  <th className="p-2">Official Email</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => {
                  const isSuccess = row.status === 'SUCCESS';
                  return (
                    <tr key={idx} className={`border-b transition-colors ${isSuccess ? 'bg-green-50/70 hover:bg-green-100/80 text-green-900 border-green-100' : 'bg-red-50/70 hover:bg-red-100/80 text-red-900 border-red-100'}`}>
                      <td className="p-2 font-medium">{row.firstName} {row.lastName}</td>
                      <td className="p-2 opacity-80">{row.mail1}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${isSuccess ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-2 font-medium">{row.remarks}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}