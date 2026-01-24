import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuditService {
    constructor(private prisma: PrismaService) { }

    async log(userId: string | null, action: string, details?: string, ip?: string, ua?: string) {
        await this.prisma.auditLog.create({
            data: {
                userId,
                action,
                details,
                ipAddress: ip,
                userAgent: ua,
            },
        });
    }
}
