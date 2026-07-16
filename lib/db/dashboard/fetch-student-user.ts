import { createClient } from "@/lib/supabase/client";

export interface StudentSubject { 
  id: string;
  code: string;
  name: string;
  department: string;
  section: string;
  sessionId: string;
  semesterId: string;
  instructorName?: string;
}

export interface StudentProfileData {
  studentId: string;
  name: string;
  departmentName: string;
  section: string;
  sessionId: string;
  subjects: StudentSubject[];
}

const supabase = createClient();

/**
 * Fetches student profile details, cohort metadata, and mapped courses dynamically
 * using the authenticated user_id from the database schema.
 */
export async function fetchStudentUserDashboardData(
  authUserId: string
): Promise<StudentProfileData | null> {
  try {
    // 1. Fetch from erp.students matching student_user_id with the provided auth id
    // Join erp.user_basic_details and trace the department through academic_sessions -> degrees -> departments
    const { data: studentRecord, error: studentError } = await supabase
      .schema("erp")
      .from("students")
      .select(`
        student_id,
        student_section,
        student_session_id,
        user_basic_details:student_basic_details_id (
          user_basic_details_fname,
          user_basic_details_lname
        ),
        academic_sessions:student_session_id (
          academic_sessions_name,
          degrees:degree_id (
            degree_name,
            departments:dept_id (
              dept_name
            )
          )
        )
      `)
      .eq("student_user_id", authUserId)
      .maybeSingle();

    if (studentError) throw studentError;
    if (!studentRecord) return null;

    // Type casting raw relational nested response values
    const basicDetails = studentRecord.user_basic_details as any;
    const sessionDetails = studentRecord.academic_sessions as any;
    const degreeDetails = sessionDetails?.degrees as any;
    const departmentInfo = degreeDetails?.departments as any;

    const firstName = basicDetails?.user_basic_details_fname ?? "Student";
    const lastName = basicDetails?.user_basic_details_lname ?? "Member";
    const deptName = departmentInfo?.dept_name ?? "General Academic";
    const currentSection = studentRecord.student_section ?? "A";

    // 2. Query mapped subjects corresponding to the student's cohort session and assigned section
    const { data: mappingData, error: mappingError } = await supabase
      .schema("erp")
      .from("faculty_subject_map")
      .select(`
        session_id,
        semester_id,
        subject_id,
        session_section,
        academic_session_semester_subjects:subject_id (
          academic_session_semester_subjects_code,
          academic_session_semester_subjects_name
        ),
        faculty:faculty_id (
          user_basic_details:faculty_basic_details_id (
            user_basic_details_fname,
            user_basic_details_lname
          )
        )
      `)
      .eq("session_id", studentRecord.student_session_id)
      .eq("session_section", currentSection);

    if (mappingError) throw mappingError;

    // 3. Map out database columns to clean properties for the student dashboard
    const subjects: StudentSubject[] = (mappingData || []).map((mapItem: any) => {
      const coreSubject = mapItem.academic_session_semester_subjects;
      const instructorDetails = mapItem.faculty?.user_basic_details as any;
      
      const instructorFname = instructorDetails?.user_basic_details_fname ?? "";
      const instructorLname = instructorDetails?.user_basic_details_lname ?? "";
      const instructorFullName = [instructorFname, instructorLname].filter(Boolean).join(" ");

      return {
        id: mapItem.subject_id,
        code: coreSubject?.academic_session_semester_subjects_code ?? "N/A",
        name: coreSubject?.academic_session_semester_subjects_name ?? "Unknown Course",
        department: deptName,
        section: mapItem.session_section ?? currentSection,
        sessionId: mapItem.session_id,
        semesterId: mapItem.semester_id,
        instructorName: instructorFullName !== "" ? instructorFullName : "To Be Assigned"
      };
    });

    return {
      studentId: studentRecord.student_id,
      name: `${firstName} ${lastName}`,
      departmentName: deptName,
      section: currentSection,
      sessionId: studentRecord.student_session_id,
      subjects
    };

  } catch (err) {
    console.error("Error executing fetchStudentUserDashboardData handler:", err);
    return null;
  }
}