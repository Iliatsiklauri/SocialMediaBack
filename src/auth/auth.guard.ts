import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class authGuard implements CanActivate {
  constructor(private JwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = getToken(request);
    if (!token) throw new UnauthorizedException();
    try {
      const user = await this.JwtService.verifyAsync(token);
      request.user = {
        email: user.email,
        id: user.id,
      };
    } catch (err) {
      throw new UnauthorizedException();
    }
    return true;
  }
}

function getToken(req) {
  if (!req.headers['authorization']) return null;
  const token = req.headers['authorization'];
  return token;
}
