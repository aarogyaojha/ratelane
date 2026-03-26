import { Test, TestingModule } from '@nestjs/testing';
import { UpsAuthService } from './ups-auth.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CarrierError } from '../../common/errors/carrier-error';
import { of, throwError } from 'rxjs';

describe('UpsAuthService', () => {
  let service: UpsAuthService;
  let httpService: jest.Mocked<HttpService>;
  let prisma: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    httpService = { post: jest.fn() } as any;
    prisma = { authToken: { findUnique: jest.fn(), upsert: jest.fn() } } as any;
    const configService = { get: jest.fn((k) => k) } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpsAuthService,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<UpsAuthService>(UpsAuthService);
  });

  it('Token acquired on first call, reused on second', async () => {
    prisma.authToken.findUnique.mockResolvedValue(null);
    httpService.post.mockReturnValue(of({ data: { access_token: 'new_token', expires_in: '3600' } }) as any);

    const token = await service.getToken();
    expect(token).toBe('new_token');
    expect(httpService.post).toHaveBeenCalledTimes(1);
    expect(prisma.authToken.upsert).toHaveBeenCalled();
  });

  it('Expired token triggers transparent refresh', async () => {
    const expired = new Date(Date.now() - 10000); 
    prisma.authToken.findUnique.mockResolvedValue({ accessToken: 'old_token', expiresAt: expired } as any);
    httpService.post.mockReturnValue(of({ data: { access_token: 'fresh_token', expires_in: '3600' } }) as any);

    const token = await service.getToken();
    expect(token).toBe('fresh_token');
    expect(httpService.post).toHaveBeenCalledTimes(1);
  });

  it('401 → CarrierError { code: "AUTH_FAILED" }', async () => {
    prisma.authToken.findUnique.mockResolvedValue(null);
    httpService.post.mockReturnValue(throwError(() => ({ response: { status: 401 } })) as any);

    await expect(service.getToken()).rejects.toMatchObject({ code: 'AUTH_FAILED' });
  });
  
  it('Network timeout → CarrierError { code: "TIMEOUT" }', async () => {
    prisma.authToken.findUnique.mockResolvedValue(null);
    httpService.post.mockReturnValue(throwError(() => ({ code: 'ECONNABORTED' })) as any);

    await expect(service.getToken()).rejects.toMatchObject({ code: 'TIMEOUT' });
  });
});
