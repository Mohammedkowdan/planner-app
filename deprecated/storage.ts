// نظام التخزين المحلي لجميع البيانات

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: string
  organizationId: string // معرف المنظمة
  organizationName: string // اسم المنظمة
  departmentId: string // معرف القسم
  departmentName: string // اسم القسم
}

export interface PlanningYear {
  id: string
  name: string
  year: number
  startDate: string
  endDate: string
  status: "active" | "draft" | "completed"
  organizationId: string
  organizationName: string
  departmentId: string
  departmentName: string
  createdAt: string
}

export interface Indicator {
  id: string
  name: string
  description: string
  category: string
  baselineValue: number
  targetValue: number
  unit: string
  quarters: {
    q1: { target: number; actual: number }
    q2: { target: number; actual: number }
    q3: { target: number; actual: number }
    q4: { target: number; actual: number }
  }
  status: "on-track" | "at-risk" | "delayed"
  progress: number
  yearId: string
  organizationId: string
  organizationName: string
  departmentId: string
  departmentName: string
  createdAt: string
}

export interface Program {
  id: string
  name: string
  description: string
  budget: number
  spent: number
  startDate: string
  endDate: string
  status: "on-track" | "at-risk" | "delayed"
  progress: number
  initiatives: {
    id: string
    name: string
    status: "completed" | "in-progress" | "pending"
  }[]
  yearId: string
  organizationId: string
  organizationName: string
  departmentId: string
  departmentName: string
  createdAt: string
}

export interface Activity {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  duration: number
  project: string
  department: string
  status: "pending" | "in-progress" | "completed"
  color: string
  assignedTo: string
  yearId: string
  organizationId: string
  organizationName: string
  departmentId: string
  departmentName: string
  createdAt: string
}

export interface ImplementationReport {
  id: string
  activityId: string
  activityName: string
  implementationDate: string
  beneficiaries: {
    men: number
    women: number
    boys: number
    girls: number
  }
  budget: {
    planned: number
    actual: number
  }
  outputs: string
  challenges: string
  recommendations: string
  attachments: string[]
  reportedBy: string
  organizationId: string
  organizationName: string
  departmentId: string
  departmentName: string
  createdAt: string
}

// دوال مساعدة للتخزين
const STORAGE_KEYS = {
  USERS: "planning_app_users",
  PLANNING_YEARS: "planning_app_years",
  INDICATORS: "planning_app_indicators",
  PROGRAMS: "planning_app_programs",
  ACTIVITIES: "planning_app_activities",
  REPORTS: "planning_app_reports",
  CURRENT_USER: "planning_app_current_user",
  CURRENT_ORG: "planning_app_current_org",
}

const ADMIN_USER_ID = "admin-001"

// تهيئة البيانات الافتراضية
export function initializeDefaultData() {
  if (typeof window === "undefined") return

  const users = getUsers()
  const adminExists = users.find((u) => u.id === ADMIN_USER_ID)

  if (!adminExists) {
    const defaultAdmin: User = {
      id: ADMIN_USER_ID,
      email: "admin@example.com",
      password: "123456789",
      name: "مدير النظام",
      role: "admin",
      organizationId: "org-1",
      organizationName: "المكتب الرئيسي",
      departmentId: "dept-1",
      departmentName: "التعليم",
    }
    saveUsers([...users, defaultAdmin])
  }
}

// Users
export function getUsers(): User[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.USERS)
  return data ? JSON.parse(data) : []
}

export function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  return data ? JSON.parse(data) : null
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }
}

export function deleteUser(id: string) {
  if (id === ADMIN_USER_ID) {
    throw new Error("لا يمكن حذف حساب المدير الرئيسي")
  }
  const users = getUsers().filter((u) => u.id !== id)
  saveUsers(users)
}

export function isAdminUser(userId: string): boolean {
  return userId === ADMIN_USER_ID
}

export function createUser(userData: Omit<User, "id">): User {
  const users = getUsers()
  const newUser: User = {
    ...userData,
    id: `user-${Date.now()}`,
  }
  saveUsers([...users, newUser])
  return newUser
}

export function updateUser(id: string, userData: Partial<User>) {
  const users = getUsers()
  const index = users.findIndex((u) => u.id === id)
  if (index >= 0) {
    if (id === ADMIN_USER_ID) {
      users[index] = {
        ...users[index],
        ...userData,
        id: ADMIN_USER_ID,
        email: users[index].email,
        role: "admin",
      }
    } else {
      users[index] = { ...users[index], ...userData, id }
    }
    saveUsers(users)
  }
}

// Planning Years
export function getPlanningYears(userId?: string): PlanningYear[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.PLANNING_YEARS)
  const years: PlanningYear[] = data ? JSON.parse(data) : []

  if (userId) {
    return filterByUserAccess(years, userId)
  }
  return years
}

export function savePlanningYear(year: PlanningYear) {
  const years = getPlanningYears()
  const index = years.findIndex((y) => y.id === year.id)
  if (index >= 0) {
    years[index] = year
  } else {
    years.push(year)
  }
  localStorage.setItem(STORAGE_KEYS.PLANNING_YEARS, JSON.stringify(years))
}

export function deletePlanningYear(id: string) {
  const years = getPlanningYears().filter((y) => y.id !== id)
  localStorage.setItem(STORAGE_KEYS.PLANNING_YEARS, JSON.stringify(years))
}

