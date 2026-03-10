"use client";

import { useEffect, useState } from "react";

import {
  AcademicSemester,
  GetAllAcademicSemesters,
  CreateAcademicSemester,
  UpdateAcademicSemester,
  DeleteAcademicSemester,
} from "@/lib/db/academics/semesters";

import {
  AcademicSession,
  GetAllAcademicSessions,
} from "@/lib/db/academics/sessions";

import { Degree, GetAllDegreeDetails } from "@/lib/db/management/degrees";

import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

export function AllAcademicSemestersList() {
  const [semesters, setSemesters] = useState<AcademicSemester[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [sessionId, setSessionId] = useState("");
  const [degreeId, setDegreeId] = useState("");
  const [semesterMappingId, setSemesterMappingId] = useState("");
  const [semesterNumber, setSemesterNumber] = useState<number | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    const [semData, sesData, degData] = await Promise.all([
      GetAllAcademicSemesters(),
      GetAllAcademicSessions(),
      GetAllDegreeDetails(),
    ]);

    setSemesters(semData);
    setSessions(sesData);
    setDegrees(degData);
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setIsAdding(false);
    setSessionId("");
    setDegreeId("");
    setSemesterMappingId("");
    setSemesterNumber(null);
  }

  function isFormValid() {
    return sessionId !== "" && degreeId !== "" && semesterMappingId !== "";
  }

  async function handleCreate() {
    if (!isFormValid()) return;

    const newRow = await CreateAcademicSemester({
      academic_session_id: sessionId,
      academic_degree_id: degreeId,
      academic_degree_wise_semester_id: semesterMappingId,
      academic_session_semesters_number: semesterNumber,
    });

    setSemesters((prev) => [newRow, ...prev]);
    resetForm();
  }

  async function handleUpdate(id: string) {
    if (!isFormValid()) return;

    const updated = await UpdateAcademicSemester(id, {
      academic_session_id: sessionId,
      academic_degree_id: degreeId,
      academic_degree_wise_semester_id: semesterMappingId,
      academic_session_semesters_number: semesterNumber,
    });

    setSemesters((prev) =>
      prev.map((s) =>
        s.academic_session_semesters_id === id ? updated : s
      )
    );

    resetForm();
  }

  async function handleDelete(id: string) {
    await DeleteAcademicSemester(id);

    setSemesters((prev) =>
      prev.filter((s) => s.academic_session_semesters_id !== id)
    );
  }

  if (loading) {
    return <p className="p-6 text-sm opacity-60">Loading Semesters...</p>;
  }

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Academic Session Semesters</h2>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-md text-sm"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-4 text-left">Session</th>
              <th className="p-4 text-left">Degree</th>
              <th className="p-4 text-left">Semester</th>
              <th className="p-4 text-left">Created</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* ADD ROW */}
            {isAdding && (
              <tr className="border-t bg-gray-50 dark:bg-gray-900/40">
                <td className="p-4">
                  <select
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="">Select Session</option>
                    {sessions.map((s) => (
                      <option
                        key={s.academic_sessions_id}
                        value={s.academic_sessions_id}
                      >
                      {new Date(s.academic_sessions_start_date).getFullYear()+` — `+new Date(s.academic_sessions_end_date??'').getFullYear()}
                    </option> ))}
                  </select>
                </td>

                <td className="p-4">
                  <select
                    value={degreeId}
                    onChange={(e) => setDegreeId(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                  >
                    <option value="">Select Degree</option>
                    {degrees.map((d) => (
                      <option key={d.degree_id} value={d.degree_id}>
                        {d.degree_fullname}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-4">
                  <input
                    type="number"
                    value={semesterNumber ?? ""}
                    onChange={(e) =>
                      setSemesterNumber(Number(e.target.value))
                    }
                    className="w-full border rounded px-2 py-1"
                  />
                </td>

                <td className="p-4">—</td>

                <td className="p-4 flex justify-end gap-3">
                  <button
                    onClick={handleCreate}
                    className="hover:text-green-600"
                  >
                    <Check size={16} />
                  </button>

                  <button
                    onClick={resetForm}
                    className="hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            )}

            {/* EXISTING ROWS */}
            {semesters.map((s) => (
              <tr
                key={s.academic_session_semesters_id}
                className="border-t hover:bg-gray-50 dark:hover:bg-gray-900"
              >
                {editingId === s.academic_session_semesters_id ? (
                  <>
                    <td className="p-4">
                      <select
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      >
                        {sessions.map((ses) => (
                          <option
                            key={ses.academic_sessions_id}
                            value={ses.academic_sessions_id}
                          >
                            {new Date(ses.academic_sessions_start_date).getFullYear()+` — `+
                              new Date(
                                ses.academic_sessions_end_date??''
                              ).getFullYear()}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4">
                      <select
                        value={degreeId}
                        onChange={(e) => setDegreeId(e.target.value)}
                        className="w-full border rounded px-2 py-1"
                      >
                        {degrees.map((d) => (
                          <option key={d.degree_id} value={d.degree_id}>
                            {d.degree_fullname}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4">
                      <input
                        type="number"
                        value={semesterNumber ?? ""}
                        onChange={(e) =>
                          setSemesterNumber(Number(e.target.value))
                        }
                        className="w-full border rounded px-2 py-1"
                      />
                    </td>

                    <td className="p-4">—</td>

                    <td className="p-4 flex justify-end gap-3">
                      <button
                        onClick={() =>
                          handleUpdate(s.academic_session_semesters_id)
                        }
                        className="hover:text-green-600"
                      >
                        <Check size={16} />
                      </button>

                      <button
                        onClick={resetForm}
                        className="hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4">{new Date(s.academic_session_start).getFullYear()+` — `+new Date(s.academic_session_end).getFullYear()}</td>
                    <td className="p-4">{s.degree_name}</td>
                    <td className="p-4">
                      {s.academic_session_semesters_number}
                    </td>

                    <td className="p-4 text-gray-500">
                      {new Date(
                        s.academic_session_semesters_created_at
                      ).toLocaleDateString(`en-GB`)}
                    </td>

                    <td className="p-4 flex justify-end gap-4">
                      <button
                        onClick={() => {
                          setEditingId(
                            s.academic_session_semesters_id
                          );
                          setSessionId(s.academic_session_id);
                          setDegreeId(s.academic_degree_id);
                          setSemesterMappingId(
                            s.academic_degree_wise_semester_id
                          );
                          setSemesterNumber(
                            s.academic_session_semesters_number
                          );
                          setIsAdding(false);
                        }}
                        className="hover:text-blue-600"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(
                            s.academic_session_semesters_id
                          )
                        }
                        className="hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
