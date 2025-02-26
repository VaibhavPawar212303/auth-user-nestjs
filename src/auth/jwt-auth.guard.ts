import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(private jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    this.logger.log(`Incoming Request: ${request.method} ${request.url}`); 
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.logger.warn('Authorization header missing or invalid');
      return false;
    }
    const token = authHeader.split(' ')[1];
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      request.user = decoded;
      return true;
    } catch (error) {
      this.logger.error(`JWT Verification Failed: ${error.message}`); // 🔹 Log JWT error
      return false;
    }
  }
}
