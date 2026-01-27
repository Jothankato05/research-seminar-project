import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const total = await prisma.report.count();
    const byStatus = await prisma.report.groupBy({
        by: ['status'],
        _count: true
    });
    const reports = await prisma.report.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { instance: true }
    });
    console.log(JSON.stringify({ total, byStatus, reports }, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
