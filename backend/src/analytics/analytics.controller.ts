import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SECURITY, UserRole.STAFF)
export class AnalyticsController {
    constructor(private readonly analyticsService: AnalyticsService) { }

    @Get()
    async getStats() {
        return this.analyticsService.getStats();
    }
}
