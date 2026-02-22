"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Power } from "lucide-react";
import { useTheme } from "next-themes";

export function LogoutButton() {
  const router = useRouter();
  const { theme } = useTheme();
  const ICON_SIZE = 16;
  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return <Button onClick={logout}>
      {theme === "light" ? (
            <Power
              key="light"
              size={ICON_SIZE}
            />
          ) : theme === "dark" ? (
            <Power
              key="dark"
              size={ICON_SIZE}
            />
          ) : (
            <Power
              key="system"
              size={ICON_SIZE}
            />
          )}
    </Button>;
}
