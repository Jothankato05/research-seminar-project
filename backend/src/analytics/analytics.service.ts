import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [totalReports, reportsByType, reportsByPriority, reportsByStatus] = await Promise.all([
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
        ]);

        return {
            totalReports,
            reportsByType: reportsByType.map(item => ({ type: item.type, count: item._count.type })),
            reportsByPriority: reportsByPriority.map(item => ({ priority: item.priority, count: item._count.priority })),
            reportsByStatus: reportsByStatus.map(item => ({ status: item.status, count: item._count.status })),
        };
    }
}
