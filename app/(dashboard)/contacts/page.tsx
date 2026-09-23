import { ContactsList } from '@/components/dashboard/ContactsList';

export default function ContactsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold text-ink-primary">Kontaktlar</h1>
        <p className="text-sm text-ink-tertiary">Guruh a'zolari</p>
      </div>
      <ContactsList />
    </div>
  );
}
