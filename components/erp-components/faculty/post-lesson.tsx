"use client";

import { BookOpen, MapPin, AlignLeft, Sparkles } from "lucide-react";

interface FacultyPostLessonProps {
  subjectId: string;
}

export function FacultyPostLesson({ subjectId }: FacultyPostLessonProps) {
  return (
    <div className="p-8 h-full flex flex-col justify-between">
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Syllabus & Lesson Tracker</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Subject Context Ref: <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700 font-semibold">{subjectId}</code>
            </p>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Form Inputs Placeholders mockup */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <MapPin size={12} /> Unit / Section Covered
              </label>
              <input 
                type="text" 
                placeholder="e.g. Unit 3 - B-Trees Variations" 
                disabled 
                className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-sm cursor-not-allowed text-slate-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Sparkles size={12} /> Methodology Tag
              </label>
              <input 
                type="text" 
                placeholder="e.g. Lecture & Live Coding Sandbox" 
                disabled 
                className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-sm cursor-not-allowed text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <AlignLeft size={12} /> Topics Summary & Reference Logs
            </label>
            <textarea 
              rows={3} 
              placeholder="Record points, textbook pages, whiteboards assets, or external repos shared..." 
              disabled 
              className="w-full bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-sm cursor-not-allowed text-slate-400 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
        <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 font-semibold text-xs rounded-lg cursor-not-allowed">
          Discard Draft
        </button>
        <button disabled className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg opacity-40 cursor-not-allowed">
          Publish Lesson Log
        </button>
      </div>
    </div>
  );
}