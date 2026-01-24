import {
    Controller,
    Post,
    Body,
    Req,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { ChatbotService } from './chatbot.service';
import { IsString, IsNotEmpty } from 'class-validator';

class ChatRequestDto {
    @IsString()
    @IsNotEmpty()
    query!: string;
}

import { Throttle } from '@nestjs/throttler';

@Controller('chat')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ChatbotController {
    constructor(private readonly service: ChatbotService) { }

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SECURITY, UserRole.STAFF, UserRole.STUDENT)
    @HttpCode(HttpStatus.OK)
    async chat(@Req() req: any, @Body() body: ChatRequestDto) {
        const user = req.user;
        const answer = await this.service.answer(user.userId, user.role, body.query);
        return { answer };
    }
}
