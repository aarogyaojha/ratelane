import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ICarrier, CARRIERS } from '../carriers/carrier.interface';
import { RateRequestDto } from './dto/rate-request.dto';
import { RateQuote } from '@prisma/client';

@Injectable()
export class RatesService {
  private readonly logger = new Logger(RatesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CARRIERS) private readonly carriers: ICarrier[],
  ) {}

  async getRates(dto: RateRequestDto, userId: string) {
    const request = await this.prisma.rateRequest.create({
      data: {
        userId,
        originZip: dto.originZip,
        destZip: dto.destZip,
        weightLbs: dto.weightLbs,
        lengthIn: dto.lengthIn,
        widthIn: dto.widthIn,
        heightIn: dto.heightIn,
        serviceCode: dto.serviceCode,
      },
    });

    const allQuotes: RateQuote[] = [];

    // Aggregate rates from all carriers
    for (const carrier of this.carriers) {
      try {
        if (carrier?.capabilities?.rates) {
          const carrierQuotes = await carrier.capabilities.rates.getRates(request);
          allQuotes.push(...carrierQuotes);
        }
      } catch (err) {
        this.logger.error(`Failed to get rates for ${carrier?.carrierId}: ${err.message}`, err.stack);
      }
    }

    // Filter by service level if a specific code was requested
    const filteredQuotes = dto.serviceCode 
      ? allQuotes.filter(q => q.serviceCode === dto.serviceCode)
      : allQuotes;

    if (filteredQuotes.length > 0) {
      await this.prisma.rateQuote.createMany({
        data: filteredQuotes.map(q => ({
          carrier: q.carrier,
          serviceCode: q.serviceCode,
          serviceLabel: q.serviceLabel,
          totalCharge: q.totalCharge,
          currency: q.currency,
          estimatedDays: q.estimatedDays,
          rateRequestId: request.id,
        })),
      });
    }

    return filteredQuotes;
  }

  async getHistory(userId: string) {
    return this.prisma.rateRequest.findMany({
      where: { userId },
      include: {
        quotes: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
