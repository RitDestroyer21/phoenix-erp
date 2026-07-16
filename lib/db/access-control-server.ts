'use server';

import { supabaseAdmin } from "@/lib/supabase/admin";
import { DatabaseTableNames } from "@/config/Databasenames";

/**
 * Helper to dynamically resolve a role_id from its code using admin client permissions.
 */
async function getRoleIdByCodeAdmin(roleCode: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ROLES.MASTER)
    .select('role_id')
    .eq('role_code', roleCode.toUpperCase())
    .maybeSingle();

  if (error) {
    throw new Error(`Database error looking up role code "${roleCode}": ${error.message}`);
  }
  if (!data) {
    throw new Error(`Role code "${roleCode}" does not exist in roles_master.`);
  }

  return data.role_id;
}

/**
 * Server-safe tool using Service Role bypass credentials to map a user to a specific authority role code.
 */
export async function assignRoleToUserAdmin(userId: string, roleCode: string): Promise<void> {
  const roleId = await getRoleIdByCodeAdmin(roleCode);

  const { error } = await supabaseAdmin
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ROLES.USERS)
    .insert({
      uam_user_id: userId,
      uam_role_id: roleId,
    });

  if (error) {
    throw new Error(`Failed to assign system role "${roleCode}" to user: ${error.message}`);
  }
}

/**
 * Server-safe tool to revoke an authority assignment using Service Role credentials.
 */
export async function removeRoleFromUserAdmin(userId: string, roleCode: string): Promise<void> {
  const roleId = await getRoleIdByCodeAdmin(roleCode);

  const { error } = await supabaseAdmin
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ROLES.USERS)
    .delete()
    .eq('uam_user_id', userId)
    .eq('uam_role_id', roleId);

  if (error) {
    throw new Error(`Failed to revoke system role "${roleCode}" from user: ${error.message}`);
  }
}