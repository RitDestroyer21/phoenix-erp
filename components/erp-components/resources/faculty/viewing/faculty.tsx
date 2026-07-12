"use client";

import { useEffect, useMemo, useState } from "react";
import { GetAllFaculty } from "@/lib/db/resourcelist/faculty"; // Ensure your DB helper path matches
import { FacultyRecord } from "@/lib/interfaces"; // Add this interface to your core typings
import { FacultyProfileModal } from "./faculty-profile";
import { 
  User, 
  ChevronDown, 
  ChevronRight, 
  Briefcase, 
  Search,
  MoreVertical 
} from "lucide-react";

export function AllFacultyList() {
  const [faculty, setFaculty] = useState<FacultyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [collapsedDepartments, setCollapsedDepartments] = useState<Record<string, boolean>>({});
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await GetAllFaculty();
      setFaculty(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Grouping faculty members by Department code or ID
  const groupedData = useMemo(() => {
    const filtered = faculty.filter(f => 
      `${f.first_name} ${f.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groups: Record<string, { label: string; list: FacultyRecord[] }> = {};
    
    filtered.forEach(f => {
      const key = f.department_id || "unknown_dept";
      if (!groups[key]) {
        groups[key] = { 
          label: f.department_name || "General / Unassigned Faculty",
          list: [] 
        };
      }
      groups[key].list.push(f);
    });
    return groups;
  }, [faculty, searchTerm]);

  if (loading) return <div className="p-10 animate-pulse text-sm">Loading Faculty Directory...</div>;

  return (
    <div className="p-6 max-w-7xl space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="text-red-600"/> Faculty Directory
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={16}/>
          <input 
            className="pl-10 pr-4 py-2 border rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 focus:ring-2 ring-red-500 outline-none transition-all"
            placeholder="Search faculty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Profile Modal */}
      {selectedFaculty && (
        <FacultyProfileModal 
          faculty={selectedFaculty} 
          onClose={() => setSelectedFaculty(null)} 
        />
      )}

      {Object.entries(groupedData).map(([deptId, group]) => (
        <div key={deptId} className="border rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950 mb-6">
          {/* Department Banner */}
          <div 
            className="flex justify-between items-center px-6 py-4 bg-zinc-900 text-white cursor-pointer"
            onClick={() => setCollapsedDepartments(prev => ({...prev, [deptId]: !prev[deptId]}))}
          >
            <div className="flex items-center gap-4">
              {collapsedDepartments[deptId] ? <ChevronRight /> : <ChevronDown />}
              <div>
                <h3 className="font-bold text-lg leading-none">{group.label}</h3>
              </div>
            </div>
            <span className="text-xs bg-white/10 px-3 py-1 rounded-full">{group.list.length} Members</span>
          </div>

          {!collapsedDepartments[deptId] && (
            <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.list.map((member) => (
                <div key={member.faculty_id} className="group relative border rounded-xl p-4 hover:border-red-500/50 transition-all bg-zinc-50/50 dark:bg-zinc-900/40">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">
                          {member.first_name} {member.middle_name ? `${member.middle_name} ` : ""}{member.last_name}
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">{"Faculty Member"}</p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={16}/>
                    </button>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <button onClick={() => setSelectedFaculty(member)} 
                      className="text-xs font-bold text-red-600 hover:underline">
                        View Full Profile
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