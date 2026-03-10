export const DatabaseTableNames = {
  SCHEMA: 'erp',
  TABLES: {
    MANAGEMENT:{
      DEPARTMENTS: 'departments',
      DEGREE:'degree',
      SEMESTERS:'degreewisesemestermapping',
      SUBJECTS:'semesterwisesubjectmapping',
    }
  },
} as const;
