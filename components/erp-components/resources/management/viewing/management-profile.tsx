'use client';

import { ManagementRecord } from "@/lib/db/resourcelist/management";
import { X, Mail, Phone, Calendar, User, Hash, Briefcase } from "lucide-react";

interface Props {
  member: ManagementRecord;
  onClose: () => void;
}

export function ManagementProfileModal({ member, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        
        <div className="relative h-32 bg-zinc-900">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="absolute -bottom-12 left-8 p-1 bg-white dark:bg-zinc-950 rounded-full">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <User size={48} />
            </div>
          </div>
        </div>

        <div className="pt-16 px-8 pb-8 space-y-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase italic">
              {member.first_name} {member.middle_name ? `${member.middle_name} ` : ""}{member.last_name}
            </h2>
            <p className="text-blue-600 font-bold text-sm tracking-widest uppercase">
              Management Executive
            </p>
            <div className="flex items-center gap-2 mt-2 opacity-50 text-xs font-mono">
              <Hash size={12} /> {member.management_id}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Employment Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="opacity-40"><Briefcase size={14}/></span>
                    <span className="font-medium text-zinc-500">System Role Code:</span>
                    <span className="font-bold">MGM</span>
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Personal Details</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="opacity-40"><Calendar size={14}/></span>
                    <span className="font-medium text-zinc-500">DOB:</span>
                    <span className="font-bold">{member.user_basic_details?.user_basic_details_dob || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="opacity-40"><User size={14}/></span>
                    <span className="font-medium text-zinc-500">Gender:</span>
                    <span className="font-bold capitalize">{member.user_basic_details?.user_basic_details_gender?.toLowerCase() || "N/A"}</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">Contact Channels</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-tight">Official Email</p>
                    <p className="text-sm font-bold break-all">{member.user_basic_details?.user_contact_details?.contact_mail1 || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold opacity-40 uppercase tracking-tight">Primary Phone</p>
                    <p className="text-sm font-bold break-all">{member.user_basic_details?.user_contact_details?.contact_phone1?.toString() || "N/A"}</p>
                  </div>
                  
                  {member.user_basic_details?.user_contact_details?.contact_mail2 && (
                    <div>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-tight">Personal Email</p>
                      <p className="text-sm font-bold break-all">{member.user_basic_details.user_contact_details.contact_mail2}</p>
                    </div>
                  )}

                  {member.user_basic_details?.user_contact_details?.contact_phone2 && (
                    <div>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-tight">Alternate Phone</p>
                      <p className="text-sm font-bold break-all">{member.user_basic_details.user_contact_details.contact_phone2.toString()}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-all"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
}