"use client";

import { createClient } from "@/lib/supabase/client";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface FacultySubjectMap {
  faculty_subject_map_id: string;
  session_id: string;
  semester_id: string;
  subject_id: string;
  session_section: string;
  faculty_id: string;
  created_at: string;
  
  // Appended view field for UI readability
  faculty_name?: string;
}

export interface FacultyFields {
  faculty_id: string;
  faculty_fullname: string;
}

// Explicit types for the Supabase complex join responses to make TS happy
interface RawAssignmentResponse {
  faculty_subject_map_id: string;
  session_id: string;
  semester_id: string;
  subject_id: string;
  session_section: string;
  faculty_id: string;
  created_at: string;
  faculty: {
    user_basic_details: {
      user_basic_details_fname: string;
      user_basic_details_mname: string | null;
      user_basic_details_lname: string;
    };
  } | null;
}

interface RawFacultyResponse {
  faculty_id: string;
  user_basic_details: {
    user_basic_details_fname: string;
    user_basic_details_mname: string | null;
    user_basic_details_lname: string;
  };
}

const supabase = createClient();

// Helper to format full names consistently
function formatFullName(fname: string, mname: string | null, lname: string): string {
  return [fname, mname, lname].filter(Boolean).join(" ");
}

/* ================================
   GET ALL FOR SPECIFIC SUBJECT
================================ */
export async function GetFacultyAssignmentsForSubject(subjectId: string): Promise<FacultySubjectMap[]> {
  // Using explicit generic typing in .select to bypass PostgREST auto-inference bugs
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SUBJECT_MAP)
    .select<string, RawAssignmentResponse>(`
      faculty_subject_map_id,
      session_id,
      semester_id,
      subject_id,
      session_section,
      faculty_id,
      created_at,
      faculty (
        user_basic_details (
          user_basic_details_fname,
          user_basic_details_mname,
          user_basic_details_lname
        )
      )
    `)
    .eq("subject_id", subjectId);

  if (error) throw new Error(error.message);

  return (
    data?.map((item) => {
      const details = item.faculty?.user_basic_details;
      return {
        faculty_subject_map_id: item.faculty_subject_map_id,
        session_id: item.session_id,
        semester_id: item.semester_id,
        subject_id: item.subject_id,
        session_section: item.session_section,
        faculty_id: item.faculty_id,
        created_at: item.created_at,
        faculty_name: details 
          ? formatFullName(details.user_basic_details_fname, details.user_basic_details_mname, details.user_basic_details_lname)
          : "Unknown Faculty",
      };
    }) ?? []
  );
}

/* ================================
   GET LIST OF AVAILABLE FACULTY
================================ */
export async function GetAllFacultyList(): Promise<FacultyFields[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DIRECTORY.FACULTY)
    .select<string, RawFacultyResponse>(`
      faculty_id,
      user_basic_details (
        user_basic_details_fname,
        user_basic_details_mname,
        user_basic_details_lname
      )
    `);

  if (error) throw new Error(error.message);

  const formattedFaculty = data?.map((item) => {
    const details = item.user_basic_details;
    return {
      faculty_id: item.faculty_id,
      faculty_fullname: details 
        ? formatFullName(details.user_basic_details_fname, details.user_basic_details_mname, details.user_basic_details_lname)
        : "Unknown Faculty",
    };
  }) ?? [];

  // Sort alphabetically by name client-side
  return formattedFaculty.sort((a, b) => a.faculty_fullname.localeCompare(b.faculty_fullname));
}

/* ================================
   CREATE ASSIGNMENT
================================ */
export async function CreateFacultyAssignment(payload: {
  session_id: string;
  semester_id: string;
  subject_id: string;
  session_section: string;
  faculty_id: string;
}): Promise<FacultySubjectMap> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SUBJECT_MAP)
    .insert([payload])
    .select<string, RawAssignmentResponse>(`
      faculty_subject_map_id,
      session_id,
      semester_id,
      subject_id,
      session_section,
      faculty_id,
      created_at,
      faculty (
        user_basic_details (
          user_basic_details_fname,
          user_basic_details_mname,
          user_basic_details_lname
        )
      )
    `)
    .single();

  if (error) throw new Error(error.message);

  const details = data.faculty?.user_basic_details;
  return {
    faculty_subject_map_id: data.faculty_subject_map_id,
    session_id: data.session_id,
    semester_id: data.semester_id,
    subject_id: data.subject_id,
    session_section: data.session_section,
    faculty_id: data.faculty_id,
    created_at: data.created_at,
    faculty_name: details 
      ? formatFullName(details.user_basic_details_fname, details.user_basic_details_mname, details.user_basic_details_lname)
      : "Unknown Faculty",
  };
}

/* ================================
   UPDATE ASSIGNMENT
================================ */
export async function UpdateFacultyAssignment(
  id: string,
  payload: Partial<Omit<FacultySubjectMap, "faculty_subject_map_id" | "created_at" | "faculty_name">>
): Promise<FacultySubjectMap> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SUBJECT_MAP)
    .update(payload)
    .eq("faculty_subject_map_id", id)
    .select<string, RawAssignmentResponse>(`
      faculty_subject_map_id,
      session_id,
      semester_id,
      subject_id,
      session_section,
      faculty_id,
      created_at,
      faculty (
        user_basic_details (
          user_basic_details_fname,
          user_basic_details_mname,
          user_basic_details_lname
        )
      )
    `)
    .single();

  if (error) throw new Error(error.message);

  const details = data.faculty?.user_basic_details;
  return {
    faculty_subject_map_id: data.faculty_subject_map_id,
    session_id: data.session_id,
    semester_id: data.semester_id,
    subject_id: data.subject_id,
    session_section: data.session_section,
    faculty_id: data.faculty_id,
    created_at: data.created_at,
    faculty_name: details 
      ? formatFullName(details.user_basic_details_fname, details.user_basic_details_mname, details.user_basic_details_lname)
      : "Unknown Faculty",
  };
}

/* ================================
   DELETE ASSIGNMENT
================================ */
export async function DeleteFacultyAssignment(id: string): Promise<void> {
  const { error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.SUBJECT_MAP)
    .delete()
    .eq("faculty_subject_map_id", id);

  if (error) throw new Error(error.message);
}