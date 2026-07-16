"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Holiday,
  GetHolidayList,
  CreateHoliday,
  UpdateHoliday,
  DeleteHoliday,
} from "@/lib/db/operations/holiday-list";
import { 
  Plus, Pencil, Trash2, Calendar, Search, X, 
  ChevronLeft, ChevronRight, AlertCircle, Sparkles 
} from "lucide-react";

export function ManageHolidays() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Calendar View State
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  
  // Form fields
  const [hlDate, setHlDate] = useState("");
  const [hlReason, setHlReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, []);

  async function fetchHolidays() {
    setLoading(true);
    try {
      const data = await GetHolidayList();
      setHolidays(data);
    } catch (err: any) {
      alert("Failed to load holidays: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Create lookup dictionary for easy rendering performance mapping { 'YYYY-MM-DD': Holiday }
  const holidayMap = useMemo(() => {
    const map: Record<string, Holiday> = {};
    holidays.forEach(h => {
      // Normalize to YYYY-MM-DD
      const dateStr = h.hl_date.substring(0, 10);
      map[dateStr] = h;
    });
    return map;
  }, [holidays]);

  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => {
      const matchesSearch = h.hl_reason.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = h.hl_date.includes(searchQuery);
      return matchesSearch || matchesDate;
    });
  }, [holidays, searchQuery]);

  // Calendar Engine logic
  const { daysInMonth, paddingDays, currentMonthYearLabel } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Padding offset (Monday = 0, Sunday = 6 or Sunday = 0, Monday = 1 depending on layout preference)
    // We'll use standard Sunday = 0
    const startOffset = firstDay.getDay(); 
    
    const daysArr = Array.from({ length: lastDay.getDate() }, (_, i) => i + 1);
    const paddingArr = Array.from({ length: startOffset });

    const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return {
      daysInMonth: daysArr,
      paddingDays: paddingArr,
      currentMonthYearLabel: monthLabel
    };
  }, [currentDate]);

  function handleMonthChange(direction: "prev" | "next") {
    setCurrentDate(prev => {
      const nextDate = new Date(prev);
      nextDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return nextDate;
    });
  }

  // Handle clicking on a calendar block day
  function handleDayClick(dayNumber: number) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(dayNumber).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const existingHoliday = holidayMap[dateStr];

    if (existingHoliday) {
      openEditModal(existingHoliday);
    } else {
      openCreateModal(dateStr);
    }
  }

  function openCreateModal(defaultDate = "") {
    setEditingHoliday(null);
    setHlDate(defaultDate);
    setHlReason("");
    setIsModalOpen(true);
  }

  function openEditModal(holiday: Holiday) {
    setEditingHoliday(holiday);
    setHlDate(holiday.hl_date);
    setHlReason(holiday.hl_reason);
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hlDate || !hlReason.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingHoliday) {
        const updated = await UpdateHoliday(editingHoliday.hl_id, {
          hl_date: hlDate,
          hl_reason: hlReason,
        });
        setHolidays((prev) =>
          prev.map((h) => (h.hl_id === editingHoliday.hl_id ? updated : h))
        );
      } else {
        const created = await CreateHoliday({
          hl_date: hlDate,
          hl_reason: hlReason,
        });
        setHolidays((prev) => [...prev, created]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Operation failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(hl_id: string) {
    if (!confirm("Are you sure you want to remove this holiday?")) return;
    try {
      await DeleteHoliday(hl_id);
      setHolidays((prev) => prev.filter((h) => h.hl_id !== hl_id));
    } catch (err: any) {
      alert("Failed to delete holiday: " + err.message);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Calendar className="text-red-600" /> Holiday Planner
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Configure academic schedules and manage holiday listings
          </p>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-xs transition"
        >
          <Plus size={16} /> Add Holiday
        </button>
      </div>

      {/* TWO COLUMN GRID: Left Side Calendar View, Right Side List Manager */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CALENDAR COLUMN */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl p-5 shadow-xs">
            {/* Header / Month Scroller */}
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-sm tracking-wide text-zinc-800 dark:text-zinc-200">
                {currentMonthYearLabel}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMonthChange("prev")}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => handleMonthChange("next")}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Weekday Titles */}
            <div className="grid grid-cols-7 text-center text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-2 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Grid Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Padding elements */}
              {paddingDays.map((_, index) => (
                <div key={`pad-${index}`} className="aspect-square bg-transparent" />
              ))}

              {/* Day Tiles */}
              {daysInMonth.map((day) => {
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, "0");
                const dayStr = String(day).padStart(2, "0");
                const lookupKey = `${year}-${month}-${dayStr}`;
                
                const dayHoliday = holidayMap[lookupKey];

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    title={dayHoliday ? dayHoliday.hl_reason : "Click to set holiday"}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition relative font-medium group ${
                      dayHoliday
                        ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <span>{day}</span>
                    {dayHoliday && (
                      <span className="absolute bottom-1 w-1.5 h-1.5 bg-red-600 dark:bg-red-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Quick Helper Legend */}
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-md inline-block" /> Academic Offday
              </span>
              <span>Click a day to add/edit</span>
            </div>
          </div>
        </div>

        {/* LIST / SEARCH TABLE COLUMN */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl px-3 py-2 shadow-2xs">
            <Search size={18} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              placeholder="Search details or ISO Date structure (e.g. 2026-07)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-0 outline-none w-full text-sm placeholder:text-zinc-400 text-zinc-800 dark:text-zinc-200"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-zinc-400 hover:text-zinc-600">
                <X size={16} />
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-12 text-center text-sm text-zinc-400 animate-pulse">
              Loading institutional holiday list...
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-850 font-semibold text-xs uppercase tracking-wider">
                    <th className="p-4 w-1/3">Date</th>
                    <th className="p-4 w-1/2">Holiday Reason</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                  {filteredHolidays.map((holiday) => (
                    <tr key={holiday.hl_id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="p-4 font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                        {new Date(holiday.hl_date).toLocaleDateString("en-US", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-400 font-medium">
                        {holiday.hl_reason}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(holiday)}
                            className="p-2 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-lg transition"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(holiday.hl_id)}
                            className="p-2 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 rounded-lg transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredHolidays.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center p-12 text-zinc-400 dark:text-zinc-600 italic">
                        No holiday records matching filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* CREATE / UPDATE MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-850 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-bold text-zinc-800 dark:text-zinc-200">
                {editingHoliday ? "Modify Holiday Details" : "Record New Holiday"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-400 hover:text-zinc-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Holiday Date
                </label>
                <input
                  type="date"
                  required
                  value={hlDate}
                  onChange={(e) => setHlDate(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm bg-background"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  Reason / Event Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Independence Day, Winter Break"
                  value={hlReason}
                  onChange={(e) => setHlReason(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-sm bg-background font-medium"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-850 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-750 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-55 transition"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}