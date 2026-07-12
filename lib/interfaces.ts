// --- Physical Table Interfaces ---
export interface Student {
  student_id: string;
  student_user_id: string;
  student_session_id: string;
  student_basic_details_id: string;
  student_created_at: string;
  student_section: string;
}

export interface UserContact {
  contact_id: string;
  contact_phone1: number;
  contact_phone2: number | null;
  contact_mail1: string;
  contact_mail2: string | null;
  contact_created_at: string;
}

export interface UserBasicDetails {
  user_basic_details_id: string;
  user_basic_contact_details_id: string;
  user_basic_details_fname: string;
  user_basic_details_mname: string | null;
  user_basic_details_lname: string;
  user_basic_details_dob: string;
  user_basic_details_gender: string;
  user_id: string;
  user_basic_details_created_at: string;
}

export interface ContactDetails {
  contact_mail1: string;
  contact_phone1: string | number;
  contact_mail2?: string | null;
  contact_phone2?: string | number | null;
}

export interface BasicDetails {
  user_basic_details_dob?: string | null;
  user_basic_details_gender?: string | null;
  user_contact_details?: ContactDetails | null;
}

export interface FacultyRecord {
  faculty_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  department_id: string;
  department_name: string;
  user_basic_details?: BasicDetails | null;
}


export interface Degree {
  degree_id: string;
  degree_initial: string;
  degree_fullname: string;
  degree_streamname: string;
  degree_level: string;
  degree_semesters: number;
  degree_duration: number;
}

export interface AcademicSession {
  academic_sessions_id: string;
  academic_sessions_degree_id: string;
  academic_sessions_start_date: string;
  academic_sessions_end_date: string | null;
}

// --- Composite & UI Interfaces ---

/**
 * Matches the deep-nested structure returned by your Supabase query.
 * Use this for the initial fetch result.
 */
export interface StudentWithRelations extends Student {
  user_basic_details: UserBasicDetails & {
    user_contact_details: UserContact;
  };
  academic_sessions: AcademicSession & {
    degree: Degree;
  };
}

/**
 * Flattened interface used by your UI components (the "Subject-ops" style).
 * This makes it easy to bind to tables and search bars.
 */
export interface StudentRecord extends StudentWithRelations {
  // Flattened from UserBasicDetails
  full_name: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;

  // Flattened from UserContact
  email_primary: string;
  phone_primary: number;

  // Flattened from AcademicSession + Degree
  degree_name: string;
  degree_initial: string;
  session_label: string;
  
}