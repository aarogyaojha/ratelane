import { Module } from '@nestjs/common';
import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';
import { UpsModule } from '../carriers/ups/ups.module';
import { UpsAdapter } from '../carriers/ups/ups.adapter';
import { CARRIERS } from '../carriers/carrier.interface';
import { AuditLogService } from '../common/services/audit-log.service';

@Module({
  imports: [UpsModule],
  controllers: [RatesController],
  providers: [
    RatesService,
    AuditLogService,
    {
      provide: CARRIERS,
      useFactory: (ups: UpsAdapter) => [ups],
      inject: [UpsAdapter],
    },
  ],
})
export class RatesModule {}
