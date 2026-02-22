"use client";

import { useEffect, useState } from "react";
import {
  Degree,
  GetAllDegreeDetails,
  DeleteDegree,
  CreateDegree,
  UpdateDegree,
} from "@/lib/db/degrees";

import { GetAllDeptDetails, Department } from "@/lib/db/departments";

import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

export function AllDegreesList() {
  const [degrees, setDegrees] = useState<Degree[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingDegreeId, setEditingDegreeId] = useState<string | null>(null);
  const [editingDegreeCode, setEditingDegreeCode] = useState("");
  const [editingDegreeName, setEditingDegreeName] = useState("");
  const [editingDegreeStream, setEditingDegreeStream] = useState("");
  const [editingDegreeLevel, setEditingDegreeLevel] = useState("");
  const [editingDegreeDept, setEditingDegreeDept] = useState("");
  const [editingDegreeSemesters, setEditingDegreeSemesters] = useState<number>(0);
  const [isDegreeAdding, setIsDegreeAdding] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    const [degreeData, deptData] = await Promise.all([
      GetAllDegreeDetails(),
      GetAllDeptDetails(),
    ]);

    setDegrees(degreeData);
    setDepartments(deptData);
    setLoading(false);
  }

  function resetForm() {
    setEditingDegreeId(null);
    setIsDegreeAdding(false);
    setEditingDegreeCode("");
    setEditingDegreeName("");
    setEditingDegreeStream("");
    setEditingDegreeLevel("");
    setEditingDegreeDept("");
    setEditingDegreeSemesters(0);
  }

  function isFormValid() {
    return (
      editingDegreeCode.trim() !== "" &&
      editingDegreeName.trim() !== "" &&
      editingDegreeStream.trim() !== "" &&
      editingDegreeLevel.trim() !== "" &&
      editingDegreeDept !== "" &&
      editingDegreeSemesters > 0
    );
  }

  async function handleCreate() {
    if (!isFormValid()) return;

    const newDegree = await CreateDegree({
      degree_initial: editingDegreeCode,
      degree_fullname: editingDegreeName,
      degree_streamname: editingDegreeStream,
      degree_level: editingDegreeLevel,
      degree_dept_id: editingDegreeDept,
      degree_semesters: editingDegreeSemesters,
    });

    setDegrees((prev) => [...prev, newDegree]);
    resetForm();
  }

  async function handleUpdate(id: string) {
    if (!isFormValid()) return;

    const updated = await UpdateDegree(id, {
      degree_initial: editingDegreeCode,
      degree_fullname: editingDegreeName,
      degree_streamname: editingDegreeStream,
      degree_level: editingDegreeLevel,
      degree_dept_id: editingDegreeDept,
      degree_semesters: editingDegreeSemesters,
    });

    setDegrees((prev) =>
      prev.map((d) => (d.degree_id === id ? updated : d))
    );

    resetForm();
  }

  async function handleDelete(id: string) {
    await DeleteDegree(id);
    setDegrees((prev) => prev.filter((d) => d.degree_id !== id));
  }

  if (loading) {
    return <p className="p-6 text-sm opacity-60">Loading Degrees...</p>;
  }

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Degrees</h2>
        <button
          onClick={() => setIsDegreeAdding(true)}
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
              <th className="p-4 text-left">Code</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Stream</th>
              <th className="p-4 text-left">Level</th>
              <th className="p-4 text-left">Department</th>
              <th className="p-4 text-left">Semesters</th>
              <th className="p-4 text-left">Created</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* ADD ROW */}
            {isDegreeAdding && (
              <tr className="border-t bg-gray-50 dark:bg-gray-900/40">
                <td className="p-4">
                  <input
                    value={editingDegreeCode}
                    onChange={(e) => setEditingDegreeCode(e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-background"
                    placeholder="Code"
                  />
                </td>

                <td className="p-4">
                  <input
                    value={editingDegreeName}
                    onChange={(e) => setEditingDegreeName(e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-background"
                    placeholder="Name"
                  />
                </td>

                <td className="p-4">
                  <input
                    value={editingDegreeStream}
                    onChange={(e) => setEditingDegreeStream(e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-background"
                    placeholder="Stream"
                  />
                </td>

                <td className="p-4">
                  <input
                    value={editingDegreeLevel}
                    onChange={(e) => setEditingDegreeLevel(e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-background"
                    placeholder="Level"
                  />
                </td>

                <td className="p-4">
                  <select
                    value={editingDegreeDept}
                    onChange={(e) => setEditingDegreeDept(e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-background"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.dept_id} value={dept.dept_id}>
                        {dept.dept_name}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-4">
                  <input
                    type="number"
                    value={editingDegreeSemesters}
                    onChange={(e) =>
                      setEditingDegreeSemesters(Number(e.target.value))
                    }
                    className="w-full border rounded px-2 py-1 bg-background"
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
            {degrees.map((degree) => (
            <tr
              key={degree.degree_id}
              className="border-t hover:bg-gray-50 dark:hover:bg-gray-900 transition"
            >
              {editingDegreeId === degree.degree_id ? (
                <>
                  <td className="p-4">
                    <input
                      value={editingDegreeCode}
                      onChange={(e) => setEditingDegreeCode(e.target.value)}
                      className="w-full border rounded px-2 py-1 bg-background"
                    />
                  </td>

                  <td className="p-4">
                    <input
                      value={editingDegreeName}
                      onChange={(e) => setEditingDegreeName(e.target.value)}
                      className="w-full border rounded px-2 py-1 bg-background"
                    />
                  </td>

                  <td className="p-4">
                    <input
                      value={editingDegreeStream}
                      onChange={(e) => setEditingDegreeStream(e.target.value)}
                      className="w-full border rounded px-2 py-1 bg-background"
                    />
                  </td>

                  <td className="p-4">
                    <input
                      value={editingDegreeLevel}
                      onChange={(e) => setEditingDegreeLevel(e.target.value)}
                      className="w-full border rounded px-2 py-1 bg-background"
                    />
                  </td>

                  <td className="p-4">
                    <select
                      value={editingDegreeDept}
                      onChange={(e) => setEditingDegreeDept(e.target.value)}
                      className="w-full border rounded px-2 py-1 bg-background"
                    >
                      {departments.map((dept) => (
                        <option key={dept.dept_id} value={dept.dept_id}>
                          {dept.dept_name}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-4">
                    <input
                      type="number"
                      value={editingDegreeSemesters}
                      onChange={(e) =>
                        setEditingDegreeSemesters(Number(e.target.value))
                      }
                      className="w-full border rounded px-2 py-1 bg-background"
                    />
                  </td>

                  <td className="p-4">—</td>

                  <td className="p-4 flex justify-end gap-3">
                    <button
                      onClick={() => handleUpdate(degree.degree_id)}
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
                  <td className="p-4">{degree.degree_initial}</td>
                  <td className="p-4">{degree.degree_fullname}</td>
                  <td className="p-4">{degree.degree_streamname}</td>
                  <td className="p-4">{degree.degree_level}</td>
                  <td className="p-4">{degree.degree_dept_name}</td>
                  <td className="p-4">{degree.degree_semesters}</td>
                  <td className="p-4 text-gray-500">
                    {new Date(degree.degree_created_at).toLocaleDateString()}
                  </td>

                  <td className="p-4 flex justify-end gap-4">
                    <button
                      onClick={() => {
                        setEditingDegreeId(degree.degree_id);
                        setEditingDegreeCode(degree.degree_initial);
                        setEditingDegreeName(degree.degree_fullname);
                        setEditingDegreeStream(degree.degree_streamname);
                        setEditingDegreeLevel(degree.degree_level);
                        setEditingDegreeDept(degree.degree_dept_id);
                        setEditingDegreeSemesters(degree.degree_semesters);
                        setIsDegreeAdding(false);
                      }}
                      className="hover:text-blue-600"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => handleDelete(degree.degree_id)}
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
