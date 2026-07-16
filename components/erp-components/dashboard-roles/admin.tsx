'use client';

import React from 'react';
import { 
  Building2, 
  Layers, 
  BookOpen, 
  CalendarDays, 
  UserPlus, 
  ShieldAlert, 
  Users, 
  GraduationCap, 
  Briefcase,
  FolderTree,
  FileCheck,
  CalendarRange, // Icon for Workdays
  CalendarHeart  // Icon for Holidays
} from 'lucide-react';

// Define the navigation interface types matching your framework blueprint
interface NavigationItem {
  id: string;
  label: string;
}

interface NavigationGroup {
  groupName: string;
  items: NavigationItem[];
}

interface DashboardTileProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

// Icon mapper targeting dynamic assignments across the NAVIGATION_SCHEMA matrix
const ICON_REGISTRY: Record<string, React.ComponentType<{ className?: string }>> = {
  // Management Group
  departments: FolderTree,
  degrees: FileCheck,
  semesters: Layers,
  subjects: BookOpen,
  
  // Academics Group
  academic_sessions: CalendarDays,
  academic_semesters: Layers,
  academic_subjects: BookOpen,
  
  // Operations Group
  manage_workdays: CalendarRange,
  manage_holidays: CalendarHeart,
  
  // Onboardings Group
  management_onboard: UserPlus,
  faculty_onboard: UserPlus,
  student_onboard: UserPlus,
  
  // Resources Group
  management_list: Briefcase,
  faculty_list: Users,
  student_list: GraduationCap,
};

// Target descriptions mapping metadata context to each schema entry
const DESCRIPTION_REGISTRY: Record<string, string> = {
  departments: "Configure structural operational divisions, organizational units, and center profiles.",
  degrees: "Manage active academic degree offerings, structural certifications, and program frameworks.",
  semesters: "Map global master calendar durations, default terms, and functional pathways.",
  subjects: "Control global course catalogs, master reference syllabi, and structural codes.",
  
  academic_sessions: "Manage active batches, core registration ranges, and institutional enrollment frameworks.",
  academic_semesters: "Track functional ongoing terms, calendar alignments, and live structural schedules.",
  academic_subjects: "Configure active curriculum allocations, program syllabi, and localized courses.",
  
  manage_workdays: "Configure administrative working structures, shifts, tracking calendars, and system uptime schedules.",
  manage_holidays: "Track and organize academic session holidays, calendar breaks, and institutional off-days.",

  management_onboard: "Register core system executives, administrators, and governance team profiles.",
  faculty_onboard: "Initialize educational staff rows, dynamic instructor assignments, and core files.",
  student_onboard: "Process batch candidate listings, initialize academic files, and assign initial identifiers.",
  
  management_list: "Access corporate executive directory, administrative load logs, and access permissions.",
  faculty_list: "Review operational teaching rosters, functional load records, and tracking indicators.",
  student_list: "Browse master enrollment registries, cross-referenced rosters, and class metrics."
};

// Route mapper evaluating navigation identifiers against exact COMPONENT_REGISTRY endpoints
const ROUTE_MAPPER: Record<string, string> = {
  departments: "/management/departments",
  degrees: "/management/degrees",
  semesters: "/management/semesters",
  subjects: "/management/subjects",
  academic_sessions: "/academics/sessions",
  academic_semesters: "/academics/semesters",
  academic_subjects: "/academics/subjects",
  manage_workdays: "/operations/workdays",
  manage_holidays: "/operations/holidays",
  management_onboard: "/onboarding/management",
  faculty_onboard: "/onboarding/faculty",
  student_onboard: "/onboarding/student",
  management_list: "/resourcelist/management",
  faculty_list: "/resourcelist/faculty",
  student_list: "/resourcelist/students"
};

const DashboardTile: React.FC<DashboardTileProps> = ({ title, description, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-red-600 transition-all duration-200 text-left w-full focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
  >
    {/* Clean Red Accent Theme Styling */}
    <div className="p-3 bg-slate-50 group-hover:bg-red-50 rounded-lg text-slate-600 group-hover:text-red-600 transition-colors duration-200 mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-semibold text-slate-900 group-hover:text-red-600 transition-colors duration-200 mb-1">
      {title}
    </h3>
    <p className="text-sm text-slate-500">
      {description}
    </p>
  </button>
);

interface AdminDashboardViewProps {
  onNavigate: (route: string) => void;
}

export default function AdminDashboardView({ onNavigate }: AdminDashboardViewProps) {
  
  // Complete schema access specification configured from administrative overview perspective
  const NAVIGATION_SCHEMA: NavigationGroup[] = [
    {
      groupName: "Management",
      items: [
        { id: "departments", label: "Departments" },
        { id: "degrees", label: "Degrees" },
        { id: "semesters", label: "Semesters" },
        { id: "subjects", label: "Subjects" },
      ],
    },
    {
      groupName: "Academics",
      items: [
        { id: "academic_sessions", label: "Academic Sessions" },
        { id: "academic_semesters", label: "Academic Semesters" },
        { id: "academic_subjects", label: "Academic Subjects" },
      ],
    },
    {
      groupName: "Operations",
      items: [
        { id: "manage_workdays", label: "Manage Workdays" },
        { id: "manage_holidays", label: "Manage Holidays" },
      ],
    },
    {
      groupName: "Onboardings",
      items: [
        { id: "management_onboard", label: "Management Onboard" },
        { id: "faculty_onboard", label: "Faculty Onboard" },
        { id: "student_onboard", label: "Student Onboard" },
      ],
    },
    {
      groupName: "Resources",
      items: [
        { id: "management_list", label: "Management List" },
        { id: "faculty_list", label: "Faculty List" },
        { id: "student_list", label: "Student List" },
      ],
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-10">
      
      {/* Central Admin Header Board - Modified with deep crimson / slate red gradient */}
      <div className="flex items-center space-x-4 bg-gradient-to-r from-red-950 via-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-sm">
        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
          <Building2 className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-red-400">System Admin Control Center</span>
          <h1 className="text-2xl font-bold tracking-tight">Enterprise Infrastructure Workspace</h1>
        </div>
      </div>

      {/* Map through the complete structure defined by the Navigation Schema */}
      {NAVIGATION_SCHEMA.map((group) => (
        <div key={group.groupName} className="space-y-4">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
              {group.groupName}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {group.items.map((item) => {
              const IconComponent = ICON_REGISTRY[item.id] || ShieldAlert;
              const textDescription = DESCRIPTION_REGISTRY[item.id] || "Access central enterprise workspace functions.";
              const runtimeRoute = ROUTE_MAPPER[item.id] || "/";

              return (
                <DashboardTile
                  key={item.id}
                  title={item.label}
                  description={textDescription}
                  icon={IconComponent}
                  onClick={() => onNavigate(runtimeRoute)}
                />
              );
            })}
          </div>
        </div>
      ))}

    </div>
  );
}