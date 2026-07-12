export const DatabaseTableNames = {
  SCHEMA: 'erp',
  TABLES: {
    MANAGEMENT:{
      DEPARTMENTS: 'departments',
      DEGREE:'degree',
      SEMESTERS:'degreewisesemestermapping',
      SUBJECTS:'semesterwisesubjectmapping',
    },
    ACADEMICS:{
      SESSIONS:'academic_sessions',
      SEMESTERS:'academic_session_semesters',
      SUBJECTS:'academic_session_semester_subjects',
    },
    DIRECTORY:{
      STUDENT:'students',
      FACULTY:'faculty',
    },
    USERS:{
      BASIC_DETAILS:'user_basic_details',
      CONTACT_DETAILS:'user_contact_details',
    }
  },
} as const;
