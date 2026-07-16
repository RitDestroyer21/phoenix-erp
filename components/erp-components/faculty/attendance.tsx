"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  ClipboardCheck, 
  Calendar as CalendarIcon, 
  Users, 
  ShieldAlert, 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  RefreshCw, 
  Check, 
  X 
} from "lucide-react";
import { fetchClassStudents, fetchAttendanceLog, upsertAttendance, type StudentRecord, type AttendanceRecord, getFacultyIdFromUserId } from "@/lib/db/dashboard/attendance";
import { Subject } from "@/lib/db/dashboard/fetch-faculty-user"; // Adjust path to where Subject is exported

interface FacultyAttendanceProps {
  subject: Subject;
  facultyUserId: string; // Pass the active faculty user context down
}

export function FacultyAttendance({ subject, facultyUserId }: FacultyAttendanceProps) {
  // 1. Context States
  const sessionId = subject.sessionId;
  const subjectId = subject.id;
  
  // 2. State Engines
  const [resolvedFacultyId, setResolvedFacultyId] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 3, 1)); 
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceRecord>>({}); 
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // 3. Derived Calendar Matrix Calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    const daysArray = [];
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      daysArray.push({ dayNumber: d, dateStr });
    }
    return daysArray;
  }, [year, month]);

  const monthLabel = currentDate.toLocaleString("default", { month: "long", year: "numeric" });

  // 4. Resolve Database faculty_id from auth user_id
  useEffect(() => {
    async function resolveFacultyIdentity() {
      if (!facultyUserId) return;
      try {
        const trueFacultyId = await getFacultyIdFromUserId(facultyUserId);
        if (trueFacultyId) {
          setResolvedFacultyId(trueFacultyId);
        }
      } catch (err) {
        console.error("Error resolving operational faculty database ID mapping:", err);
      }
    }
    resolveFacultyIdentity();
  }, [facultyUserId]);

  // 5. Integrated Data Loading Lifecycle
  useEffect(() => {
    async function loadGridData() {
      setIsLoading(true);
      try {
        const fetchedStudents = await fetchClassStudents(subject);
        setStudents(fetchedStudents);

        if (daysInMonth.length > 0) {
          const startDate = daysInMonth[0].dateStr;
          const endDate = daysInMonth[daysInMonth.length - 1].dateStr;
          const dbRecords = await fetchAttendanceLog(subjectId, startDate, endDate);

          const initialMap: Record<string, AttendanceRecord> = {};
          dbRecords.forEach(rec => {
            initialMap[`${rec.sa_student_id}_${rec.sa_date}`] = rec;
          });
          setAttendanceMap(initialMap);
        }
        setHasChanges(false);
      } catch (err) {
        alert("Failed loading dynamic roster state registers from PostgreSQL engine.");
      } finally {
        setIsLoading(false);
      }
    }

    loadGridData();
  }, [subjectId, currentDate, daysInMonth, subject]);

  // 6. Grid Cell Handlers
  const handleStatusToggle = (studentId: string, dateStr: string) => {
    if (!resolvedFacultyId) {
      alert("Error: Operational relational entity configuration mapping context is unresolved.");
      return;
    }

    const key = `${studentId}_${dateStr}`;
    const existingRecord = attendanceMap[key];
    let updatedRecord: AttendanceRecord;

    if (existingRecord) {
      updatedRecord = { ...existingRecord, sa_status: !existingRecord.sa_status };
    } else {
      updatedRecord = {
        sa_faculty_id: resolvedFacultyId,
        sa_student_id: studentId,
        sa_subject_id: subjectId,
        sa_session_id: sessionId,
        sa_date: dateStr,
        sa_status: true 
      };
    }

    setAttendanceMap(prev => ({ ...prev, [key]: updatedRecord }));
    setHasChanges(true);
  };

  // 7. Bulk Row Modifiers
  const handleBulkAction = (studentId: string, action: "all-present" | "all-absent") => {
    if (!resolvedFacultyId) {
      alert("Error: Operational relational entity configuration mapping context is unresolved.");
      return;
    }

    const updated = { ...attendanceMap };
    daysInMonth.forEach(day => {
      const key = `${studentId}_${day.dateStr}`;
      updated[key] = {
        ...(updated[key] || {
          sa_faculty_id: resolvedFacultyId,
          sa_student_id: studentId,
          sa_subject_id: subjectId,
          sa_session_id: sessionId,
          sa_date: day.dateStr,
        }),
        sa_status: action === "all-present"
      };
    });
    setAttendanceMap(updated);
    setHasChanges(true);
  };

  // 8. Save Actions Pipeline Transaction Commit
  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      let finalFacultyId = resolvedFacultyId;
      if (!finalFacultyId) {
        const freshId = await getFacultyIdFromUserId(facultyUserId);
        if (freshId) {
          finalFacultyId = freshId;
          setResolvedFacultyId(freshId);
        } else {
          throw new Error("Target authenticated user profile is not mapped in the faculty relation layout.");
        }
      }

      const recordsToUpsert = Object.values(attendanceMap).map(rec => ({
        ...rec,
        sa_faculty_id: finalFacultyId
      }));

      await upsertAttendance(recordsToUpsert);
      setHasChanges(false);
      alert("Attendance records successfully committed to erp.students_attendance.");
    } catch (err: any) {
      alert(err.message || "Error processing batch updates to system database tables.");
    } finally {
      setIsSaving(false);
    }
  };

  // 9. Statistics Metrics
  const stats = useMemo(() => {
    let totalCellsChecked = 0;
    let totalPresents = 0;
    
    Object.values(attendanceMap).forEach(rec => {
      if (rec.sa_subject_id === subjectId) {
        totalCellsChecked++;
        if (rec.sa_status) totalPresents++;
      }
    });

    const percent = totalCellsChecked > 0 ? Math.round((totalPresents / totalCellsChecked) * 100) : 100;
    return { percent };
  }, [attendanceMap, subjectId]);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  // Early Render Guard blocking interaction layout frame while the UUID translates
  if (isLoading || !resolvedFacultyId) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center space-y-3 bg-white rounded-2xl border border-slate-200 min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium text-slate-500">Compiling structural matrix data rows...</p>
      </div>
    );
  }

  return (
    <div className="p-6 h-full flex flex-col justify-between space-y-6 bg-white rounded-2xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Attendance Register Console</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Subject Context Ref: <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700 font-semibold">{subjectId}</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200/60 shadow-sm">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold font-mono px-3 text-slate-700 min-w-[120px] text-center">
              {monthLabel}
            </span>
            <button 
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <hr className="border-slate-100" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center gap-3">
            <CalendarIcon className="text-slate-400 w-5 h-5" />
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Active Month Context</p>
              <p className="text-sm font-bold text-slate-700">{monthLabel}</p>
            </div>
          </div>
          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center gap-3">
            <Users className="text-slate-400 w-5 h-5" />
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Monitored Enrollment</p>
              <p className="text-sm font-bold text-slate-700">{students.length} Target Students</p>
            </div>
          </div>
          <div className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 flex items-center gap-3">
            <ShieldAlert className="text-slate-400 w-5 h-5" />
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Aggregate Present Rate</p>
              <p className="text-sm font-bold text-slate-700">{stats.percent}% Monthly Ratio</p>
            </div>
          </div>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-3 text-xs font-bold text-slate-600 uppercase tracking-wider sticky left-0 bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 w-64">
                    Student Details
                  </th>
                  <th className="p-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-center w-28">
                    Quick Set
                  </th>
                  {daysInMonth.map(day => (
                    <th 
                      key={day.dayNumber} 
                      className="p-2 text-[11px] font-mono font-bold text-slate-500 text-center border-l border-slate-100 min-w-[40px]"
                    >
                      {String(day.dayNumber).padStart(2, "0")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.student_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 sticky left-0 bg-white group-hover:bg-slate-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] z-10 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{student.name}</span>
                        <span className="text-xs font-mono text-slate-400">{student.roll_number}</span>
                      </div>
                    </td>

                    <td className="p-2 text-center border-l border-slate-100">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => handleBulkAction(student.student_id, "all-present")}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Check size={14} />
                        </button>
                        <button 
                          onClick={() => handleBulkAction(student.student_id, "all-absent")}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </td>

                    {daysInMonth.map((day) => {
                      const cellKey = `${student.student_id}_${day.dateStr}`;
                      const record = attendanceMap[cellKey];
                      const isPresent = record?.sa_status === true;
                      const isLogged = record !== undefined;

                      return (
                        <td key={day.dayNumber} className="p-1 text-center border-l border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleStatusToggle(student.student_id, day.dateStr)}
                            className={`w-7 h-7 mx-auto rounded-md flex items-center justify-center border text-xs font-semibold transition-all ${
                              !isLogged 
                                ? "border-slate-200 text-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50" 
                                : isPresent
                                  ? "bg-emerald-500 border-emerald-600 text-white shadow-sm"
                                  : "bg-rose-100 border-rose-300 text-rose-700"
                            }`}
                          >
                            {isLogged ? (isPresent ? "P" : "A") : "-"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {students.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-400 font-medium">
              No students enrolled in the assigned subject structure section.
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between border-t border-slate-100">
        <span className="text-xs font-semibold text-slate-400">
          {hasChanges ? "⚠️ Pending unsaved state changes in register grid matrix" : "✓ Roster data matches server state"}
        </span>
        <div className="flex gap-3">
          <button 
            onClick={() => setCurrentDate(new Date(2026, 3, 1))}
            className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold text-xs rounded-lg transition-colors"
          >
            Reset view
          </button>
          <button 
            onClick={handleSaveChanges}
            disabled={!hasChanges || isSaving}
            className={`px-4 py-2 text-white font-semibold text-xs rounded-lg flex items-center gap-2 shadow-sm transition-all ${
              hasChanges && !isSaving 
                ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer" 
                : "bg-slate-300 cursor-not-allowed opacity-70"
            }`}
          >
            {isSaving ? (
              <><RefreshCw size={14} className="animate-spin" /> Saving...
              </>
            ) : (
              <><Save size={14} /> Commit Roll Call
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}