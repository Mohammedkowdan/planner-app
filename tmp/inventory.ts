import 'dotenv/config'
import { prisma } from '../lib/db'

async function check() {
    const years = await prisma.planningYear.findMany()
    console.log(`--- Planning Year Inventory (${years.length} total) ---`)
    years.forEach(y => {
        console.log(`Year ID: ${y.id} | Year: ${y.year} | Name: ${y.name} | Dept: ${y.departmentName} (${y.departmentId})`)
    })
    
    console.log('\n--- Main Goal Year Context ---')
    const sessionUser = await prisma.user.findFirst({ where: { email: 'manager@example.com' } })
    console.log(`Current User (Education Manager): ${sessionUser?.name} | Dept: ${sessionUser?.departmentName} (${sessionUser?.departmentId})`)

    await prisma.$disconnect()
}

check().catch(console.error)
