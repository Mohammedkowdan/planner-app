import { prisma } from "./lib/db"

async function main() {
  const users = await prisma.user.findMany({
    select: {
      name: true,
      email: true,
      role: true,
      organizationName: true,
      departmentName: true
    }
  })
  console.log(JSON.stringify(users, null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
