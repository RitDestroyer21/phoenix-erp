'use client';

import React, { useState } from 'react';
import { ChevronLeft, Menu, LayoutDashboard, Building2, ShieldAlert } from 'lucide-react';
import HodDashboardView from './dashboard-roles/hod';


import { AllAcademicSessionsList } from "@/components/erp-components/academics/sessions-ops";
import { AllAcademicSemestersList } from "@/components/erp-components/academics/semesters-ops";
import { AllAcademicSubjectsList } from "@/components/erp-components/academics/subjects-ops";

import { AllStudentsList } from "@/components/erp-components/resources/student/viewing/student";
import { AllFacultyList } from "@/components/erp-components/resources/faculty/viewing/faculty";

// Registry matches exact operational routes mapped inside your project UI elements
const COMPONENT_REGISTRY: Record<string, { label: string; group: string; component: React.ReactNode }> = {
  
  '/academics/sessions': { label: 'Academic Sessions', group: 'Academics', component: <AllAcademicSessionsList /> },
  '/academics/semesters': { label: 'Academic Semesters', group: 'Academics', component: <AllAcademicSemestersList /> },
  '/academics/subjects': { label: 'Academic Subjects', group: 'Academics', component: <AllAcademicSubjectsList /> },
  

  
  '/resourcelist/faculty': { label: 'Faculty List', group: 'Resources', component: <AllFacultyList /> },
  '/resourcelist/students': { label: 'Student List', group: 'Resources', component: <AllStudentsList /> },
};

interface DashboardWrapperProps {
  userRole: 'HOD' | 'ADMIN' | 'FACULTY' | 'STUDENT';
}

export default function DashboardWrapper({ userRole }: DashboardWrapperProps) {
  const [activeRoute, setActiveRoute] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (userRole !== 'HOD') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-white border border-slate-200 rounded-2xl max-w-md mx-auto my-12 shadow-sm text-center">
        <div className="p-3 bg-red-50 text-red-600 rounded-xl mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-900 mb-1">Access Authorization Mismatch</h2>
        <p className="text-sm text-slate-500">
          This system console workspace requires explicit HOD configuration scopes.
        </p>
      </div>
    );
  }

  const handleTileSelect = (route: string) => {
    if (COMPONENT_REGISTRY[route]) {
      setActiveRoute(route);
    }
  };

  const currentSelection = activeRoute ? COMPONENT_REGISTRY[activeRoute] : null;

  // Group items by their structural parent tag for rendering within the sidebar wrapper list layout
  const groupedNavigation = Object.entries(COMPONENT_REGISTRY).reduce((acc, [route, data]) => {
    if (!acc[data.group]) acc[data.group] = [];
    acc[data.group].push({ route, label: data.label });
    return acc;
  }, {} as Record<string, { route: string; label: string }[]>);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      
      {/* Dynamic Working Panel Workspace Context Bar Header */}
      {activeRoute && (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center space-x-3 text-sm">
            <button
              onClick={() => setActiveRoute(null)}
              className="flex items-center space-x-1 font-semibold text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg"
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
            aria-label="Toggle Side Workspace Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>
      )}

      {/* Main Grid View Switcher Dynamic Framework Row */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        
        {activeRoute && currentSelection ? (
          <div className="flex-1 flex flex-col md:flex-row w-full min-h-0">
            
            {/* Sidebar Navigation - Triggered on view collapse expansion bounds */}
            <aside className={`${isSidebarOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-4 shrink-0 overflow-y-auto`}>
              <div className="space-y-4">
                <button
                  onClick={() => setActiveRoute(null)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors border border-slate-100 shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4 text-blue-500" />
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
                              ? 'bg-blue-50 text-blue-600 shadow-sm font-semibold' 
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

            {/* Injected Content Window Scope */}
            <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto min-w-0">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm min-h-[400px]">
                {currentSelection.component}
              </div>
            </main>
          </div>
        ) : (
          /* Native Full Matrix Grid Block */
          <main className="flex-1 w-full py-4 overflow-y-auto">
            <HodDashboardView onNavigate={handleTileSelect} />
          </main>
        )}
      </div>
    </div>
  );
}