import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { CarrierError } from '../../common/errors/carrier-error';
import { lastValueFrom } from 'rxjs';

const TOKEN_EXPIRY_THRESHOLD_MS = 60000; // 60 seconds safety margin
const UPS_AUTH_TIMEOUT_MS = 10000;

@Injectable()
export class UpsAuthService {
  private readonly logger = new Logger(UpsAuthService.name);
  private readonly CARRIER_ID = 'UPS';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Retrieves a valid OAuth token, either from cache, via refresh flow, or fresh acquisition.
   */
  async getToken(): Promise<string> {
    const existing = await this.prisma.authToken.findUnique({
      where: { carrier: this.CARRIER_ID },
    });

    // Case 1: Token exists and is still valid (with safety margin)
    if (existing && existing.expiresAt > new Date(Date.now() + TOKEN_EXPIRY_THRESHOLD_MS)) {
      return existing.accessToken;
    }

    // Case 2: Try refreshing if we have a refresh token
    if (existing?.refreshToken) {
      try {
        return await this.useRefreshToken(existing.refreshToken);
      } catch (err) {
        this.logger.warn('UPS Refresh token failed or expired, falling back to full login');
      }
    }

    // Case 3: Fresh login via client_credentials
    return this.acquireToken();
  }

  private async useRefreshToken(refreshToken: string): Promise<string> {
    this.logger.debug('Refreshing UPS OAuth token using /refresh endpoint...');
    const baseUrl = this.configService.get<string>('UPS_BASE_URL');
    const credentials = this.getBasicAuthHeader();

    const response = await lastValueFrom(
      this.httpService.post(
        `${baseUrl}/security/v1/oauth/refresh`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
          timeout: UPS_AUTH_TIMEOUT_MS,
        },
      ),
    );

    return this.saveTokenResponse(response.data);
  }

  private async acquireToken(): Promise<string> {
    this.logger.debug('Acquiring new UPS OAuth token using /token endpoint...');
    const baseUrl = this.configService.get<string>('UPS_BASE_URL');
    const credentials = this.getBasicAuthHeader();

    try {
      const response = await lastValueFrom(
        this.httpService.post(
          `${baseUrl}/security/v1/oauth/token`,
          new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${credentials}`,
            },
            timeout: UPS_AUTH_TIMEOUT_MS,
          },
        ),
      );

      return this.saveTokenResponse(response.data);
    } catch (error: any) {
      this.handleAuthError(error);
    }
  }

  private getBasicAuthHeader(): string {
    const clientId = this.configService.get<string>('UPS_CLIENT_ID');
    const clientSecret = this.configService.get<string>('UPS_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      throw new CarrierError(this.CARRIER_ID, 'AUTH_FAILED', 'Missing UPS credentials in configuration');
    }

    return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  }

  private async saveTokenResponse(data: any): Promise<string> {
    const token = data.access_token;
    const refreshToken = data.refresh_token || null;
    const expiresInSeconds = parseInt(data.expires_in, 10);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    // Persist to DB for reuse across instances
    await this.prisma.authToken.upsert({
      where: { carrier: this.CARRIER_ID },
      update: {
        accessToken: token,
        refreshToken: refreshToken,
        expiresAt,
      },
      create: {
        carrier: this.CARRIER_ID,
        accessToken: token,
        refreshToken: refreshToken,
        expiresAt,
      },
    });

    return token;
  }

  private handleAuthError(error: any): never {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      throw new CarrierError(this.CARRIER_ID, 'AUTH_FAILED', 'Invalid UPS credentials', status, error.response?.data);
    }
    if (status === 429) {
      throw new CarrierError(this.CARRIER_ID, 'RATE_LIMITED', 'UPS API rate limited', status, error.response?.data);
    }
    if (error.code === 'ECONNABORTED') {
      throw new CarrierError(this.CARRIER_ID, 'TIMEOUT', 'UPS auth request timed out');
    }
    
    this.logger.error(`UPS Auth failed: ${error.message}`, error.stack);
    throw new CarrierError(this.CARRIER_ID, 'SERVER_ERROR', 'Failed to get UPS token', status, error.response?.data);
  }
}
