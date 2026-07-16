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
      SEMESTERS_HISTORY:'academic_semesters_history',
      SUBJECT_MAP:'faculty_subject_map',
      ATTENDANCE:'students_attendance',
    },
    DIRECTORY:{
      STUDENT:'students',
      FACULTY:'faculty',
      MANAGEMENT:'management_user',
    },
    USERS:{
      BASIC_DETAILS:'user_basic_details',
      CONTACT_DETAILS:'user_contact_details',
    },
    ROLES:{
      MASTER:'roles_master',
      USERS:'users_authority',
    },
    OPERATIONS:{
      HOLIDAYS:'holiday_list',
      WORKDAYS:'working_weekdays',
    },


  },
} as const;
