"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Subjects,
  GetAllSubjects,
  UpdateSubjects,
  DeleteSubjects,
  CreateSubjects,
} from "@/lib/db/management/subjects";

import { GetAllDegreeDetails, Degree } from "@/lib/db/management/degrees";
import {
  GetAllDegreeWiseSemesterMappings,
  SemestersMapping,
} from "@/lib/db/management/semesters";

import {
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  Layers,
} from "lucide-react";

export function AllSubjectsList() {
  const [subjects, setSubjects] = useState<Subjects[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [semesters, setSemesters] = useState<SemestersMapping[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Subjects>>({});

  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [addData, setAddData] = useState<Partial<Subjects>>({});

  const [collapsedDegrees, setCollapsedDegrees] = useState<Record<string, boolean>>({});
  const [collapsedSemesters, setCollapsedSemesters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!loading && degrees.length && semesters.length) {
      const initialDegreeCollapse = Object.fromEntries(
        degrees.map((degree) => [degree.degree_id, false])
      );
      setCollapsedDegrees(initialDegreeCollapse);

      const initialSemesterCollapse = Object.fromEntries(
        semesters.map((semester) => [
          degreeSemesterKey(semester.dwsm_degree_id, semester.dwsm_id),
          true,
        ])
      );
      setCollapsedSemesters(initialSemesterCollapse);
    }
  }, [loading, degrees, semesters]);

  function degreeSemesterKey(degreeId: string, semesterId: string) {
    return `${degreeId}-${semesterId}`;
  }

  async function loadData() {
    const [subjectData, degreeData, semesterData] = await Promise.all([
      GetAllSubjects(),
      GetAllDegreeDetails(),
      GetAllDegreeWiseSemesterMappings(),
    ]);

    setSubjects(subjectData);
    setDegrees(degreeData);
    setSemesters(semesterData);
    setLoading(false);
  }

  function resetEdit() {
    setEditingId(null);
    setEditData({});
  }

  function resetAdd() {
    setAddingKey(null);
    setAddData({});
  }

  function isUpdateValid() {
    return (
      editData.swsm_subject_name &&
      editData.swsm_subject_code &&
      editData.swsm_subject_category &&
      editData.swsm_subject_type
    );
  }

  async function handleUpdate(id: string) {
    if (!isUpdateValid()) return;

    const updated = await UpdateSubjects(id, {
      swsm_subject_name: editData.swsm_subject_name,
      swsm_subject_code: editData.swsm_subject_code,
      swsm_subject_category: editData.swsm_subject_category,
      swsm_subject_type: editData.swsm_subject_type,
      swsm_elective_set: editData.swsm_elective_set
    });

    setSubjects((prev) =>
      prev.map((s) => (s.swsm_id === id ? updated : s))
    );

    resetEdit();
  }

  async function handleDelete(id: string) {
    await DeleteSubjects(id);
    setSubjects((prev) => prev.filter((s) => s.swsm_id !== id));
  }

  async function handleCreate() {
    if (
      !addData.swsm_subject_name ||
      !addData.swsm_subject_code ||
      !addData.swsm_subject_category ||
      !addData.swsm_subject_type
    )
      return;

    const created = await CreateSubjects(addData as any);
    setSubjects((prev) => [...prev, created]);
    resetAdd();
  }

  const groupedData = useMemo(() => {
    return degrees.map((degree) => ({
      degreeId: degree.degree_id,
      degreeName: degree.degree_fullname,
      semesters: semesters
        .filter((s) => s.dwsm_degree_id === degree.degree_id)
        .map((semester) => ({
          semesterId: semester.dwsm_id,
          semesterNumber: semester.dwsm_semester_number,
          subjects: subjects.filter(
            (sub) =>
              sub.swsm_degree_id === degree.degree_id &&
              sub.swsm_semester_id === semester.dwsm_id
          ),
        })),
    }));
  }, [subjects, degrees, semesters]);

  function renderSubjectCard(subject: Subjects, showBadge: boolean = true) {
    const isEditing = editingId === subject.swsm_id;
    const isElective = subject.swsm_subject_category?.toLowerCase() === "elective";

    return (
      <div
        key={subject.swsm_id}
        className={`relative border rounded-xl p-4 shadow-sm bg-background ${
          !showBadge ? "border" : ""
        }`}
      >
        {isElective && !isEditing && showBadge && (
          <div className="absolute bottom-2 left-4">
            <span className="bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded">
              {subject.swsm_elective_set ? `Elective - ${subject.swsm_elective_set}` : `Elective`}
            </span>
          </div>
        )}

        {isEditing ? (
          <div className="space-y-2">
            <input
              className="w-full border rounded px-2 py-1 text-sm bg-background"
              value={editData.swsm_subject_name || ""}
              onChange={(e) => setEditData({ ...editData, swsm_subject_name: e.target.value })}
            />
            <input
              className="w-full border rounded px-2 py-1 text-sm bg-background"
              value={editData.swsm_subject_code || ""}
              onChange={(e) => setEditData({ ...editData, swsm_subject_code: e.target.value })}
            />
            <div className="flex gap-2">
              <select
                className="flex-1 border rounded px-2 py-1 text-sm"
                value={editData.swsm_subject_category || ""}
                onChange={(e) => setEditData({ ...editData, swsm_subject_category: e.target.value })}
              >
                <option value="">Category</option>
                <option value="CORE">Core</option>
                <option value="ELECTIVE">Elective</option>
              </select>
              {editData.swsm_subject_category?.toLowerCase() === "elective" && (
                <input
                  placeholder="Set"
                  value={editData.swsm_elective_set || ""}
                  className="w-16 border rounded px-2 py-1 text-sm"
                  onChange={(e) => setEditData({ ...editData, swsm_elective_set: e.target.value })}
                />
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => handleUpdate(subject.swsm_id)} className="text-green-600">
                <Check size={18} />
              </button>
              <button onClick={resetEdit} className="text-red-600">
                <X size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-start">
            <div className="pr-8">
              <p className="font-semibold text-sm leading-tight">{subject.swsm_subject_name}</p>
              <p className="text-xs opacity-50 mt-1 uppercase font-mono">{subject.swsm_subject_code}</p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setEditingId(subject.swsm_id);
                  setEditData(subject);
                }}
                className="hover:text-blue-600 opacity-40 hover:opacity-100 transition-opacity"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDelete(subject.swsm_id)}
                className="hover:text-red-600 opacity-40 hover:opacity-100 transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) return <p className="p-6 text-sm opacity-60">Loading Subjects...</p>;

  return (
    <div className="p-6 max-w-7xl space-y-6">
      <h2 className="text-2xl font-bold">Subjects</h2>

      {groupedData.map((degree) => {
        const degreeCollapsed = collapsedDegrees[degree.degreeId];

        return (
          <div key={degree.degreeId} className="border rounded-xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950">
            <div
              className="flex items-center gap-3 px-6 py-4 bg-gray-200 dark:bg-zinc-900 cursor-pointer"
              onClick={() =>
                setCollapsedDegrees((prev) => ({
                  ...prev,
                  [degree.degreeId]: !degreeCollapsed,
                }))
              }
            >
              {degreeCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
              <span className="font-bold text-lg">{degree.degreeName}</span>
            </div>

            {!degreeCollapsed &&
              degree.semesters.map((semester) => {
                const semesterKey = degreeSemesterKey(degree.degreeId, semester.semesterId);
                const semesterCollapsed = collapsedSemesters[semesterKey];

                // Logic to group subjects by Elective Set
                const subjectsByGroup = semester.subjects.reduce((acc, sub) => {
                  const isElective = sub.swsm_subject_category?.toLowerCase() === "elective";
                  const groupKey = (isElective && sub.swsm_elective_set) ? `elective-${sub.swsm_elective_set}` : 'standalone';
                  
                  if (!acc[groupKey]) acc[groupKey] = [];
                  acc[groupKey].push(sub);
                  return acc;
                }, {} as Record<string, Subjects[]>);

                const renderSubjectGrid = (type: string) => {
                    const filteredStandalone = (subjectsByGroup['standalone'] || []).filter(s => s.swsm_subject_type?.toLowerCase() === type);
                    
                    // Filter groups that contain subjects of this type
                    const relevantGroups = Object.keys(subjectsByGroup).filter(key => 
                        key !== 'standalone' && 
                        subjectsByGroup[key].some(s => s.swsm_subject_type?.toLowerCase() === type)
                    );

                    return (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Render Standalone Subjects */}
                            {filteredStandalone.map(s => renderSubjectCard(s))}

                            {/* Render Grouped Electives */}
                            {relevantGroups.map(groupKey => {
                                const groupSubjects = subjectsByGroup[groupKey].filter(s => s.swsm_subject_type?.toLowerCase() === type);
                                if (groupSubjects.length === 0) return null;
                                const setName = groupSubjects[0].swsm_elective_set;

                                return (
                                    <div key={groupKey} className="col-span-1 md:col-span-2 lg:col-span-3 border-2 border-red-100 dark:border-red-900/30 rounded-2xl p-5 bg-red-50/30 dark:bg-red-950/10">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Layers className="text-red-600" size={18} />
                                            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                                Elective : {setName}
                                            </span>
                                            <div className="flex-1 h-px bg-red-100 dark:bg-red-900/40" />
                                        </div>
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {groupSubjects.map(s => renderSubjectCard(s, false))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                };

                return (
                  <div key={semesterKey} className="border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between items-center px-6 py-3 bg-gray-100 dark:bg-zinc-900/50">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() =>
                          setCollapsedSemesters((prev) => ({
                            ...prev,
                            [semesterKey]: !semesterCollapsed,
                          }))
                        }
                      >
                        {semesterCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          Semester {semester.semesterNumber}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setAddingKey(semesterKey);
                          setAddData({ swsm_degree_id: degree.degreeId, swsm_semester_id: semester.semesterId });
                        }}
                        className="flex items-center gap-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black px-4 py-1.5 rounded-lg text-xs font-medium hover:opacity-80 transition"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>

                    {!semesterCollapsed && (
                      <div className="p-6 space-y-10">
                        {/* Add Subject Form remains same */}
                        {addingKey === semesterKey && (
                          <div className="border rounded-xl p-4 bg-zinc-50 dark:bg-zinc-900/40 max-w-md shadow-inner">
                            <p className="text-xs font-bold mb-3 uppercase opacity-50">New Subject</p>
                            <div className="space-y-2">
                                <input placeholder="Name" className="w-full border rounded px-3 py-2 text-sm bg-background" onChange={(e) => setAddData({ ...addData, swsm_subject_name: e.target.value })} />
                                <input placeholder="Code" className="w-full border rounded px-3 py-2 text-sm bg-background" onChange={(e) => setAddData({ ...addData, swsm_subject_code: e.target.value })} />
                                <div className="flex gap-2">
                                    <select className="flex-1 border rounded px-3 py-2 text-sm" onChange={(e) => setAddData({ ...addData, swsm_subject_category: e.target.value })}>
                                        <option value="">Category</option>
                                        <option value="CORE">Core</option>
                                        <option value="ELECTIVE">Elective</option>
                                    </select>
                                    {addData.swsm_subject_category?.toLowerCase() === "elective" && (
                                        <input placeholder="Set" className="w-20 border rounded px-3 py-2 text-sm bg-background" onChange={(e) => setAddData({ ...addData, swsm_elective_set: e.target.value })} />
                                    )}
                                </div>
                                <select className="w-full border rounded px-3 py-2 text-sm" onChange={(e) => setAddData({ ...addData, swsm_subject_type: e.target.value })}>
                                    <option value="">Type</option>
                                    <option value="THEORY">Theory</option>
                                    <option value="PRACTICAL">Practical</option>
                                </select>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button onClick={handleCreate} className="bg-zinc-900 text-white px-3 py-1 rounded text-xs">Create</button>
                                    <button onClick={resetAdd} className="text-zinc-500 text-xs">Cancel</button>
                                </div>
                            </div>
                          </div>
                        )}

                        {/* Theory Section */}
                        <div>
                          <div className="flex items-center gap-4 mb-6">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-40">Theory</span>
                            <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                          </div>
                          {renderSubjectGrid("theory")}
                        </div>

                        {/* Practical Section */}
                        <div>
                          <div className="flex items-center gap-4 mb-6">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-40">Practical</span>
                            <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                          </div>
                          {renderSubjectGrid("practical")}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        );
      })}
    </div>
  );
}