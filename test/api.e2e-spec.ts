import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth & UserController (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let userId: string;
  const randomEmail = `user${Math.floor(Math.random() * 10000)}@example.com`; // Generate unique email

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  it('should create a new user (POST /users)', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        first_name: 'John',
        last_name: 'Doe',
        email: randomEmail, // Use the generated email
        password: 'StrongPass123!',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    userId = response.body.id;
  });

  it('should login the created user (POST /auth/login)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: randomEmail, // Use the generated email
        password: 'StrongPass123!',
      })
      .expect(200);

    expect(response.body).toHaveProperty('access_token');
    token = response.body.access_token;
  });

  it('should deny access to protected route without token (GET /users)', async () => {
    await request(app.getHttpServer()).get('/users').expect(401);
  });

  it('should fetch users when authenticated (GET /users)', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
  });

  it('should update user details (PATCH /users/:id)', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        first_name: 'Johnny',
      })
      .expect(200);

    expect(response.body.first_name).toBe('Johnny');
  });

  it('should soft delete the user (DELETE /users/:id/soft)', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${userId}/soft`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
