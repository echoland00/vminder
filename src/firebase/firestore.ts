import {
  collection, addDoc, getDocs, doc, updateDoc, deleteDoc,
  query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { Contact, Reminder } from '../types'

// ---------- Contacts ----------
export function watchContacts(uid: string, cb: (rows: Contact[]) => void) {
  const q = query(collection(db, 'users', uid, 'contacts'), orderBy('name'))
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Contact, 'id'>) })))
  })
}

export async function addContact(uid: string, data: { name: string; phone: string }) {
  return addDoc(collection(db, 'users', uid, 'contacts'), {
    ...data,
    createdAt: Date.now(),
  })
}

export async function updateContact(uid: string, id: string, data: { name: string; phone: string }) {
  return updateDoc(doc(db, 'users', uid, 'contacts', id), data)
}

export async function deleteContact(uid: string, id: string) {
  return deleteDoc(doc(db, 'users', uid, 'contacts', id))
}

// ---------- Reminders ----------
export function watchReminders(uid: string, cb: (rows: Reminder[]) => void) {
  const q = query(collection(db, 'users', uid, 'reminders'), orderBy('scheduledFor'))
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => {
      const x = d.data() as any
      return {
        id: d.id,
        contactId: x.contactId,
        contactName: x.contactName,
        message: x.message,
        scheduledFor: x.scheduledFor?.toMillis?.() ?? x.scheduledFor,
        status: x.status,
        recurring: x.recurring,
        createdAt: x.createdAt?.toMillis?.() ?? x.createdAt,
        sentAt: x.sentAt?.toMillis?.() ?? x.sentAt,
      } as Reminder
    }))
  })
}

export async function addReminder(uid: string, data: Omit<Reminder, 'id'>) {
  return addDoc(collection(db, 'users', uid, 'reminders'), {
    ...data,
    scheduledFor: data.scheduledFor,    // ms epoch - matches native App.tsx pattern
    createdAt: serverTimestamp(),
  })
}

export async function updateReminder(uid: string, id: string, data: Partial<Reminder>) {
  return updateDoc(doc(db, 'users', uid, 'reminders', id), {
    ...data,
    scheduledFor: data.scheduledFor,
  })
}

export async function deleteReminder(uid: string, id: string) {
  return deleteDoc(doc(db, 'users', uid, 'reminders', id))
}

export async function listAllRemindersOnce(uid: string): Promise<Reminder[]> {
  const q = query(collection(db, 'users', uid, 'reminders'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as Reminder))
}
