import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding demo users...\n');

    const password = 'Password123!';
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const users = [
        { email: 'student@veritas.edu', role: UserRole.STUDENT },
        { email: 'staff@veritas.edu', role: UserRole.STAFF },
        { email: 'security@veritas.edu', role: UserRole.SECURITY },
        { email: 'admin@veritas.edu', role: UserRole.ADMIN },
    ];

    for (const user of users) {
        const existing = await prisma.user.findUnique({ where: { email: user.email } });
        if (existing) {
            // Update role if user exists
            await prisma.user.update({
                where: { email: user.email },
                data: { role: user.role, isLocked: false, failedLoginAttempts: 0 },
            });
            console.log(`✅ Updated: ${user.email} (${user.role})`);
        } else {
            await prisma.user.create({
                data: {
                    email: user.email,
                    passwordHash,
                    role: user.role,
                },
            });
            console.log(`✅ Created: ${user.email} (${user.role})`);
        }
    }

    console.log('\n🎉 Demo users ready!');
    console.log('\n📋 Login credentials for all users:');
    console.log('   Password: Password123!\n');
    console.log('   student@veritas.edu  - Can submit reports');
    console.log('   staff@veritas.edu    - Can update report status');
    console.log('   security@veritas.edu - Full analyst access');
    console.log('   admin@veritas.edu    - User management + audit logs\n');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
