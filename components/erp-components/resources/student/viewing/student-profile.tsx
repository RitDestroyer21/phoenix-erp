"use client";

import { StudentRecord } from "@/lib/interfaces"
import { 
  X, Mail, Phone, Calendar, User, 
  MapPin, BookOpen, Briefcase, Hash 
} from "lucide-react";

interface Props {
  student: StudentRecord;
  onClose: () => void;
}

export function StudentProfileModal({ student, onClose }: Props) {
  // Get contact info from the raw nested structure
  //console.log(student);
  console.log(student);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
        
        {/* Header / Banner */}
        <div className="relative h-32 bg-zinc-900">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X size={20} />
          </button>
          
          {/* Avatar overlap */}
          <div className="absolute -bottom-12 left-8 p-1 bg-white dark:bg-zinc-950 rounded-full">
            <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center text-white shadow-lg">
              <User size={48} />
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="pt-16 px-8 pb-8 space-y-8">
          
          {/* Primary Info */}
          <div>
            <h2 className="text-2xl font-black tracking-tight uppercase italic">
              {student.first_name+` `+student.last_name}
            </h2>
            <p className="text-red-600 font-bold text-sm tracking-widest uppercase">
              {student.academic_sessions.degree.degree_initial+` `+student.academic_sessions.degree.degree_fullname}
            </p>
            <div className="flex items-center gap-2 mt-1 opacity-50 text-xs font-mono">
              Section : {student.student_section}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Left Column: Personal & Academic */}
            <div className="space-y-6">
              <section>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Academic Status</h4>
                <div className="space-y-3">
                  <InfoRow icon={<Calendar size={14}/>} label="Batch" value={student.session_label??``} />
                  <InfoRow icon={<BookOpen size={14}/>} label="Level" value={student.academic_sessions.degree.degree_level || "N/A"} />
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Personal Details</h4>
                <div className="space-y-3">
                  <InfoRow icon={<Calendar size={14}/>} label="DOB" value={student.user_basic_details.user_basic_details_dob || "N/A"} />
                  <InfoRow icon={<User size={14}/>} label="Gender" value={student.user_basic_details.user_basic_details_gender.toLowerCase() || "N/A"} />
                </div>
              </section>
            </div>

            {/* Right Column: Contact */}
            <div className="space-y-6">
              <section className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-4">Contact Information</h4>
                <div className="space-y-4">
                  <ContactItem 
                    icon={<Mail className="text-red-600" size={16}/>} 
                    label="Self Email" 
                    value={student.user_basic_details?.user_contact_details?.contact_mail1 || "N/A"} 
                  />
                  <ContactItem 
                    icon={<Phone className="text-red-600" size={16}/>} 
                    label="Self Mobile" 
                    value={student.user_basic_details?.user_contact_details?.contact_phone1?.toString() || "N/A"} 
                  />
                  {student.user_basic_details.user_contact_details?.contact_phone2 && (
                    <ContactItem icon={<Phone size={16}/>} label="Parent Phone" value={student.user_basic_details?.user_contact_details?.contact_phone2.toString()||``} />
                  )}
                  {student.user_basic_details.user_contact_details?.contact_mail2 && (
                    <ContactItem icon={<Mail size={16}/>} label="Parent Email" value={student.user_basic_details?.user_contact_details?.contact_mail2||``} />
                  )}
                </div>
              </section>
            </div>

          </div>
        </div>

        {/* Footer */}
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

// Small helper components
function InfoRow({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="opacity-40">{icon}</span>
      <span className="font-medium text-zinc-500">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function ContactItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">{icon}</div>
      <div>
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-tight">{label}</p>
        <p className="text-sm font-bold break-all">{value}</p>
      </div>
    </div>
  );
}