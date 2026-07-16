'use server';

import { supabaseAdmin } from "@/lib/supabase/admin";
import { DatabaseTableNames } from "@/config/Databasenames";
import { 
  assignRoleToUserAdmin, 
  removeRoleFromUserAdmin 
} from "@/lib/db/access-control-server";

/**
 * Server action to assign a new HOD. 
 * Automatically terminates previous tenure, revokes their 'HOD' role, 
 * activates new tenure, and assigns them the 'HOD' role.
 */
export async function AssignNewHod(
  deptId: string, 
  facultyId: string, 
  startDate: string
): Promise<void> {
  try {
    // 1. Identify if there is an active HOD and get their faculty_user_id directly
    const { data: currentActiveHod, error: fetchError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from('faculty_hod_history')
      .select(`
        fhh_faculty_id,
        faculty:fhh_faculty_id (
          faculty_user_id
        )
      `)
      .eq('fhh_dept_id', deptId)
      .is('fhh_effective_end_date', null)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Failed verifying active HOD status: ${fetchError.message}`);
    }

    // 2. Fetch the incoming HOD's user_id directly from the faculty table
    const { data: incomingFaculty, error: incomingError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.DIRECTORY.FACULTY)
      .select('faculty_user_id')
      .eq('faculty_id', facultyId)
      .single();

    if (incomingError || !incomingFaculty) {
      throw new Error(`Could not locate user identity for incoming faculty ID: ${facultyId}`);
    }

    const incomingUserId = incomingFaculty.faculty_user_id;

    // 3. Terminate current ongoing tenure timeline in database history
    const { error: updateError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from('faculty_hod_history')
      .update({ fhh_effective_end_date: startDate })
      .eq('fhh_dept_id', deptId)
      .is('fhh_effective_end_date', null);

    if (updateError) {
      throw new Error(`Failed terminating previous HOD timeline: ${updateError.message}`);
    }

    // 4. Revoke HOD role from previous active faculty (if they exist and are different)
    if (currentActiveHod && currentActiveHod.fhh_faculty_id !== facultyId) {
      const outgoingFaculty = currentActiveHod.faculty as any;
      const outgoingUserId = outgoingFaculty?.faculty_user_id;

      if (outgoingUserId) {
        try {
          await removeRoleFromUserAdmin(outgoingUserId, 'HOD');
        } catch (roleError) {
          // Log warning, but keep the database transaction moving forward
          console.warn(`Notice: Could not strip HOD role from outgoing user ID ${outgoingUserId}:`, roleError);
        }
      }
    }

    // 5. Insert the fresh current active tracking row
    const { error: insertError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from('faculty_hod_history')
      .insert({
        fhh_dept_id: deptId,
        fhh_faculty_id: facultyId,
        fhh_effective_start_date: startDate,
        fhh_effective_end_date: null
      });

    if (insertError) {
      throw new Error(`Failed to initialize new HOD record: ${insertError.message}`);
    }

    // 6. Assign the HOD role code to the new active faculty member
    await assignRoleToUserAdmin(incomingUserId, 'HOD');

  } catch (error: any) {
    console.error("AssignNewHod Transaction Failed:", error);
    throw new Error(error.message || "Internal transaction failure executing HOD assignment.");
  }
}