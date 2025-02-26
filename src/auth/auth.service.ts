import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
// import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateJwt(user);
    return { access_token: token };
  }

  // async register(registerDto: RegisterDto): Promise<User> {
  //   const existingUser = await this.userService.findByEmail(registerDto.email);
  //   if (existingUser) {
  //     throw new ConflictException('User with this email already exists');
  //   }

  //   return await this.userService.create(registerDto);
  // }

  generateJwt(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' }
    );
  }
}
