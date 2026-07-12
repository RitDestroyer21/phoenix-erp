"use client";

import React, { useEffect, useState } from "react";
import {
  GetAllDeptDetails,
  Department,
  DeleteDepartment,
  CreateDepartment,
  UpdateDepartment,
  GetFacultyByDepartment,
  GetDepartmentHodHistory,
  AssignNewHod,
  SimpleFacultyItem,
  HodHistoryRecord
} from "@/lib/db/management/departments";
import { 
  Pencil, Trash2, Plus, Check, X, 
  ShieldAlert, History, Calendar, 
  ChevronDown, ChevronUp, GraduationCap, 
  Layers, Users, ShieldCheck 
} from "lucide-react";

export function AllDepartmentsList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Structural Expandable UI states
  const [expandedDeptIds, setExpandedDeptIds] = useState<Record<string, boolean>>({});
  const [activeHods, setActiveHods] = useState<Record<string, string>>({});

  // Modal targeting flags
  const [assignTargetDept, setAssignTargetDept] = useState<{ id: string; name: string } | null>(null);
  const [historyTargetDept, setHistoryTargetDept] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    try {
      setLoading(true);
      const data = await GetAllDeptDetails();
      setDepartments(data);
      
      // Concurrently query active HOD markers for the directory columns
      await Promise.all(
        data.map(async (dept) => {
          try {
            const history = await GetDepartmentHodHistory(dept.dept_id);
            const currentActive = history.find(h => !h.fhh_effective_end_date);
            if (currentActive?.faculty?.user_basic_details) {
              const basic = currentActive.faculty.user_basic_details;
              setActiveHods(prev => ({
                ...prev,
                [dept.dept_id]: `${basic.user_basic_details_fname} ${basic.user_basic_details_lname}`
              }));
            } else {
              setActiveHods(prev => ({
                ...prev,
                [dept.dept_id]: "No Active HOD Appointed"
              }));
            }
          } catch (e) {
            console.error(`Error loading HOD trace lines for ${dept.dept_id}:`, e);
          }
        })
      );
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setLoading(false);
    }
  }

  const toggleRowExpand = (id: string) => {
    setExpandedDeptIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  async function handleDeleteDepartment(id: string) {
    if (!confirm("Are you sure you want to delete this department? This action cannot be undone.")) return;
    try {
      await DeleteDepartment(id);
      setDepartments((prev) => prev.filter((d) => d.dept_id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete the department.");
    }
  }

  async function handleCreateDepartment() {
    if (!editingName.trim()) return;
    try {
      const newDept = await CreateDepartment(editingName.trim());
      setDepartments((prev) => [newDept, ...prev]);
      setEditingName("");
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      alert("Failed to create the department.");
    }
  }

  async function handleUpdate(id: string) {
    if (!editingName.trim()) return;
    try {
      await UpdateDepartment(id, editingName.trim());
      setDepartments((prev) =>
        prev.map((d) => (d.dept_id === id ? { ...d, dept_name: editingName.trim() } : d))
      );
      setEditingId(null);
      setEditingName("");
    } catch (err) {
      console.error(err);
      alert("Failed to update department title.");
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <p className="text-sm text-zinc-500 animate-pulse">Loading departments matrix...</p>
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      {/* Table Head Wrapper */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Academic Departments</h2>
          <p className="text-xs text-zinc-500 mt-1">Manage institutional divisions, structure, and leadership hierarchies.</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setEditingName("");
          }}
          className="flex items-center gap-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-xs"
        >
          <Plus size={16} /> Add Department
        </button>
      </div>

      {/* Main Database Table Container */}
      <div className="border rounded-2xl overflow-hidden shadow-xs bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-medium border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th className="w-12 p-4 text-center"></th>
              <th className="text-left p-4 font-semibold">Department Title</th>
              <th className="text-left p-4 font-semibold">Current Head of Dept (HOD)</th>
              <th className="text-right p-4 font-semibold pr-6">Management Operations</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {isAdding && (
              <tr className="bg-zinc-50/50 dark:bg-zinc-900/30">
                <td></td>
                <td className="p-4">
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateDepartment();
                      if (e.key === "Escape") setIsAdding(false);
                    }}
                    className="w-full max-w-md border rounded-xl px-3 py-1.5 text-sm bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 outline-none ring-2 ring-zinc-500/10 focus:ring-zinc-500/30 text-zinc-900 dark:text-zinc-100"
                    placeholder="E.g., Department of Cybernetics"
                  />
                </td>
                <td className="p-4 text-zinc-400 dark:text-zinc-500 italic text-xs">Assigned during onboarding</td>
                <td className="p-4 pr-6 flex justify-end gap-3 items-center min-h-[53px]">
                  <button onClick={handleCreateDepartment} title="Save" className="text-green-600 p-1 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-lg transition-colors"><Check size={16} /></button>
                  <button onClick={() => setIsAdding(false)} title="Cancel" className="text-red-600 p-1 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"><X size={16} /></button>
                </td>
              </tr>
            )}

            {departments.length === 0 && !isAdding ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-zinc-400 dark:text-zinc-500 italic">
                  No core departments established. Click "Add Department" to build the ledger.
                </td>
              </tr>
            ) : (
              departments.map((dept) => {
                const isExpanded = !!expandedDeptIds[dept.dept_id];
                const isCurrentlyEditing = editingId === dept.dept_id;
                const hodName = activeHods[dept.dept_id] || "No Active HOD Appointed";
                const hasHod = activeHods[dept.dept_id] && activeHods[dept.dept_id] !== "No Active HOD Appointed";

                return (
                  <React.Fragment key={dept.dept_id}>
                    <tr className="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors group">
                      {/* Collapsible Trigger cell */}
                      <td className="p-4 text-center cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" onClick={() => toggleRowExpand(dept.dept_id)}>
                        <div className="flex justify-center items-center">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </td>

                      {/* Department Name field */}
                      <td className="p-4 font-bold tracking-tight text-zinc-800 dark:text-zinc-200">
                        {isCurrentlyEditing ? (
                          <input
                            autoFocus
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdate(dept.dept_id);
                              if (e.key === "Escape") setEditingId(null);
                            }}
                            className="w-full max-w-md border rounded-lg px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 font-normal outline-none focus:ring-2 ring-zinc-500/20 text-zinc-900 dark:text-zinc-100"
                          />
                        ) : (
                          dept.dept_name
                        )}
                      </td>

                      {/* HOD Status Label Cell */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${hasHod ? "bg-green-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />
                          <span className={`font-medium ${!hasHod ? "text-zinc-400 dark:text-zinc-500 italic text-xs" : "text-zinc-700 dark:text-zinc-300"}`}>
                            {hodName}
                          </span>
                        </div>
                      </td>

                      {/* Action Block */}
                      <td className="p-4 pr-6 flex justify-end items-center gap-3 min-h-[53px]">
                        {isCurrentlyEditing ? (
                          <>
                            <button onClick={() => handleUpdate(dept.dept_id)} title="Save changes" className="text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 p-1 rounded-lg transition-colors"><Check size={16} /></button>
                            <button onClick={() => setEditingId(null)} title="Cancel editing" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 p-1 rounded-lg transition-colors"><X size={16} /></button>
                          </>
                        ) : (
                          <>
                            <button
                              title="Assign new HOD"
                              onClick={() => setAssignTargetDept({ id: dept.dept_id, name: dept.dept_name })}
                              className="flex items-center gap-1 text-xs border border-amber-200 bg-amber-50/40 text-amber-700 dark:border-amber-900/30 dark:bg-amber-950/20 dark:text-amber-400 px-2.5 py-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all"
                            >
                              <ShieldAlert size={14} /> Assign Head
                            </button>

                            <button
                              title="View HOD assignment chronology"
                              onClick={() => setHistoryTargetDept({ id: dept.dept_id, name: dept.dept_name })}
                              className="flex items-center gap-1 text-xs border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-all"
                            >
                              <History size={14} /> History
                            </button>

                            <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />

                            <button
                              title="Edit title"
                              onClick={() => {
                                setEditingId(dept.dept_id);
                                setEditingName(dept.dept_name);
                                setIsAdding(false);
                              }}
                              className="text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                            >
                              <Pencil size={16} />
                            </button>

                            <button 
                              title="Delete department"
                              onClick={() => handleDeleteDepartment(dept.dept_id)} 
                              className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Breakdown Block */}
                    {isExpanded && (
                      <tr className="bg-zinc-50/30 dark:bg-zinc-900/10 border-t-0">
                        <td colSpan={4} className="p-6 bg-zinc-50/20 dark:bg-zinc-900/5 border-t border-b border-zinc-100 dark:border-zinc-900/50">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
                            
                            {/* Card 1: Degree Programs */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 shadow-xs">
                              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
                                <GraduationCap size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Offered Degrees</p>
                                <p className="text-xl font-black mt-0.5 text-zinc-900 dark:text-zinc-100">{(dept as any).degree_count ?? 0}</p>
                              </div>
                            </div>

                            {/* Card 2: Batches */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 shadow-xs">
                              <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                                <Layers size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Active Batches</p>
                                <p className="text-xl font-black mt-0.5 text-zinc-900 dark:text-zinc-100">{(dept as any).batch_count ?? 0}</p>
                              </div>
                            </div>

                            {/* Card 3: Enrolled Students */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 shadow-xs">
                              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400">
                                <Users size={20} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Total Enrolled Students</p>
                                <p className="text-xl font-black mt-0.5 text-zinc-900 dark:text-zinc-100">{(dept as any).student_count ?? 0}</p>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Conditional Rendering Action Modals */}
      {assignTargetDept && (
        <AssignHodModal 
          deptId={assignTargetDept.id} 
          deptName={assignTargetDept.name} 
          onClose={() => {
            setAssignTargetDept(null);
            loadDepartments(); // Hot reload changes
          }} 
        />
      )}

      {historyTargetDept && (
        <HodHistoryModal 
          deptId={historyTargetDept.id} 
          deptName={historyTargetDept.name} 
          onClose={() => setHistoryTargetDept(null)} 
        />
      )}
    </div>
  );
}

/* Modals Overlay Implementations */

function AssignHodModal({ deptId, deptName, onClose }: { deptId: string; deptName: string; onClose: () => void }) {
  const [faculties, setFaculties] = useState<SimpleFacultyItem[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    GetFacultyByDepartment(deptId).then(setFaculties).catch(console.error);
  }, [deptId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFaculty || !startDate) return;

    setSubmitting(true);
    try {
      await AssignNewHod(deptId, selectedFaculty, startDate);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Error processing new leadership tenure transition assignment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-base flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <ShieldAlert className="text-amber-600" size={18}/> Appoint New HOD
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={18}/>
          </button>
        </div>
        <p className="text-xs text-zinc-400 mb-4">Target Core Division: <strong className="text-zinc-900 dark:text-zinc-50">{deptName}</strong></p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-zinc-400 dark:text-zinc-500">Select New Head</label>
            <select
              required
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="w-full text-sm border rounded-xl p-2.5 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 ring-zinc-500/20 outline-none text-zinc-900 dark:text-zinc-100"
            >
              <option value="">-- Choose Department Faculty Member --</option>
              {faculties.map(f => (
                <option key={f.faculty_id} value={f.faculty_id}>{f.first_name} {f.last_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-zinc-400 dark:text-zinc-500">Effective Appointment Date</label>
            <input 
              type="date" 
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-sm border rounded-xl p-2.5 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-2 ring-zinc-500/20 outline-none text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold border rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">Cancel</button>
            <button 
              type="submit" 
              disabled={submitting || !selectedFaculty}
              className="px-4 py-2 text-xs bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/50 text-white font-semibold rounded-xl disabled:opacity-50 transition-colors"
            >
              {submitting ? "Processing..." : "Appoint & Transition Tenure"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HodHistoryModal({ deptId, deptName, onClose }: { deptId: string; deptName: string; onClose: () => void }) {
  const [history, setHistory] = useState<HodHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetDepartmentHodHistory(deptId)
      .then(setHistory)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [deptId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-base flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <History className="text-indigo-600" size={18}/> Leadership HOD Chronology
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X size={18}/>
          </button>
        </div>
        <p className="text-xs text-zinc-400 mb-4">Chronological records for <strong className="text-zinc-950 dark:text-zinc-50">{deptName}</strong></p>
        
        {loading ? (
          <p className="text-center py-8 text-sm text-zinc-400 animate-pulse">Retrieving historical data log metrics...</p>
        ) : history.length === 0 ? (
          <p className="text-center py-8 text-sm text-zinc-400 italic border border-dashed rounded-xl border-zinc-200 dark:border-zinc-800">No structural HOD traces logged for this department context.</p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
            {history.map((record, idx) => {
              const fname = record.faculty?.user_basic_details?.user_basic_details_fname || "Deleted";
              const lname = record.faculty?.user_basic_details?.user_basic_details_lname || "Faculty";
              const isActive = !record.fhh_effective_end_date;

              return (
                <div 
                  key={record.fhh_id} 
                  className={`p-3.5 rounded-xl border text-sm flex justify-between items-center transition-all ${
                    isActive 
                      ? "border-green-500/30 bg-green-50/10 dark:bg-green-950/10" 
                      : "bg-zinc-50/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? "bg-green-100 dark:bg-green-900/30 text-green-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"}`}>
                      <ShieldCheck size={16}/>
                    </div>
                    <div>
                      <span className="text-[10px] opacity-40 font-mono block text-zinc-500">Sequence #{idx + 1}</span>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200">{fname} {lname}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-500 font-medium justify-end">
                      <Calendar size={12}/>
                      <span>{new Date(record.fhh_effective_start_date).toLocaleDateString()}</span>
                      <span>→</span>
                      <span className={isActive ? "text-green-600 dark:text-green-400 font-bold uppercase tracking-wider text-[10px]" : ""}>
                        {isActive ? "Active Duty" : new Date(record.fhh_effective_end_date!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="flex justify-end pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button onClick={onClose} className="px-5 py-2 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black text-xs font-bold rounded-xl hover:opacity-90 transition-opacity">Close Timeline</button>
        </div>
      </div>
    </div>
  );
}