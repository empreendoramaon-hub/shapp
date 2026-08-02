import { initializeApp, getApp, getApps } from 'firebase/app'
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut
} from 'firebase/auth'
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDCVpAIscfOqOA7v6bjGGEp6O3ofaIrUFM',
  authDomain: 'shapp-4aad6.firebaseapp.com',
  projectId: 'shapp-4aad6',
  storageBucket: 'shapp-4aad6.firebasestorage.app',
  messagingSenderId: '274030701212',
  appId: '1:274030701212:web:5271658525be9988111b59'
}

const APP_NAME = 'shapp-fit'
const ADMIN_EMAIL = 'empreendoramaon@gmail.com'
const app = getApps().some((item) => item.name === APP_NAME)
  ? getApp(APP_NAME)
  : initializeApp(firebaseConfig, APP_NAME)
const auth = getAuth(app)
const db = getFirestore(app)
const reservations = collection(db, 'academies', 'shapp', 'reservations')

const appCheckSiteKey = import.meta.env.VITE_SHAPP_RECAPTCHA_ENTERPRISE_SITE_KEY
if (appCheckSiteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true
  })
}

function cleanId(value = '') {
  return `${value}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 100)
}

function reservationFromSnapshot(snapshot) {
  const data = snapshot.data()
  return {
    id: snapshot.id,
    ...data,
    requestedAt: data.requestedAt?.toDate?.().toISOString?.() || data.requestedAt || '',
    confirmedAt: data.confirmedAt?.toDate?.().toISOString?.() || data.confirmedAt || ''
  }
}

export function isShappAdmin(user) {
  return Boolean(user && !user.isAnonymous && user.email?.toLocaleLowerCase('pt-BR') === ADMIN_EMAIL)
}

export function subscribeShappAuth(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function signInShappAdmin() {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ login_hint: ADMIN_EMAIL, prompt: 'select_account' })
  const result = await signInWithPopup(auth, provider)
  if (!isShappAdmin(result.user)) {
    await signOut(auth)
    throw new Error(`Entre com ${ADMIN_EMAIL}.`)
  }
  return result.user
}

export async function signOutShappAdmin() {
  await signOut(auth)
}

async function ensureStudentSession() {
  if (auth.currentUser) return auth.currentUser
  const result = await signInAnonymously(auth)
  return result.user
}

export async function saveShappReservation({ student, activity, status }) {
  const user = await ensureStudentSession()
  const activityId = cleanId(activity.id)
  const reservationId = `${cleanId(user.uid)}-${activityId}`
  const reservationRef = doc(reservations, reservationId)

  await setDoc(reservationRef, {
    academyId: 'shapp',
    createdBy: user.uid,
    studentId: cleanId(student.id),
    studentToken: cleanId(student.token),
    studentName: `${student.name || 'Aluno'}`.trim().slice(0, 90),
    activityId,
    activityTitle: `${activity.title || 'Atividade'}`.trim().slice(0, 90),
    activityDate: `${activity.date || ''}`.slice(0, 10),
    activityTime: `${activity.time || ''}`.slice(0, 5),
    activityPlace: `${activity.place || ''}`.trim().slice(0, 90),
    status: status === 'cancelled' ? 'cancelled' : 'pending',
    requestedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true })
}

export async function subscribeStudentReservations(studentToken, callback, onError) {
  const user = await ensureStudentSession()
  const studentQuery = query(reservations, where('createdBy', '==', user.uid))
  return onSnapshot(studentQuery, (snapshot) => {
    callback(snapshot.docs
      .map(reservationFromSnapshot)
      .filter((item) => item.studentToken === cleanId(studentToken)))
  }, onError)
}

export function subscribeAdminReservations(callback, onError) {
  return onSnapshot(reservations, (snapshot) => {
    callback(snapshot.docs.map(reservationFromSnapshot))
  }, onError)
}

export async function updateShappReservation(reservationId, status) {
  if (!['confirmed', 'cancelled'].includes(status)) throw new Error('Status de reserva inválido.')
  await updateDoc(doc(reservations, reservationId), {
    status,
    confirmedAt: status === 'confirmed' ? serverTimestamp() : null,
    updatedAt: serverTimestamp()
  })
}
