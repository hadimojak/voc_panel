import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RefreshStrategy } from './refresh.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [JwtModule.register({}), UserModule],
  providers: [AuthService, JwtStrategy, RefreshStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
