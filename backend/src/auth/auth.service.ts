import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private auditService: AuditService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });

        if (!user) {
            return null;
        }

        if (user.isLocked) {
            await this.auditService.log(user.id, 'LOGIN_LOCKED', 'Attempt to login to locked account');
            throw new ForbiddenException('Account is locked due to too many failed attempts.');
        }

        const isMatch = await bcrypt.compare(pass, user.passwordHash);

        if (isMatch) {
            // Reset failed attempts on success
            if (user.failedLoginAttempts > 0) {
                await this.prisma.user.update({
                    where: { id: user.id },
                    data: { failedLoginAttempts: 0 },
                });
            }
            const { passwordHash, ...result } = user;
            return result;
        } else {
            // Increment failed attempts
            const attempts = user.failedLoginAttempts + 1;
            const isLocked = attempts >= 5;

            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: attempts,
                    isLocked: isLocked
                },
            });

            if (isLocked) {
                await this.auditService.log(user.id, 'ACCOUNT_LOCKED', 'Account locked after 5 failed attempts');
            }

            return null;
        }
    }

    async login(user: any, ip: string, userAgent: string) {
        const payload = { username: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        await this.setCurrentRefreshToken(refreshToken, user.id);
        await this.auditService.log(user.id, 'LOGIN_SUCCESS', 'User logged in successfully', ip, userAgent);

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        };
    }

    async setCurrentRefreshToken(refreshToken: string, userId: string) {
        const salt = await bcrypt.genSalt();
        const currentRefreshToken = await bcrypt.hash(refreshToken, salt);
        await this.prisma.user.update({
            where: { id: userId },
            data: { hashedRefreshToken: currentRefreshToken },
        });
    }

    async refresh(userId: string, refreshToken: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.hashedRefreshToken) {
            throw new ForbiddenException('Access Denied');
        }

        const refreshTokenMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
        if (!refreshTokenMatches) {
            throw new ForbiddenException('Access Denied');
        }

        const payload = { username: user.email, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload);
        const newRefreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

        await this.setCurrentRefreshToken(newRefreshToken, user.id);

        return {
            access_token: accessToken,
            refresh_token: newRefreshToken,
        };
    }

    async logout(userId: string) {
        await this.prisma.user.updateMany({
            where: {
                id: userId,
                hashedRefreshToken: { not: null },
            },
            data: { hashedRefreshToken: null },
        });
    }

    async register(email: string, pass: string, role: UserRole = UserRole.STUDENT) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new BadRequestException('User already exists');
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(pass, salt);

        const user = await this.prisma.user.create({
            data: {
                email,
                passwordHash,
                role,
            },
        });

        await this.auditService.log(user.id, 'USER_REGISTER', 'User registered');
        const { passwordHash: _, ...result } = user;
        return result;
    }
}
