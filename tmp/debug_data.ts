import 'dotenv/config'
import { PrismaClient } from './generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

async function debugData() {
    const connectionString = process.env.DATABASE_URL
    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    const prisma = new PrismaClient({ adapter })

    console.log('--- Users ---')
    const users = await prisma.user.findMany({
        select: { id: true, email: true, organizationId: true, departmentId: true, departmentName: true }
    })
    console.log(JSON.stringify(users, null, 2))

    console.log('\n--- Planning Years ---')
    const years = await prisma.planningYear.findMany({
        select: { id: true, name: true, year: true, organizationId: true, departmentId: true }
    })
    console.log(JSON.stringify(years, null, 2))

    console.log('\n--- Main Goals ---')
    const goals = await prisma.mainGoal.findMany({
        select: { id: true, name: true, yearId: true, organizationId: true, departmentId: true }
    })
    console.log(JSON.stringify(goals, null, 2))

    await prisma.$disconnect()
}

debugData().catch(console.error)
