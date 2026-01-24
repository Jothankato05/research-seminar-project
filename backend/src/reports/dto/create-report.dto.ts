import { IsString, IsEnum, IsBoolean, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ReportType, ReportPriority } from '@prisma/client';

export class CreateReportDto {
    @IsString()
    @MinLength(5)
    @MaxLength(200)
    title!: string;

    @IsString()
    @MinLength(20)
    @MaxLength(5000)
    description!: string;

    @IsEnum(ReportType)
    type!: ReportType;

    @IsOptional()
    @IsEnum(ReportPriority)
    priority?: ReportPriority;

    @IsOptional()
    @IsBoolean()
    isAnonymous?: boolean;
}
