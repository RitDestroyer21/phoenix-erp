'use server';

import { createClient } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DatabaseTableNames } from "@/config/Databasenames";
import { StudentRecord } from "@/lib/interfaces";

// Browser client specifically utilized for read operations (GetAllStudents)
const supabase = createClient();

export interface StudentOnboardPayload {
  firstName: string;
  middleName: string | null;
  lastName: string;
  dob: string;
  gender: string;
  phone1: number;
  phone2: number | null;
  mail1: string;
  mail2: string | null;
  degreeId: string;
  sessionId: string;
  student_section: string;
}

export interface SectionAllocationInfo {
  sectionName: string;
  currentStudentCount: number;
}

/* ==========================================================================
   GET LIVE SECTION ALLOCATIONS BY SESSION
   ========================================================================== */
export async function GetActiveSectionCapacitiesBySession(
  sessionId: string
): Promise<SectionAllocationInfo[]> {
  if (!sessionId) {
    throw new Error('Missing parameter: A valid sessionId must be provided.');
  }

  // Pulling only the student_section field for performance scaling
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DIRECTORY.STUDENT)
    .select('student_section')
    .eq('student_session_id', sessionId);

  if (error) {
    throw new Error(`Failed to query active section roster metrics: ${error.message}`);
  }

  // Aggregate student counts by section string values in memory
  const countsMap: Record<string, number> = {};
  
  (data ?? []).forEach((row: any) => {
    const sec = row.student_section || 'A';
    countsMap[sec] = (countsMap[sec] || 0) + 1;
  });

  // Map into UI-ready payload contracts sorted alphabetically ('A', 'B', etc.)
  const activeAllocations: SectionAllocationInfo[] = Object.keys(countsMap)
    .sort()
    .map((sectionName) => ({
      sectionName,
      currentStudentCount: countsMap[sectionName],
    }));

  // Fallback Provision: If a fresh batch has 0 records, seed default choices so the frontend dropdown remains interactive
  if (activeAllocations.length === 0) {
    return [
      { sectionName: 'A', currentStudentCount: 0 },
      { sectionName: 'B', currentStudentCount: 0 },
    ];
  }

  return activeAllocations;
}

/* ==========================================================================
   GET ALL STUDENTS (Client Context Safe)
   ========================================================================== */
export async function GetAllStudents(): Promise<StudentRecord[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DIRECTORY.STUDENT)
    .select(`
      *,
      user_basic_details:student_basic_details_id (
        * ,
        user_contact_details:user_basic_contact_details_id(*)
      ),
      academic_sessions:student_session_id (
        *,
        degree:academic_sessions_degree_id(*)
      )
    `)
    .order("student_created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => {
    const start = row.academic_sessions?.academic_sessions_start_date
      ? new Date(row.academic_sessions.academic_sessions_start_date).getFullYear()
      : "Unknown";
    const end = row.academic_sessions?.academic_sessions_end_date 
      ? new Date(row.academic_sessions.academic_sessions_end_date).getFullYear() 
      : "Present";

    return {
      ...row,
      first_name: row.user_basic_details?.user_basic_details_fname,
      last_name: row.user_basic_details?.user_basic_details_lname,
      degree_name: row.academic_sessions?.degree?.degree_fullname,
      session_label: `${start} - ${end}`,
    };
  });
}

/* ==========================================================================
   ONBOARD SINGLE STUDENT (Server Action Context - Bypasses Admin Logouts)
   ========================================================================== */
export async function onboardSingleStudent(payload: StudentOnboardPayload) {
  // 1. Validation Check: Verify if Self Mail already exists in user_contact_details
  const { data: existingContact, error: checkError } = await supabaseAdmin
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.USERS.CONTACT_DETAILS)
    .select('contact_id')
    .eq('contact_mail1', payload.mail1)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Database verification failed: ${checkError.message}`);
  }

  if (existingContact) {
    throw new Error('Student already exists.');
  }

  // 2. Parse Date of Birth into "ddmmyyyy@Me" for the temporary auth password
  const dateParts = payload.dob.split('-');
  if (dateParts.length !== 3) {
    throw new Error('Invalid date of birth format supplied.');
  }
  
  const [year, month, day] = dateParts;
  const tempPassword = `${day}${month}${year}@Me`;
  
  // Create user session cleanly on the backend via admin privileges
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: payload.mail1,
    password: tempPassword,
    email_confirm: true, // Prevents validation lockouts
    user_metadata: {
      first_name: payload.firstName,
      last_name: payload.lastName,
    },
  });

  if (authError) throw authError;
  if (!authUser.user) throw new Error('Failed to instantiate authentication profile.');

  const generatedUserId = authUser.user.id;

  try {
    // 3. Sequential Relational Inserts
    // Step 3a: Populate basic identity properties
    const { data: basicDetails, error: basicError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.USERS.BASIC_DETAILS)
      .insert({
        user_id: generatedUserId,
        user_basic_details_fname: payload.firstName,
        user_basic_details_mname: payload.middleName,
        user_basic_details_lname: payload.lastName,
        user_basic_details_dob: payload.dob,
        user_basic_details_gender: payload.gender,
      })
      .select('user_basic_details_id')
      .single();

    if (basicError) throw basicError;

    // Step 3b: Populate communication channels
    const { data: contactDetails, error: contactError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.USERS.CONTACT_DETAILS)
      .insert({
        contact_phone1: payload.phone1,
        contact_phone2: payload.phone2,
        contact_mail1: payload.mail1,
        contact_mail2: payload.mail2,
      })
      .select('contact_id')
      .single();

    if (contactError) throw contactError;

    // Step 3c: Link Contact Details ID back to Basic Details
    const { error: basicUpdateError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.USERS.BASIC_DETAILS)
      .update({
        user_basic_contact_details_id: contactDetails.contact_id,
      })
      .eq('user_basic_details_id', basicDetails.user_basic_details_id);

    if (basicUpdateError) throw basicUpdateError;

    // Step 3d: Assign and create the functional Student Role pointer mapping
    const { data: studentRecord, error: studentError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.DIRECTORY.STUDENT)
      .insert({
        student_user_id: generatedUserId,
        student_basic_details_id: basicDetails.user_basic_details_id,
        student_session_id: payload.sessionId,
        student_section: payload.student_section
      })
      .select('student_id')
      .single();

    if (studentError) throw studentError;

    return studentRecord;

  } catch (dbTransactionError) {
    // Structural rollback fallback: Purge orphaned Auth reference if DB sequence crashes
    await supabaseAdmin.auth.admin.deleteUser(generatedUserId);
    throw dbTransactionError;
  }
}