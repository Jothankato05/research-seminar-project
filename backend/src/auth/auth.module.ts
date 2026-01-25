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

// Load RSA keys from environment variables if available (for cloud), otherwise from files (for local)
let privateKey: string | Buffer = '';
let publicKey: string | Buffer = '';

try {
    if (process.env.JWT_PRIVATE_KEY) {
        console.log('Loading JWT_PRIVATE_KEY from environment...');
        privateKey = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
    } else {
        const keyPath = path.join(process.cwd(), 'secrets', 'private.key');
        console.log(`Checking for private key at: ${keyPath}`);
        if (fs.existsSync(keyPath)) {
            privateKey = fs.readFileSync(keyPath);
            console.log('Loaded private key from filesystem.');
        } else {
            console.warn('Private key not found in environment or filesystem!');
        }
    }

    if (process.env.JWT_PUBLIC_KEY) {
        console.log('Loading JWT_PUBLIC_KEY from environment...');
        publicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
    } else {
        const keyPath = path.join(process.cwd(), 'secrets', 'public.key');
        console.log(`Checking for public key at: ${keyPath}`);
        if (fs.existsSync(keyPath)) {
            publicKey = fs.readFileSync(keyPath);
            console.log('Loaded public key from filesystem.');
        } else {
            console.warn('Public key not found in environment or filesystem!');
        }
    }
} catch (error) {
    console.error('Warning: Failed to load RSA keys. Security endpoints will fail.', error);
}

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
