import { useEffect, useState } from 'react'
import { watchContacts } from '../firebase/firestore'
import type { Contact } from '../types'

export function useContacts(uid: string | undefined) {
  const [contacts, setContacts] = useState<Contact[]>([])

  useEffect(() => {
    if (!uid) { setContacts([]); return }
    return watchContacts(uid, setContacts)
  }, [uid])

  return contacts
}
