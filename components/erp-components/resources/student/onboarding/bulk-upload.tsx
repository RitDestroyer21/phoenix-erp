'use client';

import { useState, useEffect } from 'react';
import { GetAllDegreeDetails, Degree } from '@/lib/db/management/degrees';
import { GetAllAcademicSessions, AcademicSession } from '@/lib/db/academics/sessions';
import { onboardSingleStudent, StudentOnboardPayload } from '@/lib/db/resourcelist/students';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// GLOBAL SEATING CAPACITY CONFIGURATION
const GLOBAL_SECTION_SEATING_CAPACITY = 40;

interface ProcessingResult extends StudentOnboardPayload {
  status: 'SUCCESS' | 'FAILED';
  remarks: string;
}

export default function BulkStudentUpload() {
  // Academic Parameter Data Collections
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [allSessions, setAllSessions] = useState<AcademicSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<AcademicSession[]>([]);
  
  // Selection States
  const [selectedDegreeId, setSelectedDegreeId] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  
  // UI Status Management
  const [fetchingData, setFetchingData] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [results, setResults] = useState<ProcessingResult[]>([]);

  // 1. Fetch form dependencies on mount via your custom data layers
  useEffect(() => {
    async function loadAcademicMeta() {
      try {
        setFetchingData(true);
        const [degreeData, sessionData] = await Promise.all([
          GetAllDegreeDetails(),
          GetAllAcademicSessions()
        ]);
        setDegrees(degreeData);
        setAllSessions(sessionData);
      } catch (err: any) {
        console.error('Failed parsing structural collections:', err);
        setError('Error loading active structural metadata.');
      } finally {
        setFetchingData(false);
      }
    }
    loadAcademicMeta();
  }, []);

  // 2. Cascade Filter: Match academic session availability to the selected degree
  useEffect(() => {
    if (!selectedDegreeId) {
      setFilteredSessions([]);
      setSelectedSessionId('');
      return;
    }
    const matched = allSessions.filter(
      (session) => session.academic_sessions_degree_id === selectedDegreeId
    );
    setFilteredSessions(matched);
    setSelectedSessionId(''); // Reset selection on change
  }, [selectedDegreeId, allSessions]);

  // 3. Clean CSV Template Download (Completely free of raw technical database IDs)
  const downloadCleanTemplate = () => {
    const headers = 'firstName,middleName,lastName,dob,gender,phone1,phone2,mail1,mail2\n';
    const blob = new Blob([headers], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'bulk_student_onboarding_template.csv');
    a.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
      setResults([]); // Clear results array whenever a fresh source file is loaded
    }
  };

  // 4. Client Parse & Server Pipeline Dispatcher Loop
  const handleBulkUploadProcess = async () => {
    if (!file || !selectedSessionId || !selectedDegreeId) return;

    setProcessing(true);
    setError(null);
    setSuccess(null);
    setResults([]);

    try {
      const text = await file.text();
      // Simple parse mapping logic to slice text lines safely
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length <= 1) {
        throw new Error('The uploaded CSV file does not contain any valid student record lines.');
      }

      const headers = lines[0].split(',');
      const rawRows = lines.slice(1);
      const totalCount = rawRows.length;

      // Determine load-balancing properties across sections mathematically
      const sectionsNeeded = Math.ceil(totalCount / GLOBAL_SECTION_SEATING_CAPACITY);
      const balancedSectionSize = Math.ceil(totalCount / sectionsNeeded);

      // Map raw rows out of CSV file string array
      const basePayloads = rawRows.map((line, index) => {
        const values = line.split(',');
        if (values.length < headers.length) return null;

        // --- DATE HANDLING LOGIC ---
        const rawDob = values[3]?.trim(); // "14/05/2008"
        const dobParts = rawDob.split('/'); // Split by slash -> ["14", "05", "2008"]

        if (dobParts.length !== 3) {
          console.error(`Row ${index + 1}: Invalid date format "${rawDob}". Skipping row.`);
          return null;
        }

        const [day, month, year] = dobParts;
        const formattedDobForPayload = `${year}-${month}-${day}`; // Becomes "2008-05-14"

        // --- AUTOMATED LOAD BALANCING SECTION DISTRIBUTION ---
        let computedSection = 'A';
        if (totalCount > GLOBAL_SECTION_SEATING_CAPACITY) {
          const sectionIndex = Math.floor(index / balancedSectionSize);
          computedSection = String.fromCharCode(65 + sectionIndex); // Offset ASCII: 65 is 'A', 66 is 'B', etc.
        }

        // Construct baseline record mapping and explicitly inject the selected contextual IDs
        return {
          firstName: values[0]?.trim(),
          middleName: values[1]?.trim() || null,
          lastName: values[2]?.trim(),
          dob: formattedDobForPayload, // Safe ISO format: YYYY-MM-DD
          gender: values[4]?.trim()?.toUpperCase(), // Automatically capitalizes ("MALE", "FEMALE", "OTHERS")
          phone1: Number(values[5]),
          phone2: values[6] ? Number(values[6]) : null,
          mail1: values[7]?.trim(),
          mail2: values[8]?.trim() || null,
          degreeId: selectedDegreeId, 
          sessionId: selectedSessionId, 
          student_section: computedSection // Injected field as per schema definition extension
        };
      }).filter(Boolean) as (StudentOnboardPayload & { student_section: string })[];

      if (basePayloads.length === 0) {
        throw new Error('No valid records could be parsed out of your structural columns layout.');
      }

      const outputReport: ProcessingResult[] = [];
      let successCount = 0;

      // Core sequential transaction parsing chain
      for (const payload of basePayloads) {
        try {
          // Send payload alongside load-balanced student_section variable adjustments
          await onboardSingleStudent(payload);
          outputReport.push({
            ...payload,
            status: 'SUCCESS',
            remarks: `Onboarded Successfully to Section ${payload.student_section}!`,
          });
          successCount++;
        } catch (err: any) {
          outputReport.push({
            ...payload,
            status: 'FAILED',
            remarks: err.message || 'Unknown technical database execution fault.',
          });
        }
      }

      setResults(outputReport);
      setSuccess(`Batch execution complete! Successfully processed ${successCount} out of ${basePayloads.length} students.`);
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred while parsing batch allocations.');
    } finally {
      setProcessing(false);
    }
  };

  // 5. Download Response File Exporter Function
  const downloadResponseReport = () => {
    if (results.length === 0) return;

    const header = 'firstName,middleName,lastName,dob,gender,phone1,phone2,mail1,mail2,assignedSection,status,remarks\n';
    const csvRows = results.map(row => {
      // Revert date formatting style back to human presentation (DD/MM/YYYY)
      const [year, month, day] = row.dob.split('-');
      const displayDob = `${day}/${month}/${year}`;

      return [
        row.firstName,
        row.middleName || '',
        row.lastName,
        displayDob,
        row.gender,
        row.phone1,
        row.phone2 || '',
        row.mail1,
        row.mail2 || '',
        (row as any).student_section || 'A',
        row.status,
        `"${row.remarks.replace(/"/g, '""')}"` // Safely escape text comma collisions
      ].join(',');
    }).join('\n');

    const blob = new Blob([header + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `onboarding_report_${new Date().toISOString().slice(0,10)}.csv`);
    a.click();
  };

  if (fetchingData) {
    return <div className="text-center py-6 text-sm text-muted-foreground animate-pulse">Querying core onboarding parameters...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2">
      {error && <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">{error}</div>}
      {success && <div className="p-3 text-sm text-green-500 bg-green-50 border border-green-200 rounded">{success}</div>}

      {/* Step 1: Global Context Selection Dropdowns */}
      <div className="bg-slate-50 border p-4 rounded-lg space-y-4">
        <h3 className="text-sm font-semibold text-slate-800">1. Select Target Academic Scope</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bulkDegreeId">Degree Programme</Label>
            <select 
              id="bulkDegreeId" 
              value={selectedDegreeId}
              onChange={(e) => setSelectedDegreeId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
            >
              <option value="">-- Select Degree --</option>
              {degrees.map((deg) => (
                <option key={deg.degree_id} value={deg.degree_id}>
                  {deg.degree_initial} ({deg.degree_fullname})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="bulkSessionId">Academic Batch / Session</Label>
            <select 
              id="bulkSessionId" 
              value={selectedSessionId}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" 
              disabled={!selectedDegreeId}
            >
              <option value="">
                {!selectedDegreeId ? 'Awaiting Degree selection...' : '-- Select Session --'}
              </option>
              {filteredSessions.map((sess) => {
                const startYear = new Date(sess.academic_sessions_start_date).getFullYear();
                const endYear = sess.academic_sessions_end_date 
                  ? new Date(sess.academic_sessions_end_date).getFullYear() 
                  : 'Present';
                return (
                  <option key={sess.academic_sessions_id} value={sess.academic_sessions_id}>
                    {startYear} - {endYear} ({sess.academic_sessions_degree_duration} Years)
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* Step 2: Template Extraction */}
      <div className="border border-dashed p-4 rounded-lg bg-slate-50 text-center">
        <h3 className="text-sm font-semibold mb-1">2. Download Standard Template</h3>
        <p className="text-xs text-muted-foreground mb-3">Obtain the clean format file without worrying about structural database keys.</p>
        <Button variant="outline" size="sm" onClick={downloadCleanTemplate}>
          Download Clean CSV Template
        </Button>
      </div>

      {/* Step 3: Payload Intake Processing Dropper */}
      <div className="border border-dashed p-5 rounded-lg bg-slate-50 space-y-4">
        <h3 className="text-sm font-semibold text-center">3. Upload Completed Roster</h3>
        
        <div>
          <Label htmlFor="csvFile">Choose Populated CSV File</Label>
          <Input 
            id="csvFile" 
            type="file" 
            accept=".csv" 
            onChange={handleFileChange} 
            className="mt-1 bg-background" 
            disabled={!selectedSessionId || processing}
          />
          {!selectedSessionId && (
            <p className="text-[11px] text-amber-600 mt-1">Please completely specify Degree and Session above before attaching file logs.</p>
          )}
        </div>

        <Button 
          className="w-full" 
          disabled={!file || !selectedSessionId || processing} 
          onClick={handleBulkUploadProcess}
        >
          {processing ? 'Processing Bulk Operations Ledger...' : 'Parse and Onboard Bulk Roster'}
        </Button>
      </div>

      {/* Step 4: Conditional Results Execution Matrix Dashboard */}
      {results.length > 0 && (
        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">Batch Onboarding Report Log</h3>
            <Button variant="secondary" size="sm" onClick={downloadResponseReport}>
              Export Report CSV
            </Button>
          </div>

          <div className="overflow-x-auto border rounded-lg max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b font-semibold text-slate-700">
                  <th className="p-2">Student Name</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Assigned Sec</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => {
                  const isSuccess = row.status === 'SUCCESS';
                  return (
                    <tr 
                      key={idx} 
                      className={`border-b transition-colors ${
                        isSuccess 
                          ? 'bg-green-50/70 hover:bg-green-100/80 text-green-900 border-green-100' 
                          : 'bg-red-50/70 hover:bg-red-100/80 text-red-900 border-red-100'
                      }`}
                    >
                      <td className="p-2 font-medium">{row.firstName} {row.lastName}</td>
                      <td className="p-2 opacity-80">{row.mail1}</td>
                      <td className="p-2 font-mono font-bold text-center">{(row as any).student_section || 'A'}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          isSuccess ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}>
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