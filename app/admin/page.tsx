import { Suspense } from "react";
import { AdminLayout } from "@/components/erp-components/admin-view-layout";

export default function AdminPage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <Suspense>
          <AdminLayout />
        </Suspense>
      </div>
    </div>
  );
}