'use client';

import { useState, useEffect } from 'react';
import { onboardSingleStudent ,GetActiveSectionCapacitiesBySession } from '@/lib/db/resourcelist/students';
import { GetAllDegreeDetails, Degree } from '@/lib/db/management/degrees';
import { GetAllAcademicSessions, AcademicSession } from '@/lib/db/academics/sessions';
// Assuming your data layers expose an allocation query mapping utility here


import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SectionAllocationInfo {
  sectionName: string;      // e.g., "A", "B"
  currentStudentCount: number; // e.g., 30, 25
}

export default function SingleStudentForm() {
  // Data State Collections using your native Interfaces
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [allSessions, setAllSessions] = useState<AcademicSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<AcademicSession[]>([]);
  const [sectionsList, setSectionsList] = useState<SectionAllocationInfo[]>([]);
  
  // Selection & UI Management States
  const [selectedDegreeId, setSelectedDegreeId] = useState<string>('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [fetchingSections, setFetchingSections] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
        setError(err.message || 'Error loading active metadata from core ledger.');
      } finally {
        setFetchingData(false);
      }
    }
    loadAcademicMeta();
  }, []);

  // 2. Cascade Filter: Dynamically filter sessions whenever a degree is selected
  useEffect(() => {
    if (!selectedDegreeId) {
      setFilteredSessions([]);
      setSelectedSessionId('');
      setSectionsList([]);
      setSelectedSection('');
      return;
    }
    
    const matchedSessions = allSessions.filter(
      (session) => session.academic_sessions_degree_id === selectedDegreeId
    );
    setFilteredSessions(matchedSessions);
    setSelectedSessionId('');
    setSectionsList([]);
    setSelectedSection('');
  }, [selectedDegreeId, allSessions]);

  // 3. Cascade Filter Part 2: Fetch Live Section seat maps when Session changes
  useEffect(() => {
    if (!selectedSessionId) {
      setSectionsList([]);
      setSelectedSection('');
      return;
    }

    async function loadLiveSectionCapacities() {
      try {
        setFetchingSections(true);
        // Fires database count retrieval mapping routine based on session structural identity
        const liveAllocations = await GetActiveSectionCapacitiesBySession(selectedSessionId);
        setSectionsList(liveAllocations || []);
      } catch (err: any) {
        console.error('Failed pulling balanced section metrics maps:', err);
        // Fallback gracefully so manual typing or entry is not blocked
        setSectionsList([]); 
      } finally {
        setFetchingSections(false);
      }
    }

    loadLiveSectionCapacities();
    setSelectedSection('');
  }, [selectedSessionId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    
    try {
      await onboardSingleStudent({
        firstName: formData.get('firstName') as string,
        middleName: formData.get('middleName') as string || null,
        lastName: formData.get('lastName') as string,
        dob: formData.get('dob') as string,
        gender: formData.get('gender') as string,
        phone1: Number(formData.get('phone1')),
        phone2: formData.get('phone2') ? Number(formData.get('phone2')) : null,
        mail1: formData.get('mail1') as string,
        mail2: formData.get('mail2') as string || null,
        degreeId: selectedDegreeId,
        sessionId: selectedSessionId, 
        student_section: selectedSection, // Direct field parameter binding extension
      });
      
      setSuccess(true);
      setSelectedDegreeId('');
      setSelectedSessionId('');
      setSelectedSection('');
      setSectionsList([]);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || 'An unexpected runtime validation error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return <div className="text-center py-6 text-sm text-muted-foreground animate-pulse">Querying core administrative parameters...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">{error}</div>}
      {success && <div className="p-3 text-sm text-green-500 bg-green-50 border border-green-200 rounded">Student transaction executed successfully!</div>}

      {/* Name Parameters */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" name="firstName" required />
        </div>
        <div>
          <Label htmlFor="middleName">Middle Name</Label>
          <Input id="middleName" name="middleName" />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" name="lastName" required />
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input id="dob" name="dob" type="date" required />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <select id="gender" name="gender" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
            <option value="">Select Gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHERS">Others</option>
          </select>
        </div>
      </div>

      {/* Phone Communications */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone1">Self Mobile</Label>
          <Input id="phone1" name="phone1" required />
        </div>
        <div>
          <Label htmlFor="phone2">Parent's Mobile</Label>
          <Input id="phone2" name="phone2" />
        </div>
      </div>

      {/* Mail Channels */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="mail1">Self Mail</Label>
          <Input id="mail1" name="mail1" type="email" required />
        </div>
        <div>
          <Label htmlFor="mail2">Parent's Mail</Label>
          <Input id="mail2" name="mail2" type="email" />
        </div>
      </div>

      {/* Academic Structural Mapping & Section Target Group */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="degreeId">Degree Programme</Label>
          <select 
            id="degreeId" 
            name="degreeId" 
            value={selectedDegreeId}
            onChange={(e) => setSelectedDegreeId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" 
            required
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
          <Label htmlFor="sessionId">Academic Session</Label>
          <select 
            id="sessionId" 
            name="sessionId" 
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" 
            disabled={!selectedDegreeId}
            required
          >
            <option value="">
              {!selectedDegreeId ? 'Awaiting Degree...' : '-- Select Session --'}
            </option>
            {filteredSessions.map((sess) => {
              const startYear = new Date(sess.academic_sessions_start_date).getFullYear();
              const endYear = sess.academic_sessions_end_date 
                ? new Date(sess.academic_sessions_end_date).getFullYear() 
                : 'Ongoing';
              return (
                <option key={sess.academic_sessions_id} value={sess.academic_sessions_id}>
                  {startYear} - {endYear} ({sess.academic_sessions_degree_duration}Y)
                </option>
              );
            })}
          </select>
        </div>

        {/* Live Load Balancer Section Selection Input Row */}
        <div>
          <Label htmlFor="studentSection">Target Section</Label>
          <select 
            id="studentSection" 
            name="studentSection" 
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 font-medium" 
            disabled={!selectedSessionId || fetchingSections}
            required
          >
            <option value="">
              {!selectedSessionId ? 'Awaiting Session...' : fetchingSections ? 'Querying Allocations...' : '-- Select Section --'}
            </option>
            {sectionsList.map((sec) => (
              <option key={sec.sectionName} value={sec.sectionName}>
                Section {sec.sectionName} - ({sec.currentStudentCount} Active)
              </option>
            ))}
          </select>
        </div>
      </div>

      <Button type="submit" disabled={loading || fetchingSections} className="w-full font-medium">
        {loading ? 'Committing Atomic Transaction...' : 'Onboard Student'}
      </Button>
    </form>
  );
}