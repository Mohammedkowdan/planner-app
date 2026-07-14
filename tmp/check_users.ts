import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import 'dotenv/config'

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, organizationId: true }
    })
    console.log('--- DATABASE USER INVENTORY ---')
    console.log('Total Users:', users.length)
    users.forEach(u => {
        console.log(`ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Org: ${u.organizationId}`)
    })
}

main()
    .then(async () => await prisma.$disconnect())
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
    })
