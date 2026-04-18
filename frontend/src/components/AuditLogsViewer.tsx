"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
  };
}

export function AuditLogsViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { token } = useAuth();

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          `http://localhost:3000/admin/audit-logs?page=${page}&limit=20`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (response.ok) {
          const data = await response.json();
          setLogs(data.data);
          setTotal(data.total);
        }
      } catch (error) {
        console.error("Failed to fetch audit logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [token, page]);

  if (isLoading) return <Spinner />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>Activity history for all users</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-sm">{log.user.email}</TableCell>
                <TableCell className="text-sm font-medium">
                  {log.action}
                </TableCell>
                <TableCell className="text-sm">{log.resource}</TableCell>
                <TableCell className="text-sm text-gray-600">
                  {log.details}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {log.ipAddress}
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(log.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing page {page} of {Math.ceil(total / 20)}
          </p>
          <div className="space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
