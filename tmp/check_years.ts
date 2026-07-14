import 'dotenv/config'
import { prisma } from '../lib/db'

async function check() {
    console.log('--- Planning Years ---')
    const years = await prisma.planningYear.findMany({
        orderBy: { year: 'desc' }
    })
    console.log(years.map(y => ({ 
        id: y.id, 
        name: y.name, 
        year: y.year, 
        org: y.organizationId, 
        dept: y.departmentId,
        deptName: y.departmentName
    })))

    console.log('\n--- Sessions (Users) ---')
    const users = await prisma.user.findMany({
        select: { email: true, organizationId: true, departmentId: true, departmentName: true }
    })
    console.log(users)

    await prisma.$disconnect()
}

check().catch(console.error)
