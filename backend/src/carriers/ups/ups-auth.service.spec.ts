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
    expect(httpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/token'),
        expect.stringContaining('grant_type=client_credentials'),
        expect.anything()
    );
    expect(prisma.authToken.upsert).toHaveBeenCalled();
  });

  it('Expired token with NO refresh token → Full Login', async () => {
    const expired = new Date(Date.now() - 10000); 
    prisma.authToken.findUnique.mockResolvedValue({ accessToken: 'old', refreshToken: null, expiresAt: expired } as any);
    httpService.post.mockReturnValue(of({ data: { access_token: 'fresh', expires_in: '3600' } }) as any);

    const token = await service.getToken();
    expect(token).toBe('fresh');
    expect(httpService.post).toHaveBeenCalledWith(expect.stringContaining('/token'), expect.anything(), expect.anything());
  });

  it('Expired token WITH refresh token → Refresh Flow', async () => {
    const expired = new Date(Date.now() - 10000); 
    prisma.authToken.findUnique.mockResolvedValue({ accessToken: 'old', refreshToken: 'valid-ref', expiresAt: expired } as any);
    httpService.post.mockReturnValue(of({ data: { access_token: 'refreshed', expires_in: '3600' } }) as any);

    const token = await service.getToken();
    expect(token).toBe('refreshed');
    expect(httpService.post).toHaveBeenCalledWith(
        expect.stringContaining('/refresh'),
        expect.stringContaining('grant_type=refresh_token'),
        expect.anything()
    );
  });

  it('Refresh failure → Fallback to full login', async () => {
    const expired = new Date(Date.now() - 10000); 
    prisma.authToken.findUnique.mockResolvedValue({ accessToken: 'old', refreshToken: 'bad-ref', expiresAt: expired } as any);
    
    // First call (refresh) fails
    httpService.post.mockReturnValueOnce(throwError(() => new Error('Refresh failed')));
    // Second call (full login) succeeds
    httpService.post.mockReturnValueOnce(of({ data: { access_token: 'fallback-token', expires_in: '3600' } }) as any);

    const token = await service.getToken();
    expect(token).toBe('fallback-token');
    expect(httpService.post).toHaveBeenCalledTimes(2);
  });

  it('401 on full login → CarrierError { code: "AUTH_FAILED" }', async () => {
    prisma.authToken.findUnique.mockResolvedValue(null);
    httpService.post.mockReturnValue(throwError(() => ({ response: { status: 401 } })) as any);

    await expect(service.getToken()).rejects.toMatchObject({ code: 'AUTH_FAILED' });
  });
});
