'use client';

import { createClient } from "@/lib/supabase/client";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface RoleMaster {
  role_id: string;
  role_name: string;
  role_code: string;
  role_created_at: string;
}

export interface UserAuthorizationPayload {
  userId: string;
  roles: RoleMaster[];
}

const supabase = createClient();

export const accessControlDb = {
  /**
   * Retrieves all roles assigned to a specific user.
   */
  async getUserRoles(userId: string): Promise<RoleMaster[]> {
    const { data, error } = await supabase
      .schema(DatabaseTableNames.SCHEMA)
      .from(DatabaseTableNames.TABLES.ROLES.USERS)
      .select(`
        roles_master (
          role_id,
          role_name,
          role_code,
          role_created_at
        )
      `)
      .eq('uam_user_id', userId);

    if (error) {
      throw new Error(`Database error fetching user roles: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Map through the results to return a clean, flat list of role structures
    const resolvedRoles: RoleMaster[] = data
      .map((item) => {
        const roleData = item.roles_master;
        if (Array.isArray(roleData)) {
          return roleData[0];
        }
        return roleData;
      })
      .filter((role): role is RoleMaster => !!role);

    return resolvedRoles;
  },

  /**
   * Helper to resolve the logged-in session user's ID and all their roles at once.
   */
  async getCurrentUserSessionWithRoles(): Promise<UserAuthorizationPayload> {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error("No active session or user found.");
    }

    const roles = await this.getUserRoles(user.id);

    return {
      userId: user.id,
      roles,
    };
  }
  
};


async function getRoleIdByCodeAdmin(roleCode: string): Promise<string> {
  const { data, error } = await supabase
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

  const { error } = await supabase
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

  const { error } = await supabase
    .schema(DatabaseTableNames.SCHEMA)
    .from(DatabaseTableNames.TABLES.ROLES.USERS)
    .delete()
    .eq('uam_user_id', userId)
    .eq('uam_role_id', roleId);

  if (error) {
    throw new Error(`Failed to revoke system role "${roleCode}" from user: ${error.message}`);
  }
}