import { createClient } from "@/lib/supabase/client";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface WorkingWeekday {
  wwd_id: number;
  wwd_day: number;
  wwd_name: string;
  wwd_status: boolean;
  wwd_created_at: string;
}

/**
 * READ: Fetch all working weekdays ordered by their day index (1-7)
 */
export async function GetWorkingWeekdays(): Promise<WorkingWeekday[]> {
  const { data, error } = await supabase
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.OPERATIONS.WORKDAYS)
    .select("*")
    .order("wwd_day", { ascending: true });

  if (error) {
    console.error("Error fetching working weekdays:", error.message);
    throw new Error(error.message);
  }

  return data || [];
}

const supabase = createClient();

/**
 * UPDATE: Update the status or name of a specific weekday
 */
export async function UpdateWorkingWeekday(
  wwd_id: number,
  payload: Partial<Omit<WorkingWeekday, "wwd_id" | "wwd_created_at">>
): Promise<WorkingWeekday> {
  const { data, error } = await supabase
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.OPERATIONS.WORKDAYS)
    .update(payload)
    .eq("wwd_id", wwd_id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating working weekday ID ${wwd_id}:`, error.message);
    throw new Error(error.message);
  }

  return data;
}