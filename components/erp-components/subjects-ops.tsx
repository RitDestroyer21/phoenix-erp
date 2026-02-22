"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Subjects,
  GetAllSubjects,
  UpdateSubjects,
  DeleteSubjects,
  CreateSubjects,
} from "@/lib/db/subjects";

import { GetAllDegreeDetails, Degree } from "@/lib/db/degrees";
import {
  GetAllDegreeWiseSemesterMappings,
  SemestersMapping,
} from "@/lib/db/semesters";

import {
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
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

function renderSubjectCard(subject: Subjects) {
  const isEditing = editingId === subject.swsm_id;
  const isElective =
    subject.swsm_subject_category?.toLowerCase() === "elective";

  return (
    <div
      key={subject.swsm_id}
      className="relative border rounded-xl p-4 shadow-sm bg-background"
    >
      {/* ELECTIVE BADGE */}
      {isElective && !isEditing && (
        <div className="absolute bottom-2 left-4">
          <span className="bg-red-600 text-white text-sm px-3 py-1 rounded">
            Elective
          </span>
        </div>
      )}

      {isEditing ? (
        <>
          <input
            className="w-full border rounded px-2 py-1 mb-2 bg-background"
            value={editData.swsm_subject_name || ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                swsm_subject_name: e.target.value,
              })
            }
          />
          <input
            className="w-full border rounded px-2 py-1 mb-2 bg-background"
            value={editData.swsm_subject_code || ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                swsm_subject_code: e.target.value,
              })
            }
          />
          <input
            className="w-full border rounded px-2 py-1 mb-2 bg-background"
            value={editData.swsm_subject_category || ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                swsm_subject_category: e.target.value,
              })
            }
          />
          <input
            className="w-full border rounded px-2 py-1 mb-3 bg-background"
            value={editData.swsm_subject_type || ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                swsm_subject_type: e.target.value,
              })
            }
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => handleUpdate(subject.swsm_id)}
              className="hover:text-green-600"
            >
              <Check size={16} />
            </button>
            <button onClick={resetEdit} className="hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between ">
            <div>
              <p className="font-medium">
                {subject.swsm_subject_name}
              </p>
              <p className="text-xs opacity-60 mb-5">
                {subject.swsm_subject_code}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditingId(subject.swsm_id);
                  setEditData(subject);
                }}
                className="hover:text-blue-600"
              >
                <Pencil size={16} />
              </button>

              <button
                onClick={() => handleDelete(subject.swsm_id)}
                className="hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

        </>
      )}
    </div>
  );
}

  if (loading)
    return <p className="p-6 text-sm opacity-60">Loading Subjects...</p>;

  return (
    <div className="p-6 max-w-7xl space-y-6">
      <h2 className="text-2xl font-bold">Subjects</h2>

      {groupedData.map((degree) => {
        const degreeCollapsed = collapsedDegrees[degree.degreeId];

        return (
          <div key={degree.degreeId} className="border rounded-xl overflow-hidden shadow-sm">
            <div
              className="flex items-center gap-3 px-6 py-4 bg-gray-100 dark:bg-gray-800 cursor-pointer"
              onClick={() =>
                setCollapsedDegrees((prev) => ({
                  ...prev,
                  [degree.degreeId]: !degreeCollapsed,
                }))
              }
            >
              {degreeCollapsed ? (
                <ChevronRight size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
              <span className="font-semibold text-lg">
                {degree.degreeName}
              </span>
            </div>

            {!degreeCollapsed &&
              degree.semesters.map((semester) => {
                const semesterKey = degreeSemesterKey(
                  degree.degreeId,
                  semester.semesterId
                );

                const semesterCollapsed =
                  collapsedSemesters[semesterKey];

                const theorySubjects = semester.subjects.filter(
                  (s) => s.swsm_subject_type?.toLowerCase() === "theory"
                );

                const practicalSubjects = semester.subjects.filter(
                  (s) => s.swsm_subject_type?.toLowerCase() === "practical"
                );

                return (
                  <div key={semesterKey} className="border-t">
                    <div className="flex justify-between items-center px-6 py-2 bg-gray-100 dark:bg-gray-800">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() =>
                          setCollapsedSemesters((prev) => ({
                            ...prev,
                            [semesterKey]: !semesterCollapsed,
                          }))
                        }
                      >
                        {semesterCollapsed ? (
                          <ChevronRight size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                        <span className="font-medium">
                          Semester {semester.semesterNumber}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setAddingKey(semesterKey);
                          setAddData({
                            swsm_degree_id: degree.degreeId,
                            swsm_semester_id: semester.semesterId,
                          });
                        }}
                        className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-md text-sm hover:opacity-80 transition"
                      >
                        <Plus size={14} />
                        Add
                      </button>
                    </div>

                    {!semesterCollapsed && (
                      <div className="p-6 space-y-8">
                        {addingKey === semesterKey && (
                          <div className="border rounded-xl p-4 bg-gray-50 dark:bg-gray-900/40 max-w-md">
                            <input
                              placeholder="Name"
                              className="w-full border rounded px-2 py-1 mb-2 bg-background"
                              onChange={(e) =>
                                setAddData({
                                  ...addData,
                                  swsm_subject_name: e.target.value,
                                })
                              }
                            />
                            <input
                              placeholder="Code"
                              className="w-full border rounded px-2 py-1 mb-2 bg-background"
                              onChange={(e) =>
                                setAddData({
                                  ...addData,
                                  swsm_subject_code: e.target.value,
                                })
                              }
                            />
                            <input
                              placeholder="Category"
                              className="w-full border rounded px-2 py-1 mb-2 bg-background"
                              onChange={(e) =>
                                setAddData({
                                  ...addData,
                                  swsm_subject_category: e.target.value,
                                })
                              }
                            />
                            <input
                              placeholder="Type (Theory / Practical)"
                              className="w-full border rounded px-2 py-1 mb-3 bg-background"
                              onChange={(e) =>
                                setAddData({
                                  ...addData,
                                  swsm_subject_type: e.target.value,
                                })
                              }
                            />

                            <div className="flex justify-end gap-3">
                              <button onClick={handleCreate}>
                                <Check size={16} />
                              </button>
                              <button onClick={resetAdd}>
                                <X size={16} />
                              </button>
                            </div>
                          </div>
                        )}

                        {theorySubjects.length > 0 && (
                          <div>
                            <div className="flex items-center gap-4 mb-4">
                              <span className="text-sm font-medium opacity-70 whitespace-nowrap">
                                Theory
                              </span>
                              <div className="flex-1 h-px bg-border" />
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {theorySubjects.map(renderSubjectCard)}
                            </div>
                          </div>
                        )}

                        {practicalSubjects.length > 0 && (
                          <div>
                            <div className="flex items-center gap-4 mb-4">
                              <span className="text-sm font-medium opacity-70 whitespace-nowrap">
                                Practical
                              </span>
                              <div className="flex-1 h-px bg-border" />
                            </div>

                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {practicalSubjects.map(renderSubjectCard)}
                            </div>
                          </div>
                        )}
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