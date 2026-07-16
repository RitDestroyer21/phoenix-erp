'use client';

import { useEffect, useState } from "react";
import { GetAllManagement, ManagementRecord } from "@/lib/db/resourcelist/management";
import { ManagementProfileModal } from "./management-profile";
import { User, Briefcase, Search, MoreVertical } from "lucide-react";

export function AllManagementList() {
  const [managementList, setManagementList] = useState<ManagementRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<ManagementRecord | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await GetAllManagement();
      setManagementList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredManagement = managementList.filter(m => 
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-10 animate-pulse text-sm">Loading Management Directory...</div>;

  return (
    <div className="p-6 max-w-7xl space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Briefcase className="text-blue-600"/> Management Roster
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={16}/>
          <input 
            className="pl-10 pr-4 py-2 border rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 focus:ring-2 ring-blue-500 outline-none transition-all"
            placeholder="Search roster..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {selectedMember && (
        <ManagementProfileModal 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
        />
      )}

      <div className="border rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-zinc-950 p-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredManagement.map((member) => (
            <div key={member.management_id} className="group relative border rounded-xl p-4 hover:border-blue-500/50 transition-all bg-zinc-50/50 dark:bg-zinc-900/40">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">
                      {member.first_name} {member.middle_name ? `${member.middle_name} ` : ""}{member.last_name}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">Management Staff</p>
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={16}/>
                </button>
              </div>
              
              <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                <button onClick={() => setSelectedMember(member)} 
                  className="text-xs font-bold text-blue-600 hover:underline">
                    View Full Profile
                </button>
              </div>
            </div>
          ))}
          {filteredManagement.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm text-zinc-400">No management profiles found matching the search context.</div>
          )}
        </div>
      </div>
    </div>
  );
}