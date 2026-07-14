import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { hashSync } from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const newPassword = '123456789'
  const hashedPassword = hashSync(newPassword, 12)
  
  const emails = ['admin@example.com', 'manager@example.com', 'user@example.com']
  
  console.log(`Setting passwords for ${emails.join(', ')} to 123456789...`)

  for (const email of emails) {
    try {
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      })
      console.log(`✅ Success: ${email}`)
    } catch (e) {
      console.log(`❌ Failed or not found: ${email}`)
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
