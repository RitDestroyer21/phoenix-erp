"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  AcademicSubject, GetAllAcademicSubjects, UpdateAcademicSubject, 
  DeleteAcademicSubject, CreateAcademicSubject 
} from "@/lib/db/academics/subjects";
import { GetAllAcademicSessions, AcademicSession } from "@/lib/db/academics/sessions";
import { GetAllAcademicSemesters, AcademicSemester } from "@/lib/db/academics/semesters";
import { Subjects, GetSubjectsForElectiveSelection } from "@/lib/db/management/subjects";
import { 
  FacultySubjectMap, FacultyFields, GetFacultyAssignmentsForSubject, 
  GetAllFacultyList, CreateFacultyAssignment, UpdateFacultyAssignment, DeleteFacultyAssignment 
} from "@/lib/db/academics/faculty-subject-map";
import { Pencil, Trash2, Check, X, ChevronDown, ChevronRight, Plus, BookOpen, UserCheck } from "lucide-react";

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

  // Faculty Assignment Modal State
  const [selectedSubjectForModal, setSelectedSubjectForModal] = useState<AcademicSubject | null>(null);
  const [assignments, setAssignments] = useState<FacultySubjectMap[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyFields[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  
  // New Assignment Inline State
  const [newSection, setNewSection] = useState("");
  const [newFacultyId, setNewFacultyId] = useState("");
  
  // Editing Assignment Row State
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [editAssignmentSection, setEditAssignmentSection] = useState("");
  const [editAssignmentFacultyId, setEditAssignmentFacultyId] = useState("");

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

  useEffect(() => {
    if (!loading && sessions.length && semesters.length) {
      // 1. Initialize session collapse states
      const initialSessionsCollapse = Object.fromEntries(
        sessions.map((sess) => [sess.academic_sessions_id, false])
      );
      setCollapsedSessions(initialSessionsCollapse);

      // 2. Correctly map over semesters to initialize semester collapse states
      const initialSemesterCollapse = Object.fromEntries(
        semesters.map((sem) => [
          sessionsSemesterKey(sem.academic_session_id, sem.academic_session_semesters_id),
          true,
        ])
      );
      setCollapsedSemesters(initialSemesterCollapse);
    }
  }, [loading, sessions, semesters]);

  function sessionsSemesterKey(session: string, semesterId: string) {
    return `${session}-${semesterId}`;
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
        sessions: _, 
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
      const { degrees, sessions: _, degree_name, session_label, ...cleanPayload } = addData as any;

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
    const part1 = categoryParts[0]; 
    const part2 = categoryParts.slice(1).join(" "); 
    const options = await GetSubjectsForElectiveSelection(
        part1, part2, 
        subject.academic_degree_wise_semester_id, 
        subject.academic_degree_id
    );
    setElectiveOptions(options);
  }

  // Handle opening assignment modal context safely
  async function openAssignmentModal(subject: AcademicSubject) {
    setSelectedSubjectForModal(subject);
    setModalLoading(true);
    try {
      const [assignmentsData, facultyData] = await Promise.all([
        GetFacultyAssignmentsForSubject(subject.academic_session_semester_subjects_id),
        GetAllFacultyList()
      ]);
      setAssignments(assignmentsData || []);
      setFacultyList(facultyData || []);
    } catch (error: any) {
      console.error("Modal Data Loading Error:", error.message);
    } finally {
      setModalLoading(false);
    }
  }

  async function handleAddAssignment() {
    if (!selectedSubjectForModal || !newSection || !newFacultyId) return;
    try {
      const created = await CreateFacultyAssignment({
        session_id: selectedSubjectForModal.academic_session_id,
        semester_id: selectedSubjectForModal.academic_session_semesters_id,
        subject_id: selectedSubjectForModal.academic_session_semester_subjects_id,
        session_section: newSection,
        faculty_id: newFacultyId
      });
      setAssignments(prev => [...prev, created]);
      setNewSection("");
      setNewFacultyId("");
    } catch (error: any) {
      alert("Error saving assignment: " + error.message);
    }
  }

  async function handleUpdateAssignment(assignmentId: string) {
    try {
      const updated = await UpdateFacultyAssignment(assignmentId, {
        session_section: editAssignmentSection,
        faculty_id: editAssignmentFacultyId
      });
      setAssignments(prev => prev.map(a => a.faculty_subject_map_id === assignmentId ? updated : a));
      setEditingAssignmentId(null);
    } catch (error: any) {
      alert("Error updating assignment: " + error.message);
    }
  }

  async function handleDeleteAssignment(assignmentId: string) {
    try {
      await DeleteFacultyAssignment(assignmentId);
      setAssignments(prev => prev.filter(a => a.faculty_subject_map_id !== assignmentId));
    } catch (error: any) {
      alert("Error deleting assignment: " + error.message);
    }
  }

  function renderSubjectCard(subject: AcademicSubject) {
    const isEditing = editingId === subject.academic_session_semester_subjects_id;
    const isElective = subject.academic_session_semester_subjects_category?.toUpperCase().includes("ELECTIVE");
    const isMapped = !!subject.academic_semester_wise_subject_id;

    return (
      <div key={subject.academic_session_semester_subjects_id} 
           className={`relative border rounded-xl p-4 shadow-sm bg-background transition-all flex flex-col justify-between ${isElective ? "border-red-200 bg-red-50/10" : ""}`}>
        
        {isEditing ? (
          <div className="space-y-2">
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
          <div>
            <div className="flex justify-between items-start">
              <div>
                <p className={`font-semibold text-sm ${isElective ? "text-red-700" : ""}`}>{subject.academic_session_semester_subjects_name}</p>
                <p className="text-xs opacity-50 font-mono">{subject.academic_session_semester_subjects_code}</p>
                {isElective && <span className="inline-block mt-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">{isMapped?subject.academic_session_semester_subjects_category:`Elective`}</span>}
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

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-850 flex justify-between items-center">
              <button 
                onClick={() => openAssignmentModal(subject)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition"
              >
                <UserCheck size={13} />
                Check Subject assignment
              </button>
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
          <div className="flex justify-between items-center px-6 py-5 bg-gray-200 dark:bg-zinc-900 cursor-pointer" 
               onClick={() => setCollapsedSessions(prev => ({...prev, [session.sessionId]: !prev[session.sessionId]}))}>
            <div className="flex items-center gap-4">
              {collapsedSessions[session.sessionId] ? <ChevronRight /> : <ChevronDown />}
              <div>
                <h3 className="font-bold text-lg leading-none">{session.degreeName}</h3>
                <p className="text-sm opacity-70 mt-1">Batch: {session.batch}</p>
              </div>
            </div>
          </div>

          {!collapsedSessions[session.sessionId] && session.semesters.map((sem) => {
            const semKey = `${session.sessionId}-${sem.academic_session_semesters_id}`;
            const isSemCollapsed = collapsedSemesters[semKey];

            return (
              <div key={semKey} className="border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-center px-6 py-4 bg-gray-100 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCollapsedSemesters(prev => ({...prev, [semKey]: !isSemCollapsed}))}>
                    {isSemCollapsed ? <ChevronRight size={16}/> : <ChevronDown size={16}/>}
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Semester {sem.academic_session_semesters_number}</span>
                  </div>
                  <button className="flex items-center gap-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black px-4 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition"
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
                        <input placeholder="Name" className="w-full border rounded p-2 text-sm mb-2 bg-background" onChange={e => setAddData({...addData, academic_session_semester_subjects_name: e.target.value})} />
                        <input placeholder="Code" className="w-full border rounded p-2 text-sm mb-2 bg-background" onChange={e => setAddData({...addData, academic_session_semester_subjects_code: e.target.value})} />
                        <div className="flex gap-2 mb-2">
                            <select className="flex-1 border rounded p-2 text-sm bg-background" onChange={e => setAddData({...addData, academic_session_semester_subjects_category: e.target.value})}>
                                <option value="">Category</option>
                                <option value="CORE">CORE</option>
                                <option value="ELECTIVE">ELECTIVE</option>
                                <option value="SESSIONAL">SESSIONAL</option>
                            </select>
                            <select className="flex-1 border rounded p-2 text-sm bg-background" onChange={e => setAddData({...addData, academic_session_semester_subjects_type: e.target.value})}>
                                <option value="">Type</option>
                                <option value="THEORY">THEORY</option>
                                <option value="PRACTICAL">PRACTICAL</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button onClick={handleCreate} className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black px-4 py-1 rounded text-xs">Create</button>
                            <button onClick={() => setAddingKey(null)} className="text-xs">Cancel</button>
                        </div>
                      </div>
                    )}

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

      {/* DYNAMIC CRUD ASSIGNMENT MANAGEMENT MODAL LAYER */}
      {selectedSubjectForModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 border rounded-2xl max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-700 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Faculty Assignment Map</h3>
                <p className="text-xs text-zinc-500 font-medium">{selectedSubjectForModal.academic_session_semester_subjects_name} ({selectedSubjectForModal.academic_session_semester_subjects_code})</p>
              </div>
              <button 
                onClick={() => setSelectedSubjectForModal(null)} 
                className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content Frame */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Form Payload Creators */}
              <div className="p-4 border border-dashed rounded-xl bg-zinc-50/50 dark:bg-zinc-950/20 space-y-3">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Assign New Faculty Section mapping</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="text" 
                    placeholder="Section (e.g. A, B, Sec 1)" 
                    value={newSection}
                    onChange={e => setNewSection(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background"
                  />
                  <select
                    value={newFacultyId}
                    onChange={e => setNewFacultyId(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background"
                  >
                    <option value="">Select Faculty...</option>
                    {facultyList.map(f => (
                      <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_fullname}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleAddAssignment}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition inline-flex items-center gap-1 shrink-0"
                  >
                    <Plus size={16} /> Assign
                  </button>
                </div>
              </div>

              {/* Roster Table Content */}
              {modalLoading ? (
                <div className="text-center py-6 text-sm text-zinc-400 animate-pulse">Loading Map Allocations...</div>
              ) : (
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-850 text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 font-semibold text-xs uppercase tracking-wider">
                        <th className="p-3 w-1/3">Section</th>
                        <th className="p-3 w-1/2">Faculty Head</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {assignments.map(assign => {
                        const isRowEditing = editingAssignmentId === assign.faculty_subject_map_id;

                        return (
                          <tr key={assign.faculty_subject_map_id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-850/20 transition-colors">
                            {isRowEditing ? (
                              <>
                                <td className="p-3">
                                  <input 
                                    type="text" 
                                    value={editAssignmentSection} 
                                    onChange={e => setEditAssignmentSection(e.target.value)}
                                    className="w-full border rounded px-2 py-1 text-sm bg-background font-medium"
                                  />
                                </td>
                                <td className="p-3">
                                  <select
                                    value={editAssignmentFacultyId}
                                    onChange={e => setEditAssignmentFacultyId(e.target.value)}
                                    className="w-full border rounded px-2 py-1 text-sm bg-background"
                                  >
                                    {facultyList.map(f => (
                                      <option key={f.faculty_id} value={f.faculty_id}>{f.faculty_fullname}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="p-3 flex justify-end gap-2 items-center">
                                  <button onClick={() => handleUpdateAssignment(assign.faculty_subject_map_id)} className="text-green-600 p-1 hover:bg-green-50 rounded"><Check size={16}/></button>
                                  <button onClick={() => setEditingAssignmentId(null)} className="text-zinc-400 p-1 hover:bg-zinc-100 rounded"><X size={16}/></button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="p-3 font-semibold text-zinc-700 dark:text-zinc-300">{assign.session_section}</td>
                                <td className="p-3 text-zinc-600 dark:text-zinc-400">{assign.faculty_name}</td>
                                <td className="p-3">
                                  <div className="flex justify-end gap-2 items-center opacity-60 hover:opacity-100 transition-opacity">
                                    <button 
                                      onClick={() => {
                                        setEditingAssignmentId(assign.faculty_subject_map_id);
                                        setEditAssignmentSection(assign.session_section);
                                        setEditAssignmentFacultyId(assign.faculty_id);
                                      }}
                                      className="p-1 text-zinc-600 hover:text-blue-600"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteAssignment(assign.faculty_subject_map_id)}
                                      className="p-1 text-zinc-600 hover:text-red-600"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        );
                      })}

                      {assignments.length === 0 && (
                        <tr>
                          <td colSpan={3} className="text-center p-8 text-zinc-400 text-xs italic">
                            No active faculty map distribution configured for this subject.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-100 dark:border-zinc-700 flex justify-end">
              <button 
                onClick={() => setSelectedSubjectForModal(null)}
                className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-750 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}