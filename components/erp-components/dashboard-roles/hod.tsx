import React from 'react';
import { 
  CalendarDays, 
  Layers, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Building2 
} from 'lucide-react';

interface DashboardTileProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

const DashboardTile: React.FC<DashboardTileProps> = ({ title, description, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 transition-all duration-200 text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    <div className="p-3 bg-slate-50 group-hover:bg-blue-50 rounded-lg text-slate-600 group-hover:text-blue-600 transition-colors duration-200 mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors duration-200 mb-1">
      {title}
    </h3>
    <p className="text-sm text-slate-500">
      {description}
    </p>
  </button>
);

interface HodDashboardViewProps {
  onNavigate: (route: string) => void;
}

export default function HodDashboardView({ onNavigate }: HodDashboardViewProps) {
  // Mock department data - this can eventually come from context or metadata props
  const departmentInfo = {
    name: "Computer Science",
    code: "CSE"
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-10">
      
      {/* Department Header Board */}
      <div className="flex items-center space-x-4 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl text-white shadow-sm">
        <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
          <Building2 className="w-8 h-8 text-blue-400" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">HOD Control Center</span>
          <h1 className="text-2xl font-bold tracking-tight">{departmentInfo.name}</h1>
        </div>
      </div>

      {/* SECTION 1: ACADEMICS */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Academics</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <DashboardTile 
            title="Academic Sessions" 
            description="Manage batches, core session ranges, and target administrative periods."
            icon={CalendarDays}
            onClick={() => onNavigate('/academics/sessions')}
          />
          <DashboardTile 
            title="Academic Semesters" 
            description="Structure continuous terms, functional timelines, and structural tracks."
            icon={Layers}
            onClick={() => onNavigate('/academics/semesters')}
          />
          <DashboardTile 
            title="Academic Subjects" 
            description="Configure department curriculum, syllabi repositories, and core catalog mappings."
            icon={BookOpen}
            onClick={() => onNavigate('/academics/subjects')}
          />
        </div>
      </div>

      {/* SECTION 2: RESOURCES */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-2">
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">Resources</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl">
          <DashboardTile 
            title="Faculty List" 
            description="Access faculty profiles, department instructor loads, and operational assignments."
            icon={Users}
            onClick={() => onNavigate('/resourcelist/faculty')}
          />
          <DashboardTile 
            title="Student List" 
            description="Access live student registries, directory rosters, and section allocation configurations."
            icon={GraduationCap}
            onClick={() => onNavigate('/resourcelist/students')}
          />
        </div>
      </div>

    </div>
  );
}