import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth } from './config'

export function onAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb)
}

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUp(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function logOut() {
  return signOut(auth)
}
