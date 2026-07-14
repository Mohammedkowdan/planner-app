import { getIndicators, getPlanningYears } from "@/actions/planning"
import { getMainGoals } from "@/actions/main-goals"
import { IndicatorsClientPage } from "@/components/indicators/indicators-client-page"

export default async function IndicatorsPage() {
  const [indicatorsResult, yearsResult, mainGoalsResult] = await Promise.all([
    getIndicators(),
    getPlanningYears(),
    getMainGoals()
  ])

  return (
    <IndicatorsClientPage
      initialIndicators={indicatorsResult.data || []}
      initialYears={yearsResult.data || []}
      mainGoals={mainGoalsResult.data || []}
    />
  )
}
