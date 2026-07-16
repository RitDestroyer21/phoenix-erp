"use client";

import { useState, useEffect } from "react";
import { 
  ClipboardCheck, 
  BookOpen, 
  FileEdit, 
  ChevronLeft, 
  ChevronRight, 
  BookMarked,
  ArrowLeft,
  Loader2
} from "lucide-react";
import { fetchFacultyUserDashboardData, Subject } from "@/lib/db/dashboard/fetch-faculty-user";

import { FacultyAttendance } from "@/components/erp-components/faculty/attendance";
import { FacultyPostLesson } from "@/components/erp-components/faculty/post-lesson";
import { FacultyPostAssignment } from "@/components/erp-components/faculty/post-assignment";

type ActiveTab = "attendance" | "post-lesson" | "post-assignment" | null;

interface FacultyDashboardProps {
  userId: string;
}

export default function FacultyDashboardView({ userId }: FacultyDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [assignedSubjects, setAssignedSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [profileName, setProfileName] = useState<string>("Loading...");
  const [department, setDepartment] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function syncDashboardData() {
      if (!userId) return;
      setIsLoading(true);

      const result = await fetchFacultyUserDashboardData(userId);
      
      if (result) {
        setProfileName(result.name);
        setDepartment(result.departmentName);
        setAssignedSubjects(result.subjects);
        
        if (result.subjects.length > 0) {
          setSelectedSubjectId(result.subjects[0].id);
        }
      }
      setIsLoading(false);
    }

    syncDashboardData();
  }, [userId]);

  const activeSubject = assignedSubjects.find(sub => sub.id === selectedSubjectId);

  const tiles = [
    {
      id: "attendance" as const,
      title: "Attendance Tracker",
      description: "Log daily lecture presences, manage student rosters, and generate attendance profiles.",
      icon: ClipboardCheck,
      color: "border-emerald-500 hover:border-emerald-600 bg-emerald-50/30 text-emerald-700",
      badge: "Roll Call"
    },
    {
      id: "post-lesson" as const,
      title: "Post Lesson Plan",
      description: "Update lesson logs, document lecture progress, and attach reference files or links.",
      icon: BookOpen,
      color: "border-blue-500 hover:border-blue-600 bg-blue-50/30 text-blue-700",
      badge: "Syllabus Track"
    },
    {
      id: "post-assignment" as const,
      title: "Post Assignment",
      description: "Draft homework schedules, set submission deadlines, and coordinate rubrics.",
      icon: FileEdit,
      color: "border-purple-500 hover:border-purple-600 bg-purple-50/30 text-purple-700",
      badge: "Assessments"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)] w-full bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Loading Console Environment...</p>
        </div>
      </div>
    );
  }

  if (assignedSubjects.length === 0) {
    return (
      <div className="p-6 w-full max-w-xl mx-auto text-center mt-20 space-y-4">
        <h3 className="text-xl font-bold text-slate-800">No Mapped Subjects Identified</h3>
        <p className="text-sm text-slate-500 leading-relaxed">
          Your faculty account profiles details correctly, but no active curriculum assignments exist in our logs for this session.
        </p>
      </div>
    );
  }

  if (!activeTab) {
    return (
      <div className="p-6 w-full max-w-7xl mx-auto space-y-8 animate-fadeIn">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Faculty Operations Console</h2>
          <p className="text-sm text-slate-500 mt-1">
            Welcome back, {profileName}! Workspace Context: <span className="font-semibold text-slate-700">{department}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={() => setActiveTab(tile.id)}
                className={`flex flex-col text-left p-6 border rounded-2xl shadow-sm transition-all duration-200 transform hover:-translate-y-1 hover:shadow-md ${tile.color}`}
              >
                <div className="flex justify-between items-start w-full mb-4">
                  <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/80 border border-current/10">
                    {tile.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{tile.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed flex-grow">
                  {tile.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-50">
      
      {/* COLLAPSIBLE SIDEBAR MENU */}
      <aside 
        className={`bg-white border-r border-slate-200 flex flex-col justify-between transition-all duration-300 relative ${
          isSidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 bg-white border border-slate-200 text-slate-500 rounded-full p-1 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-sm z-10"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="flex-1 flex flex-col pt-5 overflow-y-auto">
          <div className="px-4 mb-5">
            <button
              onClick={() => {
                setActiveTab(null);
                setIsSidebarCollapsed(false);
              }}
              className="flex items-center gap-2.5 w-full text-slate-500 hover:text-slate-800 text-sm font-medium px-3 py-2 rounded-lg hover:bg-slate-100 transition-all"
            >
              <ArrowLeft size={16} />
              {!isSidebarCollapsed && <span>Dashboard Hub</span>}
            </button>
          </div>

          <div className="border-t border-slate-100 my-2" />

          <nav className="flex-1 px-4 py-3 space-y-1.5">
            {tiles.map((tile) => {
              const Icon = tile.icon;
              const isActive = activeTab === tile.id;
              return (
                <button
                  key={tile.id}
                  onClick={() => setActiveTab(tile.id)}
                  className={`flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                    isActive 
                      ? "bg-slate-900 text-white shadow-sm" 
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isSidebarCollapsed && <span className="ml-3 truncate">{tile.title}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-white text-xs">
              {profileName.substring(0, 1).toUpperCase()}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate">{profileName}</span>
                <span className="text-[10px] text-slate-500 font-semibold truncate">{department} Department</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* WORKSPACE AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 py-4 px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <BookMarked size={18} />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Workspace Context</span>
              <h1 className="text-lg font-bold text-slate-800">
                {activeSubject ? `[${activeSubject.code}] ${activeSubject.name}` : "Select Subject"}
                {activeSubject?.section && <span className="text-xs font-normal text-slate-400 ml-2">({activeSubject.section})</span>}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="subject-selector" className="text-xs font-bold text-slate-500 uppercase whitespace-nowrap">
              Active Course:
            </label>
            <select
              id="subject-selector"
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow"
            >
              {assignedSubjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  [{sub.code}] {sub.name} {sub.section ? `(${sub.section})` : ""}
                </option>
              ))}
            </select>
          </div>
        </header>

        <section className="flex-1 p-6">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm h-full min-h-[400px]">
            {activeTab === "attendance" && activeSubject && (
              <FacultyAttendance subject={activeSubject} facultyUserId={userId}/>
            )}
            {activeTab === "post-lesson" && (
              <FacultyPostLesson subjectId={selectedSubjectId} />
            )}
            {activeTab === "post-assignment" && (
              <FacultyPostAssignment subjectId={selectedSubjectId} />
            )}
          </div>
        </section>
      </main>
    </div>
  );
}