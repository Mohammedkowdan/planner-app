import { prisma } from "./lib/db"
import { hashPassword } from "./lib/password"

async function main() {
  const newPassword = "Mohammed?@123456789(*&^%$#@!"
  const hashed = await hashPassword(newPassword)
  
  await prisma.user.update({
    where: { email: "admin@example.com" },
    data: { password: hashed }
  })
  
  console.log("Password updated successfully for admin@example.com")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
