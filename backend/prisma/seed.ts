import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import "dotenv/config";
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'dzakiudin07@gmail.com' },
    update: {},
    create: {
      email: 'dzakiudin07@gmail.com',
      username: 'dzakiudinadmin',
      name: 'Dzakiudin',
      passwordHash,
      role: 'admin'
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create sample products
  const products = [
    {
      name: '100 Diamonds',
      price: 15000,
      description: 'Top up 100 diamonds untuk Mobile Legends. Proses cepat dan aman.',
      imageUrl: 'https://via.placeholder.com/400x300?text=100+Diamonds',
      category: 'mobile-legends',
    },
    {
      name: '310 Diamonds',
      price: 45000,
      description: 'Top up 310 diamonds untuk Mobile Legends. Bonus 31 diamonds.',
      imageUrl: 'https://via.placeholder.com/400x300?text=310+Diamonds',
      category: 'mobile-legends',
    },
    {
      name: '520 Diamonds',
      price: 75000,
      description: 'Top up 520 diamonds untuk Mobile Legends. Harga terjangkau.',
      imageUrl: 'https://via.placeholder.com/400x300?text=520+Diamonds',
      category: 'mobile-legends',
    },
    {
      name: '60 UC',
      price: 12000,
      description: 'Top up 60 UC untuk PUBG Mobile. Proses instan.',
      imageUrl: 'https://via.placeholder.com/400x300?text=60+UC',
      category: 'pubg-mobile',
    },
    {
      name: '325 UC',
      price: 55000,
      description: 'Top up 325 UC untuk PUBG Mobile. Best deal.',
      imageUrl: 'https://via.placeholder.com/400x300?text=325+UC',
      category: 'pubg-mobile',
    },
    {
      name: '100 Primogems',
      price: 16000,
      description: 'Genesis Crystal untuk Genshin Impact. Bisa ditukar ke Primogems.',
      imageUrl: 'https://via.placeholder.com/400x300?text=100+Primogems',
      category: 'genshin-impact',
    },
    {
      name: 'Welkin Moon',
      price: 65000,
      description: 'Blessing of the Welkin Moon - 90 Primogems per hari selama 30 hari.',
      imageUrl: 'https://via.placeholder.com/400x300?text=Welkin+Moon',
      category: 'genshin-impact',
    },
    {
      name: '100 Valorant Points',
      price: 13000,
      description: 'Top up Valorant Points. Region Indonesia.',
      imageUrl: 'https://via.placeholder.com/400x300?text=100+VP',
      category: 'valorant',
    },
  ];

  // Group by category string
  const categoriesToCreate = [...new Set(products.map(p => p.category))];
  
  const categoryMap = {};
  for (const catName of categoriesToCreate) {
    const formattedName = catName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
    const category = await prisma.category.create({
      data: {
        name: formattedName,
        slug: catName,
        iconUrl: null
      }
    });
    categoryMap[catName] = category.id;
  }

  for (const product of products) {
    await prisma.product.create({
      data: {
        name: product.name,
        price: product.price,
        description: product.description,
        imageUrl: product.imageUrl,
        categoryId: categoryMap[product.category]
      },
    });
  }
  console.log(`✅ ${categoriesToCreate.length} categories and ${products.length} products created`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
