import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';  


@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET, 
      signOptions: { expiresIn: process.env.JWT_EXPIRATION_TIME }, 
    }),
    UsersModule,
  ],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule { }
