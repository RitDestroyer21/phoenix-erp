'use server';

import { createClient } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DatabaseTableNames } from "@/config/Databasenames";
import { assignRoleToUserAdmin } from "@/lib/db/access-control-server";

const supabase = createClient();

export interface ManagementOnboardPayload {
  firstName: string;
  middleName: string | null;
  lastName: string;
  dob: string;
  gender: string;
  phone1: number;
  phone2: number | null;
  mail1: string;
  mail2: string | null;
}

export interface ManagementRecord {
  management_id: string;
  management_user_id: string;
  management_created_at: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  user_basic_details: {
    user_basic_details_dob: string;
    user_basic_details_gender: string;
    user_contact_details: {
      contact_mail1: string;
      contact_phone1: number;
      contact_mail2: string | null;
      contact_phone2: number | null;
    } | null;
  } | null;
}

/* ==========================================================================
   GET ALL MANAGEMENT STAFF
   ========================================================================== */
export async function GetAllManagement(): Promise<ManagementRecord[]> {
  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DIRECTORY.MANAGEMENT) // Assuming your management master table name
    .select(`
      *,
      user_basic_details:management_basic_details_id (
        * ,
        user_contact_details:user_basic_contact_details_id(*)
      )
    `)
    .order("management_created_at", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row: any) => ({
    ...row,
    first_name: row.user_basic_details?.user_basic_details_fname,
    middle_name: row.user_basic_details?.user_basic_details_mname,
    last_name: row.user_basic_details?.user_basic_details_lname,
  }));
}

/* ==========================================================================
   ONBOARD SINGLE MANAGEMENT EMPLOYEE (Server Action Context)
   ========================================================================== */
export async function onboardSingleManagement(payload: ManagementOnboardPayload) {
  // 1. Validation Check: Verify if Email already exists
  const { data: existingContact, error: checkError } = await supabaseAdmin
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.USERS.CONTACT_DETAILS)
    .select('contact_id')
    .eq('contact_mail1', payload.mail1)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Database verification failed: ${checkError.message}`);
  }
  if (existingContact) {
    throw new Error('Management employee already exists.');
  }

  // 2. Parse Date of Birth into temporary auth password
  const dateParts = payload.dob.split('-');
  if (dateParts.length !== 3) {
    throw new Error('Invalid date of birth format supplied.');
  }
  
  const [year, month, day] = dateParts;
  const tempPassword = `${day}${month}${year}@Me`;
  
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: payload.mail1,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      first_name: payload.firstName,
      last_name: payload.lastName,
    },
  });

  if (authError) throw authError;
  if (!authUser.user) throw new Error('Failed to instantiate authentication profile.');

  const generatedUserId = authUser.user.id;

  try {
    // Step 3a: Populate basic identity properties
    const { data: basicDetails, error: basicError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.USERS.BASIC_DETAILS)
      .insert({
        user_id: generatedUserId,
        user_basic_details_fname: payload.firstName,
        user_basic_details_mname: payload.middleName,
        user_basic_details_lname: payload.lastName,
        user_basic_details_dob: payload.dob,
        user_basic_details_gender: payload.gender,
      })
      .select('user_basic_details_id')
      .single();

    if (basicError) throw basicError;

    // Step 3b: Populate communication channels
    const { data: contactDetails, error: contactError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.USERS.CONTACT_DETAILS)
      .insert({
        contact_phone1: payload.phone1,
        contact_phone2: payload.phone2,
        contact_mail1: payload.mail1,
        contact_mail2: payload.mail2,
      })
      .select('contact_id')
      .single();

    if (contactError) throw contactError;

    // Step 3c: Link Contact Details ID back to Basic Details
    const { error: basicUpdateError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.USERS.BASIC_DETAILS)
      .update({
        user_basic_contact_details_id: contactDetails.contact_id,
      })
      .eq('user_basic_details_id', basicDetails.user_basic_details_id);

    if (basicUpdateError) throw basicUpdateError;

    // Step 3d: Create Management Mapping Pointer
    const { data: managementRecord, error: mgmtError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.DIRECTORY.MANAGEMENT)
      .insert({
        management_user_id: generatedUserId,
        management_basic_details_id: basicDetails.user_basic_details_id,
      })
      .select('management_id')
      .single();

    if (mgmtError) throw mgmtError;

    // Step 3e: Assign core system authorization role mapping ('MGM')
    await assignRoleToUserAdmin(generatedUserId, 'MGM');

    return managementRecord;

  } catch (dbTransactionError) {
    await supabaseAdmin.auth.admin.deleteUser(generatedUserId);
    throw dbTransactionError;
  }
}