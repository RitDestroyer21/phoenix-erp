import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { DatabaseTableNames } from "@/config/Databasenames";

export interface RoleMaster {
  role_id: string;
  role_name: string;
  role_code: string;
  role_created_at: string;
}

export function useUserRoles() {
  const [userRoles, setUserRoles] = useState<RoleMaster[]>([]);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Added state tracking hook variable
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function resolveIdentityAndRoles() {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          throw new Error("No authenticated user context found.");
        }

        setUserId(user.id); // Save resolved user context identifier locally

        const { data, error: dbError } = await supabase
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
          .eq('uam_user_id', user.id);

        if (dbError) {
          throw new Error(`Database error resolving user roles: ${dbError.message}`);
        }

        if (data && data.length > 0) {
          const resolvedRoles: RoleMaster[] = data
            .map((item) => {
              const roleData = item.roles_master;
              return Array.isArray(roleData) ? roleData[0] : roleData;
            })
            .filter((role): role is RoleMaster => !!role);

          setUserRoles(resolvedRoles);
          if (resolvedRoles.length > 0) {
            setActiveRole(resolvedRoles[0].role_code);
          }
        }
      } catch (err) {
        console.error("Access control validation failed: ", err);
      } finally {
        setIsLoading(false);
      }
    }

    resolveIdentityAndRoles();
  }, []);

  return { userRoles, activeRole, setActiveRole, userId, isLoading }; // Returned userId string parameter
}