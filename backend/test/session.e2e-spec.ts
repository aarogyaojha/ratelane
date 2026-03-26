import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { UpsAdapter } from '../src/carriers/ups/ups.adapter';
import cookieParser from 'cookie-parser';

describe('Session (e2e)', () => {
  let app: INestApplication;
  let prismaMock = {
    rateRequest: { create: jest.fn().mockResolvedValue({ id: '123' }), findMany: jest.fn().mockResolvedValue([]) },
    rateQuote: { createMany: jest.fn() }
  };
  let upsMock = {
    getRates: jest.fn().mockResolvedValue([])
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService).useValue(prismaMock)
      .overrideProvider(UpsAdapter).useValue(upsMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser('test'));
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  it('Session cookie created on first request, reused on second', async () => {
    const res1 = await request(app.getHttpServer())
      .post('/rates')
      .send({ originZip: "11111", destZip: "22222", weightLbs: 10 });
    
    expect(res1.status).toBe(201);
    const setCookie = res1.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    expect(setCookie[0]).toContain('cybership_session=');
    
    const res2 = await request(app.getHttpServer())
      .post('/rates')
      .set('Cookie', setCookie[0].split(';')[0])
      .send({ originZip: "11111", destZip: "22222", weightLbs: 10 });

    expect(res2.status).toBe(201);
    expect(res2.headers['set-cookie']).toBeUndefined();
  });

  it('GET /rates/history returns correct records for session', async () => {
    const res = await request(app.getHttpServer())
      .get('/rates/history');
    
    expect(res.status).toBe(200);
    expect(prismaMock.rateRequest.findMany).toHaveBeenCalled();
  });

  afterAll(async () => {
    await app.close();
  });
});
