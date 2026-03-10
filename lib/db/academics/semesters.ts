"use client";

import { createClient } from "@/lib/supabase/client";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface AcademicSemester {
  academic_session_semesters_id: string;
  academic_session_id: string;
  academic_degree_id: string;
  academic_degree_wise_semester_id: string;
  academic_session_semesters_number: number | null;
  academic_session_semesters_created_at: string;

  academic_session_start: string;
  academic_session_end: string;
  degree_name: string;
}

const supabase = createClient();

/* ================================
   GET ALL
================================ */
export async function GetAllAcademicSemesters(): Promise<AcademicSemester[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SEMESTERS)
    .select(`
      *,
      sessions:academic_session_id (
        academic_sessions_start_date,
        academic_sessions_end_date
      ),
      degree:academic_degree_id (
        degree_fullname
      )
    `)
    .order("academic_session_semesters_number", { ascending: true });

  if (error) throw new Error(error.message);

  return (
    data?.map((item: any) => ({
      ...item,
      academic_session_start: item.sessions?.academic_sessions_start_date ?? "",
      academic_session_end: item.sessions?.academic_sessions_end_date ?? "",
      degree_name: item.degree?.degree_fullname ?? "",
    })) ?? []
  );
}

/* ================================
   CREATE
================================ */
export async function CreateAcademicSemester(payload: {
  academic_session_id: string;
  academic_degree_id: string;
  academic_degree_wise_semester_id: string;
  academic_session_semesters_number: number | null;
}): Promise<AcademicSemester> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SEMESTERS)
    .insert([payload])
    .select(`
      *,
      sessions:academic_session_id (
        academic_sessions_start_date
      ),
      degree:academic_degree_id (
        degree_fullname
      )
    `)
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    academic_session_start: data.sessions?.academic_sessions_start_date ?? "",
    academic_session_end: data.sessions?.academic_sessions_end_date ?? "",
    degree_name: data.degree?.degree_fullname ?? "",
  };
}

/* ================================
   UPDATE
================================ */
export async function UpdateAcademicSemester(
  id: string,
  payload: Partial<
    Omit<
      AcademicSemester,
      | "academic_session_semesters_id"
      | "academic_session_semesters_created_at"
      | "academic_session_start"
      | "degree_name"
    >
  >
): Promise<AcademicSemester> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SEMESTERS)
    .update(payload)
    .eq("academic_session_semesters_id", id)
    .select(`
      *,
      sessions:academic_session_id (
        academic_sessions_start_date
      ),
      degree:academic_degree_id (
        degree_fullname
      )
    `)
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    academic_session_start: data.sessions?.academic_sessions_start_date ?? "",
    academic_session_end: data.sessions?.academic_sessions_end_date ?? "",
    degree_name: data.degree?.degree_fullname ?? "",
  };
}

/* ================================
   DELETE
================================ */
export async function DeleteAcademicSemester(id: string): Promise<void> {
  const { error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SEMESTERS)
    .delete()
    .eq("academic_session_semesters_id", id);

  if (error) throw new Error(error.message);
}
