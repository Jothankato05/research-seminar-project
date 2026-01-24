import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';
import * as fs from 'fs';
import * as path from 'path';

const privateKey = fs.readFileSync(path.join(process.cwd(), 'secrets', 'private.key'));
const publicKey = fs.readFileSync(path.join(process.cwd(), 'secrets', 'public.key'));

@Module({
    imports: [
        PassportModule,
        JwtModule.register({
            privateKey: privateKey,
            publicKey: publicKey,
            signOptions: { expiresIn: '15m', algorithm: 'RS256' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, PrismaService, AuditService],
    exports: [AuthService],
})
export class AuthModule { }
