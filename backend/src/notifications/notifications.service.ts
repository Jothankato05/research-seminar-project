import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class NotificationsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, title: string, message: string) {
        return this.prisma.notification.create({
            data: {
                userId,
                title,
                message,
            },
        });
    }

    async createForRole(role: UserRole, title: string, message: string) {
        const users = await this.prisma.user.findMany({
            where: { role },
            select: { id: true },
        });

        const notifications = await this.prisma.notification.createMany({
            data: users.map(user => ({
                userId: user.id,
                title,
                message,
            })),
        });

        return { count: notifications.count };
    }

    async createForAllStaff(title: string, message: string) {
        const staffRoles: UserRole[] = [UserRole.ADMIN, UserRole.SECURITY, UserRole.STAFF];

        const users = await this.prisma.user.findMany({
            where: { role: { in: staffRoles } },
            select: { id: true },
        });

        const notifications = await this.prisma.notification.createMany({
            data: users.map(user => ({
                userId: user.id,
                title,
                message,
            })),
        });

        return { count: notifications.count };
    }

    async findAllForUser(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;

        const [notifications, total, unreadCount] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
            this.prisma.notification.count({ where: { userId, isRead: false } }),
        ]);

        return {
            data: notifications,
            meta: {
                total,
                unreadCount,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async markAsRead(userId: string, notificationId: string) {
        return this.prisma.notification.updateMany({
            where: {
                id: notificationId,
                userId, // Ensure user owns the notification
            },
            data: { isRead: true },
        });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notification.updateMany({
            where: {
                userId,
                isRead: false,
            },
            data: { isRead: true },
        });
    }

    async getUnreadCount(userId: string) {
        const count = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { unreadCount: count };
    }

    // Event-based notifications
    async notifyNewReport(reportId: string, reportTitle: string) {
        return this.createForAllStaff(
            'New Threat Report',
            `A new threat report "${reportTitle}" has been submitted and requires attention.`
        );
    }

    async notifyStatusChange(reportId: string, reportTitle: string, newStatus: string, authorId: string | null) {
        if (authorId) {
            return this.create(
                authorId,
                'Report Status Updated',
                `Your report "${reportTitle}" has been updated to: ${newStatus}`
            );
        }
        return null;
    }

    async notifyCriticalReport(reportId: string, reportTitle: string) {
        return this.createForRole(
            UserRole.SECURITY,
            'Critical Threat Report',
            `A CRITICAL threat report "${reportTitle}" requires immediate attention.`
        );
    }
}
