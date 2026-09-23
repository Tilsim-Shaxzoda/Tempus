import type { Contact } from '@/hooks/useContacts';

export interface UpcomingBirthday {
  contact: Contact;
  daysUntil: number;
  turningAge: number | null;
}

export function getUpcomingBirthdays(contacts: Contact[], now: Date = new Date()): UpcomingBirthday[] {
  const withBirthday = contacts.filter((c): c is Contact & { birthday: string } => !!c.birthday);

  return withBirthday
    .map((contact) => {
      const bday = new Date(contact.birthday);
      let next = new Date(now.getFullYear(), bday.getMonth(), bday.getDate());
      if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
        next = new Date(now.getFullYear() + 1, bday.getMonth(), bday.getDate());
      }
      const daysUntil = Math.round((next.getTime() - now.getTime()) / 86_400_000);
      const turningAge = next.getFullYear() - bday.getFullYear();

      return { contact, daysUntil, turningAge };
    })
    .sort((a, b) => a.daysUntil - b.daysUntil);
}
