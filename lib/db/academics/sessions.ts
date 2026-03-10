"use client";

import { createClient } from "@/lib/supabase/client";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface AcademicSession {
  academic_sessions_id: string;
  academic_sessions_degree_id: string;
  academic_sessions_start_date: string;
  academic_sessions_end_date: string | null;
  academic_sessions_created_at: string;

  // Flattened relation
  academic_sessions_degree_name: string;
  academic_sessions_degree_duration: string;
}

const supabase = createClient();

/* ================================
   GET ALL
================================ */
export async function GetAllAcademicSessions(): Promise<AcademicSession[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SESSIONS)
    .select(`
      *,
      degrees:academic_sessions_degree_id (
        degree_fullname,
        degree_duration
      )
    `)
    .order("academic_sessions_created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (
    data?.map((item: any) => ({
      ...item,
      academic_sessions_degree_name:
        item.degrees?.degree_fullname ?? "",
      academic_sessions_degree_duration:
        item.degrees?.degree_duration ?? "",
    })) ?? []
  );
}

/* ================================
   CREATE
================================ */
export async function CreateAcademicSession(payload: {
  academic_sessions_degree_id: string;
  academic_sessions_start_date: string;
  academic_sessions_end_date: string | null;
}): Promise<AcademicSession> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SESSIONS)
    .insert([payload])
    .select(`
      *,
      degrees:academic_sessions_degree_id (
        degree_fullname,
        degree_duration
      )
    `)
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    academic_sessions_degree_name:
      data.degrees?.degree_fullname ?? "",
    academic_sessions_degree_duration:
      data.degrees?.degree_duration ?? "",
  };
}

/* ================================
   UPDATE
================================ */
export async function UpdateAcademicSession(
  id: string,
  payload: Partial<{
    academic_sessions_degree_id: string;
    academic_sessions_start_date: string;
    academic_sessions_end_date: string | null;
  }>
): Promise<AcademicSession> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SESSIONS)
    .update(payload)
    .eq("academic_sessions_id", id)
    .select(`
      *,
      degrees:academic_sessions_degree_id (
        degree_fullname,
        degree_duration
      )
    `)
    .single();

  if (error) throw new Error(error.message);

  return {
    ...data,
    academic_sessions_degree_name:
      data.degrees?.degree_fullname ?? "",
    academic_sessions_degree_duration:
      data.degrees?.degree_duration ?? "",
  };
}

/* ================================
   DELETE
================================ */
export async function DeleteAcademicSession(
  id: string
): Promise<void> {
  const { error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SESSIONS)
    .delete()
    .eq("academic_sessions_id", id);

  if (error) throw new Error(error.message);
}
