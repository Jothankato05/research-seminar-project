import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { InstanceStatus } from '@prisma/client';

@Injectable()
export class LabsService {
    constructor(private prisma: PrismaService) { }

    async spawnInstance(reportId: string, userId: string) {
        // Check if report exists
        const report = await this.prisma.report.findUnique({
            where: { id: reportId },
            include: { instance: true }
        });

        if (!report) {
            throw new NotFoundException('Incident report not found');
        }

        if (report.instance && report.instance.status !== InstanceStatus.TERMINATED) {
            throw new BadRequestException('An investigation instance is already active for this report');
        }

        // Generate random mock data
        const labName = `vuln-lab-${report.title.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}`;
        const mockIp = `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
        const mockSsh = `ssh analyst@${mockIp} -p 2222`;

        // Create Instance record
        const instance = await this.prisma.investigationInstance.create({
            data: {
                name: labName,
                targetIp: mockIp,
                sshCommand: mockSsh,
                status: InstanceStatus.PROVISIONING,
                reportId: reportId,
                creatorId: userId,
            }
        });

        // Simulate provisioning delay (don't await, just let it update in background)
        setTimeout(async () => {
            try {
                await this.prisma.investigationInstance.update({
                    where: { id: instance.id },
                    data: { status: InstanceStatus.RUNNING }
                });
            } catch (e) {
                console.error('Failed to update instance status', e);
            }
        }, 15000); // 15 seconds simulation

        return instance;
    }

    async getInstance(id: string) {
        const instance = await this.prisma.investigationInstance.findUnique({
            where: { id },
            include: { report: true }
        });

        if (!instance) throw new NotFoundException('Instance not found');
        return instance;
    }

    async getUserInstances(userId: string) {
        return this.prisma.investigationInstance.findMany({
            where: { creatorId: userId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async terminateInstance(id: string) {
        return this.prisma.investigationInstance.update({
            where: { id },
            data: { status: InstanceStatus.TERMINATED }
        });
    }
}
