import { PrismaClient, UserRole, ReportType, ReportStatus, ReportPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash('Admin123!', salt);

    // 1. Create Users
    console.log(' Creating users...');

    // Admin
    const adminEmail = 'admin@veritas.edu';
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            passwordHash,
            role: UserRole.ADMIN,
        },
    });

    // Security Analyst
    const analystEmail = 'analyst@veritas.edu';
    const analyst = await prisma.user.upsert({
        where: { email: analystEmail },
        update: {},
        create: {
            email: analystEmail,
            passwordHash,
            role: UserRole.SECURITY,
        },
    });

    // Staff
    const staffEmail = 'staff@veritas.edu';
    const staff = await prisma.user.upsert({
        where: { email: staffEmail },
        update: {},
        create: {
            email: staffEmail,
            passwordHash,
            role: UserRole.STAFF,
        },
    });

    // Student
    const studentEmail = 'student@veritas.edu';
    const student = await prisma.user.upsert({
        where: { email: studentEmail },
        update: {},
        create: {
            email: studentEmail,
            passwordHash,
            role: UserRole.STUDENT,
        },
    });

    // 2. Create Reports
    console.log(' creating reports...');

    // Clean up existing reports to avoid duplicates if re-running without reset
    // await prisma.report.deleteMany(); 

    const reportsData = [
        {
            title: 'Urgent: Reset your password immediately phishing email',
            description: 'Received a suspicious email claiming to be from IT asking for my password. The link goes to verify-veritas-secure.com.',
            type: ReportType.PHISHING,
            status: ReportStatus.OPEN,
            priority: ReportPriority.HIGH,
            isAnonymous: false,
            authorId: student.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
            title: 'Library Computer 14 acting strangely',
            description: 'The computer in the library keeps popping up ads and is very slow. I think it has a virus.',
            type: ReportType.MALWARE,
            status: ReportStatus.INVESTIGATING,
            priority: ReportPriority.MEDIUM,
            isAnonymous: true,
            authorId: null,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        },
        {
            title: 'Bullying on student forum',
            description: 'There are several posts targeting a specific student group on the unofficial forum.',
            type: ReportType.HARASSMENT,
            status: ReportStatus.RESOLVED,
            priority: ReportPriority.HIGH,
            isAnonymous: false,
            authorId: student.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        },
        {
            title: 'Found USB drive in parking lot',
            description: 'I found a USB drive labeled "Confidential" in the parking lot. I have not plugged it in.',
            type: ReportType.OTHER,
            status: ReportStatus.OPEN,
            priority: ReportPriority.LOW,
            isAnonymous: false,
            authorId: staff.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        },
        {
            title: 'Possible Data Leak in Registrar Office',
            description: 'I saw a file with student grades left on a communal printer for 3 hours.',
            type: ReportType.DATA_LEAK,
            status: ReportStatus.INVESTIGATING,
            priority: ReportPriority.CRITICAL,
            isAnonymous: true,
            authorId: null,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        },
        {
            title: 'Ransomware message on Lab PC',
            description: 'Screen turned red and asked for Bitcoin.',
            type: ReportType.MALWARE,
            status: ReportStatus.RESOLVED,
            priority: ReportPriority.CRITICAL,
            isAnonymous: false,
            authorId: staff.id,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
        }
    ];

    for (const report of reportsData) {
        // Upsert based on title to avoid dupes if run multiple times
        // Note: Title isn't unique in schema, but for seeding it's fine to check existence
        const existing = await prisma.report.findFirst({ where: { title: report.title } });
        if (!existing) {
            await prisma.report.create({ data: report });
        }
    }

    console.log('✅ Seed completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
