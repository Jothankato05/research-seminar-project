import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [totalReports, reportsByType, reportsByPriority, reportsByStatus, trendData] = await Promise.all([
            this.prisma.report.count(),
            this.prisma.report.groupBy({
                by: ['type'],
                _count: {
                    type: true,
                },
            }),
            this.prisma.report.groupBy({
                by: ['priority'],
                _count: {
                    priority: true,
                },
            }),
            this.prisma.report.groupBy({
                by: ['status'],
                _count: {
                    status: true,
                },
            }),
            this.prisma.report.findMany({
                where: {
                    createdAt: {
                        gte: thirtyDaysAgo,
                    },
                },
                select: {
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'asc',
                },
            }),
        ]);

        // Process trend data into daily counts
        const dailyCounts: Record<string, number> = {};
        trendData.forEach(report => {
            const date = report.createdAt.toISOString().split('T')[0];
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        const trend = Object.entries(dailyCounts).map(([date, count]) => ({
            date,
            count,
        }));

        return {
            totalReports,
            reportsByType: reportsByType.map(item => ({ type: item.type, count: item._count.type })),
            reportsByPriority: reportsByPriority.map(item => ({ priority: item.priority, count: item._count.priority })),
            reportsByStatus: reportsByStatus.map(item => ({ status: item.status, count: item._count.status })),
            trend,
        };
    }
}
