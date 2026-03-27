import { Test, TestingModule } from '@nestjs/testing';
import { RatesService } from './rates.service';
import { PrismaService } from '../prisma/prisma.service';
import { CARRIERS } from '../carriers/carrier.interface';

describe('RatesService', () => {
  let service: RatesService;
  let prisma: jest.Mocked<PrismaService>;
  let carrierMock = {
    carrierId: 'MOCK',
    capabilities: {
      rates: {
        getRates: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    prisma = {
      rateRequest: { create: jest.fn() },
      rateQuote: { createMany: jest.fn() },
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatesService,
        { provide: PrismaService, useValue: prisma },
        { provide: CARRIERS, useValue: [carrierMock] },
      ],
    }).compile();

    service = module.get<RatesService>(RatesService);
  });

  it('getRates should create a request and call carriers', async () => {
    const dto = { originZip: '11111', destZip: '22222', weightLbs: 10 };
    const sessionId = 'test-session';
    const mockRequest = { id: 'req-1', ...dto };
    const mockQuote = { carrier: 'MOCK', serviceCode: 'S1', totalCharge: 10, currency: 'USD' };

    (prisma.rateRequest.create as jest.Mock).mockResolvedValue(mockRequest);
    (carrierMock.capabilities.rates.getRates as jest.Mock).mockResolvedValue([mockQuote]);

    const result = await service.getRates(dto as any, sessionId);

    expect(prisma.rateRequest.create).toHaveBeenCalled();
    expect(carrierMock.capabilities.rates.getRates).toHaveBeenCalledWith(mockRequest);
    expect(prisma.rateQuote.createMany).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0].serviceCode).toBe('S1');
  });

  it('getRates should filter by service code if provided', async () => {
    const dto = { originZip: '11111', destZip: '22222', weightLbs: 10, serviceCode: 'S1' };
    const mockQuotes = [
      { carrier: 'MOCK', serviceCode: 'S1', totalCharge: 10 },
      { carrier: 'MOCK', serviceCode: 'S2', totalCharge: 20 },
    ];

    (prisma.rateRequest.create as jest.Mock).mockResolvedValue({ id: 'req-1' });
    (carrierMock.capabilities.rates.getRates as jest.Mock).mockResolvedValue(mockQuotes);

    const result = await service.getRates(dto as any, 'sid');

    expect(result).toHaveLength(1);
    expect(result[0].serviceCode).toBe('S1');
  });
});
