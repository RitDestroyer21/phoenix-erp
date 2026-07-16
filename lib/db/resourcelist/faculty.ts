'use server';

import { createClient } from '@/lib/supabase/server'; // Adjust this to match your Supabase initialization path
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DatabaseTableNames } from "@/config/Databasenames";
import { FacultyRecord } from "@/lib/interfaces";
import { assignRoleToUserAdmin } from "@/lib/db/access-control-server"

export interface FacultyOnboardPayload {
  firstName: string;
  middleName?: string | null;
  lastName: string;
  dob: string; // YYYY-MM-DD
  gender: string;
  phone1: number;
  phone2?: number | null;
  mail1: string;
  mail2?: string | null;
  deptId: string;
}

// 1. Core single faculty transaction method
export async function onboardSingleFaculty(payload: FacultyOnboardPayload): Promise<void> {

  // Parse the DOB string to format the default password securely
  const dobParts = payload.dob.split('-'); // ["YYYY", "MM", "DD"]
  if (dobParts.length !== 3) {
    throw new Error(`Invalid Date format received: ${payload.dob}`);
  }
  const [year, month, day] = dobParts;
  const defaultPassword = `${day}${month}${year}@Me`;

  // Pipeline Execution Step A: Provision standard Auth user account
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: payload.mail1,
    password: defaultPassword,
    email_confirm: true,
    user_metadata: {
      first_name: payload.firstName,
      last_name: payload.lastName,
    },
  });

  if (authError) {
    throw new Error(`Auth provisioning failed: ${authError.message}`);
  }

  const newUserId = authUser.user?.id;
  if (!newUserId) throw new Error('Auth layer returned an invalid unique identity key.');

  try {
    // 3. Sequential Relational Inserts
    // Step 3a: Populate basic identity properties
    const { data: basicDetails, error: basicError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.USERS.BASIC_DETAILS)
      .insert({
        user_id: newUserId,
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

    // Step 3d: Assign and create the functional faculty Role pointer mapping
    const { data: facultyRecord, error: facultyError } = await supabaseAdmin
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.DIRECTORY.FACULTY)
      .insert({
        faculty_user_id: newUserId,
        faculty_basic_details_id: basicDetails.user_basic_details_id,
        faculty_dept_id: payload.deptId
      })
      .select('faculty_id')
      .single();

    if (facultyError) throw facultyError;
    
    await assignRoleToUserAdmin(newUserId,`INS`);

  } catch (dbTransactionError) {
    // Structural rollback fallback: Purge orphaned Auth reference if DB sequence crashes
    await supabaseAdmin.auth.admin.deleteUser(newUserId);
    throw dbTransactionError;
  }
}

// 2. Fetch all faculty directory method with joined profiles
export async function GetAllFaculty(): Promise<FacultyRecord[]> {
  const supabase = await createClient();

  // Build relational query payload string dynamically using table schema configurations
  const query = `
    faculty_id,
    faculty_dept_id,
    department:faculty_dept_id (
      dept_name
    ),
    user_basic_details:faculty_basic_details_id (
      user_basic_details_fname,
      user_basic_details_mname,
      user_basic_details_lname,
      user_basic_details_dob,
      user_basic_details_gender,
      user_contact_details:user_basic_contact_details_id (
        contact_mail1,
        contact_phone1,
        contact_mail2,
        contact_phone2
      )
    )
  `;

  const { data, error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.DIRECTORY.FACULTY)
    .select(query);

  if (error) {
    console.error("Supabase fault pulling faculty directory lines:", error.message);
    throw new Error("Failed to load faculty records from server database.");
  }

  // Parse structural payloads cleanly back to component shapes
  return (data || []).map((record: any) => {
    const basic = record.user_basic_details;
    const contact = basic?.user_contact_details;

    return {
      faculty_id: record.faculty_id,
      first_name: basic?.user_basic_details_fname || "Unknown",
      middle_name: basic?.user_basic_details_mname || null,
      last_name: basic?.user_basic_details_lname || "Member",
      department_id: record.faculty_dept_id,
      department_name: record.department?.dept_name || "General Faculty",
      user_basic_details: basic ? {
        user_basic_details_dob: basic.user_basic_details_dob,
        user_basic_details_gender: basic.user_basic_details_gender,
        user_contact_details: contact ? {
          contact_mail1: contact.contact_mail1,
          contact_phone1: contact.contact_phone1,
          contact_mail2: contact.contact_mail2,
          contact_phone2: contact.contact_phone2
        } : null
      } : null
    };
  });
}