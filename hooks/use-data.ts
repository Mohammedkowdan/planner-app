"use client"

import { useState, useEffect } from "react"
import {
  getPlanningYears,
  getIndicators,
  getPrograms,
  getActivities,
  getReports,
  savePlanningYear,
  saveIndicator,
  saveProgram,
  saveActivity,
  saveReport,
  deletePlanningYear,
  deleteIndicator,
  deleteProgram,
  deleteActivity,
  deleteReport,
  initializeDefaultData,
  getCurrentUser,
  canAccessData,
  type PlanningYear,
  type Indicator,
  type Program,
  type Activity,
  type ImplementationReport,
} from "@/lib/storage"

export function usePlanningYears() {
  const [years, setYears] = useState<PlanningYear[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser] = useState(() => getCurrentUser())

  useEffect(() => {
    initializeDefaultData()
    loadYears()
  }, [])

  const loadYears = () => {
    if (!currentUser) {
      setYears([])
      setLoading(false)
      return
    }

    setLoading(true)
    const data = getPlanningYears(currentUser.id)
    setYears(data)
    setLoading(false)
  }

  const addYear = (year: Omit<PlanningYear, "id" | "createdAt">) => {
    if (!currentUser) return null

    const newYear: PlanningYear = {
      ...year,
      id: `year-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    savePlanningYear(newYear)
    loadYears()
    return newYear
  }

  const updateYear = (id: string, updates: Partial<PlanningYear>) => {
    if (!currentUser) return

    const year = years.find((y) => y.id === id)
    if (year && canAccessData(currentUser.id, year.organizationId, year.departmentId)) {
      const updatedYear = { ...year, ...updates }
      savePlanningYear(updatedYear)
      loadYears()
    }
  }

  const removeYear = (id: string) => {
    if (!currentUser) return

    const year = years.find((y) => y.id === id)
    if (year && canAccessData(currentUser.id, year.organizationId, year.departmentId)) {
      deletePlanningYear(id)
      loadYears()
    }
  }

  return { years, loading, addYear, updateYear, removeYear, refresh: loadYears }
}

export function useIndicators(yearId?: string) {
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser] = useState(() => getCurrentUser())

  useEffect(() => {
    loadIndicators()
  }, [yearId])

  const loadIndicators = () => {
    if (!currentUser) {
      setIndicators([])
      setLoading(false)
      return
    }

    setLoading(true)
    const data = getIndicators(currentUser.id, yearId)
    setIndicators(data)
    setLoading(false)
  }

  const addIndicator = (indicator: Omit<Indicator, "id" | "createdAt">) => {
    if (!currentUser) return null

    const newIndicator: Indicator = {
      ...indicator,
      id: `indicator-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    saveIndicator(newIndicator)
    loadIndicators()
    return newIndicator
  }

  const updateIndicator = (id: string, updates: Partial<Indicator>) => {
    if (!currentUser) return

    const indicator = indicators.find((i) => i.id === id)
    if (indicator && canAccessData(currentUser.id, indicator.organizationId, indicator.departmentId)) {
      const updatedIndicator = { ...indicator, ...updates }
      saveIndicator(updatedIndicator)
      loadIndicators()
    }
  }

  const removeIndicator = (id: string) => {
    if (!currentUser) return

    const indicator = indicators.find((i) => i.id === id)
    if (indicator && canAccessData(currentUser.id, indicator.organizationId, indicator.departmentId)) {
      deleteIndicator(id)
      loadIndicators()
    }
  }

  return { indicators, loading, addIndicator, updateIndicator, removeIndicator, refresh: loadIndicators }
}

export function usePrograms(yearId?: string) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser] = useState(() => getCurrentUser())

  useEffect(() => {
    loadPrograms()
  }, [yearId])

  const loadPrograms = () => {
    if (!currentUser) {
      setPrograms([])
      setLoading(false)
      return
    }

    setLoading(true)
    const data = getPrograms(currentUser.id, yearId)
    setPrograms(data)
    setLoading(false)
  }

  const addProgram = (program: Omit<Program, "id" | "createdAt">) => {
    if (!currentUser) return null

    const newProgram: Program = {
      ...program,
      id: `program-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    saveProgram(newProgram)
    loadPrograms()
    return newProgram
  }

  const updateProgram = (id: string, updates: Partial<Program>) => {
    if (!currentUser) return

    const program = programs.find((p) => p.id === id)
    if (program && canAccessData(currentUser.id, program.organizationId, program.departmentId)) {
      const updatedProgram = { ...program, ...updates }
      saveProgram(updatedProgram)
      loadPrograms()
    }
  }

  const removeProgram = (id: string) => {
    if (!currentUser) return

    const program = programs.find((p) => p.id === id)
    if (program && canAccessData(currentUser.id, program.organizationId, program.departmentId)) {
      deleteProgram(id)
      loadPrograms()
    }
  }

  return { programs, loading, addProgram, updateProgram, removeProgram, refresh: loadPrograms }
}

export function useActivities(yearId?: string) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser] = useState(() => getCurrentUser())

  useEffect(() => {
    loadActivities()
  }, [yearId])

  const loadActivities = () => {
    if (!currentUser) {
      setActivities([])
      setLoading(false)
      return
    }

    setLoading(true)
    const data = getActivities(currentUser.id, yearId)
    setActivities(data)
    setLoading(false)
  }

  const addActivity = (activity: Omit<Activity, "id" | "createdAt">) => {
    if (!currentUser) return null

    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    saveActivity(newActivity)
    loadActivities()
    return newActivity
  }

  const updateActivity = (id: string, updates: Partial<Activity>) => {
    if (!currentUser) return

    const activity = activities.find((a) => a.id === id)
    if (activity && canAccessData(currentUser.id, activity.organizationId, activity.departmentId)) {
      const updatedActivity = { ...activity, ...updates }
      saveActivity(updatedActivity)
      loadActivities()
    }
  }

  const removeActivity = (id: string) => {
    if (!currentUser) return

    const activity = activities.find((a) => a.id === id)
    if (activity && canAccessData(currentUser.id, activity.organizationId, activity.departmentId)) {
      deleteActivity(id)
      loadActivities()
    }
  }

  return { activities, loading, addActivity, updateActivity, removeActivity, refresh: loadActivities }
}

export function useReports() {
  const [reports, setReports] = useState<ImplementationReport[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser] = useState(() => getCurrentUser())

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = () => {
    if (!currentUser) {
      setReports([])
      setLoading(false)
      return
    }

    setLoading(true)
    const data = getReports(currentUser.id)
    setReports(data)
    setLoading(false)
  }

  const addReport = (report: Omit<ImplementationReport, "id" | "createdAt">) => {
    if (!currentUser) return null

    const newReport: ImplementationReport = {
      ...report,
      id: `report-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    saveReport(newReport)
    loadReports()
    return newReport
  }

  const updateReport = (id: string, updates: Partial<ImplementationReport>) => {
    if (!currentUser) return

    const report = reports.find((r) => r.id === id)
    if (report && canAccessData(currentUser.id, report.organizationId, report.departmentId)) {
      const updatedReport = { ...report, ...updates }
      saveReport(updatedReport)
      loadReports()
    }
  }

  const removeReport = (id: string) => {
    if (!currentUser) return

    const report = reports.find((r) => r.id === id)
    if (report && canAccessData(currentUser.id, report.organizationId, report.departmentId)) {
      deleteReport(id)
      loadReports()
    }
  }

  return { reports, loading, addReport, updateReport, removeReport, refresh: loadReports }
}
