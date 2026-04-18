import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  // User Management
  async getAllUsers(skip: number = 0, take: number = 50) {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const total = await this.prisma.user.count();

    return { data: users, total, page: Math.ceil(skip / take) + 1, pageSize: take };
  }

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        rateRequests: {
          select: {
            id: true,
            createdAt: true,
            originZip: true,
            destZip: true,
            weightLbs: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  async promoteUserToAdmin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: 'admin' },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }

  async demoteAdminToUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: 'user' },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });
  }

  // Audit Log Management
  async getAuditLogs(skip: number = 0, take: number = 100) {
    const logs = await this.prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const total = await this.prisma.auditLog.count();

    return { data: logs, total, page: Math.ceil(skip / take) + 1, pageSize: take };
  }

  async getAuditLogsForUser(userId: string, skip: number = 0, take: number = 50) {
    const logs = await this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });

    const total = await this.prisma.auditLog.count({ where: { userId } });

    return { data: logs, total, page: Math.ceil(skip / take) + 1, pageSize: take };
  }

  // Rate Limiting & Analytics
  async getRateLimitStats() {
    // Get rate request statistics for the last 24 hours
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const requestsByUser = await this.prisma.rateRequest.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: last24h },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: { id: 'desc' },
      },
    });

    const totalRequests24h = await this.prisma.rateRequest.count({
      where: {
        createdAt: { gte: last24h },
      },
    });

    // Identify users approaching hourly limit (100/hour)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const userHourlyRequests = await this.prisma.rateRequest.groupBy({
      by: ['userId'],
      where: {
        createdAt: { gte: oneHourAgo },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: { id: 'desc' },
      },
    });

    const usersApproachingLimit = userHourlyRequests
      .filter(u => u._count.id > 80)
      .map(u => ({ userId: u.userId, requestsLastHour: u._count.id }));

    return {
      totalRequests24h,
      requestsByUser: requestsByUser.slice(0, 10),
      usersApproachingLimit,
    };
  }

  async getUserRateLimitStatus(userId: string) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const requestsLastHour = await this.prisma.rateRequest.count({
      where: {
        userId,
        createdAt: { gte: oneHourAgo },
      },
    });

    const requestsLastDay = await this.prisma.rateRequest.count({
      where: {
        userId,
        createdAt: { gte: oneDayAgo },
      },
    });

    return {
      userId,
      requestsLastHour,
      hourlyLimit: 100,
      hourlyRemaining: Math.max(0, 100 - requestsLastHour),
      hourlyPercentage: Math.round((requestsLastHour / 100) * 100),
      requestsLastDay,
      dayLimit: 1000, // Suggested daily limit
      dayRemaining: Math.max(0, 1000 - requestsLastDay),
      dayPercentage: Math.round((requestsLastDay / 1000) * 100),
    };
  }

  // System Health
  async getSystemStats() {
    const totalUsers = await this.prisma.user.count();
    const adminUsers = await this.prisma.user.count({ where: { role: 'admin' } });
    const totalRateRequests = await this.prisma.rateRequest.count();
    const totalAuditLogs = await this.prisma.auditLog.count();
    const totalCarrierQuotes = await this.prisma.rateQuote.count();

    return {
      totalUsers,
      adminUsers,
      regularUsers: totalUsers - adminUsers,
      totalRateRequests,
      totalAuditLogs,
      totalCarrierQuotes,
      averageQuotesPerRequest: totalRateRequests > 0 ? totalCarrierQuotes / totalRateRequests : 0,
    };
  }
}
