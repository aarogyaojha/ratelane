import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(
    userId: string,
    action: string,
    resource: string,
    details?: string,
    ipAddress?: string,
  ) {
    return this.prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        details,
        ipAddress,
      },
    });
  }

  async getLogs(userId?: string, limit: number = 100, offset: number = 0) {
    const where = userId ? { userId } : {};

    return this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }
}
