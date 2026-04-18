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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";

interface RateLimitStatus {
  userId: string;
  requestsLastHour: number;
  hourlyLimit: number;
  hourlyRemaining: number;
  hourlyPercentage: number;
  requestsLastDay: number;
  dayLimit: number;
  dayRemaining: number;
  dayPercentage: number;
}

export function RateLimitMonitor() {
  const [stats, setStats] = useState<RateLimitStatus | null>(null);
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();

  const handleFetchStats = async () => {
    if (!userId || !token) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/admin/rate-limit-status/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch rate limit status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Limit Monitor</CardTitle>
        <CardDescription>
          Check rate limiting status for a specific user
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter user ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <Button onClick={handleFetchStats} disabled={isLoading || !userId}>
            {isLoading ? "Loading..." : "Check"}
          </Button>
        </div>

        {stats && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Hourly Requests</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stats.requestsLastHour}</p>
                  <p className="text-sm text-gray-600">/ {stats.hourlyLimit}</p>
                </div>
                <div className="mt-2 bg-gray-200 rounded h-2">
                  <div
                    className={`h-2 rounded ${
                      stats.hourlyPercentage > 80
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${stats.hourlyPercentage}%` }}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Daily Requests</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stats.requestsLastDay}</p>
                  <p className="text-sm text-gray-600">/ {stats.dayLimit}</p>
                </div>
                <div className="mt-2 bg-gray-200 rounded h-2">
                  <div
                    className={`h-2 rounded ${
                      stats.dayPercentage > 80 ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${stats.dayPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
