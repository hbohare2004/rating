const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.rating.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw) => bcrypt.hashSync(pw, 10);

  // Create admin
  const admin = await prisma.user.create({
    data: {
      name: 'Platform Administrator',
      email: 'admin@example.com',
      password: hash('Admin@123'),
      address: '100 Admin Street, Suite 500, San Francisco, CA 94105',
      role: 'ADMIN',
    },
  });

  // Create store owners
  const owner1 = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar Enterprises',
      email: 'owner@example.com',
      password: hash('Owner@123'),
      address: '45 Market Road, Sector 12, New Delhi, India 110001',
      role: 'STORE_OWNER',
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Priya Sharma Retail Group',
      email: 'priya.owner@example.com',
      password: hash('Owner@123'),
      address: '78 Commercial Complex, MG Road, Bangalore, India 560001',
      role: 'STORE_OWNER',
    },
  });

  const owner3 = await prisma.user.create({
    data: {
      name: 'Amit Verma Trading Company',
      email: 'amit.owner@example.com',
      password: hash('Owner@123'),
      address: '22 Business Park, Ring Road, Hyderabad, India 500032',
      role: 'STORE_OWNER',
    },
  });

  // Create normal users
  const user1 = await prisma.user.create({
    data: {
      name: 'Ananya Desai Customer',
      email: 'user@example.com',
      password: hash('User@123'),
      address: '12 Residential Lane, Koramangala, Bangalore, India 560034',
      role: 'USER',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Vikram Singh Rathore',
      email: 'vikram@example.com',
      password: hash('User@123'),
      address: '56 Green Avenue, Sector 15, Gurgaon, Haryana, India 122001',
      role: 'USER',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      name: 'Sneha Patel Maharashtra',
      email: 'sneha@example.com',
      password: hash('User@123'),
      address: '89 Lake View Road, Powai, Mumbai, Maharashtra, India 400076',
      role: 'USER',
    },
  });

  const user4 = await prisma.user.create({
    data: {
      name: 'Rohit Mehta Consulting',
      email: 'rohit@example.com',
      password: hash('User@123'),
      address: '34 Tech Park, Whitefield, Bangalore, Karnataka, India 560066',
      role: 'USER',
    },
  });

  const user5 = await prisma.user.create({
    data: {
      name: 'Kavita Reddy Enterprises',
      email: 'kavita@example.com',
      password: hash('User@123'),
      address: '67 Heritage Lane, Jubilee Hills, Hyderabad, India 500033',
      role: 'USER',
    },
  });

  // Create stores
  const store1 = await prisma.store.create({
    data: {
      name: 'Fresh Mart Superstore',
      email: 'contact@freshmart.com',
      address: '45 Market Road, Sector 12, New Delhi, India 110001',
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: 'Urban Style Clothing',
      email: 'hello@urbanstyle.com',
      address: '78 Commercial Complex, MG Road, Bangalore, India 560001',
      ownerId: owner2.id,
    },
  });

  const store3 = await prisma.store.create({
    data: {
      name: 'Tech Hub Electronics',
      email: 'support@techhub.com',
      address: '22 Business Park, Ring Road, Hyderabad, India 500032',
      ownerId: owner3.id,
    },
  });

  const store4 = await prisma.store.create({
    data: {
      name: 'Green Leaf Organics',
      email: 'info@greenleaf.com',
      address: '15 Garden Street, Indiranagar, Bangalore, India 560038',
      ownerId: owner1.id,
    },
  });

  const store5 = await prisma.store.create({
    data: {
      name: 'Book Worm Library Store',
      email: 'read@bookworm.com',
      address: '90 College Road, Anna Nagar, Chennai, India 600040',
      ownerId: owner2.id,
    },
  });

  // Create ratings
  const ratingsData = [
    { rating: 5, userId: user1.id, storeId: store1.id },
    { rating: 4, userId: user2.id, storeId: store1.id },
    { rating: 3, userId: user3.id, storeId: store1.id },
    { rating: 5, userId: user4.id, storeId: store1.id },
    { rating: 4, userId: user5.id, storeId: store1.id },

    { rating: 4, userId: user1.id, storeId: store2.id },
    { rating: 5, userId: user2.id, storeId: store2.id },
    { rating: 4, userId: user3.id, storeId: store2.id },
    { rating: 3, userId: user4.id, storeId: store2.id },

    { rating: 5, userId: user1.id, storeId: store3.id },
    { rating: 5, userId: user2.id, storeId: store3.id },
    { rating: 4, userId: user3.id, storeId: store3.id },

    { rating: 3, userId: user1.id, storeId: store4.id },
    { rating: 4, userId: user2.id, storeId: store4.id },

    { rating: 5, userId: user1.id, storeId: store5.id },
    { rating: 4, userId: user3.id, storeId: store5.id },
    { rating: 5, userId: user5.id, storeId: store5.id },
  ];

  for (const r of ratingsData) {
    await prisma.rating.create({ data: r });
  }

  console.log('Seeding complete.');
  console.log('');
  console.log('Demo Credentials:');
  console.log('  Admin:       admin@example.com / Admin@123');
  console.log('  User:        user@example.com  / User@123');
  console.log('  Store Owner: owner@example.com / Owner@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
