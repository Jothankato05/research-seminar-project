import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChatbotService } from './chatbot.service';
import { ChatbotController } from './chatbot.controller';
import { PrismaService } from '../prisma.service';
import { AuditService } from '../audit/audit.service';

@Module({
    imports: [ConfigModule],
    providers: [ChatbotService, PrismaService, AuditService],
    controllers: [ChatbotController],
})
export class ChatbotModule { }
