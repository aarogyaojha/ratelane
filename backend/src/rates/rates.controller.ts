import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiCookieAuth } from '@nestjs/swagger';
import { RatesService } from './rates.service';
import { RateRequestDto } from './dto/rate-request.dto';
import { SessionId } from '../session/session.decorator';

@ApiTags('rates')
@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Post()
  @ApiOperation({ summary: 'Fetch shipping rates from carriers' })
  @ApiResponse({ status: 201, description: 'Rates fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized or missing session' })
  @ApiCookieAuth('sessionId')
  async getRates(@Body() dto: RateRequestDto, @SessionId() sessionId: string) {
    return this.ratesService.getRates(dto, sessionId);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get session rate request history' })
  @ApiResponse({ status: 200, description: 'History retrieved successfully' })
  @ApiCookieAuth('sessionId')
  async getHistory(@SessionId() sessionId: string) {
    return this.ratesService.getHistory(sessionId);
  }
}
