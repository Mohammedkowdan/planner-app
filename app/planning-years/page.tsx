import { getPlanningYears } from "@/actions/planning"
import { PlanningYearsClientPage } from "@/components/planning-years/planning-years-client-page"

export default async function PlanningYearsPage() {
    const { data: years } = await getPlanningYears()

    return <PlanningYearsClientPage initialYears={years || []} />
}
