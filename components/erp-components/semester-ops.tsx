"use client";

import { useEffect, useState } from "react";
import {
  SemestersMapping,
  GetAllDegreeWiseSemesterMappings,
  CreateDegreeWiseSemesterMapping,
  UpdateDegreeWiseSemesterMapping,
  DeleteDegreeWiseSemesterMapping,
} from "@/lib/db/semesters";

import { GetAllDegreeDetails, Degree } from "@/lib/db/degrees";

import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

export function AllSemestersList() {
  const [semesters, setSemesters] = useState<SemestersMapping[]>([]);
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSemesterNumber, setEditingSemesterNumber] = useState<number>(0);
  const [editingDegreeId, setEditingDegreeId] = useState<string>("");

  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    const [semesterData, degreeData] = await Promise.all([
      GetAllDegreeWiseSemesterMappings(),
      GetAllDegreeDetails(),
    ]);

    setSemesters(semesterData);
    setDegrees(degreeData);
    setLoading(false);
  }

  function resetForm() {
    setEditingId(null);
    setIsAdding(false);
    setEditingSemesterNumber(0);
    setEditingDegreeId("");
  }

  function isFormValid() {
    return editingSemesterNumber > 0 && editingDegreeId !== "";
  }

  async function handleCreate() {
    if (!isFormValid()) return;

    const created = await CreateDegreeWiseSemesterMapping({
      dwsm_semester_number: editingSemesterNumber,
      dwsm_degree_id: editingDegreeId,
    });

    setSemesters((prev) => [...prev, created]);
    resetForm();
  }

  async function handleUpdate(id: string) {
    if (!isFormValid()) return;

    const updated = await UpdateDegreeWiseSemesterMapping(id, {
      dwsm_semester_number: editingSemesterNumber,
      dwsm_degree_id: editingDegreeId,
    });

    setSemesters((prev) =>
      prev.map((s) => (s.dwsm_id === id ? updated : s))
    );

    resetForm();
  }

  async function handleDelete(id: string) {
    await DeleteDegreeWiseSemesterMapping(id);
    setSemesters((prev) => prev.filter((s) => s.dwsm_id !== id));
  }

  if (loading) {
    return <p className="p-6 text-sm opacity-60">Loading Semesters...</p>;
  }

  return (
    <div className="p-6 w-full max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Degree Semesters</h2>

        <button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
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
              <th className="p-4 text-left">Semester No</th>
              <th className="p-4 text-left">Degree</th>
              <th className="p-4 text-left">Created</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* ADD ROW */}
            {isAdding && (
              <tr className="border-t bg-gray-50 dark:bg-gray-900/40">
                <td className="p-4">
                  <input
                    type="number"
                    value={editingSemesterNumber}
                    onChange={(e) =>
                      setEditingSemesterNumber(Number(e.target.value))
                    }
                    className="w-full border rounded px-2 py-1 bg-background"
                    placeholder="Semester Number"
                  />
                </td>

                <td className="p-4">
                  <select
                    value={editingDegreeId}
                    onChange={(e) => setEditingDegreeId(e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-background"
                  >
                    <option value="">Select Degree</option>
                    {degrees.map((degree) => (
                      <option key={degree.degree_id} value={degree.degree_id}>
                        {degree.degree_fullname}
                      </option>
                    ))}
                  </select>
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
            {semesters.map((semester) => (
              <tr
                key={semester.dwsm_id}
                className="border-t hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                {editingId === semester.dwsm_id ? (
                  <>
                    <td className="p-4">
                      <input
                        type="number"
                        value={editingSemesterNumber}
                        onChange={(e) =>
                          setEditingSemesterNumber(Number(e.target.value))
                        }
                        className="w-full border rounded px-2 py-1 bg-background"
                      />
                    </td>

                    <td className="p-4">
                      <select
                        value={editingDegreeId}
                        onChange={(e) => setEditingDegreeId(e.target.value)}
                        className="w-full border rounded px-2 py-1 bg-background"
                      >
                        {degrees.map((degree) => (
                          <option key={degree.degree_id} value={degree.degree_id}>
                            {degree.degree_fullname}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4">—</td>

                    <td className="p-4 flex justify-end gap-3">
                      <button
                        onClick={() => handleUpdate(semester.dwsm_id)}
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
                      Semester {semester.dwsm_semester_number}
                    </td>

                    <td className="p-4">
                      {semester.dwsm_degree_name}
                    </td>

                    <td className="p-4 text-gray-500">
                      {new Date(
                        semester.dwsm_created_at
                      ).toLocaleDateString()}
                    </td>

                    <td className="p-4 flex justify-end gap-4">
                      <button
                        onClick={() => {
                          setEditingId(semester.dwsm_id);
                          setEditingSemesterNumber(
                            semester.dwsm_semester_number
                          );
                          setEditingDegreeId(semester.dwsm_degree_id);
                          setIsAdding(false);
                        }}
                        className="hover:text-blue-600"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(semester.dwsm_id)
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
