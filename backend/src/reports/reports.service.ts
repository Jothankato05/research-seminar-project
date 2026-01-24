import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateVoteDto } from './dto/create-vote.dto';
import { UserRole, ReportStatus } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ReportsService {
    constructor(
        private prisma: PrismaService,
        private auditService: AuditService,
    ) { }

    async create(createReportDto: CreateReportDto, userId: string) {
        const report = await this.prisma.report.create({
            data: {
                title: createReportDto.title,
                description: createReportDto.description,
                type: createReportDto.type,
                priority: createReportDto.priority,
                isAnonymous: createReportDto.isAnonymous ?? false,
                authorId: createReportDto.isAnonymous ? null : userId,
            },
        });

        await this.auditService.log(userId, 'REPORT_CREATED', `Report ${report.id} created`);
        return report;
    }

    async findAll(page: number = 1, limit: number = 10, status?: ReportStatus) {
        const skip = (page - 1) * limit;
        const where = status ? { status } : {};

        const [reports, total] = await Promise.all([
            this.prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: { id: true, email: true, role: true },
                    },
                    _count: {
                        select: { comments: true, votes: true, evidence: true },
                    },
                },
            }),
            this.prisma.report.count({ where }),
        ]);

        // Sanitize anonymous reports
        const sanitizedReports = reports.map(report => {
            if (report.isAnonymous) {
                return { ...report, author: null, authorId: null };
            }
            return report;
        });

        return {
            data: sanitizedReports,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Find reports submitted by a specific user (for Staff/Student role-based visibility)
     */
    async findMyReports(userId: string, page: number = 1, limit: number = 10, status?: ReportStatus) {
        const skip = (page - 1) * limit;
        const where: any = { authorId: userId };
        if (status) {
            where.status = status;
        }

        const [reports, total] = await Promise.all([
            this.prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { comments: true, votes: true, evidence: true },
                    },
                },
            }),
            this.prisma.report.count({ where }),
        ]);

        return {
            data: reports,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const report = await this.prisma.report.findUnique({
            where: { id },
            include: {
                author: {
                    select: { id: true, email: true, role: true },
                },
                evidence: true,
                comments: {
                    include: {
                        author: {
                            select: { id: true, email: true, role: true },
                        },
                    },
                    orderBy: { createdAt: 'asc' },
                },
                votes: true,
            },
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        // Sanitize anonymous reports
        if (report.isAnonymous) {
            return { ...report, author: null, authorId: null };
        }

        return report;
    }

    async updateStatus(id: string, updateDto: UpdateReportStatusDto, userId: string, userRole: UserRole) {
        // Only ADMIN, SECURITY, or STAFF can update status
        const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.SECURITY, UserRole.STAFF];
        if (!allowedRoles.includes(userRole)) {
            throw new ForbiddenException('You do not have permission to update report status');
        }

        const report = await this.prisma.report.findUnique({ where: { id } });
        if (!report) {
            throw new NotFoundException('Report not found');
        }

        const updatedReport = await this.prisma.report.update({
            where: { id },
            data: { status: updateDto.status },
        });

        await this.auditService.log(userId, 'REPORT_STATUS_UPDATED', `Report ${id} status changed to ${updateDto.status}`);
        return updatedReport;
    }

    async addComment(reportId: string, createCommentDto: CreateCommentDto, userId: string) {
        const report = await this.prisma.report.findUnique({ where: { id: reportId } });
        if (!report) {
            throw new NotFoundException('Report not found');
        }

        const comment = await this.prisma.comment.create({
            data: {
                content: createCommentDto.content,
                reportId,
                authorId: userId,
            },
            include: {
                author: {
                    select: { id: true, email: true, role: true },
                },
            },
        });

        return comment;
    }

    async vote(reportId: string, createVoteDto: CreateVoteDto, userId: string) {
        const report = await this.prisma.report.findUnique({ where: { id: reportId } });
        if (!report) {
            throw new NotFoundException('Report not found');
        }

        // Upsert: create or update vote
        const vote = await this.prisma.vote.upsert({
            where: {
                reportId_userId: {
                    reportId,
                    userId,
                },
            },
            update: {
                value: createVoteDto.value,
            },
            create: {
                reportId,
                userId,
                value: createVoteDto.value,
            },
        });

        return vote;
    }

    async addEvidence(reportId: string, fileUrl: string, fileType: string, fileSize: number, userId: string) {
        const report = await this.prisma.report.findUnique({ where: { id: reportId } });
        if (!report) {
            throw new NotFoundException('Report not found');
        }

        const evidence = await this.prisma.evidence.create({
            data: {
                reportId,
                fileUrl,
                fileType,
                fileSize,
            },
        });

        await this.auditService.log(userId, 'EVIDENCE_UPLOADED', `Evidence added to report ${reportId}`);
        return evidence;
    }
}
