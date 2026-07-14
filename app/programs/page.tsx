import { getPrograms, getPlanningYears } from "@/actions/planning"
import { getProgramWallets } from "@/actions/program-wallets"
import { ProgramsClientPage } from "@/components/programs/programs-client-page"

export default async function ProgramsPage() {
  const [programsResult, yearsResult, walletsResult] = await Promise.all([
    getPrograms(),
    getPlanningYears(),
    getProgramWallets()
  ])

  return (
    <ProgramsClientPage
      initialPrograms={programsResult.data || []}
      initialYears={yearsResult.data || []}
      initialWallets={walletsResult.data || []}
    />
  )
}
