const { PrismaClient } = require('./generated/prisma');
const { hashSync } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const newPassword = '123456789';
  const hashedPassword = hashSync(newPassword, 12);
  
  const emails = ['admin@example.com', 'manager@example.com', 'user@example.com'];
  
  for (const email of emails) {
    try {
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      });
      console.log(`Updated password for ${email}`);
    } catch (e) {
      console.log(`User ${email} not found or failed to update`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
