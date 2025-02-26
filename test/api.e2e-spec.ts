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
    // Log the email and password used for login (be cautious with sensitive data)
    console.log('Logging in with email:', randomEmail);
    
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: randomEmail, // Use the generated email
        password: 'StrongPass123!',
      })
      .expect(201); // Expecting a 200 status code
  
    // Log the response status code and body for debugging
    console.log('Response Status Code:', response.status);
    console.log('Response Body:', JSON.stringify(response.body, null, 2));
  
    // Check if the response contains the access token and log it
    if (response.body && response.body.access_token) {
      console.log('Access Token:', response.body.access_token);
    } else {
      console.error('No access token found in response!');
    }
  
    // Validate the response contains the access token
    expect(response.body).toHaveProperty('access_token');
    
    // Store the access token for further tests
    token = response.body.access_token;
  });
  
  it('should deny access to protected route without token (GET /users)', async () => {
    await request(app.getHttpServer()).get('/users').expect(403);
  });

  it('should fetch users when authenticated (GET /users)', async () => {
    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body).toBeInstanceOf(Array);
  });

  it('should update user details (PATCH /users/:id)', async () => {
    // Log the userId and the token being used for the request
    console.log('Updating user details for user ID:', userId);
    console.log('Using token for authorization:', token);
    // Send the PATCH request to update user details
    const response = await request(app.getHttpServer())
      .patch(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        first_name: 'Johnny',
      })
      .expect(200); // Expect a 200 status code on success
    // Log the response status code and body
    console.log('Response Status Code:', response.status);
    console.log('Response Body:', JSON.stringify(response.body, null, 2));
    // Log the updated first name (this is the expected result)
    if (response.body && response.body.first_name) {
      console.log('Updated First Name:', response.body.first_name);
    } else {
      console.error('Failed to update the first name!');
    }
    // Validate that the response body contains the updated first name
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
