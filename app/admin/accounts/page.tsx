import { AdminAccountsManager } from './_components/admin-accounts-manager'
import { listManagedLearnerAccounts } from '@/lib/auth/service'

export default async function AdminAccountsPage() {
  const result = await listManagedLearnerAccounts()

  return (
    <AdminAccountsManager accounts={result.ok ? result.accounts : []} />
  )
}
