import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ClientShell from './ClientShell'
import { isAdminEmail } from '@/lib/admins'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: store } = await supabase
    .from('stores')
    .select('plan, plan_expires_at')
    .eq('owner_id', user.id)
    .single()

  let hasActivePlan = false;
  const isAdmin = isAdminEmail(user.email);
  if (isAdmin) {
    hasActivePlan = true; // Admins always have active plan
  } else if (store && store.plan && store.plan !== 'none' && store.plan_expires_at) {
    if (new Date(store.plan_expires_at) > new Date()) {
      hasActivePlan = true;
    }
  }

  return <ClientShell hasActivePlan={hasActivePlan} isAdmin={isAdmin}>{children}</ClientShell>
}
