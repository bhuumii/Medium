import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
const prisma = new PrismaClient()

async function main() {
  const pw = await bcrypt.hash('password', 10)
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: { name: 'Alice', email: 'alice@example.com', password: pw },
  })
  await prisma.post.upsert({
    where: { slug: 'hello-world' },
    update: {},
    create: {
      slug: 'hello-world',
      title: 'Hello World',
      excerpt: 'Welcome to the Medium-clone',
      content: '<p>This is a demo post.</p>',
      authorId: alice.id,
    },
  })
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect())
