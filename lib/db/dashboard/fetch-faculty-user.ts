import { createClient } from "@/lib/supabase/client";

export interface Subject { 
  id: string;
  code: string;
  name: string;
  department: string;
  section: string;
  sessionId: string;
  semesterId: string;
}

export interface FacultyProfileData {
  facultyId: string;
  name: string;
  departmentName: string;
  subjects: Subject[];
}

const supabase = createClient();


/**
 * Fetches profile info, department details, and mapped courses dynamically
 * using the authenticated user_id from the database schema.
 */
export async function fetchFacultyUserDashboardData(
  authUserId: string
): Promise<FacultyProfileData | null> {
  try {
    // 1. Fetch from erp.faculty matching faculty_user_id with the provided auth id
    // and join erp.user_basic_details and erp.departments
    const { data: facultyRecord, error: facultyError } = await supabase
      .schema("erp")
      .from("faculty")
      .select(`
        faculty_id,
        user_basic_details:faculty_basic_details_id (
          user_basic_details_fname,
          user_basic_details_lname
        ),
        departments:faculty_dept_id (
          dept_name
        )
      `)
      .eq("faculty_user_id", authUserId)
      .maybeSingle();

    if (facultyError) throw facultyError;
    if (!facultyRecord) return null;

    // Type casting raw relational nested response values
    const basicDetails = facultyRecord.user_basic_details as any;
    const departmentInfo = facultyRecord.departments as any;

    const firstName = basicDetails?.user_basic_details_fname ?? "Faculty";
    const lastName = basicDetails?.user_basic_details_lname ?? "Member";
    const deptName = departmentInfo?.dept_name ?? "General Academic";

    // 2. Query the subject mapping table using the retrieved primary faculty_id
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
        )
      `)
      .eq("faculty_id", facultyRecord.faculty_id);

    if (mappingError) throw mappingError;

    // 3. Map out database columns smoothly to clean properties for your layout
    const subjects: Subject[] = (mappingData || []).map((mapItem: any) => {
      const coreSubject = mapItem.academic_session_semester_subjects;
      return {
        id: mapItem.subject_id,
        code: coreSubject?.academic_session_semester_subjects_code ?? "N/A",
        name: coreSubject?.academic_session_semester_subjects_name ?? "Unknown Course",
        department: deptName,
        section: mapItem.session_section ?? "",
        sessionId: mapItem.session_id,
        semesterId: mapItem.semester_id,
      };
    });

    return {
      facultyId: facultyRecord.faculty_id,
      name: `${firstName} ${lastName}`,
      departmentName: deptName,
      subjects
    };

  } catch (err) {
    console.error("Error executing fetchFacultyUserDashboardData handler:", err);
    return null;
  }
}