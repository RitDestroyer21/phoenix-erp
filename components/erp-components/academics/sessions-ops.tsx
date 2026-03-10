"use client";

import { useEffect, useState } from "react";
import {
  AcademicSession,
  GetAllAcademicSessions,
  CreateAcademicSession,
  UpdateAcademicSession,
  DeleteAcademicSession,
} from "@/lib/db/academics/sessions";

import {
  Degree,
  GetAllDegreeDetails,
} from "@/lib/db/management/degrees";

import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

export function AllAcademicSessionsList() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const [degreeId, setDegreeId] = useState("");
  const [startDate, setStartDate] = useState(""); // stored as YYYY-01-01
  const [endDate, setEndDate] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    const [sessionData, degreeData] = await Promise.all([
      GetAllAcademicSessions(),
      GetAllDegreeDetails(),
    ]);

    setSessions(sessionData);
    setDegrees(degreeData);
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setIsAdding(false);
    setDegreeId("");
    setStartDate("");
    setEndDate(null);
  }

  function getDegreeDuration(id:string) {
    const degree = degrees.find((d) => d.degree_id === id); //Kind of a Hashmap ; works faster and efficiently
    return degree ? degree.degree_duration : 0; // Returns duration, or 0 if not found
  }

  function isFormValid() {
    return degreeId !== "" && startDate !== "";
  }

  async function handleCreate() {
    if (!isFormValid()) return;

    const newSession = await CreateAcademicSession({
      academic_sessions_degree_id: degreeId,
      academic_sessions_start_date: startDate,
      academic_sessions_end_date: endDate,
    });

    setSessions((prev) => [newSession, ...prev]);
    resetForm();
  }

  async function handleUpdate(id: string) {
    if (!isFormValid()) return;

    const updated = await UpdateAcademicSession(id, {
      academic_sessions_degree_id: degreeId,
      academic_sessions_start_date: startDate,
      academic_sessions_end_date: endDate,
    });

    setSessions((prev) =>
      prev.map((s) =>
        s.academic_sessions_id === id ? updated : s
      )
    );

    resetForm();
  }

  async function handleDelete(id: string) {
    await DeleteAcademicSession(id);
    setSessions((prev) =>
      prev.filter((s) => s.academic_sessions_id !== id)
    );
  }

  if (loading) {
    return <p className="p-6 text-sm opacity-60">Loading Sessions...</p>;
  }

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Academic Sessions</h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-md text-sm hover:opacity-80 transition"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div className="border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="p-4 text-left">Degree</th>
              <th className="p-4 text-left">Batch</th>
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
                    value={degreeId}
                    onChange={(e) => setDegreeId(e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-background"
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
                        value={startDate.split("-")[0]}
                        onChange={(e) => {
                          const year = Number(e.target.value);
                          setStartDate(`${year}-01-01`);
                          if (e.target.value.length >= 4 && !isNaN(year)) {
                            setEndDate(`${year + getDegreeDuration(degreeId)
                            }-01-01`);
                          }else{
                            setEndDate(`----`);
                          }
                        }}
                        className="w-2/5 border rounded px-2 py-1 bg-background mx-2"
                      />
                      —
                      <input
                        type="number"
                        value={endDate ? endDate.split("-")[0] : ""}
                        onChange={(e) =>
                          setEndDate(
                            e.target.value
                              ? `${e.target.value}-01-01`
                              : null
                          )
                        }
                        className="w-2/5 border rounded px-2 py-1 bg-background mx-2 disabled:text-fg-disabled disabled:cursor-not-allowed disabled:opacity-70" disabled
                      />
                </td>

                <td className="p-4">—</td>

                <td className="p-4 flex justify-end gap-3">
                  <button
                    onClick={handleCreate}
                    disabled={!isFormValid()}
                    className="hover:text-green-600 disabled:opacity-30"
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
            {sessions.map((session) => (
              <tr
                key={session.academic_sessions_id}
                className="border-t hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                {editingId === session.academic_sessions_id ? (
                  <>
                    <td className="p-4">
                      <select
                        value={degreeId}
                        onChange={(e) => setDegreeId(e.target.value)}
                        className="w-full border rounded px-2 py-1 bg-background"
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
                        value={startDate.split("-")[0]}
                        onChange={(e) => {
                          const year = Number(e.target.value);
                          setStartDate(`${year}-01-01`);
                          if (e.target.value.length >= 4 && !isNaN(year)) {
                            setEndDate(`${year + getDegreeDuration(degreeId)
                            }-01-01`);
                          }else{
                            setEndDate(`----`);
                          }
                        }}
                        className="w-2/5 border rounded px-2 py-1 bg-background mx-2"
                      />
                      —
                      <input
                        type="number"
                        value={endDate ? endDate.split("-")[0] : ""}
                        onChange={(e) =>
                          setEndDate(
                            e.target.value
                              ? `${e.target.value}-01-01`
                              : null
                          )
                        }
                        className="w-2/5 border rounded px-2 py-1 bg-background mx-2 disabled:text-fg-disabled disabled:cursor-not-allowed disabled:opacity-70" disabled 
                      />
                    </td>

                    <td className="p-4">—</td>

                    <td className="p-4 flex justify-end gap-3">
                      <button
                        onClick={() =>
                          handleUpdate(session.academic_sessions_id)
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
                    <td className="p-4">
                      {session.academic_sessions_degree_name}
                    </td>
                    <td className="p-4">
                      {new Date(
                        session.academic_sessions_start_date
                      ).getFullYear()}
                      {` — `}
                      {Number(new Date(
                        session.academic_sessions_start_date
                      ).getFullYear())+Number(session.academic_sessions_degree_duration)}
                    </td>

                    <td className="p-4 text-gray-500">
                      {new Date(session.academic_sessions_created_at).toLocaleDateString("en-GB")}
                    </td>

                    <td className="p-4 flex justify-end gap-4">
                      <button
                        onClick={() => {
                          setEditingId(
                            session.academic_sessions_id
                          );
                          setDegreeId(
                            session.academic_sessions_degree_id
                          );
                          setStartDate(
                            session.academic_sessions_start_date
                          );
                          setEndDate(
                            session.academic_sessions_end_date
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
                            session.academic_sessions_id
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
