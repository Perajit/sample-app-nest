import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import jwtConfig from 'src/config/jwt.config';
import { UsersModule } from 'src/modules/users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Session } from './entities/session.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      useFactory: (jwtConfigValues: ConfigType<typeof jwtConfig>) =>
        ({
          secret: jwtConfigValues.accessSecret,
          signOptions: {
            expiresIn: jwtConfigValues.accessExpiresIn,
          },
        }) as JwtModuleOptions,
    }),
    TypeOrmModule.forFeature([Session]),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
