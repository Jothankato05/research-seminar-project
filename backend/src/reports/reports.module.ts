import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

import { ReportsGateway } from './reports.gateway';

@Module({
    controllers: [ReportsController],
    providers: [ReportsService, PrismaService, AuditService, ReportsGateway],
    exports: [ReportsService],
})
export class ReportsModule { }
