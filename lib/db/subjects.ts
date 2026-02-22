"use client";

import { createClient } from "@/lib/supabase/client";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface Subjects {
  swsm_id: string;
  swsm_degree_id: string;
  swsm_semester_id: string;
  swsm_subject_code: string;
  swsm_subject_name: string;
  swsm_subject_category: string;
  swsm_subject_type: string;
  swsm_created_at: string;
  swsm_degree_name: string;
  swsm_semester_name: string;
}

const supabase = createClient();

/* ================================
   HELPER: Flatten
================================ */
function flattenSubject(row: any): Subjects {
  return {
    swsm_id: row.swsm_id,
    swsm_degree_id: row.swsm_degree_id,
    swsm_semester_id: row.swsm_semester_id,
    swsm_subject_code: row.swsm_subject_code,
    swsm_subject_name: row.swsm_subject_name,
    swsm_subject_category: row.swsm_subject_category,
    swsm_subject_type: row.swsm_subject_type,
    swsm_created_at: row.swsm_created_at,
    swsm_degree_name: row.degrees?.degree_fullname ?? "",
    swsm_semester_name: row.semesters?.dwsm_semester_number
      ? `Semester ${row.semesters.dwsm_semester_number}`
      : "",
  };
}

/* ================================
   GET ALL
================================ */
export async function GetAllSubjects(): Promise<Subjects[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.SUBJECTS)
    .select(`
      *,
      degrees:swsm_degree_id (
        degree_fullname
      ),
      semesters:swsm_semester_id (
        dwsm_semester_number
      )
    `)
    .order("swsm_subject_code", { ascending: true });

  if (error) {
    console.error("Fetch SWSM Error:", error);
    throw new Error(error.message);
  }

  return (data ?? []).map(flattenSubject);
}

/* ================================
   GET BY DEGREE
================================ */
export async function GetSemesterWiseSubjectsByDegree(
  degreeId: string
): Promise<Subjects[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.SUBJECTS)
    .select(`
      *,
      degrees:swsm_degree_id (
        degree_fullname
      ),
      semesters:swsm_semester_id (
        dwsm_semester_number
      )
    `)
    .eq("swsm_degree_id", degreeId)
    .order("swsm_created_at", { ascending: true });

  if (error) {
    console.error("Fetch By Degree Error:", error);
    throw new Error(error.message);
  }

  return (data ?? []).map(flattenSubject);
}

/* ================================
   CREATE
================================ */
export async function CreateSubjects(
  payload: Omit<Subjects, "swsm_id" | "swsm_created_at" | "swsm_degree_name" | "swsm_semester_name">
): Promise<Subjects> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.SUBJECTS)
    .insert([payload])
    .select(`
      *,
      degrees:swsm_degree_id (
        degree_fullname
      ),
      semesters:swsm_semester_id (
        dwsm_semester_number
      )
    `)
    .single();

  if (error) {
    console.error("Create SWSM Error:", error);
    throw new Error(error.message);
  }

  return flattenSubject(data);
}

/* ================================
   UPDATE
================================ */
export async function UpdateSubjects(
  swsm_id: string,
  payload: Partial<Omit<Subjects, "swsm_id" | "swsm_created_at" | "swsm_degree_name" | "swsm_semester_name">>
): Promise<Subjects> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.SUBJECTS)
    .update(payload)
    .eq("swsm_id", swsm_id)
    .select(`
      *,
      degrees:swsm_degree_id (
        degree_fullname
      ),
      semesters:swsm_semester_id (
        dwsm_semester_number
      )
    `)
    .single();

  if (error) {
    console.error("Update SWSM Error:", error);
    throw new Error(error.message);
  }

  return flattenSubject(data);
}

/* ================================
   DELETE
================================ */
export async function DeleteSubjects(swsm_id: string): Promise<void> {
  const { error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.SUBJECTS)
    .delete()
    .eq("swsm_id", swsm_id);

  if (error) {
    console.error("Delete SWSM Error:", error);
    throw new Error(error.message);
  }
}
