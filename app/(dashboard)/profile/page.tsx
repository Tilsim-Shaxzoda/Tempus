import { ProfileForm } from '@/components/dashboard/ProfileForm';

export default function ProfilePage() {
  return (
    <div className="max-w-lg space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-primary">Profil</h1>
        <p className="text-sm text-ink-tertiary">Ma'lumotlaringizni yangilang</p>
      </div>
      <ProfileForm />
    </div>
  );
}
