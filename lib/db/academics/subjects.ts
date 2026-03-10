"use client";

import { createClient } from "@/lib/supabase/client";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface AcademicSubject {
  academic_session_semester_subjects_id: string;
  academic_session_semesters_id: string;
  academic_session_id: string;
  academic_degree_id: string;
  academic_degree_wise_semester_id: string;
  academic_semester_wise_subject_id: string | null;
  academic_session_semesters_number: number | null;
  academic_session_semester_subjects_code: string;
  academic_session_semester_subjects_name: string;
  academic_session_semester_subjects_category: string;
  academic_session_semester_subjects_type: string;
  academic_session_semester_subjects_faculty_map: string | null;
  academic_session_semester_subjects_created_at: string;
  // Relation fields
  degree_name?: string;
  session_label?: string;
}

const supabase = createClient();

function flattenSubject(row: any): AcademicSubject {
  const startYear = row.sessions?.academic_sessions_start_date ? new Date(row.sessions.academic_sessions_start_date).getFullYear() : "";
  const endYear = row.sessions?.academic_sessions_end_date ? new Date(row.sessions.academic_sessions_end_date).getFullYear() : "";
  
  return {
    ...row,
    degree_name: row.degrees?.degree_fullname ?? "",
    session_label: startYear && endYear ? `${startYear} - ${endYear}` : "N/A"
  };
}



/* ================================
   CREATE 
================================ */
export async function CreateAcademicSubject(payload: Partial<AcademicSubject>): Promise<AcademicSubject> {
  const { degrees, sessions, degree_name, session_label, ...dbPayload } = payload as any;

  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SUBJECTS)
    .insert([dbPayload])
    .select(`
      *, 
      degrees:academic_degree_id (degree_fullname), 
      sessions:academic_session_id (academic_sessions_start_date, academic_sessions_end_date)
    `)
    .single();

  if (error) throw new Error(error.message);
  return flattenSubject(data);
}

/* ================================
   READ 
================================ */
export async function GetAllAcademicSubjects(): Promise<AcademicSubject[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SUBJECTS)
    .select(`
      *,
      degrees:academic_degree_id (degree_fullname),sessions:academic_session_id (academic_sessions_start_date, academic_sessions_end_date)
    `)
    .order("academic_session_semester_subjects_code", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(flattenSubject);
}

/* ================================
   UPDATE
================================ */
export async function UpdateAcademicSubject(
  id: string, 
  payload: Partial<AcademicSubject>
): Promise<AcademicSubject> {
  const { 
    degrees, 
    sessions,
    degree_name, 
    session_label, 
    academic_session_semester_subjects_id,
    academic_session_semester_subjects_created_at,
    ...dbPayload 
  } = payload as any; 

  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SUBJECTS)
    .update(dbPayload) // Now dbPayload only contains real columns
    .eq("academic_session_semester_subjects_id", id)
    .select(`
      *, 
      degrees:academic_degree_id (degree_fullname), 
      sessions:academic_session_id (academic_sessions_start_date, academic_sessions_end_date)
    `)
    .single();

  if (error) {
    console.error("Update Academic Subject Error:", error);
    throw new Error(error.message);
  }
  
  return flattenSubject(data);
}

/* ================================
   DELETE
================================ */
export async function DeleteAcademicSubject(id: string): Promise<void> {
  const { error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SUBJECTS)
    .delete()
    .eq("academic_session_semester_subjects_id", id);

  if (error) throw new Error(error.message);
}



