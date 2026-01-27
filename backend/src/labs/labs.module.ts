import { Module } from '@nestjs/common';
import { LabsController } from './labs.controller';
import { LabsService } from './labs.service';
import { PrismaService } from '../prisma.service';

@Module({
    controllers: [LabsController],
    providers: [LabsService, PrismaService],
    exports: [LabsService],
})
export class LabsModule { }
