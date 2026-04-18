import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { RatesService } from './rates.service';
import { RateRequestDto } from './dto/rate-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { GetIpAddress } from '../common/decorators/get-ip.decorator';
import { AuditLogService } from '../common/services/audit-log.service';

@ApiTags('rates')
@Controller('rates')
@UseGuards(JwtAuthGuard, ThrottlerGuard)
@ApiBearerAuth()
export class RatesController {
  constructor(
    private readonly ratesService: RatesService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Fetch shipping rates from carriers' })
  @ApiResponse({ status: 201, description: 'Rates fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async getRates(
    @Body() dto: RateRequestDto,
    @GetUser() user: any,
    @GetIpAddress() ipAddress: string,
  ) {
    // Log the rate request
    await this.auditLogService.log(
      user.id,
      'FETCH_RATES',
      'RateRequest',
      `${dto.originZip} → ${dto.destZip}, ${dto.weightLbs}lbs`,
      ipAddress,
    );

    return this.ratesService.getRates(dto, user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get user rate request history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async getHistory(@GetUser() user: any) {
    return this.ratesService.getHistory(user.id);
  }
}
