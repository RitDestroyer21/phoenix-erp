"use client";

import { useState } from "react";
import { 
  Menu, 
  ChevronLeft, 
  ChevronRight,
  Building2,
  Settings,
  ShieldAlert
} from "lucide-react";

/* MANAGEMENT */
import { AllDepartmentsList } from "@/components/erp-components/management/department-ops";
import { AllDegreesList } from "@/components/erp-components/management/degree-ops";
import { AllSemestersList } from "@/components/erp-components/management/semester-ops";
import { AllSubjectsList } from "@/components/erp-components/management/subjects-ops";

/* ACADEMICS */
import { AllAcademicSessionsList } from "@/components/erp-components/academics/sessions-ops";
import { AllAcademicSemestersList } from "@/components/erp-components/academics/semesters-ops";
import { AllAcademicSubjectsList } from "@/components/erp-components/academics/subjects-ops";

/* RESOURCES LIST */
import { AllStudentsList } from "@/components/erp-components/resources/student/viewing/student";
import { AllFacultyList } from "@/components/erp-components/resources/faculty/viewing/faculty";
import { AllManagementList } from "@/components/erp-components/resources/management/viewing/management";

/* ONBOARDING */
import { StudentOnboardingWrapper } from "@/components/erp-components/resources/student/onboarding/wrapper";
import { FacultyOnboardingWrapper } from "@/components/erp-components/resources/faculty/onboarding/wrapper";
import { ManagementOnboardingWrapper } from "@/components/erp-components/resources/management/onboarding/wrapper";

/* ONBOARDING */
import { ManageWorkdays } from "@/components/erp-components/operations/manage-workdays";
import { ManageHolidays } from "@/components/erp-components/operations/manage-holidays";


export type AdminView =
  | "departments"
  | "degrees"
  | "semesters"
  | "subjects"
  | "academic_sessions"
  | "academic_semesters"
  | "academic_subjects"
  | "student_onboard"
  | "student_list"
  | "management_onboard"
  | "management_list"
  | "faculty_onboard"
  | "faculty_list"
  | "holiday_list"
  | "workday_list";

interface NavigationItem {
  id: AdminView;
  label: string;
  collapsedLabel: string;
}

interface NavigationGroup {
  groupName: string;
  items: NavigationItem[];
}

const NAVIGATION_SCHEMA: NavigationGroup[] = [
  {
    groupName: "Management",
    items: [
      { id: "departments", label: "Departments", collapsedLabel: "Dept" },
      { id: "degrees", label: "Degrees", collapsedLabel: "Deg" },
      { id: "semesters", label: "Semesters", collapsedLabel: "Sem" },
      { id: "subjects", label: "Subjects", collapsedLabel: "Sub" },
    ],
  },
  {
    groupName: "Academics",
    items: [
      { id: "academic_sessions", label: "Academic Sessions", collapsedLabel: "Sess" },
      { id: "academic_semesters", label: "Academic Semesters", collapsedLabel: "Sem" },
      { id: "academic_subjects", label: "Academic Subjects", collapsedLabel: "Sub" },
    ],
  },
  {
    groupName: "Onboardings",
    items: [
      { id: "management_onboard", label: "Management Onboard", collapsedLabel: "Mgm+" },
      { id: "faculty_onboard", label: "Faculty Onboard", collapsedLabel: "Fac+" },
      { id: "student_onboard", label: "Student Onboard", collapsedLabel: "Stu+" },
    ],
  },
  {
    groupName: "Resources",
    items: [
      { id: "management_list", label: "Management List", collapsedLabel: "ManLt" },
      { id: "faculty_list", label: "Faculty List", collapsedLabel: "FacLt" },
      { id: "student_list", label: "Student List", collapsedLabel: "StuLt" },
    ],
  },
  {
    groupName: "Operations",
    items: [
      { id: "holiday_list", label: "Manage Holidays", collapsedLabel: "Hol+" },
      { id: "workday_list", label: "Manage Workdays", collapsedLabel: "Days" },
    ],
  },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>("departments");

  function renderContent() {
    switch (activeView) {
      case "departments": return <AllDepartmentsList />;
      case "degrees": return <AllDegreesList />;
      case "semesters": return <AllSemestersList />;
      case "subjects": return <AllSubjectsList />;
      case "academic_sessions": return <AllAcademicSessionsList />;
      case "academic_semesters": return <AllAcademicSemestersList />;
      case "academic_subjects": return <AllAcademicSubjectsList />;
      case "student_list": return <AllStudentsList />;
      case "faculty_list": return <AllFacultyList />;
      case "management_list": return <AllManagementList />;      
      case "student_onboard": return <StudentOnboardingWrapper />; 
      case "faculty_onboard": return <FacultyOnboardingWrapper />; 
      case "management_onboard": return <ManagementOnboardingWrapper />; 
      case "holiday_list": return < ManageHolidays />;
      case "workday_list": return < ManageWorkdays />;
      default: return null;
    }
  }

  // Resolves the plaintext title for breadcrumbs
  const getActiveLabel = (): string => {
    for (const group of NAVIGATION_SCHEMA) {
      const match = group.items.find(item => item.id === activeView);
      if (match) return match.label;
    }
    return "Overview";
  };

  return (
    <div className="w-full flex min-h-[calc(100vh-4rem)] bg-slate-50/50">
      
      {/* Structural Sidebar Pane */}
      <aside
        className={`
          bg-white border-r border-slate-200 
          transition-all duration-300 ease-in-out
          flex flex-col shrink-0
          ${collapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Sidebar Header Panel */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100">
          {!collapsed && (
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm tracking-wide uppercase">
              <Settings className="w-4 h-4 text-red-600" />
              <span>Admin Center</span>
            </div>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ${collapsed ? 'mx-auto' : ''}`}
            aria-label="Toggle Navigation Sidebar Menu"
          >
            {collapsed ? (
              <div className="flex items-center justify-center">
                <Menu className="w-4 h-4" />
                <ChevronRight className="w-3 h-3 -ml-0.5" />
              </div>
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Scrolling Inner Navigation Map */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {NAVIGATION_SCHEMA.map((group) => (
            <div key={group.groupName} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pt-2 pb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {group.groupName}
                </div>
              )}
              
              {group.items.map((item) => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`
                      w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150
                      ${collapsed ? "text-center justify-center" : ""}
                      ${isActive 
                        ? "bg-red-50 text-red-600 shadow-sm font-semibold" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    {collapsed ? item.collapsedLabel : item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* Primary Feature Render Area Space */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Workspace Dynamic Action Bar Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 md:px-8 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center space-x-2 text-sm">
            <span className="font-medium text-slate-400">System Root</span>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-800 tracking-tight">{getActiveLabel()}</span>
          </div>
        </header>

        {/* Internal Core Subcomponent Content Container Injection */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[300px]">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}