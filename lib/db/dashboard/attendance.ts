import { createClient } from "@/lib/supabase/client"; // Replace with your standard client instance path
import { Subject } from "./fetch-faculty-user";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface StudentRecord {
  student_id: string;
  name: string;
  roll_number: string;
}

export interface AttendanceRecord {
  sa_id?: string;
  sa_faculty_id: string;
  sa_student_id: string;
  sa_subject_id: string;
  sa_session_id: string;
  sa_date: string; 
  sa_status: boolean;
}

/**
 * Fetches all students enrolled within a specified academic session.
 * Maps names from user_basic_details and maps user_id as roll number descriptor representation.
 */
export async function fetchClassStudents(subject: Subject): Promise<StudentRecord[]> {
  const supabase = createClient();
  console.log(subject);
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DIRECTORY.STUDENT)
    .select(`
      student_id,
      student_section,
      user_basic_details!inner (
        user_basic_details_fname,
        user_basic_details_mname,
        user_basic_details_lname
      )
    `)
    .eq("student_session_id", subject.sessionId)
    .eq("student_section", subject.section);

  if (error) {
    console.error("Error fetching class students:", error);
    throw new Error(error.message);
  }

  return (data || []).map((row: any) => {
    const details = row.user_basic_details;
    const middle = details?.user_basic_details_mname ? ` ${details.user_basic_details_mname} ` : " ";
    const fullName = `${details?.user_basic_details_fname || ""}${middle}${details?.user_basic_details_lname || ""}`.trim();

    return {
      student_id: row.student_id,
      name: fullName || "Unknown Student",
      roll_number: `SEC-${row.student_section}-${row.student_id.slice(0, 5).toUpperCase()}`
    };
  });
}

/**
 * Retrieves full active attendance ledger matching selected subject tracking parameters inside a date range window.
 */
export async function fetchAttendanceLog(
  subjectId: string, 
  startDate: string, 
  endDate: string
): Promise<AttendanceRecord[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.ATTENDANCE)
    .select("sa_id, sa_faculty_id, sa_student_id, sa_subject_id, sa_session_id, sa_date, sa_status")
    .eq("sa_subject_id", subjectId)
    .gte("sa_date", startDate)
    .lte("sa_date", endDate);

  if (error) {
    console.error("Error fetching attendance records:", error);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * Performs a highly efficient atomic transactional UPSERT execution array sequence over structural grid maps.
 */
export async function upsertAttendance(records: AttendanceRecord[]): Promise<void> {
  if (records.length === 0) return;
  
  const supabase = createClient();

  const payloads = records.map(({ sa_id, ...rest }) => ({
    // If sa_id is missing, blank, or null, generate a fresh v4 UUID
    sa_id: sa_id && sa_id.trim() !== "" ? sa_id : crypto.randomUUID(),
    ...rest
  }));

  const { error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ACADEMICS.ATTENDANCE)
    .upsert(payloads, { onConflict: 'sa_id' }); // Explicitly define the conflict target

  if (error) {
    console.error("Error committing attendance ledger:", error);
    throw new Error(error.message);
  }
}


export async function getFacultyIdFromUserId(userAuthId: string): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DIRECTORY.FACULTY)
    .select("faculty_id")
    .eq("faculty_user_id", userAuthId) // Maps the authentication lookup key column
    .maybeSingle();

  if (error) {
    console.error("Database tracking error resolving faculty layout entity mapping:", error);
    return '';
  }

  return data ? data.faculty_id:'';
}