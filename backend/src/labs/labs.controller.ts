import { Controller, Post, Get, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { LabsService } from './labs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('labs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LabsController {
    constructor(private readonly labsService: LabsService) { }

    @Post('spawn/:reportId')
    @Roles(UserRole.ADMIN, UserRole.SECURITY, UserRole.STAFF)
    async spawn(@Param('reportId') reportId: string, @Req() req: any) {
        return this.labsService.spawnInstance(reportId, req.user.id);
    }

    @Get('my')
    async getMyInstances(@Req() req: any) {
        return this.labsService.getUserInstances(req.user.id);
    }

    @Get(':id')
    async getInstance(@Param('id') id: string) {
        return this.labsService.getInstance(id);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SECURITY, UserRole.STAFF)
    async terminate(@Param('id') id: string) {
        return this.labsService.terminateInstance(id);
    }
}
