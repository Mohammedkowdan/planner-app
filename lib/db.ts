import { PrismaClient } from "../generated/prisma/client"

const globalForPrisma = globalThis as unknown as {
    prismaClientV3: PrismaClient | undefined
}

import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prismaClientV3 ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaClientV3 = prisma
