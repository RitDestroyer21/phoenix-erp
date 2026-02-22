"use client";

import { createClient } from "@/lib/supabase/client";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface Department {
  dept_id: string;
  dept_name: string;
  dept_created_at: string;
}

const supabase = createClient();

/* ================================
   GET ALL DEPARTMENTS
================================ */
export async function GetAllDeptDetails(): Promise<Department[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DEPARTMENTS)
    .select("*")
    .order("dept_created_at", { ascending: true });

  if (error) {
    console.error("Fetch Departments Error:", error);
    throw new Error(error.message);
  }

  return (data ?? []) as Department[];
}

/* ================================
   CREATE DEPARTMENT
================================ */
export async function CreateDepartment(
  dept_name: string
): Promise<Department> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DEPARTMENTS)
    .insert([{ dept_name }])
    .select()
    .single();

  if (error) {
    console.error("Create Department Error:", error);
    throw new Error(error.message);
  }

  return data as Department;
}

/* ================================
   UPDATE DEPARTMENT
================================ */
export async function UpdateDepartment(
  dept_id: string,
  dept_name: string
): Promise<void> {
  const { error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DEPARTMENTS)
    .update({ dept_name })
    .eq("dept_id", dept_id);

  if (error) {
    console.error("Update Department Error:", error);
    throw new Error(error.message);
  }
}

/* ================================
   DELETE DEPARTMENT
================================ */
export async function DeleteDepartment(
  dept_id: string
): Promise<void> {
  const { error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DEPARTMENTS)
    .delete()
    .eq("dept_id", dept_id);

  if (error) {
    console.error("Delete Department Error:", error);
    throw new Error(error.message);
  }
}
