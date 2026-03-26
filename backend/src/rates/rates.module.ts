import { Module, MiddlewareConsumer } from '@nestjs/common';
import { RatesController } from './rates.controller';
import { RatesService } from './rates.service';
import { SessionMiddleware } from '../session/session.middleware';
import { UpsModule } from '../carriers/ups/ups.module';
import { UpsAdapter } from '../carriers/ups/ups.adapter';
import { CARRIERS } from '../carriers/carrier.interface';

@Module({
  imports: [UpsModule],
  controllers: [RatesController],
  providers: [
    RatesService,
    {
      provide: CARRIERS,
      useFactory: (ups: UpsAdapter) => [ups],
      inject: [UpsAdapter],
    },
  ],
})
export class RatesModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SessionMiddleware)
      .forRoutes(RatesController);
  }
}
