import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GlassCard } from '@/components/ui/GlassCard';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-primary">Sozlamalar</h1>
        <p className="text-sm text-ink-tertiary">Hisob va ilova haqida</p>
      </div>

      <GlassCard className="divide-y divide-white/[0.06] p-5">
        <Row label="Username" value={session?.user?.username ?? '—'} />
        <Row label="Rol" value={session?.user?.role === 'ADMIN' ? 'Admin' : 'A\'zo'} />
        <Row label="Mavzu" value="Dark (yagona rejim)" />
      </GlassCard>

      <p className="text-xs text-ink-tertiary">
        Profil ma'lumotlarini va parolni <a href="/profile" className="text-accent hover:underline">Profil</a> bo'limidan o'zgartirishingiz mumkin.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
      <span className="text-sm text-ink-secondary">{label}</span>
      <span className="text-sm text-ink-primary">{value}</span>
    </div>
  );
}
