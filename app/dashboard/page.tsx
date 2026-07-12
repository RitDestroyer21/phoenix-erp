import { Suspense } from "react";
import DashboardWrapper from "@/components/erp-components/dashboard-wrapper";

export default function Page() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading Dashboard...</div>}>
          {/* Pass "HOD" to unlock the full dashboard layout view */}
          <DashboardWrapper userRole="HOD" />
        </Suspense>
      </div>
    </div>
  );
}