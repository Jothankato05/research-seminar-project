import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
    constructor(private readonly adminService: AdminService) { }

    @Get('users')
    async getUsers() {
        return this.adminService.getUsers();
    }

    @Patch('users/:id/lock')
    async toggleLock(@Param('id') id: string, @Request() req: any) {
        return this.adminService.toggleLock(id, req.user.userId);
    }

    @Get('audit-logs')
    async getAuditLogs() {
        return this.adminService.getAuditLogs();
    }
}
