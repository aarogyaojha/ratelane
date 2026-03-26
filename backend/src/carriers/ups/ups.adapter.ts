import { Injectable } from '@nestjs/common';
import { ICarrier } from '../carrier.interface';
import { RateRequest, RateQuote } from '@prisma/client';
import { UpsRatesService } from './ups-rates.service';

@Injectable()
export class UpsAdapter implements ICarrier {
  readonly carrierId = 'UPS';
  readonly capabilities: ICarrier['capabilities'];

  constructor(private readonly upsRatesService: UpsRatesService) {
    this.capabilities = {
      rates: this.upsRatesService,
    };
  }
}
