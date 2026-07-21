import { initializeApp, getApps } from 'firebase/app'
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check'
import { getAuth, onIdTokenChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, serverTimestamp, setDoc } from 'firebase/firestore'
import { filterFutureSotaliaActivities, sotaliaActivityDateTime } from './sotaliaData.js'

const envFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const publicSotaliaFirebaseConfig = {
  apiKey: 'AIzaSyCUdQwJ4C-BeC7UQKJ1jrvCy6NelQ91iNw',
  authDomain: 'sotalia-sports-empre.firebaseapp.com',
  projectId: 'sotalia-sports-empre',
  storageBucket: 'sotalia-sports-empre.firebasestorage.app',
  messagingSenderId: '627117537067',
  appId: '1:627117537067:web:54a9aade2f62cbc044376e'
}

const hasEnvFirebaseConfig = Object.values(envFirebaseConfig).every(Boolean)
const firebaseConfig = hasEnvFirebaseConfig ? envFirebaseConfig : publicSotaliaFirebaseConfig

export const hasSotaliaFirebaseConfig = Object.values(firebaseConfig).every(Boolean)

let db = null
let auth = null

if (hasSotaliaFirebaseConfig) {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = hasEnvFirebaseConfig ? getAuth(app) : null

  const appCheckSiteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY
  if (appCheckSiteKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true
    })
  }
}

const LOCAL_EVENTS_KEY = 'sotaliaAppEvents'
const LOCAL_ACTIVITIES_KEY = 'sotaliaActivities'
const FIRESTORE_REST_BASE = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/academies/sotalia`

export function subscribeToAdminSession(callback) {
  if (!auth) {
    callback({ demo: true, loading: false, user: null })
    return () => {}
  }

  return onIdTokenChanged(auth, async (user) => {
    if (!user) {
      callback({ demo: false, loading: false, user: null })
      return
    }

    try {
      const token = await user.getIdTokenResult()
      const academyAllowed = token.claims.academyId === 'sotalia' || token.claims.superAdmin === true
      callback({
        demo: false,
        loading: false,
        user,
        authorized: token.claims.admin === true && academyAllowed
      })
    } catch {
      callback({ demo: false, loading: false, user, authorized: false })
    }
  })
}

export async function signInSotaliaAdmin(email, password) {
  if (!auth) throw new Error('Firebase Authentication nao esta configurado.')
  return signInWithEmailAndPassword(auth, email.trim(), password)
}

export async function signOutSotaliaAdmin() {
  if (auth) await signOut(auth)
}

export async function loadSotaliaMember(memberId) {
  if (!db) return loadSotaliaMemberRest(memberId)

  try {
    const snap = await withSotaliaTimeout(getDoc(doc(db, 'academies', 'sotalia', 'members', memberId)))
    return snap.exists() ? snap.data() : loadSotaliaMemberRest(memberId)
  } catch {
    return loadSotaliaMemberRest(memberId)
  }
}

export async function loadSotaliaMembers() {
  if (!db) return loadSotaliaCollectionRest('members')

  try {
    const snap = await withSotaliaTimeout(getDocs(collection(db, 'academies', 'sotalia', 'members')))
    const members = snap.docs.map((item) => ({ id: item.id, ...item.data() }))
    return members.length ? members : loadSotaliaCollectionRest('members')
  } catch {
    return loadSotaliaCollectionRest('members')
  }
}

export async function loadSotaliaEvents() {
  if (!db) return readLocalEvents()

  try {
    const snap = await withSotaliaTimeout(getDocs(collection(db, 'academies', 'sotalia', 'appEvents')))
    const events = snap.docs.map((item) => ({ id: item.id, ...item.data() }))
    return sortSotaliaEvents(events)
  } catch {
    const events = await loadSotaliaCollectionRest('appEvents')
    return sortSotaliaEvents(events)
  }
}

function sortSotaliaEvents(events = []) {
  return events
    .sort((a, b) => eventTime(b) - eventTime(a))
    .slice(0, 80)
}

export async function loadSotaliaActivities(includeExpired = false) {
  if (!db) return readLocalActivities(includeExpired)

  let activities = []
  try {
    const snap = await withSotaliaTimeout(getDocs(collection(db, 'academies', 'sotalia', 'activities')))
    activities = snap.docs.map((item) => ({ id: item.id, ...item.data() }))
  } catch {
    activities = await loadSotaliaCollectionRest('activities')
  }
  if (!activities.length) activities = await loadSotaliaCollectionRest('activities')
  activities = activities.sort((a, b) => activityTime(a) - activityTime(b))
  return includeExpired ? activities : filterFutureSotaliaActivities(activities)
}

export async function saveSotaliaActivity(activity) {
  if (!db) return saveLocalActivity(activity)

  await setDoc(doc(db, 'academies', 'sotalia', 'activities', activity.id), activity, { merge: true })
  return { firebase: true }
}

export async function deleteSotaliaActivity(activityId) {
  if (!db) return deleteLocalActivity(activityId)

  await deleteDoc(doc(db, 'academies', 'sotalia', 'activities', activityId))
  return { firebase: true }
}

export async function deleteSotaliaEvent(eventId) {
  if (!db) return deleteLocalEvent(eventId)

  await deleteDoc(doc(db, 'academies', 'sotalia', 'appEvents', eventId))
  return { firebase: true }
}

export async function saveSotaliaMember(memberId, payload) {
  if (!db) return saveLocalEvent({ type: 'member-update', memberId, payload })

  await setDoc(doc(db, 'academies', 'sotalia', 'members', memberId), payload, { merge: true })
  return { firebase: true }
}

export async function deleteSotaliaMember(memberId) {
  if (!db) return saveLocalEvent({ type: 'member-delete-local-only', memberId })

  await deleteDoc(doc(db, 'academies', 'sotalia', 'members', memberId))
  return { firebase: true }
}

export async function saveSotaliaEvent(payload) {
  if (!db) return saveLocalEvent(payload)

  await addDoc(collection(db, 'academies', 'sotalia', 'appEvents'), {
    ...payload,
    createdAt: serverTimestamp()
  })
  return { firebase: true }
}

function saveLocalEvent(payload) {
  const current = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '[]')
  const event = { id: payload.id || `event-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, ...payload, createdAt: new Date().toISOString(), local: true }
  localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify([event, ...current].slice(0, 80)))
  return { local: true }
}

