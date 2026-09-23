import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const password = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe123!';
  const fullName = process.env.SEED_ADMIN_NAME ?? 'Admin';

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`User "${username}" already exists, skipping.`);
    return;
  }

  await prisma.user.create({
    data: {
      username,
      fullName,
      passwordHash: await hashPassword(password),
      role: 'ADMIN'
    }
  });

  console.log(`Admin created: username="${username}" password="${password}"`);
  console.log('IMPORTANT: log in and change this password immediately.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
