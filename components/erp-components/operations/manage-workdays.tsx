"use client";

import { useEffect, useState } from "react";
import {
  WorkingWeekday,
  GetWorkingWeekdays,
  UpdateWorkingWeekday,
} from "@/lib/db/operations/working-weekdays";
import { CalendarRange, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export function ManageWorkdays() {
  const [weekdays, setWeekdays] = useState<WorkingWeekday[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    fetchWeekdays();
  }, []);

  async function fetchWeekdays() {
    setLoading(true);
    try {
      const data = await GetWorkingWeekdays();
      setWeekdays(data);
    } catch (err: any) {
      alert("Failed to load workdays: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(day: WorkingWeekday) {
    setUpdatingId(day.wwd_id);
    const newStatus = !day.wwd_status;
    try {
      const updated = await UpdateWorkingWeekday(day.wwd_id, {
        wwd_status: newStatus,
      });
      setWeekdays((prev) =>
        prev.map((w) => (w.wwd_id === day.wwd_id ? updated : w))
      );
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <CalendarRange className="text-red-600" /> Working Weekdays
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage operational working days for calendar maps & attendance processing
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-zinc-400 animate-pulse">
          Retrieving workday matrix...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weekdays.map((day) => {
            const isToggling = updatingId === day.wwd_id;
            return (
              <div
                key={day.wwd_id}
                className={`relative border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between h-40 ${
                  day.wwd_status
                    ? "bg-green-50/10 border-green-200 dark:border-green-900/30"
                    : "bg-zinc-50/40 border-zinc-100 dark:border-zinc-850"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-40">
                      Day Index: {day.wwd_day}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold leading-none ${
                        day.wwd_status
                          ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                          : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {day.wwd_status ? (
                        <>
                          <CheckCircle2 size={12} /> Working
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} /> Non-Working
                        </>
                      )}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mt-2 text-zinc-800 dark:text-zinc-200">
                    {day.wwd_name}
                  </h3>
                </div>

                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Set active schedule status</span>
                  <button
                    onClick={() => handleToggleStatus(day)}
                    disabled={isToggling}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      day.wwd_status ? "bg-green-600" : "bg-zinc-200 dark:bg-zinc-800"
                    } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                        day.wwd_status ? "translate-x-5" : "translate-x-0"
                      }`}
                    >
                      {isToggling && (
                        <RefreshCw size={10} className="animate-spin text-zinc-400" />
                      )}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}