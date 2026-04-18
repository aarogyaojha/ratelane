"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/lib/auth-context";

interface SystemStats {
  totalUsers: number;
  adminUsers: number;
  regularUsers: number;
  totalRateRequests: number;
  totalAuditLogs: number;
  totalCarrierQuotes: number;
  averageQuotesPerRequest: number;
}

export function AdminStats() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:3000/admin/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (isLoading) return <Spinner />;
  if (!stats) return <p>Failed to load stats</p>;

  const statCards = [
    { label: "Total Users", value: stats.totalUsers },
    { label: "Admin Users", value: stats.adminUsers },
    { label: "Rate Requests", value: stats.totalRateRequests },
    { label: "Audit Logs", value: stats.totalAuditLogs },
    { label: "Carrier Quotes", value: stats.totalCarrierQuotes },
    {
      label: "Avg Quotes/Request",
      value: stats.averageQuotesPerRequest.toFixed(2),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
