"use client";

import { createClient } from "@/lib/supabase/client";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface AcademicSemesterHistory {
  ash_id: string;
  ash_created_at: string;
  ash_semester_id: string;
  ash_effective_start_date: string | null;
  ash_effective_end_date: string | null;
}

const supabase = createClient();

// Fallback config mapping if SEMESTERS_HISTORY isn't fully defined yet in config
const TABLE_NAME = (DatabaseTableNames.TABLES.ACADEMICS as any).SEMESTERS_HISTORY || "academic_semesters_history";

/* ================================
   GET ALL HISTORIES
================================ */
export async function GetAllSemesterHistories(): Promise<AcademicSemesterHistory[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(TABLE_NAME)
    .select("*");

  if (error) throw new Error(error.message);
  return data || [];
}

/* ================================
   GET BY SEMESTER ID
================================ */
export async function GetSemesterHistoryBySemesterId(semesterId: string): Promise<AcademicSemesterHistory | null> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(TABLE_NAME)
    .select("*")
    .eq("ash_semester_id", semesterId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/* ================================
   UPSERT (Insert if new, Update if exists)
================================ */
export async function UpsertSemesterHistory(
  semesterId: string,
  startDate: string | null,
  endDate: string | null
): Promise<AcademicSemesterHistory> {
  // Check for existing history log
  const existing = await GetSemesterHistoryBySemesterId(semesterId);

  if (existing) {
    const { data, error } = await supabase
      .schema(DatabaseTableNames.SCHEMA)
      .from(TABLE_NAME)
      .update({
        ash_effective_start_date: startDate || null,
        ash_effective_end_date: endDate || null,
      })
      .eq("ash_semester_id", semesterId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data;
  } else {
    const { data, error } = await supabase
      .schema(DatabaseTableNames.SCHEMA)
      .from(TABLE_NAME)
      .insert([
        {
          ash_semester_id: semesterId,
          ash_effective_start_date: startDate || null,
          ash_effective_end_date: endDate || null,
        },
      ])
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}

/* ================================
   DELETE HISTORY ONLY
================================ */
export async function DeleteSemesterHistoryBySemesterId(semesterId: string): Promise<void> {
  const { error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(TABLE_NAME)
    .delete()
    .eq("ash_semester_id", semesterId);

  if (error) throw new Error(error.message);
}