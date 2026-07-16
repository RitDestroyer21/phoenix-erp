"use client";

import { FileEdit, CalendarDays, Award, AlertCircle } from "lucide-react";

interface FacultyPostAssignmentProps {
  subjectId: string;
}

export function FacultyPostAssignment({ subjectId }: FacultyPostAssignmentProps) {
  return (
    <div className="p-8 h-full flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600 border border-purple-100">
            <FileEdit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Task & Assessment Publisher</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Subject Context Ref: <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700 font-semibold">{subjectId}</code>
            </p>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Input Details Placeholder Structure */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <FileEdit size={12} /> Title Heading
              </label>
              <input 
                type="text" 
                placeholder="e.g. Lab Assignment 2" 
                disabled 
                className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-sm cursor-not-allowed text-slate-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <CalendarDays size={12} /> Cutoff Due Date
              </label>
              <input 
                type="date" 
                disabled 
                className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-sm cursor-not-allowed text-slate-400 font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Award size={12} /> Max Grade Points
              </label>
              <input 
                type="number" 
                placeholder="100" 
                disabled 
                className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-sm cursor-not-allowed text-slate-400"
              />
            </div>
          </div>

          <div className="p-4 bg-purple-50/20 border border-purple-100/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-purple-950">Publishing Target</p>
              <p className="text-xs text-purple-700/80 mt-0.5 leading-relaxed">
                Confirming and launching an assessment publishes notification triggers down onto student portals enrolled inside this specific reference class block.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
        <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-lg cursor-not-allowed">
          Discard Draft
        </button>
        <button disabled className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg opacity-40 cursor-not-allowed">
          Launch Assignment
        </button>
      </div>
    </div>
  );
}