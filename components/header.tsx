import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";
export function Header() {
  return (
    <nav className="w-full border-b border-b-foreground/10 h-16">
      <div className="flex w-full h-full items-center justify-between px-8 text-sm">
        
        {/* Left - Logo */}
        <Link href="/">
          <h4 className="font-bold text-2xl">PhoenixERP</h4>
        </Link>

        {/* Right - Auth */}
        {!hasEnvVars ? (
          <EnvVarWarning />
        ) : (
          <Suspense>
            <AuthButton />
          </Suspense>
        )}
      </div>
    </nav>
  );
}


