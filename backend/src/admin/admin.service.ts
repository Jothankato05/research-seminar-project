import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
    ) { }

    async getUsers() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                isLocked: true,
                failedLoginAttempts: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async toggleLock(userId: string, adminId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const newStatus = !user.isLocked;
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { isLocked: newStatus, failedLoginAttempts: newStatus ? user.failedLoginAttempts : 0 },
        });

        await this.auditService.log(
            adminId,
            'USER_LOCK_TOGGLE',
            `User ${user.email} ${newStatus ? 'locked' : 'unlocked'} by admin`
        );

        return updatedUser;
    }

    async getAuditLogs(limit: number = 100) {
        return this.prisma.auditLog.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { email: true, role: true },
                },
            },
        });
    }
}
