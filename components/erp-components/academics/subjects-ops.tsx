"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  AcademicSubject, GetAllAcademicSubjects, UpdateAcademicSubject, 
  DeleteAcademicSubject, CreateAcademicSubject 
} from "@/lib/db/academics/subjects";
import { GetAllAcademicSessions, AcademicSession } from "@/lib/db/academics/sessions";
import { GetAllAcademicSemesters, AcademicSemester } from "@/lib/db/academics/semesters";
import { Subjects, GetSubjectsForElectiveSelection } from "@/lib/db/management/subjects";
import { Pencil, Trash2, Check, X, ChevronDown, ChevronRight, Plus, BookOpen, Layers } from "lucide-react";

export function AllAcademicSubjectsList() {
  const [subjects, setSubjects] = useState<AcademicSubject[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [semesters, setSemesters] = useState<AcademicSemester[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<AcademicSubject>>({});
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [addData, setAddData] = useState<Partial<AcademicSubject>>({});
  const [collapsedSessions, setCollapsedSessions] = useState<Record<string, boolean>>({});
  const [collapsedSemesters, setCollapsedSemesters] = useState<Record<string, boolean>>({});
  
  // Elective Selection State
  const [electiveOptions, setElectiveOptions] = useState<Subjects[]>([]);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [subData, sessData, semData] = await Promise.all([
      GetAllAcademicSubjects(),
      GetAllAcademicSessions(),
      GetAllAcademicSemesters(),
    ]);
    setSubjects(subData);
    setSessions(sessData);
    setSemesters(semData);
    setLoading(false);
  }

  const groupedData = useMemo(() => {
    return sessions.map(session => {
        const start = new Date(session.academic_sessions_start_date).getFullYear();
        const end = session.academic_sessions_end_date ? new Date(session.academic_sessions_end_date).getFullYear() : "Present";
        return {
            sessionId: session.academic_sessions_id,
            degreeName: session.academic_sessions_degree_name,
            batch: `${start} - ${end}`,
            semesters: semesters
                .filter(sem => sem.academic_session_id === session.academic_sessions_id)
                .map(sem => ({
                    ...sem,
                    subjects: subjects.filter(sub => sub.academic_session_semesters_id === sem.academic_session_semesters_id)
                }))
        };
    });
  }, [subjects, sessions, semesters]);

  async function handleUpdate(id: string) {
    try {

      const { 
        degrees, 
        sessions, 
        degree_name, 
        session_label, 
        academic_session_semester_subjects_id, 
        academic_session_semester_subjects_created_at,
        ...cleanPayload 
      } = editData as any;


      const updated = await UpdateAcademicSubject(id, cleanPayload);

      setSubjects(prev => prev.map(s => 
        s.academic_session_semester_subjects_id === id ? updated : s
      ));
      setEditingId(null);
      setEditData({}); 
    } catch (error: any) {
      console.error("Update Error:", error.message);
      alert("Failed to update: " + error.message);
    }
  }

  async function handleCreate() {
    try {
      const { degrees, sessions, degree_name, session_label, ...cleanPayload } = addData as any;

      const created = await CreateAcademicSubject(cleanPayload);
      
      setSubjects(prev => [...prev, created]);
      setAddingKey(null);
      setAddData({});
    } catch (error: any) {
      console.error("Create Error:", error.message);
      alert("Failed to create: " + error.message);
    }
  }


  async function fetchElectivesForSubject(subject: AcademicSubject) {
    const categoryParts = subject.academic_session_semester_subjects_category.split(" ");
    const part1 = categoryParts[0]; // e.g., 'ELECTIVE'
    const part2 = categoryParts.slice(1).join(" "); // e.g., 'III Lab'
    const options = await GetSubjectsForElectiveSelection(
        part1, part2, 
        subject.academic_degree_wise_semester_id, 
        subject.academic_degree_id
    );
    setElectiveOptions(options);
  }

  function renderSubjectCard(subject: AcademicSubject) {
    const isEditing = editingId === subject.academic_session_semester_subjects_id;
    const isElective = subject.academic_session_semester_subjects_category?.toUpperCase().includes("ELECTIVE");
    const isMapped = !!subject.academic_semester_wise_subject_id;

    return (
      <div key={subject.academic_session_semester_subjects_id} 
           className={`relative border rounded-xl p-4 shadow-sm bg-background transition-all ${isElective ? "border-red-200 bg-red-50/10" : ""}`}>
        
        {isEditing ? (
          <div className="space-y-2">
            {/* Subject Name Selection / Input */}
            {isElective && !isMapped ? (
                <select className="w-full border rounded px-2 py-1 text-sm bg-background"
                        onChange={e => {
                            const selected = electiveOptions.find(o => o.swsm_id === e.target.value);
                            if (selected) {
                                setEditData({
                                    ...editData,
                                    academic_semester_wise_subject_id: selected.swsm_id,
                                    academic_session_semester_subjects_code: selected.swsm_subject_code,
                                    academic_session_semester_subjects_name: selected.swsm_subject_name,
                                    academic_session_semester_subjects_category: selected.swsm_subject_category+` `+selected.swsm_elective_set,
                                    academic_session_semester_subjects_type: selected.swsm_subject_type,
                                });
                            }
                        }}>
                    <option value="">Select Elective Subject</option>
                    {electiveOptions.map(opt => <option key={opt.swsm_id} value={opt.swsm_id}>{opt.swsm_subject_name}</option>)}
                </select>
            ) : (
                <input className="w-full border rounded px-2 py-1 text-sm bg-background" 
                       value={editData.academic_session_semester_subjects_name || ""} 
                       onChange={e => setEditData({...editData, academic_session_semester_subjects_name: e.target.value})} 
                       disabled={isMapped||isElective} />
            )}

            <input className="w-full border rounded px-2 py-1 text-sm bg-background opacity-60" 
                   value={editData.academic_session_semester_subjects_code || ""} 
                   placeholder="Code" readOnly />

            <div className="flex gap-2">
                <select className="flex-1 border rounded px-2 py-1 text-sm" 
                        value={editData.academic_session_semester_subjects_category} 
                        onChange={e => setEditData({...editData, academic_session_semester_subjects_category: e.target.value})}
                        disabled={isMapped||isElective}>
                    <option value="CORE">CORE</option>
                    <option value={editData.academic_session_semester_subjects_category}>ELECTIVE</option>
                    <option value="SESSIONAL">SESSIONAL</option>
                </select>
                <select className="flex-1 border rounded px-2 py-1 text-sm" 
                        value={editData.academic_session_semester_subjects_type} 
                        onChange={e => setEditData({...editData, academic_session_semester_subjects_type: e.target.value})}
                        disabled={isMapped||isElective}>
                    <option value="THEORY">THEORY</option>
                    <option value="PRACTICAL">PRACTICAL</option>
                </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => handleUpdate(subject.academic_session_semester_subjects_id)} className="text-green-600"><Check size={18}/></button>
              <button onClick={() => setEditingId(null)} className="text-red-600"><X size={18}/></button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-start">
            <div>
              <p className={`font-semibold text-sm ${isElective ? "text-red-700" : ""}`}>{subject.academic_session_semester_subjects_name}</p>
              <p className="text-xs opacity-50 font-mono">{subject.academic_session_semester_subjects_code}</p>
              {isElective && <span className="inline-block mt-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">Elective</span>}
            </div>
            <div className="flex flex-col gap-2 opacity-40 hover:opacity-100">
              <button onClick={() => { 
                  setEditingId(subject.academic_session_semester_subjects_id); 
                  setEditData(subject); 
                  if (isElective && !isMapped) fetchElectivesForSubject(subject);
              }}><Pencil size={14}/></button>
              <button onClick={async () => { await DeleteAcademicSubject(subject.academic_session_semester_subjects_id); setSubjects(prev => prev.filter(s => s.academic_session_semester_subjects_id !== subject.academic_session_semester_subjects_id)); }}><Trash2 size={14}/></button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) return <div className="p-10 animate-pulse text-sm">Loading Academic Subjects...</div>;

  return (
    <div className="p-6 max-w-7xl space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="text-red-600"/> Academic Subjects</h2>
      
      {groupedData.map((session) => (
        <div key={session.sessionId} className="border rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950">
          {/* Level 1: Session Banner [cite: 1] */}
          <div className="flex justify-between items-center px-6 py-5 bg-gray-200 dark:bg-zinc-900 cursor-pointer" 
               onClick={() => setCollapsedSessions(prev => ({...prev, [session.sessionId]: !prev[session.sessionId]}))}>
            <div className="flex items-center gap-4">
              {collapsedSessions[session.sessionId] ? <ChevronRight /> : <ChevronDown />}
              <div>
                <h3 className="font-bold text-lg leading-none">{session.degreeName}</h3>
                <p className="text-xs opacity-60 mt-1">Batch: {session.batch}</p>
              </div>
            </div>
          </div>

          {!collapsedSessions[session.sessionId] && session.semesters.map((sem) => {
            const semKey = `${session.sessionId}-${sem.academic_session_semesters_id}`;
            const isSemCollapsed = collapsedSemesters[semKey];

            return (
              <div key={semKey} className="border-t border-zinc-100 dark:border-zinc-800">
                {/* Level 2: Semester Banner  */}
                <div className="flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCollapsedSemesters(prev => ({...prev, [semKey]: !isSemCollapsed}))}>
                    {isSemCollapsed ? <ChevronRight size={16}/> : <ChevronDown size={16}/>}
                    <span className="font-bold text-zinc-600">Semester {sem.academic_session_semesters_number}</span>
                  </div>
                  <button className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition"
                          onClick={() => { setAddingKey(semKey); setAddData({ 
                            academic_session_semesters_id: sem.academic_session_semesters_id,
                            academic_session_id: session.sessionId,
                            academic_degree_id: sem.academic_degree_id,
                            academic_session_semesters_number: sem.academic_session_semesters_number,
                            academic_degree_wise_semester_id: sem.academic_degree_wise_semester_id
                          }); }}>
                    <Plus size={14}/> Add
                  </button>
                </div>

                {!isSemCollapsed && (
                  <div className="p-6 space-y-8">
                    {addingKey === semKey && (
                      <div className="border rounded-xl p-4 bg-zinc-50 dark:bg-zinc-900/40 max-w-md shadow-inner">
                        <p className="text-xs font-bold mb-3 uppercase opacity-50">New Subject</p>
                        <input placeholder="Name" className="w-full border rounded p-2 text-sm mb-2" onChange={e => setAddData({...addData, academic_session_semester_subjects_name: e.target.value})} />
                        <input placeholder="Code" className="w-full border rounded p-2 text-sm mb-2" onChange={e => setAddData({...addData, academic_session_semester_subjects_code: e.target.value})} />
                        <div className="flex gap-2 mb-2">
                            <select className="flex-1 border rounded p-2 text-sm" onChange={e => setAddData({...addData, academic_session_semester_subjects_category: e.target.value})}>
                                <option value="">Category</option>
                                <option value="CORE">CORE</option>
                                <option value="ELECTIVE">ELECTIVE</option>
                                <option value="SESSIONAL">SESSIONAL</option>
                            </select>
                            <select className="flex-1 border rounded p-2 text-sm" onChange={e => setAddData({...addData, academic_session_semester_subjects_type: e.target.value})}>
                                <option value="">Type</option>
                                <option value="THEORY">THEORY</option>
                                <option value="PRACTICAL">PRACTICAL</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={handleCreate} className="bg-zinc-900 text-white px-4 py-1 rounded text-xs">Create</button>
                            <button onClick={() => setAddingKey(null)} className="text-xs">Cancel</button>
                        </div>
                      </div>
                    )}

                    {/* Level 3: Subjects area [cite: 2] */}
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                          Theory <div className="flex-1 h-px bg-zinc-100"/>
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        {sem.subjects.filter(s => s.academic_session_semester_subjects_type === "THEORY").map(renderSubjectCard)}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                          Practical <div className="flex-1 h-px bg-zinc-100"/>
                      </h4>
                      <div className="grid md:grid-cols-3 gap-4">
                        {sem.subjects.filter(s => s.academic_session_semester_subjects_type === "PRACTICAL").map(renderSubjectCard)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}