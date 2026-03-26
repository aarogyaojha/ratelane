import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UpsAuthService } from './ups-auth.service';
import { UpsRatesService } from './ups-rates.service';
import { UpsAdapter } from './ups.adapter';
import { CARRIERS } from '../carrier.interface';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [UpsAuthService, UpsRatesService, UpsAdapter],
  exports: [UpsAdapter],
})
export class UpsModule {}
