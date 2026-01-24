import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    UseGuards,
    Request,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportStatusDto } from './dto/update-report-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateVoteDto } from './dto/create-vote.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, ReportStatus } from '@prisma/client';
import { Throttle } from '@nestjs/throttler';

// Allowed file types for evidence
const ALLOWED_FILE_TYPES = /\.(jpg|jpeg|png|gif|pdf|doc|docx|txt|log|json|csv)$/i;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Post()
    @UseGuards(AuthGuard('jwt'))
    @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 reports per minute
    async create(@Body() createReportDto: CreateReportDto, @Request() req: any) {
        return this.reportsService.create(createReportDto, req.user.userId);
    }

    @Get()
    async findAll(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: ReportStatus,
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.reportsService.findAll(pageNum, Math.min(limitNum, 100), status);
    }

    /**
     * Get reports submitted by the current user (for Staff/Student)
     * This endpoint enforces role-based visibility - users only see their own reports
     */
    @Get('my')
    @UseGuards(AuthGuard('jwt'))
    async findMyReports(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: ReportStatus,
        @Request() req?: any,
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.reportsService.findMyReports(req.user.userId, pageNum, Math.min(limitNum, 100), status);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.reportsService.findOne(id);
    }

    @Patch(':id/status')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SECURITY, UserRole.STAFF)
    async updateStatus(
        @Param('id') id: string,
        @Body() updateDto: UpdateReportStatusDto,
        @Request() req: any,
    ) {
        return this.reportsService.updateStatus(id, updateDto, req.user.userId, req.user.role);
    }

    @Post(':id/evidence')
    @UseGuards(AuthGuard('jwt'))
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/evidence',
                filename: (req, file, callback) => {
                    const uniqueSuffix = uuidv4();
                    const ext = extname(file.originalname);
                    callback(null, `${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!ALLOWED_FILE_TYPES.test(file.originalname)) {
                    return callback(new BadRequestException('Invalid file type'), false);
                }
                callback(null, true);
            },
            limits: {
                fileSize: MAX_FILE_SIZE,
            },
        }),
    )
    @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 uploads per minute
    async uploadEvidence(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Request() req: any,
    ) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        return this.reportsService.addEvidence(
            id,
            `/uploads/evidence/${file.filename}`,
            file.mimetype,
            file.size,
            req.user.userId,
        );
    }

    @Post(':id/comments')
    @UseGuards(AuthGuard('jwt'))
    @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 comments per minute
    async addComment(
        @Param('id') id: string,
        @Body() createCommentDto: CreateCommentDto,
        @Request() req: any,
    ) {
        return this.reportsService.addComment(id, createCommentDto, req.user.userId);
    }

    @Post(':id/vote')
    @UseGuards(AuthGuard('jwt'))
    @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 votes per minute
    async vote(
        @Param('id') id: string,
        @Body() createVoteDto: CreateVoteDto,
        @Request() req: any,
    ) {
        return this.reportsService.vote(id, createVoteDto, req.user.userId);
    }
}
