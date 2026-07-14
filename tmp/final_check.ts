import 'dotenv/config'
import { prisma } from '../lib/db'

async function check() {
    const years = await prisma.planningYear.findMany()
    console.log(`Count of Planning Years: ${years.length}`)
    years.forEach(y => console.log(`Year: ${y.year}, Name: ${y.name}, Dept: ${y.departmentName}`))
    
    const goals = await prisma.mainGoal.findMany({
        include: { year: true }
    })
    console.log(`\nCount of Main Goals: ${goals.length}`)
    goals.forEach(g => console.log(`Goal: ${g.name}, Year: ${g.year?.year || 'NONE'}`))

    await prisma.$disconnect()
}

check().catch(console.error)