function readLocalEvents() {
  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_EVENTS_KEY) || '[]')
    return Array.isArray(current) ? current : []
  } catch {
    return []
  }
}

function deleteLocalEvent(eventId) {
  const current = readLocalEvents()
  localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(current.filter((event) => event.id !== eventId)))
  return { local: true }
}

function withSotaliaTimeout(promise, ms = 2500) {
  return Promise.race([
    promise,
    new Promise((_, reject) => window.setTimeout(() => reject(new Error('Firebase read timeout')), ms))
  ])
}

async function loadSotaliaMemberRest(memberId) {
  if (!hasSotaliaFirebaseConfig || !memberId) return null
  try {
    const response = await fetch(`${FIRESTORE_REST_BASE}/members/${encodeURIComponent(memberId)}`)
    if (!response.ok) return null
    return parseFirestoreDocument(await response.json())
  } catch {
    return null
  }
}

async function loadSotaliaCollectionRest(collectionName) {
  if (!hasSotaliaFirebaseConfig) return []
  try {
    const response = await fetch(`${FIRESTORE_REST_BASE}/${collectionName}?pageSize=200`)
    if (!response.ok) return []
    const payload = await response.json()
    return (payload.documents || []).map(parseFirestoreDocument)
  } catch {
    return []
  }
}

function parseFirestoreDocument(document = {}) {
  const id = String(document.name || '').split('/').pop()
  return { id, ...parseFirestoreMap(document.fields || {}) }
}

function parseFirestoreMap(fields = {}) {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, parseFirestoreValue(value)]))
}

function parseFirestoreValue(value = {}) {
  if ('stringValue' in value) return value.stringValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('booleanValue' in value) return Boolean(value.booleanValue)
  if ('timestampValue' in value) return value.timestampValue
  if ('nullValue' in value) return null
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(parseFirestoreValue)
  if ('mapValue' in value) return parseFirestoreMap(value.mapValue.fields || {})
  return undefined
}

function saveLocalActivity(activity) {
  const current = readLocalActivities()
  localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify([activity, ...current.filter((item) => item.id !== activity.id)].slice(0, 120)))
  return { local: true }
}

function deleteLocalActivity(activityId) {
  const current = readLocalActivities()
  localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(current.filter((item) => item.id !== activityId)))
  return { local: true }
}

function readLocalActivities(includeExpired = false) {
  try {
    const current = JSON.parse(localStorage.getItem(LOCAL_ACTIVITIES_KEY) || '[]')
    if (includeExpired) return Array.isArray(current) ? current.sort((a, b) => activityTime(a) - activityTime(b)) : []
    const future = Array.isArray(current) ? filterFutureSotaliaActivities(current).sort((a, b) => activityTime(a) - activityTime(b)) : []
    if (Array.isArray(current) && future.length !== current.length) localStorage.setItem(LOCAL_ACTIVITIES_KEY, JSON.stringify(future))
    return future
  } catch {
    return []
  }
}

function eventTime(event) {
  if (event.createdAt?.toMillis) return event.createdAt.toMillis()
  if (event.createdAt?.seconds) return event.createdAt.seconds * 1000
  return new Date(event.createdAt || 0).getTime()
}

function activityTime(activity) {
  return sotaliaActivityDateTime(activity)
}
