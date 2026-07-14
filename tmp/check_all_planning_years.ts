import 'dotenv/config'
import { prisma } from '../lib/db'

async function check() {
    const years = await prisma.planningYear.findMany()
    console.log('--- ALL Planning Years ---')
    console.log(JSON.stringify(years, null, 2))
    await prisma.$disconnect()
}

check().catch(console.error)
