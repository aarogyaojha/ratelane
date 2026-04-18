import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { UpsModule } from './carriers/ups/ups.module';
import { RatesModule } from './rates/rates.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 20, // 20 requests per minute per IP
      },
      {
        name: 'long',
        ttl: 3600000, // 1 hour
        limit: 100, // 100 requests per hour per user
      },
    ]),
    PrismaModule,
    AuthModule,
    AdminModule,
    UpsModule,
    RatesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
