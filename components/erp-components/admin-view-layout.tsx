"use client";

import { useState } from "react";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";

/* MANAGEMENT */
import { AllDepartmentsList } from "@/components/erp-components/management/department-ops";
import { AllDegreesList } from "@/components/erp-components/management/degree-ops";
import { AllSemestersList } from "@/components/erp-components/management/semester-ops";
import { AllSubjectsList } from "@/components/erp-components/management/subjects-ops";

/* ACADEMICS */
import { AllAcademicSessionsList } from "@/components/erp-components/academics/sessions-ops";
import { AllAcademicSemestersList } from "@/components/erp-components/academics/semesters-ops";
import { AllAcademicSubjectsList } from "@/components/erp-components/academics/subjects-ops";

type AdminView =
  | "departments"
  | "degrees"
  | "semesters"
  | "subjects"
  | "academic_sessions"
  | "academic_semesters"
  | "academic_subjects";

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] =
    useState<AdminView>("departments");

  function renderContent() {
    switch (activeView) {
      /* MANAGEMENT */
      case "departments":
        return <AllDepartmentsList />;
      case "degrees":
        return <AllDegreesList />;
      case "semesters":
        return <AllSemestersList />;
      case "subjects":
        return <AllSubjectsList />;

      /* ACADEMICS */
      case "academic_sessions":
        return <AllAcademicSessionsList />;
      case "academic_semesters":
        return <AllAcademicSemestersList />;
      case "academic_subjects":
        return <AllAcademicSubjectsList />;

      default:
        return null;
    }
  }

  const buttonClass = (view: AdminView) =>
    `px-3 py-2 rounded-lg text-left transition ${
      activeView === view
        ? "bg-black text-white dark:bg-white dark:text-black"
        : "hover:bg-gray-200 dark:hover:bg-gray-800"
    }`;

  return (
    <div className="w-full flex">
      {/* Sidebar */}
      <div
        className={`
          ml-5
          ${collapsed ? "w-20" : "w-64"}
          bg-gray-100 dark:bg-gray-900
          rounded-2xl
          shadow-sm
          transition-all duration-300
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <span className="font-semibold">
              Admin Menu
            </span>
          )}
          <button onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? (
              <span className="flex">
                <Menu size={18} />
                <ChevronRight size={18} />
              </span>
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        <nav className="flex flex-col p-2 gap-1 text-sm">

          {/* MANAGEMENT GROUP */}
          {!collapsed && (
            <span className="text-xs uppercase opacity-60 px-3 pt-2">
              Management
            </span>
          )}

          <button onClick={() => setActiveView("departments")} className={buttonClass("departments")}>
            {collapsed ? "Dept" : "Departments"}
          </button>

          <button onClick={() => setActiveView("degrees")} className={buttonClass("degrees")}>
            {collapsed ? "Deg" : "Degrees"}
          </button>

          <button onClick={() => setActiveView("semesters")} className={buttonClass("semesters")}>
            {collapsed ? "Sem" : "Semesters"}
          </button>

          <button onClick={() => setActiveView("subjects")} className={buttonClass("subjects")}>
            {collapsed ? "Sub" : "Subjects"}
          </button>

          {/* ACADEMICS GROUP */}
          {!collapsed && (
            <span className="text-xs uppercase opacity-60 px-3 pt-4">
              Academics
            </span>
          )}

          <button onClick={() => setActiveView("academic_sessions")} className={buttonClass("academic_sessions")}>
            {collapsed ? "Sess" : "Academic Sessions"}
          </button>

          <button onClick={() => setActiveView("academic_semesters")} className={buttonClass("academic_semesters")}>
            {collapsed ? "Sem" : "Academic Semesters"}
          </button>

          <button onClick={() => setActiveView("academic_subjects")} className={buttonClass("academic_subjects")}>
            {collapsed ? "Sub" : "Academic Subjects"}
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 px-8">
        {renderContent()}
      </div>
    </div>
  );
}