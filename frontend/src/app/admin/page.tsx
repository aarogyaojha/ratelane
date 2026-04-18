"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminStats } from "@/components/AdminStats";
import { AuditLogsViewer } from "@/components/AuditLogsViewer";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== "admin") {
      router.push("/");
    }
  }, [user, isLoading, router]);

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">System Statistics</h2>
          <AdminStats />
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Activity</h2>
          <AuditLogsViewer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
