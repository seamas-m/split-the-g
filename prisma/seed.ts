import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const PINT_PHOTOS = [
  "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&q=80",
  "https://images.unsplash.com/photo-1566633806327-68e152aaf26d?w=800&q=80",
  "https://images.unsplash.com/photo-1532634993-15f421e42ec0?w=800&q=80",
  "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80",
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=800&q=80",
  "https://images.unsplash.com/photo-1573062337052-bb78916f1671?w=800&q=80",
  "https://images.unsplash.com/photo-1600788886242-5c96aabe3757?w=800&q=80",
  "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&q=80",
];

const PUBS = [
  { name: "The Stag's Head", city: "Dublin" },
  { name: "Mulligan's", city: "Dublin" },
  { name: "Kehoe's", city: "Dublin" },
  { name: "The Long Valley", city: "Cork" },
  { name: "Sin É", city: "Cork" },
  { name: "The Crane Bar", city: "Galway" },
  { name: "Tigh Neachtain", city: "Galway" },
  { name: "The Dew Drop Inn", city: "Belfast" },
  { name: "The Crown Liquor Saloon", city: "Belfast" },
  { name: "Dick Mack's", city: "Dingle" },
];

const USERS = [
  { id: "seed-user-1", name: "seamarkey", email: "sea@example.com", username: "seamarkey" },
  { id: "seed-user-2", name: "pintlover", email: "pint@example.com", username: "pintlover" },
  { id: "seed-user-3", name: "guinnesshead", email: "ghead@example.com", username: "guinnesshead" },
  { id: "seed-user-4", name: "blackstuff", email: "black@example.com", username: "blackstuff" },
  { id: "seed-user-5", name: "thegsplitter", email: "theg@example.com", username: "thegsplitter" },
];

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randSettle() {
  const options = [null, 90, 105, 112, 119, 95, 102, 108];
  return pick(options);
}

async function main() {
  console.log("🌱 Seeding...");

  // Create users
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        username: u.username,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }
  console.log(`✓ ${USERS.length} users`);

  // Create posts
  const posts = [];
  for (let i = 0; i < 20; i++) {
    const pub = pick(PUBS);
    const user = pick(USERS);
    const daysAgo = Math.floor(Math.random() * 6);
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        imageUrl: PINT_PHOTOS[i % PINT_PHOTOS.length],
        pubName: pub.name,
        city: pub.city,
        settleSeconds: randSettle(),
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });
    posts.push(post);
  }
  console.log(`✓ ${posts.length} posts`);

  // Create ratings — each user rates most posts
  let ratingCount = 0;
  for (const post of posts) {
    const raters = USERS.filter((u) => u.id !== post.userId);
    for (const rater of raters) {
      if (Math.random() > 0.3) { // 70% chance each user rates each post
        await prisma.rating.upsert({
          where: { postId_userId: { postId: post.id, userId: rater.id } },
          update: {},
          create: {
            postId: post.id,
            userId: rater.id,
            score: Math.floor(Math.random() * 3) + 3, // scores 3-5, it's good Guinness
          },
        });
        ratingCount++;
      }
    }
  }
  console.log(`✓ ${ratingCount} ratings`);
  console.log("✅ Done");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
