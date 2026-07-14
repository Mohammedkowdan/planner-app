import 'dotenv/config'
import { prisma } from '../lib/db'

async function check() {
    console.log('--- ALL Planning Years (No Filters) ---')
    const years = await prisma.planningYear.findMany({
        orderBy: { year: 'desc' }
    })
    console.log(JSON.stringify(years.map(y => ({ 
        id: y.id, 
        name: y.name, 
        year: y.year, 
        org: y.organizationId, 
        dept: y.departmentId,
        deptName: y.departmentName
    })), null, 2))

    await prisma.$disconnect()
}

check().catch(console.error)
