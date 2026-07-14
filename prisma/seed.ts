import 'dotenv/config'
import { PrismaClient, ProgressStatus, Role, Status } from '../generated/prisma/client'
import { hashPassword } from '../lib/password'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = `${process.env.DATABASE_URL}`

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Start seeding...')

    // Cleanup
    await prisma.programWallet.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.calendarEvent.deleteMany()
    await prisma.recentActivity.deleteMany()
    await prisma.implementationReport.deleteMany()
    await prisma.activity.deleteMany()
    await prisma.indicator.deleteMany()
    await prisma.program.deleteMany()
    await prisma.mainGoal.deleteMany()
    await prisma.planningYear.deleteMany()
    await prisma.user.deleteMany()

    // Users
    // ⚠️ IMPORTANT: These are development-only seed passwords.
    // In production, always use strong passwords and reset these immediately.
    const DEFAULT_SEED_PASSWORD = 'Admin@2025!'; // Change this before deploying

    // Admin in Main Office / Administration
    const admin = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            name: 'مدير النظام',
            password: await hashPassword(DEFAULT_SEED_PASSWORD),
            role: Role.ADMIN,
            organizationId: 'org-1',
            organizationName: 'المكتب الرئيسي',
            departmentId: 'dept-8',
            departmentName: 'الإدارة',
        }
    })

    // Manager in Main Office / Education
    const manager = await prisma.user.create({
        data: {
            email: 'manager@example.com',
            name: 'مدير التعليم',
            password: await hashPassword(DEFAULT_SEED_PASSWORD),
            role: Role.MANAGER,
            organizationId: 'org-1',
            organizationName: 'المكتب الرئيسي',
            departmentId: 'dept-1',
            departmentName: 'التعليم',
        }
    })

    // Employee in Main Office / Education
    const employee = await prisma.user.create({
        data: {
            email: 'user@example.com',
            name: 'محمد الموظف',
            password: await hashPassword(DEFAULT_SEED_PASSWORD),
            role: Role.USER,
            organizationId: 'org-1',
            organizationName: 'المكتب الرئيسي',
            departmentId: 'dept-1',
            departmentName: 'التعليم',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        }
    })

    console.log("Created Users:", { admin: admin.email, manager: manager.email, employee: employee.email })

    // Planning Year
    const year2025 = await prisma.planningYear.create({
        data: {
            name: 'خطة 2025',
            year: 2025,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-12-31'),
            status: Status.ACTIVE,
            organizationId: 'org-1',
            organizationName: 'المكتب الرئيسي',
            departmentId: 'dept-1',
            departmentName: 'التعليم',
        }
    })

    // Programs
    const program1 = await prisma.program.create({
        data: {
            name: 'تطوير التعليم الرقمي',
            description: 'تحديث الأنظمة التعليمية',
            budget: 500000,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2025-06-30'),
            status: ProgressStatus.ON_TRACK,
            progress: 35,
            yearId: year2025.id,
            organizationId: 'org-1',
            organizationName: 'المكتب الرئيسي',
            departmentId: 'dept-1',
            departmentName: 'التعليم',
        }
    })

    const program2 = await prisma.program.create({
        data: {
            name: 'تدريب المعلمين',
            description: 'دورات تدريبية للكادر التعليمي',
            budget: 200000,
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-11-30'),
            status: ProgressStatus.DELAYED,
            progress: 10,
            yearId: year2025.id,
            organizationId: 'org-1',
            organizationName: 'المكتب الرئيسي',
            departmentId: 'dept-1',
            departmentName: 'التعليم',
        }
    })

    // Create Main Goals
    const educationGoal = await prisma.mainGoal.create({
        data: {
            name: 'تحسين جودة التعليم الرقمي',
            description: 'رفع كفاءة ومخرجات التعليم باستخدام التقنيات الحديثة',
            organizationId: admin.organizationId,
            organizationName: admin.organizationName,
            departmentId: manager.departmentId,
            departmentName: manager.departmentName,
        }
    })

    const infrastructureGoal = await prisma.mainGoal.create({
        data: {
            name: 'تطوير البنية التحتية',
            description: 'تحسين وتجهيز المرافق التعليمية',
            organizationId: admin.organizationId,
            organizationName: admin.organizationName,
            departmentId: manager.departmentId,
            departmentName: manager.departmentName,
        }
    })

    // Indicators
    await prisma.indicator.create({
        data: {
            name: 'عدد المعلمين المدربين',
            category: 'Quantity',
            baselineValue: 0,
            targetValue: 100,
            unit: 'معلم',
            status: ProgressStatus.ON_TRACK,
            progress: 45,
            yearId: year2025.id,
            organizationId: 'org-1',
            organizationName: 'المكتب الرئيسي',
            departmentId: 'dept-1',
            departmentName: 'التعليم',
            mainGoalId: educationGoal.id // Link to main goal
        }
    })

    // Activities assigned to Employee
    await prisma.activity.create({
        data: {
            name: 'تجهيز قاعات التدريب',
            startDate: new Date('2025-02-10'),
            endDate: new Date('2025-02-20'),
            duration: 10,
            status: ProgressStatus.IN_PROGRESS,
            assignedUserId: employee.id,
            yearId: year2025.id,
            organizationId: 'org-1',
            organizationName: 'المكتب الرئيسي',
            departmentId: 'dept-1',
            departmentName: 'التعليم',
        }
    })

    await prisma.activity.create({
        data: {
            name: 'إعداد المواد التدريبية',
            startDate: new Date('2025-02-25'),
            endDate: new Date('2025-03-05'),
            duration: 10,
            status: ProgressStatus.PENDING,
            assignedUserId: employee.id,
            yearId: year2025.id,
            organizationId: 'org-1',
            organizationName: 'المكتب الرئيسي',
            departmentId: 'dept-1',
            departmentName: 'التعليم',
        }
    })

    await prisma.activity.create({
        data: {
            name: 'اجتماع مراجعة المشروع',
            startDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
            endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
            duration: 1,
            status: ProgressStatus.PENDING,
            assignedUserId: employee.id,
            yearId: year2025.id,
            organizationId: 'org-1',
            organizationName: 'المكتب الرئيسي',
            departmentId: 'dept-1',
            departmentName: 'التعليم',
        }
    })

    // Activities assigned to Manager
    await prisma.activity.create({
        data: {
            name: 'مراجعة الميزانية الربع سنوية',
            startDate: new Date('2025-03-01'),
            endDate: new Date('2025-03-05'),
            duration: 5,
            status: ProgressStatus.PENDING,
            assignedUserId: manager.id,
            yearId: year2025.id,
            organizationId: 'org-1',
            organizationName: 'المكتب الرئيسي',
            departmentId: 'dept-1',
            departmentName: 'التعليم',
        }
    })


    // Recent Data
    await prisma.recentActivity.create({
        data: {
            userId: employee.id,
            userName: employee.name,
            action: 'تحديث حالة',
            targetType: 'Activity',
            targetTitle: 'تجهيز قاعات التدريب',
            createdAt: new Date(new Date().setHours(new Date().getHours() - 1))
        }
    })

    await prisma.recentActivity.create({
        data: {
            userId: manager.id,
            userName: manager.name,
            action: 'إنشاء',
            targetType: 'Program',
            targetTitle: 'تطوير التعليم الرقمي',
            createdAt: new Date(new Date().setHours(new Date().getHours() - 24))
        }
    })

    // Notifications
    await prisma.notification.create({
        data: {
            userId: employee.id,
            title: 'تم تعيين نشاط جديد',
            message: 'تم تعيينك لنشاط "تجهيز قاعات التدريب" ضمن برنامج تطوير التعليم الرقمي.',
            type: 'INFO',
            link: '/activities',
            isRead: false
        }
    })

    await prisma.notification.create({
        data: {
            userId: employee.id,
            title: 'تذكير موعد التسليم',
            message: 'موعد تسليم تقرير الربع الأول يقترب.',
            type: 'WARNING',
            isRead: false
        }
    })

    await prisma.notification.create({
        data: {
            userId: employee.id,
            title: 'تم اكتمال المهمة',
            message: 'تم اعتماد التقرير السابق بنجاح.',
            type: 'SUCCESS',
            isRead: true
        }
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
