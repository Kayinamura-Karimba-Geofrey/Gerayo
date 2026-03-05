const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const devices = await prisma.device.findMany({
            include: {
                vehicle: {
                    include: {
                        user: true
                    }
                }
            }
        });

        console.log('--- Devices ---');
        devices.forEach(d => {
            console.log(`Device MAC: ${d.macAddress}`);
            console.log(`  Vehicle: ${d.vehicle?.plateNumber || 'None'}`);
            console.log(`  User ID: ${d.vehicle?.userId || 'None'}`);
            console.log(`  User Email: ${d.vehicle?.user?.email || 'None'}`);
        });

        const users = await prisma.user.findMany();
        console.log('\n--- Users ---');
        users.forEach(u => {
            console.log(`User ID: ${u.id} | Email: ${u.email}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
