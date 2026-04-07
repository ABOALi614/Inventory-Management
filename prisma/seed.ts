import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'ChangeMe!123';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const adminEmail = 'admin@wms.local';

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const warehouse = await prisma.warehouse.upsert({
    where: { code: 'WH-MAIN' },
    update: { name: 'Main Distribution Center' },
    create: {
      code: 'WH-MAIN',
      name: 'Main Distribution Center',
    },
  });

  await prisma.location.upsert({
    where: {
      warehouseId_code: { warehouseId: warehouse.id, code: 'A-01' },
    },
    update: { name: 'Aisle A — Bin 01' },
    create: {
      warehouseId: warehouse.id,
      code: 'A-01',
      name: 'Aisle A — Bin 01',
    },
  });

  await prisma.location.upsert({
    where: {
      warehouseId_code: { warehouseId: warehouse.id, code: 'A-02' },
    },
    update: { name: 'Aisle A — Bin 02' },
    create: {
      warehouseId: warehouse.id,
      code: 'A-02',
      name: 'Aisle A — Bin 02',
    },
  });

  const productSeeds = [
    { sku: 'SKU-001', name: 'Seeded Product 1', description: 'Portfolio seed' },
    { sku: 'SKU-002', name: 'Seeded Product 2', description: 'Portfolio seed' },
    { sku: 'SKU-003', name: 'Seeded Product 3', description: 'Portfolio seed' },
    { sku: 'SKU-004', name: 'Seeded Product 4', description: 'Portfolio seed' },
    { sku: 'SKU-005', name: 'Seeded Product 5', description: 'Portfolio seed' },
  ];

  for (const p of productSeeds) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: { name: p.name, description: p.description },
      create: {
        sku: p.sku,
        name: p.name,
        description: p.description,
      },
    });
  }

  console.log('Seed completed.');
  console.log(`  Admin login: ${admin.email} / password: ${adminPassword}`);
  console.log(`  Admin id: ${admin.id}`);
  console.log(`  Warehouse: ${warehouse.code} (${warehouse.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
