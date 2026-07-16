"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2, Check, X, CalendarDays } from "lucide-react";

import {
  AcademicSemester,
  GetAllAcademicSemesters,
} from "@/lib/db/academics/semesters";

import {
  UpsertSemesterHistory,
  DeleteSemesterHistoryBySemesterId,
  GetAllSemesterHistories, // Added import
} from "@/lib/db/academics/semesters-history";

interface AcademicSemesterWithHistory extends AcademicSemester {
  ash_effective_start_date?: string | null;
  ash_effective_end_date?: string | null;
}

export function AllAcademicSemestersList() {
  const [semesters, setSemesters] = useState<AcademicSemesterWithHistory[]>([]);
  const [loading, setLoading] = useState(true);

  // Accordion collapse toggles for structural Degree/Session groups
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const [editingId, setEditingId] = useState<string | null>(null);

  // Active inputs parameters specifically managing the history log timeline dates
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      setLoading(true);
      // Fetch semesters and their histories in parallel
      const [semData, historyData] = await Promise.all([
        GetAllAcademicSemesters(),
        GetAllSemesterHistories()
      ]);

      // Map histories to their target semester IDs for immediate O(1) matching
      const historyMap = new Map(historyData.map((h) => [h.ash_semester_id, h]));

      // Merge datasets
      const combinedData: AcademicSemesterWithHistory[] = semData.map((sem) => {
        const matchingHistory = historyMap.get(sem.academic_session_semesters_id);
        return {
          ...sem,
          ash_effective_start_date: matchingHistory ? matchingHistory.ash_effective_start_date : null,
          ash_effective_end_date: matchingHistory ? matchingHistory.ash_effective_end_date : null,
        };
      });

      setSemesters(combinedData);
    } catch (err: any) {
      console.error("Failed to load initial semester and history records:", err.message);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setStartDate("");
    setEndDate("");
  }

  async function handleUpsertHistory(semesterId: string) {
    try {
      const updatedHistory = await UpsertSemesterHistory(
        semesterId,
        startDate || null,
        endDate || null
      );

      // Mutate local state array with newly upserted timeline details
      setSemesters((prev) =>
        prev.map((s) =>
          s.academic_session_semesters_id === semesterId
            ? {
                ...s,
                ash_effective_start_date: updatedHistory.ash_effective_start_date,
                ash_effective_end_date: updatedHistory.ash_effective_end_date,
              }
            : s
        )
      );
      resetForm();
    } catch (err: any) {
      console.error("Failed to commit timeline changes:", err.message);
    }
  }

  async function handleDeleteHistoryOnly(semesterId: string) {
    try {
      // Stripping data cleanly from erp.academic_semesters_history without touching parent semesters rows
      await DeleteSemesterHistoryBySemesterId(semesterId);

      setSemesters((prev) =>
        prev.map((s) =>
          s.academic_session_semesters_id === semesterId
            ? { ...s, ash_effective_start_date: null, ash_effective_end_date: null }
            : s
        )
      );
    } catch (err: any) {
      console.error("Failed to flush timeline log values:", err.message);
    }
  }

  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const formatHistoryDate = (start: string | null | undefined, end: string | null | undefined) => {
    if (!start && !end) return { start: "Upcoming", end: "—" };
    if (start && !end) return { start: new Date(start).toLocaleDateString("en-GB"), end: "Current" };
    return {
      start: start ? new Date(start).toLocaleDateString("en-GB") : "—",
      end: end ? new Date(end).toLocaleDateString("en-GB") : "—"
    };
  };

  if (loading) {
    return <p className="p-6 text-sm opacity-60">Loading Structural Academic Clusters...</p>;
  }

  // Club/Group items using structural Degree names and Session years keys
  const groupedSemesters: Record<string, { degreeName: string; sessionRange: string; items: AcademicSemesterWithHistory[] }> = {};

  semesters.forEach((sem) => {
    const startYear = new Date(sem.academic_session_start).getFullYear();
    const endYear = new Date(sem.academic_session_end).getFullYear();
    const sessionString = !isNaN(startYear) && !isNaN(endYear) ? `${startYear} — ${endYear}` : "Active Session";
    const key = `${sem.degree_name || "Unassigned Program"}||${sessionString}`;

    if (!groupedSemesters[key]) {
      groupedSemesters[key] = {
        degreeName: sem.degree_name || "Unassigned Program",
        sessionRange: sessionString,
        items: [],
      };
    }
    groupedSemesters[key].items.push(sem);
  });

  return (
    <div className="p-6 w-full max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Academic Semesters Roster</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure real-time timeline states, execution durations, and historical records.
        </p>
      </div>

      {/* CLUSTERED WORKING HUB WRAPPER */}
      <div className="space-y-4">
        {Object.entries(groupedSemesters).map(([groupKey, group]) => {
          const isCurrentGroupExpanded = expandedGroups[groupKey] !== false;

          return (
            <div key={groupKey} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
              {/* ACCORDION BLOCK HEADER */}
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/70 border-b border-slate-200 transition-colors text-left font-medium"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 bg-slate-200 rounded-lg text-slate-700">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="font-bold text-slate-900 text-base">{group.degreeName}</span>
                    <span className="text-xs sm:text-sm bg-slate-200/80 px-2.5 py-0.5 rounded-full font-semibold text-slate-600 tracking-wide">
                      {group.sessionRange}
                    </span>
                  </div>
                </div>
                <div>
                  {isCurrentGroupExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                </div>
              </button>

              {/* RENDER DYNAMIC ROW SLOTS WITHIN ACCORDION GRIDS */}
              {isCurrentGroupExpanded && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-50/40 text-slate-400 border-b border-slate-100 font-semibold text-xs uppercase tracking-wider">
                        <th className="p-4 text-left w-1/4">Semester Term</th>
                        <th className="p-4 text-left w-1/3">Effective Start Date</th>
                        <th className="p-4 text-left w-1/3">Effective End Date</th>
                        <th className="p-4 text-right w-32">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {group.items
                        .sort((a, b) => (a.academic_session_semesters_number || 0) - (b.academic_session_semesters_number || 0))
                        .map((s) => {
                          const isEditing = editingId === s.academic_session_semesters_id;
                          const dates = formatHistoryDate(s.ash_effective_start_date, s.ash_effective_end_date);

                          return (
                            <tr key={s.academic_session_semesters_id} className="hover:bg-slate-50/50 transition-colors">
                              {isEditing ? (
                                <>
                                  <td className="p-4 font-semibold text-slate-800">
                                    Semester {s.academic_session_semesters_number}
                                  </td>
                                  <td className="p-4">
                                    <input
                                      type="date"
                                      value={startDate}
                                      onChange={(e) => setStartDate(e.target.value)}
                                      className="border border-slate-200 rounded px-2.5 py-1 text-sm bg-white font-medium focus:outline-slate-400"
                                    />
                                  </td>
                                  <td className="p-4">
                                    <input
                                      type="date"
                                      value={endDate}
                                      onChange={(e) => setEndDate(e.target.value)}
                                      className="border border-slate-200 rounded px-2.5 py-1 text-sm bg-white font-medium focus:outline-slate-400"
                                    />
                                  </td>
                                  <td className="p-4 flex justify-end gap-3 items-center">
                                    <button
                                      onClick={() => handleUpsertHistory(s.academic_session_semesters_id)}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                                      title="Confirm Timeline Update"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button onClick={resetForm} className="p-1 text-slate-400 hover:bg-slate-100 rounded">
                                      <X size={16} />
                                    </button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="p-4 font-semibold text-slate-800">
                                    Semester {s.academic_session_semesters_number}
                                  </td>
                                  <td className="p-4 text-slate-600 font-medium">
                                    <span className={dates.start === "Upcoming" ? "text-amber-600 font-semibold" : ""}>
                                      {dates.start}
                                    </span>
                                  </td>
                                  <td className="p-4 text-slate-600 font-medium">
                                    <span className={dates.end === "Current" ? "inline-block bg-green-50 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200" : ""}>
                                      {dates.end}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex justify-end gap-3 items-center opacity-70 hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={() => {
                                          setEditingId(s.academic_session_semesters_id);
                                          setStartDate(s.ash_effective_start_date || "");
                                          setEndDate(s.ash_effective_end_date || "");
                                        }}
                                        className="p-1 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                        title="Configure Duration Timelines"
                                      >
                                        <Pencil size={15} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteHistoryOnly(s.academic_session_semesters_id)}
                                        className="p-1 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded"
                                        title="Flush History Timeline Values Only"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </td>
                                </>
                              )}
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}

        {Object.keys(groupedSemesters).length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm bg-white border border-dashed rounded-xl">
            No active semester groups available. Ensure your base schedules are populated correctly.
          </div>
        )}
      </div>
    </div>
  );
}