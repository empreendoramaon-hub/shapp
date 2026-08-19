import { after, before, beforeEach, test } from 'node:test'
import { readFile } from 'node:fs/promises'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore'

const projectId = 'demo-shapp-reservations-security'
const reservationPath = 'academies/shapp/reservations/student-a-hidro-07'
let testEnv

const reservation = {
  academyId: 'shapp',
  createdBy: 'student-a',
  studentId: 'member-a',
  studentToken: 'student-a',
  studentName: 'Aluno A',
  activityId: 'hidro-07',
  activityTitle: 'Hidroginastica',
  activityDate: '2026-08-04',
  activityTime: '07:30',
  activityPlace: 'Piscina',
  status: 'pending',
  requestedAt: Timestamp.now(),
  updatedAt: Timestamp.now()
}

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules: await readFile('firestore.shapp.rules', 'utf8') }
  })
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), reservationPath), reservation)
  })
})

after(async () => {
  await testEnv?.cleanup()
})

test('cliente autenticado nao grava reserva diretamente', async () => {
  const db = testEnv.authenticatedContext('student-a').firestore()
  await assertFails(setDoc(doc(db, 'academies/shapp/reservations/student-a-nova'), {
    ...reservation,
    activityId: 'nova'
  }))
  await assertFails(updateDoc(doc(db, reservationPath), {
    status: 'cancelled',
    updatedAt: Timestamp.now()
  }))
})

test('dono le a propria reserva, mas outro usuario nao le', async () => {
  const ownerDb = testEnv.authenticatedContext('student-a').firestore()
  const otherDb = testEnv.authenticatedContext('student-b').firestore()
  await assertSucceeds(getDoc(doc(ownerDb, reservationPath)))
  await assertFails(getDoc(doc(otherDb, reservationPath)))
})

test('administrador verificado atualiza a reserva', async () => {
  const adminDb = testEnv.authenticatedContext('admin-shapp', {
    email_verified: true,
    email: 'empreendoramaon@gmail.com'
  }).firestore()
  await assertSucceeds(updateDoc(doc(adminDb, reservationPath), {
    status: 'confirmed',
    confirmedAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }))
})