'use client';

import { useState, type FormEvent } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import type { Contact } from '@/lib/storage';

const inputClass =
  'w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink-primary focus:border-accent/40';

interface FormState {
  fullName: string;
  phone: string;
  telegram: string;
  birthday: string;
}

const emptyForm: FormState = { fullName: '', phone: '', telegram: '', birthday: '' };

function toFormState(contact: Contact): FormState {
  return {
    fullName: contact.fullName,
    phone: contact.phone ?? '',
    telegram: contact.telegram ?? '',
    birthday: contact.birthday ? contact.birthday.slice(0, 10) : ''
  };
}

function toContactPatch(form: FormState) {
  return {
    fullName: form.fullName.trim(),
    phone: form.phone.trim() || null,
    telegram: form.telegram.trim() || null,
    birthday: form.birthday || null
  };
}

export function AdminContactsManager() {
  const { contacts, addContact, updateContact, removeContact } = useAppData();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!form.fullName.trim()) return;
    addContact(toContactPatch(form));
    setForm(emptyForm);
  }

  function startEdit(contact: Contact) {
    setEditingId(contact.id);
    setEditForm(toFormState(contact));
  }

  function handleEditSave(e: FormEvent) {
    e.preventDefault();
    if (!editingId || !editForm.fullName.trim()) return;
    updateContact(editingId, toContactPatch(editForm));
    setEditingId(null);
  }

  function handleDelete(id: string) {
    if (window.confirm("Kontaktni o'chirasizmi?")) removeContact(id);
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleAdd} className="space-y-3">
        <p className="text-xs font-medium text-ink-secondary">Yangi kontakt qo'shish</p>
        <input
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          placeholder="Ism familiya"
          required
          className={inputClass}
        />
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="Telefon"
            className={inputClass}
          />
          <input
            value={form.telegram}
            onChange={(e) => setForm({ ...form, telegram: e.target.value })}
            placeholder="Telegram (@username)"
            className={inputClass}
          />
        </div>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-ink-secondary">Tug'ilgan kun</span>
          <input
            type="date"
            value={form.birthday}
            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            className={inputClass}
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-accent/90 px-4 py-2.5 text-sm font-medium text-base-950 hover:bg-accent"
        >
          Qo'shish
        </button>
      </form>

      <div className="space-y-2">
        <p className="text-xs font-medium text-ink-secondary">Kontaktlar ({contacts.length})</p>
        {contacts.length === 0 && <p className="text-sm text-ink-tertiary">Hali kontakt yo'q.</p>}
        {contacts.map((contact) =>
          editingId === contact.id ? (
            <form
              key={contact.id}
              onSubmit={handleEditSave}
              className="space-y-2 rounded-xl border border-accent/30 bg-white/[0.02] p-3"
            >
              <input
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                required
                className={inputClass}
              />
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="Telefon"
                  className={inputClass}
                />
                <input
                  value={editForm.telegram}
                  onChange={(e) => setEditForm({ ...editForm, telegram: e.target.value })}
                  placeholder="Telegram"
                  className={inputClass}
                />
              </div>
              <input
                type="date"
                value={editForm.birthday}
                onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                className={inputClass}
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-accent/90 px-3 py-2 text-xs font-medium text-base-950 hover:bg-accent"
                >
                  Saqlash
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-lg px-3 py-2 text-xs text-ink-secondary hover:bg-white/[0.06]"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          ) : (
            <div
              key={contact.id}
              className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-primary">{contact.fullName}</p>
                <p className="truncate text-xs text-ink-tertiary">
                  {[contact.phone, contact.telegram, contact.birthday].filter(Boolean).join(' · ') || '—'}
                </p>
              </div>
              <button
                onClick={() => startEdit(contact)}
                aria-label="Tahrirlash"
                className="rounded-lg p-2 text-ink-secondary hover:bg-white/[0.06] hover:text-ink-primary"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button
                onClick={() => handleDelete(contact.id)}
                aria-label="O'chirish"
                className="rounded-lg p-2 text-ink-secondary hover:bg-white/[0.06] hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
