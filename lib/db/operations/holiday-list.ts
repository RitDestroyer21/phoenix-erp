import { createClient } from "@/lib/supabase/client";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface Holiday {
  hl_id: string;
  hl_date: string; // ISO date string (YYYY-MM-DD)
  hl_reason: string;
  hl_created_at: string;
}

const supabase = createClient();

export type CreateHolidayInput = Omit<Holiday, "hl_id" | "hl_created_at">;
export type UpdateHolidayInput = Partial<CreateHolidayInput>;

/**
 * CREATE: Add a new holiday to the schedule
 */
export async function CreateHoliday(payload: CreateHolidayInput): Promise<Holiday> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.OPERATIONS.HOLIDAYS)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error creating holiday:", error.message);
    throw new Error(error.message);
  }

  return data;
}

/**
 * READ: Fetch all holidays sorted by holiday date (chronological order)
 */
export async function GetHolidayList(): Promise<Holiday[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.OPERATIONS.HOLIDAYS)
    .select("*")
    .order("hl_date", { ascending: true });

  if (error) {
    console.error("Error fetching holiday list:", error.message);
    throw new Error(error.message);
  }

  return data || [];
}

/**
 * READ SINGLE: Fetch details of a specific holiday
 */
export async function GetHolidayById(hl_id: string): Promise<Holiday | null> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.OPERATIONS.HOLIDAYS)
    .select("*")
    .eq("hl_id", hl_id)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching holiday with ID ${hl_id}:`, error.message);
    throw new Error(error.message);
  }

  return data;
}

/**
 * UPDATE: Modify a holiday's date or reason
 */
export async function UpdateHoliday(
  hl_id: string,
  payload: UpdateHolidayInput
): Promise<Holiday> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.OPERATIONS.HOLIDAYS)
    .update(payload)
    .eq("hl_id", hl_id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating holiday with ID ${hl_id}:`, error.message);
    throw new Error(error.message);
  }

  return data;
}

/**
 * DELETE: Remove a holiday entry from the database
 */
export async function DeleteHoliday(hl_id: string): Promise<void> {
  const { error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.OPERATIONS.HOLIDAYS)
    .delete()
    .eq("hl_id", hl_id);

  if (error) {
    console.error(`Error deleting holiday with ID ${hl_id}:`, error.message);
    throw new Error(error.message);
  }
}