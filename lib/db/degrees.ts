"use client";

import { createClient } from "@/lib/supabase/client";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface Degree {
  degree_id: string;
  degree_initial: string;
  degree_fullname: string;
  degree_streamname: string;
  degree_dept_id: string;
  degree_level: string;
  degree_semesters: number;
  degree_created_at: string;
  degree_dept_name: string;
}

const supabase = createClient();

/* ================================
   GET ALL
================================ */
export async function GetAllDegreeDetails(): Promise<Degree[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DEGREE)
    .select(`
      *,
      departments:degree_dept_id (
        dept_name
      )
    `)
    .order("degree_created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (
    data?.map((item: any) => ({
      ...item,
      degree_dept_name: item.departments?.dept_name ?? "",
    })) ?? []
  );
}

/* ================================
   CREATE
================================ */
export async function CreateDegree(payload: {
  degree_initial: string;
  degree_fullname: string;
  degree_streamname: string;
  degree_level: string;
  degree_dept_id: string;
  degree_semesters: number;
}): Promise<Degree> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DEGREE)
    .insert([payload])
    .select(`
      *,
      departments:degree_dept_id (
        dept_name
      )
    `)
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    degree_dept_name: data.departments?.dept_name ?? "",
  };
}

/* ================================
   UPDATE
================================ */
export async function UpdateDegree(
  degree_id: string,
  payload: Partial<Omit<Degree, "degree_id" | "degree_created_at" | "degree_dept_name">>
): Promise<Degree> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DEGREE)
    .update(payload)
    .eq("degree_id", degree_id)
    .select(`
      *,
      departments:degree_dept_id (
        dept_name
      )
    `)
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    degree_dept_name: data.departments?.dept_name ?? "",
  };
}

/* ================================
   DELETE
================================ */
export async function DeleteDegree(degree_id: string): Promise<void> {
  const { error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DEGREE)
    .delete()
    .eq("degree_id", degree_id);

  if (error) throw new Error(error.message);
}
