'use client';

import React, { useState } from 'react';
import { ChevronLeft, Menu, LayoutDashboard, ShieldAlert, Loader2, UserCheck } from 'lucide-react';
import { useUserRoles } from '@/lib/db/use-user-roles';

// Import role views
import AdminDashboardView from './dashboard-roles/admin';
import ManagementDashboardView from './dashboard-roles/management';
import HodDashboardView from './dashboard-roles/hod';
import FacultyDashboardView from './dashboard-roles/faculty';
import StudentDashboardView from './dashboard-roles/student';
 
// Operations & Registries
import { AllDepartmentsList } from "@/components/erp-components/management/department-ops";
import { AllDegreesList } from "@/components/erp-components/management/degree-ops";
import { AllSemestersList } from "@/components/erp-components/management/semester-ops";
import { AllSubjectsList } from "@/components/erp-components/management/subjects-ops";

import { StudentOnboardingWrapper } from "@/components/erp-components/resources/student/onboarding/wrapper";
import { FacultyOnboardingWrapper } from "@/components/erp-components/resources/faculty/onboarding/wrapper";
import { ManagementOnboardingWrapper } from "@/components/erp-components/resources/management/onboarding/wrapper";

import { AllAcademicSessionsList } from "@/components/erp-components/academics/sessions-ops";
import { AllAcademicSemestersList } from "@/components/erp-components/academics/semesters-ops";
import { AllAcademicSubjectsList } from "@/components/erp-components/academics/subjects-ops";

import { AllStudentsList } from "@/components/erp-components/resources/student/viewing/student";
import { AllFacultyList } from "@/components/erp-components/resources/faculty/viewing/faculty";
import { AllManagementList } from "@/components/erp-components/resources/management/viewing/management";

import { ManageHolidays } from "@/components/erp-components/operations/manage-holidays";
import { ManageWorkdays } from "@/components/erp-components/operations/manage-workdays";

const COMPONENT_REGISTRY: Record<string, { label: string; group: string; component: React.ReactNode }> = {
  '/academics/sessions': { label: 'Academic Sessions', group: 'Academics', component: <AllAcademicSessionsList /> },
  '/academics/semesters': { label: 'Academic Semesters', group: 'Academics', component: <AllAcademicSemestersList /> },
  '/academics/subjects': { label: 'Academic Subjects', group: 'Academics', component: <AllAcademicSubjectsList /> },
  
  '/resourcelist/faculty': { label: 'Faculty List', group: 'Resources', component: <AllFacultyList /> },
  '/resourcelist/students': { label: 'Student List', group: 'Resources', component: <AllStudentsList /> },
  '/resourcelist/management': { label: 'Management List', group: 'Resources', component: <AllManagementList /> },
  
  '/management/departments': { label: 'Departments', group: 'Management', component: <AllDepartmentsList /> },
  '/management/degrees': { label: 'Degrees', group: 'Management', component: <AllDegreesList /> },
  '/management/semesters': { label: 'Semesters', group: 'Management', component: <AllSemestersList /> },
  '/management/subjects': { label: 'Subjects', group: 'Management', component: <AllSubjectsList /> },

  '/operations/workdays': { label: 'Manage Workdays', group: 'Operations', component: <ManageWorkdays /> },
  '/operations/holidays': { label: 'Manage Holidays', group: 'Operations', component: <ManageHolidays /> },

  '/onboarding/management': { label: 'Management Onboard', group: 'Onboardings', component: <ManagementOnboardingWrapper /> },
  '/onboarding/faculty': { label: 'Faculty Onboard', group: 'Onboardings', component: <FacultyOnboardingWrapper /> },
  '/onboarding/student': { label: 'Student Onboard', group: 'Onboardings', component: <StudentOnboardingWrapper /> },
};

