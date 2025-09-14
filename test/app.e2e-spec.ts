import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableCors();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/urls/fetch (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/urls/fetch')
      .send({
        urls: ['https://httpbin.org/json', 'https://httpbin.org/xml'],
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.message).toBeDefined();
        expect(res.body.results).toBeDefined();
        expect(Array.isArray(res.body.results)).toBe(true);
      });
  });

  it('/api/urls (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/urls')
      .expect(200)
      .expect((res) => {
        expect(res.body.results).toBeDefined();
        expect(res.body.summary).toBeDefined();
        expect(Array.isArray(res.body.results)).toBe(true);
      });
  });

  it('/api/urls/status (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/urls/status')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('running');
        expect(res.body.timestamp).toBeDefined();
        expect(res.body.summary).toBeDefined();
      });
  });
});