export function removeYears2026And2027() {
  if (typeof window === "undefined") return
  
  const years = getPlanningYears()
  const filteredYears = years.filter((year) => year.year !== 2026 && year.year !== 2027)
  
  // فقط احفظ إذا كان هناك فرق
  if (filteredYears.length !== years.length) {
    localStorage.setItem(STORAGE_KEYS.PLANNING_YEARS, JSON.stringify(filteredYears))
    console.log("[v0] تم حذف السنوات 2026 و 2027 من قاعدة البيانات")
  }
}

// Indicators
export function getIndicators(userId?: string, yearId?: string): Indicator[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.INDICATORS)
  let indicators: Indicator[] = data ? JSON.parse(data) : []

  if (userId) {
    indicators = filterByUserAccess(indicators, userId)
  }
  if (yearId) {
    indicators = indicators.filter((i) => i.yearId === yearId)
  }
  return indicators
}

export function saveIndicator(indicator: Indicator) {
  const indicators = getIndicators()
  const index = indicators.findIndex((i) => i.id === indicator.id)
  if (index >= 0) {
    indicators[index] = indicator
  } else {
    indicators.push(indicator)
  }
  localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(indicators))
}

export function deleteIndicator(id: string) {
  const indicators = getIndicators().filter((i) => i.id !== id)
  localStorage.setItem(STORAGE_KEYS.INDICATORS, JSON.stringify(indicators))
}

// Programs
export function getPrograms(userId?: string, yearId?: string): Program[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.PROGRAMS)
  let programs: Program[] = data ? JSON.parse(data) : []

  if (userId) {
    programs = filterByUserAccess(programs, userId)
  }
  if (yearId) {
    programs = programs.filter((p) => p.yearId === yearId)
  }
  return programs
}

export function saveProgram(program: Program) {
  const programs = getPrograms()
  const index = programs.findIndex((p) => p.id === program.id)
  if (index >= 0) {
    programs[index] = program
  } else {
    programs.push(program)
  }
  localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs))
}

export function deleteProgram(id: string) {
  const programs = getPrograms().filter((p) => p.id !== id)
  localStorage.setItem(STORAGE_KEYS.PROGRAMS, JSON.stringify(programs))
}

// Activities
export function getActivities(userId?: string, yearId?: string): Activity[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.ACTIVITIES)
  let activities: Activity[] = data ? JSON.parse(data) : []

  if (userId) {
    activities = filterByUserAccess(activities, userId)
  }
  if (yearId) {
    activities = activities.filter((a) => a.yearId === yearId)
  }
  return activities
}

export function saveActivity(activity: Activity) {
  const activities = getActivities()
  const index = activities.findIndex((a) => a.id === activity.id)
  if (index >= 0) {
    activities[index] = activity
  } else {
    activities.push(activity)
  }
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities))
}

export function deleteActivity(id: string) {
  const activities = getActivities().filter((a) => a.id !== id)
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities))
}

// Implementation Reports
export function getReports(userId?: string): ImplementationReport[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEYS.REPORTS)
  let reports: ImplementationReport[] = data ? JSON.parse(data) : []

  if (userId) {
    reports = filterByUserAccess(reports, userId)
  }
  return reports
}

export function saveReport(report: ImplementationReport) {
  const reports = getReports()
  const index = reports.findIndex((r) => r.id === report.id)
  if (index >= 0) {
    reports[index] = report
  } else {
    reports.push(report)
  }
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports))
}

export function deleteReport(id: string) {
  const reports = getReports().filter((r) => r.id !== id)
  localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports))
}

// دوال للتحقق من صلاحيات الوصول
export function canAccessData(userId: string, dataOrganizationId: string, dataDepartmentId: string): boolean {
  const user = getUsers().find((u) => u.id === userId)
  if (!user) return false

  if (user.role === "admin") return true

  return user.organizationId === dataOrganizationId && user.departmentId === dataDepartmentId
}

export function filterByUserAccess<T extends { organizationId: string; departmentId: string }>(
  items: T[],
  userId: string,
): T[] {
  const user = getUsers().find((u) => u.id === userId)
  if (!user) return []

  if (user.role === "admin") return items

  return items.filter((item) => item.organizationId === user.organizationId && item.departmentId === user.departmentId)
}

export function clearAllData() {
  if (typeof window === "undefined") return

  localStorage.removeItem(STORAGE_KEYS.PLANNING_YEARS)
  localStorage.removeItem(STORAGE_KEYS.INDICATORS)
  localStorage.removeItem(STORAGE_KEYS.PROGRAMS)
  localStorage.removeItem(STORAGE_KEYS.ACTIVITIES)
  localStorage.removeItem(STORAGE_KEYS.REPORTS)
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  localStorage.removeItem(STORAGE_KEYS.CURRENT_ORG)
  
  // إعادة إنشاء حساب المدير فقط
  const defaultAdmin: User = {
    id: ADMIN_USER_ID,
    email: "admin@example.com",
    password: "123456789",
    name: "مدير النظام",
    role: "admin",
    organizationId: "org-1",
    organizationName: "المكتب الرئيسي",
    departmentId: "dept-1",
    departmentName: "التعليم",
  }
  saveUsers([defaultAdmin])
}

export function resetDatabase() {
  clearAllData()
  initializeDefaultData()
}

export function exportAllData() {
  if (typeof window === "undefined") return null

  const data = {
    users: getUsers().filter(u => u.id !== ADMIN_USER_ID), // لا نصدر حساب المدير
    planningYears: getPlanningYears(),
    indicators: getIndicators(),
    programs: getPrograms(),
    activities: getActivities(),
    reports: getReports(),
    exportDate: new Date().toISOString(),
  }

  return data
}

export function downloadDataAsJson() {
  const data = exportAllData()
  if (!data) return

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `planning-data-${new Date().toISOString().split("T")[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
