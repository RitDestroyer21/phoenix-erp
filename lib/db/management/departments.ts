"use client";

import { createClient } from "@/lib/supabase/client";
import { removeRoleFromUserAdmin,assignRoleToUserAdmin } from "@/lib/db/access-control";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface Department {
  dept_id: string;
  dept_name: string;
  dept_created_at: string;
  degree_count?: number;
  batch_count?: number;
  student_count?: number;
}

export interface HodHistoryRecord {
  fhh_id: number;
  fhh_dept_id: string;
  fhh_faculty_id: string;
  fhh_effective_start_date: string;
  fhh_effective_end_date: string | null;
  faculty: {
    user_basic_details: {
      user_basic_details_fname: string;
      user_basic_details_lname: string;
    } | null;
  } | null;
}

export interface SimpleFacultyItem {
  faculty_id: string;
  first_name: string;
  last_name: string;
}

const supabase = createClient();

/* ================================
   GET ALL DEPARTMENTS
================================ */
export async function GetAllDeptDetails(): Promise<Department[]> {
  // Querying department lines along with relational counts from degrees, batches, and students
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.MANAGEMENT.DEPARTMENTS)
    .select(`
      dept_id,
      dept_name,
      dept_created_at,
      degree (
        degree_id,
        academic_sessions (
          academic_sessions_id,
          students (
            student_id
          )
        )
      )
    `)
    .order("dept_created_at", { ascending: true });

  if (error) {
    console.error("Fetch Departments Error:", error);
    throw new Error(error.message);
  }

  // Map out count schemas matching sub-queries cleanly back to interface attributes
  return (data ?? []).map((dept: any) => {
  const degreesArray = dept.degree ?? [];
  
  // Extract all sessions across all degrees in this department
  const allSessions = degreesArray.flatMap((deg: any) => deg.academic_sessions ?? []);
  
  // Extract all students across all those sessions
  const allStudents = allSessions.flatMap((sess: any) => sess.students ?? []);

  return {
      dept_id: dept.dept_id,
      dept_name: dept.dept_name,
      dept_created_at: dept.dept_created_at,
      degree_count: degreesArray.length,
      batch_count: allSessions.length,
      student_count: allStudents.length
    };
  });
}

/* ================================
   CREATE DEPARTMENT
================================ */
export async function CreateDepartment(
  dept_name: string
): Promise<Department> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.MANAGEMENT.DEPARTMENTS)
    .insert([{ dept_name }])
    .select()
    .single();

  if (error) {
    console.error("Create Department Error:", error);
    throw new Error(error.message);
  }

  return {
    ...data,
    degree_count: 0,
    batch_count: 0,
    student_count: 0
  } as Department;
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
    .from(DatabaseTableNames.TABLES.MANAGEMENT.DEPARTMENTS)
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
    .from(DatabaseTableNames.TABLES.MANAGEMENT.DEPARTMENTS)
    .delete()
    .eq("dept_id", dept_id);

  if (error) {
    console.error("Delete Department Error:", error);
    throw new Error(error.message);
  }
}

/* ================================
   FACULTY BY DEPARTMENT (HOD DROPDOWN)
================================ */
export async function GetFacultyByDepartment(deptId: string): Promise<SimpleFacultyItem[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DIRECTORY.FACULTY)
    .select(`
      faculty_id,
      user_basic_details:faculty_basic_details_id (
        user_basic_details_fname,
        user_basic_details_lname
      )
    `)
    .eq('faculty_dept_id', deptId);

  if (error) {
    console.error("GetFacultyByDepartment Error:", error);
    throw error;
  }

  return (data || []).map((f: any) => ({
    faculty_id: f.faculty_id,
    first_name: f.user_basic_details?.user_basic_details_fname || "Unknown",
    last_name: f.user_basic_details?.user_basic_details_lname || "Faculty"
  }));
}

/* ================================
   HOD HISTORICAL TIMELINE CHRONOLOGY
================================ */
export async function GetDepartmentHodHistory(deptId: string): Promise<HodHistoryRecord[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from('faculty_hod_history')
    .select(`
      fhh_id,
      fhh_dept_id,
      fhh_faculty_id,
      fhh_effective_start_date,
      fhh_effective_end_date,
      faculty:fhh_faculty_id (
        user_basic_details:faculty_basic_details_id (
          user_basic_details_fname,
          user_basic_details_lname
        )
      )
    `)
    .eq('fhh_dept_id', deptId)
    .order('fhh_effective_start_date', { ascending: true });

  if (error) {
    console.error("GetDepartmentHodHistory Error:", error);
    throw error;
  }
  
  return data as unknown as HodHistoryRecord[];
}

