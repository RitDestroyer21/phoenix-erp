"use client";

import { createClient } from "@/lib/supabase/client";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface SemestersMapping {
  dwsm_id: string;
  dwsm_semester_number: number;
  dwsm_degree_id: string;
  dwsm_created_at: string;
  dwsm_degree_name: string;
}

const supabase = createClient();

/* ================================
   HELPER: Flatten
================================ */
function flattenSemester(row: any): SemestersMapping {
  return {
    dwsm_id: row.dwsm_id,
    dwsm_semester_number: row.dwsm_semester_number,
    dwsm_degree_id: row.dwsm_degree_id,
    dwsm_created_at: row.dwsm_created_at,
    dwsm_degree_name: row.degrees?.degree_fullname ?? "",
  };
}

/* ================================
   GET ALL
================================ */
export async function GetAllDegreeWiseSemesterMappings(): Promise<SemestersMapping[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.SEMESTERS)
    .select(`
      *,
      degrees:dwsm_degree_id (
        degree_fullname
      )
    `)
    .order("dwsm_degree_id", { ascending: true });

  if (error) {
    console.error("Fetch DWSM Error:", error);
    throw new Error(error.message);
  }

  return (data ?? []).map(flattenSemester);
}

/* ================================
   GET BY DEGREE
================================ */
export async function GetSemestersByDegree(
  degreeId: string
): Promise<SemestersMapping[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.SEMESTERS)
    .select(`
      *,
      degrees:dwsm_degree_id (
        degree_fullname
      )
    `)
    .eq("dwsm_degree_id", degreeId)
    .order("dwsm_degree_id", { ascending: true });

  if (error) {
    console.error("Fetch Semesters By Degree Error:", error);
    throw new Error(error.message);
  }

  return (data ?? []).map(flattenSemester);
}

/* ================================
   CREATE
================================ */
export async function CreateDegreeWiseSemesterMapping(
  payload: Omit<
    SemestersMapping,
    "dwsm_id" | "dwsm_created_at" | "dwsm_degree_name"
  >
): Promise<SemestersMapping> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.SEMESTERS)
    .insert([payload])
    .select(`
      *,
      degrees:dwsm_degree_id (
        degree_fullname
      )
    `)
    .single();

  if (error) {
    console.error("Create DWSM Error:", error);
    throw new Error(error.message);
  }

  return flattenSemester(data);
}

/* ================================
   UPDATE
================================ */
export async function UpdateDegreeWiseSemesterMapping(
  dwsm_id: string,
  payload: Partial<
    Omit<
      SemestersMapping,
      "dwsm_id" | "dwsm_created_at" | "dwsm_degree_name"
    >
  >
): Promise<SemestersMapping> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.SEMESTERS)
    .update(payload)
    .eq("dwsm_id", dwsm_id)
    .select(`
      *,
      degrees:dwsm_degree_id (
        degree_fullname
      )
    `)
    .single();

  if (error) {
    console.error("Update DWSM Error:", error);
    throw new Error(error.message);
  }

  return flattenSemester(data);
}

/* ================================
   DELETE
================================ */
export async function DeleteDegreeWiseSemesterMapping(
  dwsm_id: string
): Promise<void> {
  const { error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.SEMESTERS)
    .delete()
    .eq("dwsm_id", dwsm_id);

  if (error) {
    console.error("Delete DWSM Error:", error);
    throw new Error(error.message);
  }
}
