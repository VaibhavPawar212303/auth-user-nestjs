// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.modules';


@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig()),
    UsersModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