/* ================================
   APPOINT NEW HOD TRANSACTION
================================ */
export async function AssignNewHodOLD(deptId: string, facultyId: string, startDate: string): Promise<void> {
  // 1. Terminate current ongoing tenure if an active row exists (where end_date is null)
  const { error: updateError } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from('faculty_hod_history')
    .update({ fhh_effective_end_date: startDate })
    .eq('fhh_dept_id', deptId)
    .is('fhh_effective_end_date', null);

  if (updateError) {
    console.error("AssignNewHod (Update) Error:", updateError);
    throw updateError;
  }

  // 2. Insert the fresh current active tracking row
  const { error: insertError } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from('faculty_hod_history')
    .insert({
      fhh_dept_id: deptId,
      fhh_faculty_id: facultyId,
      fhh_effective_start_date: startDate,
      fhh_effective_end_date: null
    });

  if (insertError) {
    console.error("AssignNewHod (Insert) Error:", insertError);
    throw insertError;
  }
}

export async function AssignNewHod(
  deptId: string, 
  facultyId: string, 
  startDate: string
): Promise<void> {
  try {
    // 1. Identify if there is an active HOD and get their faculty_user_id directly
    const { data: currentActiveHod, error: fetchError } = await supabase
      .schema(DatabaseTableNames.SCHEMA)
      .from('faculty_hod_history')
      .select(`
        fhh_faculty_id,
        faculty:fhh_faculty_id (
          faculty_user_id
        )
      `)
      .eq('fhh_dept_id', deptId)
      .is('fhh_effective_end_date', null)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Failed verifying active HOD status: ${fetchError.message}`);
    }

    // 2. Fetch the incoming HOD's user_id directly from the faculty table
    const { data: incomingFaculty, error: incomingError } = await supabase
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.DIRECTORY.FACULTY)
      .select('faculty_user_id')
      .eq('faculty_id', facultyId)
      .single();

    if (incomingError || !incomingFaculty) {
      throw new Error(`Could not locate user identity for incoming faculty ID: ${facultyId}`);
    }

    const incomingUserId = incomingFaculty.faculty_user_id;

    // 3. Terminate current ongoing tenure timeline in database history
    const { error: updateError } = await supabase
      .schema(DatabaseTableNames.SCHEMA)
      .from('faculty_hod_history')
      .update({ fhh_effective_end_date: startDate })
      .eq('fhh_dept_id', deptId)
      .is('fhh_effective_end_date', null);

    if (updateError) {
      throw new Error(`Failed terminating previous HOD timeline: ${updateError.message}`);
    }

    // 4. Revoke HOD role from previous active faculty (if they exist and are different)
    if (currentActiveHod && currentActiveHod.fhh_faculty_id !== facultyId) {
      const outgoingFaculty = currentActiveHod.faculty as any;
      const outgoingUserId = outgoingFaculty?.faculty_user_id;

      if (outgoingUserId) {
        try {
          await removeRoleFromUserAdmin(outgoingUserId, 'HOD');
        } catch (roleError) {
          // Log warning, but keep the database transaction moving forward
          console.warn(`Notice: Could not strip HOD role from outgoing user ID ${outgoingUserId}:`, roleError);
        }
      }
    }

    // 5. Insert the fresh current active tracking row
    const { error: insertError } = await supabase
      .schema(DatabaseTableNames.SCHEMA)
      .from('faculty_hod_history')
      .insert({
        fhh_dept_id: deptId,
        fhh_faculty_id: facultyId,
        fhh_effective_start_date: startDate,
        fhh_effective_end_date: null
      });

    if (insertError) {
      throw new Error(`Failed to initialize new HOD record: ${insertError.message}`);
    }

    // 6. Assign the HOD role code to the new active faculty member
    await assignRoleToUserAdmin(incomingUserId, 'HOD');

  } catch (error: any) {
    console.error("AssignNewHod Transaction Failed:", error);
    throw new Error(error.message || "Internal transaction failure executing HOD assignment.");
  }
}