export default function DashboardWrapper() {
  const { userRoles, activeRole, setActiveRole, userId, isLoading } = useUserRoles(); // Extracted userId
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="text-sm font-medium text-slate-500">Resolving secure dashboard session...</span>
        </div>
      </div>
    );
  }

  // Safety fall-through if no authorized active roles or userId are loaded properly
  if (!activeRole || !userId) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col justify-center">
        <div className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto shadow-sm text-center">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">Access Authorization Mismatch</h2>
          <p className="text-sm text-slate-500">This workspace console requires an authorized role configuration.</p>
        </div>
      </div>
    );
  }

  const handleTileSelect = (route: string) => {
    if (COMPONENT_REGISTRY[route]) {
      setActiveRoute(route);
    }
  };

  // Switch layouts based on roles
  // if (activeRole === 'ADM') {
  //   return (
  //     <div className="min-h-screen bg-slate-50/50 flex flex-col">
  //       {renderRoleSwitcherUtility()}
  //       <AdminDashboardView onNavigate={handleTileSelect} />
  //     </div>
  //   );
  // }

  if (activeRole === 'STU') {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col">
        {renderRoleSwitcherUtility()}
        <StudentDashboardView userId={userId} />
      </div>
    );
  }

  if (activeRole === 'FAC' || activeRole === 'INS') {
    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col">
        {renderRoleSwitcherUtility()}
        {/* Passed userId dynamically to the faculty panel prop configuration */}
        <FacultyDashboardView userId={userId} />
      </div>
    );
  }

  // Shared UI Layout: HOD and MGM Workspace
  if (activeRole === 'MGM' || activeRole === 'HOD' || activeRole === 'ADM') {
    const currentSelection = activeRoute ? COMPONENT_REGISTRY[activeRoute] : null;

    const groupedNavigation = Object.entries(COMPONENT_REGISTRY).reduce((acc, [route, data]) => {
      if (!acc[data.group]) acc[data.group] = [];
      acc[data.group].push({ route, label: data.label });
      return acc;
    }, {} as Record<string, { route: string; label: string }[]>);

    const isMGM = ( activeRole === 'MGM' || activeRole === 'ADM');
    const textAccentClass = isMGM ? 'hover:text-red-600 text-red-600' : 'hover:text-blue-600 text-blue-600';
    const bgAccentClass = isMGM ? 'hover:bg-red-50 bg-red-50' : 'hover:bg-blue-50 bg-blue-50';
    const iconAccentClass = isMGM ? 'text-red-500' : 'text-blue-500';

    return (
      <div className="min-h-screen bg-slate-50/50 flex flex-col">
        {renderRoleSwitcherUtility()}

        {activeRoute && (
          <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center space-x-3 text-sm">
              <button
                onClick={() => setActiveRoute(null)}
                className={`flex items-center space-x-1 font-semibold text-slate-500 transition-colors bg-slate-100 px-2.5 py-1.5 rounded-lg ${textAccentClass} ${isMGM ? 'hover:bg-red-50' : 'hover:bg-blue-50'}`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Dashboard Overview</span>
              </button>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-slate-400">{currentSelection?.group}</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-900 tracking-tight">{currentSelection?.label}</span>
            </div>

            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </header>
        )}

        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {activeRoute && currentSelection ? (
            <div className="flex-1 flex flex-col md:flex-row w-full min-h-0">
              <aside className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 shrink-0 overflow-y-auto`}>
                <div className="space-y-4">
                  <button
                    onClick={() => setActiveRoute(null)}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100 shadow-sm"
                  >
                    <LayoutDashboard className={`w-4 h-4 ${iconAccentClass}`} />
                    <span>Grid Console Hub</span>
                  </button>

                  {Object.entries(groupedNavigation).map(([groupName, items]) => (
                    <div key={groupName} className="space-y-1">
                      <div className="pt-2 pb-1 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {groupName}
                      </div>
                      {items.map((item) => {
                        const isActive = activeRoute === item.route;
                        return (
                          <button
                            key={item.route}
                            onClick={() => setActiveRoute(item.route)}
                            className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                              isActive 
                                ? `${bgAccentClass} ${textAccentClass} shadow-sm font-semibold` 
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </aside>

              <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto min-w-0">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[400px]">
                  {currentSelection.component}
                </div>
              </main>
            </div>
          ) : (
            <main className="flex-1 w-full py-4 overflow-y-auto">
              {isMGM ? (
                <ManagementDashboardView onNavigate={handleTileSelect} />
              ) : (
                <HodDashboardView onNavigate={handleTileSelect} />
              )}
            </main>
          )}
        </div>
      </div>
    );
  }

  // Fall-through boundary handler
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-center">
      <div className="flex flex-col items-center justify-center p-6 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto shadow-sm text-center">
        <div className="p-3 bg-red-50 text-red-600 rounded-xl mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">Access Authorization Mismatch</h2>
        <p className="text-sm text-slate-500">No authorized ERP configuration scope found for code: "{activeRole}"</p>
      </div>
    </div>
  );

  function renderRoleSwitcherUtility() {
    if (userRoles.length <= 1) return null;

    return (
      <div className="bg-slate-900 text-white py-2.5 px-6 flex items-center justify-between border-b border-slate-850 shrink-0">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
          <UserCheck className="w-4 h-4 text-emerald-400" />
          <span>Assigned Roles:</span>
        </div>
        <div className="flex items-center space-x-1.5">
          {userRoles.map((role) => (
            <button
              key={role.role_id}
              onClick={() => {
                setActiveRole(role.role_code);
                setActiveRoute(null);
              }}
              className={`text-xs px-2.5 py-1 rounded font-semibold transition-all duration-150 ${
                activeRole === role.role_code
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {role.role_name}
            </button>
          ))}
        </div>
      </div>
    );
  }
}