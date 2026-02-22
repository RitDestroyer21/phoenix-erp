"use client";

import { useEffect, useState } from "react";
import {
  GetAllDeptDetails,
  Department,
  DeleteDepartment,
  CreateDepartment,
  UpdateDepartment,
} from "@/lib/db/departments";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";

export function AllDepartmentsList() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    try {
      const data = await GetAllDeptDetails();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteDepartment(id: string) {
    await DeleteDepartment(id);
    setDepartments((prev) => prev.filter((d) => d.dept_id !== id));
  }

  async function handleCreateDepartment() {
    if (!editingName.trim()) return;

    const newDept = await CreateDepartment(editingName);
    setDepartments((prev) => [newDept, ...prev]);

    setEditingName("");
    setIsAdding(false);
  }

  async function handleUpdate(id: string) {
    if (!editingName.trim()) return;

    await UpdateDepartment(id, editingName);

    setDepartments((prev) =>
      prev.map((d) =>
        d.dept_id === id ? { ...d, dept_name: editingName } : d
      )
    );

    setEditingId(null);
    setEditingName("");
  }

  if (loading) {
    return <p className="p-6 text-sm opacity-60">Loading departments...</p>;
  }

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Departments</h2>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingName("");
          }}
          className="flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-md text-sm hover:opacity-80 transition"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left p-4 font-medium">Department Name</th>
              <th className="text-left p-4 font-medium">Created At</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {/* Add Row */}
            {isAdding && (
              <tr className="border-t bg-muted/40">
                <td className="p-4">
                  <input
                    autoFocus
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="w-full border rounded px-2 py-1 bg-background"
                    placeholder="Enter department name"
                  />
                </td>
                <td className="p-4 text-muted-foreground">—</td>
                <td className="p-4 flex justify-end gap-3">
                  <button
                    onClick={handleCreateDepartment}
                    className="hover:text-green-600"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setIsAdding(false)}
                    className="hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </td>
              </tr>
            )}

            {/* Existing Rows */}
            {departments.map((dept) => (
              <tr
                key={dept.dept_id}
                className="border-t hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              >
                <td className="p-4 font-medium">
                  {editingId === dept.dept_id ? (
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="w-full border rounded px-2 py-1 bg-background"
                    />
                  ) : (
                    dept.dept_name
                  )}
                </td>

                <td className="p-4 text-gray-500">
                  {new Date(dept.dept_created_at).toLocaleDateString()}
                </td>

                <td className="p-4 flex justify-end gap-4">
                  {editingId === dept.dept_id ? (
                    <>
                      <button
                        onClick={() => handleUpdate(dept.dept_id)}
                        className="hover:text-green-600"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="hover:text-red-600"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(dept.dept_id);
                          setEditingName(dept.dept_name);
                        }}
                        className="hover:text-blue-600 transition"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteDepartment(dept.dept_id)}
                        className="hover:text-red-600 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
