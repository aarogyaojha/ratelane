import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RoleGuard } from '../common/guards/role.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { AdminService } from './admin.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, new RoleGuard('admin'))
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // System Stats
  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'System stats retrieved' })
  @ApiResponse({ status: 403, description: 'Not an admin' })
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }

  // User Management
  @Get('users')
  @ApiOperation({ summary: 'List all users (admin only)' })
  @ApiResponse({ status: 200, description: 'Users list retrieved' })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const skip = (page - 1) * limit;
    return this.adminService.getAllUsers(skip, limit);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details (admin only)' })
  @ApiResponse({ status: 200, description: 'User details retrieved' })
  async getUserById(@Param('id') userId: string) {
    return this.adminService.getUserById(userId);
  }

  @Post('users/:id/promote')
  @ApiOperation({ summary: 'Promote user to admin (admin only)' })
  @ApiResponse({ status: 200, description: 'User promoted to admin' })
  async promoteUserToAdmin(@Param('id') userId: string) {
    return this.adminService.promoteUserToAdmin(userId);
  }

  @Post('users/:id/demote')
  @ApiOperation({ summary: 'Demote admin to user (admin only)' })
  @ApiResponse({ status: 200, description: 'Admin demoted to user' })
  async demoteAdminToUser(@Param('id') userId: string) {
    return this.adminService.demoteAdminToUser(userId);
  }

  // Audit Logs
  @Get('audit-logs')
  @ApiOperation({ summary: 'View all audit logs (admin only)' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async getAuditLogs(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
  ) {
    const skip = (page - 1) * limit;
    return this.adminService.getAuditLogs(skip, limit);
  }

  @Get('audit-logs/user/:id')
  @ApiOperation({ summary: 'View audit logs for specific user (admin only)' })
  @ApiResponse({ status: 200, description: 'User audit logs retrieved' })
  async getAuditLogsForUser(
    @Param('id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const skip = (page - 1) * limit;
    return this.adminService.getAuditLogsForUser(userId, skip, limit);
  }

  // Rate Limiting Analytics
  @Get('rate-limit-stats')
  @ApiOperation({ summary: 'Get rate limiting statistics (admin only)' })
  @ApiResponse({ status: 200, description: 'Rate limit stats retrieved' })
  async getRateLimitStats() {
    return this.adminService.getRateLimitStats();
  }

  @Get('rate-limit-status/:id')
  @ApiOperation({ summary: 'Get rate limit status for user (admin only)' })
  @ApiResponse({ status: 200, description: 'User rate limit status retrieved' })
  async getUserRateLimitStatus(@Param('id') userId: string) {
    return this.adminService.getUserRateLimitStatus(userId);
  }
}
