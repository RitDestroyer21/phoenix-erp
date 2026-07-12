"use client";

import { useEffect, useMemo, useState } from "react";
import { GetAllStudents } from "@/lib/db/resourcelist/students";
import { StudentRecord } from "@/lib/interfaces"
import { StudentProfileModal } from "./student-profile";
import { 
  User, 
  Mail, 
  ChevronDown, 
  ChevronRight, 
  GraduationCap, 
  Search,
  MoreVertical 
} from "lucide-react";

export function AllStudentsList() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedSessions, setCollapsedSessions] = useState<Record<string, boolean>>({});
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null); // New State
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await GetAllStudents();
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Grouping students by Session (similar to Subject hierarchy)
  const groupedData = useMemo(() => {
    const filtered = students.filter(s => 
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groups: Record<string, { label: string; degree: string; list: StudentRecord[] }> = {};
    
    filtered.forEach(s => {
      const key = s.student_session_id;
      if (!groups[key]) {
        groups[key] = { 
          label: s.session_label || "Unknown Session", 
          degree: s.degree_name || "N/A", 
          list: [] 
        };
      }
      groups[key].list.push(s);
    });
    return groups;
  }, [students, searchTerm]);

  if (loading) return <div className="p-10 animate-pulse text-sm">Loading Student Directory...</div>;

  return (
    <div className="p-6 max-w-7xl space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="text-red-600"/> Student Directory
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={16}/>
          <input 
            className="pl-10 pr-4 py-2 border rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 focus:ring-2 ring-red-500 outline-none transition-all"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Render Modal if a student is selected */}
      {selectedStudent && (
        <StudentProfileModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}

      {Object.entries(groupedData).map(([sessionId, group]) => (
        <div key={sessionId} className="border rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950 mb-6">
          {/* Session Banner */}
          <div 
            className="flex justify-between items-center px-6 py-4 bg-zinc-900 text-white cursor-pointer"
            onClick={() => setCollapsedSessions(prev => ({...prev, [sessionId]: !prev[sessionId]}))}
          >
            <div className="flex items-center gap-4">
              {collapsedSessions[sessionId] ? <ChevronRight /> : <ChevronDown />}
              <div>
                <h3 className="font-bold text-lg leading-none">{group.degree}</h3>
                <p className="text-xs opacity-60 mt-1">Batch: {group.label}</p>
              </div>
            </div>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">{group.list.length} Students</span>
          </div>

          {!collapsedSessions[sessionId] && (
            <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.list.map((student) => (
                <div key={student.student_id} className="group relative border rounded-xl p-4 hover:border-red-500/50 transition-all bg-zinc-50/50 dark:bg-zinc-900/40">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{student.first_name} {student.last_name}</p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={16}/>
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <button onClick={() => setSelectedStudent(student)} // Triggers Profile Card
                      className="text-xs font-bold text-red-600 hover:underline">
                        View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}