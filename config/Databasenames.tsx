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
    }
  },
} as const;
