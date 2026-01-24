import { Controller, Get, Post, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { Throttle } from '@nestjs/throttler';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @Throttle({ default: { limit: 30, ttl: 60000 } })
    async findAll(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return this.notificationsService.findAllForUser(
            req.user.userId,
            pageNum,
            Math.min(limitNum, 50)
        );
    }

    @Get('unread-count')
    @Throttle({ default: { limit: 60, ttl: 60000 } })
    async getUnreadCount(@Request() req: any) {
        return this.notificationsService.getUnreadCount(req.user.userId);
    }

    @Patch(':id/read')
    @Throttle({ default: { limit: 30, ttl: 60000 } })
    async markAsRead(@Param('id') id: string, @Request() req: any) {
        return this.notificationsService.markAsRead(req.user.userId, id);
    }

    @Post('mark-all-read')
    @Throttle({ default: { limit: 10, ttl: 60000 } })
    async markAllAsRead(@Request() req: any) {
        return this.notificationsService.markAllAsRead(req.user.userId);
    }
}
