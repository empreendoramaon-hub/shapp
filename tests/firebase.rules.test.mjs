import { after, before, beforeEach, test } from 'node:test'
import { readFile } from 'node:fs/promises'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, Timestamp, updateDoc } from 'firebase/firestore'
import { getBytes, ref, uploadString } from 'firebase/storage'

const projectId = 'demo-shapp-security'
let testEnv

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules: await readFile('firestore.rules', 'utf8') },
    storage: { rules: await readFile('storage.rules', 'utf8') }
  })
})

beforeEach(async () => {
  await testEnv.clearFirestore()
  await testEnv.clearStorage()

  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'academies/sotalia/members/member-a'), {
      authUid: 'student-a',
      name: 'Aluno A',
      bookedClasses: [],
      checkinsMonth: 0,
      level: 1,
      noticesRead: [],
      streak: 0,
      xp: 0
    })
  })
})

after(async () => {
  await testEnv?.cleanup()
})

test('lead valido pode ser criado, mas nao pode ser lido', async () => {
  const db = testEnv.unauthenticatedContext().firestore()
  const lead = doc(db, 'landingLeads/lead-1')

  await assertSucceeds(setDoc(lead, {
    name: 'Ana',
    email: 'ana@example.com',
    profile: 'aluno',
    interest: 'Quero conhecer o produto',
    createdAt: Timestamp.now(),
    source: 'landing'
  }))
  await assertFails(getDoc(lead))
})

test('lead com campo administrativo injetado e rejeitado', async () => {
  const db = testEnv.unauthenticatedContext().firestore()
  await assertFails(setDoc(doc(db, 'landingLeads/lead-2'), {
    name: 'Ana',
    email: 'ana@example.com',
    profile: 'aluno',
    interest: 'Teste',
    createdAt: Timestamp.now(),
    source: 'landing',
    admin: true
  }))
})

test('usuario anonimo e outro aluno nao leem o documento privado', async () => {
  const path = 'academies/sotalia/members/member-a'
  await assertFails(getDoc(doc(testEnv.unauthenticatedContext().firestore(), path)))
  await assertFails(getDoc(doc(testEnv.authenticatedContext('student-b').firestore(), path)))
})

test('aluno le o proprio documento e so altera preferencias permitidas', async () => {
  const db = testEnv.authenticatedContext('student-a').firestore()
  const member = doc(db, 'academies/sotalia/members/member-a')

  await assertSucceeds(getDoc(member))
  await assertSucceeds(updateDoc(member, { bookedClasses: ['hidro-07'], noticesRead: ['n1'] }))
  await assertFails(updateDoc(member, { xp: 999999 }))
  await assertFails(updateDoc(member, { admin: true }))
})

test('admin da academia pode gerenciar membros; admin de outra academia nao pode', async () => {
  const adminDb = testEnv.authenticatedContext('admin-a', {
    admin: true,
    academyId: 'sotalia'
  }).firestore()
  const otherAdminDb = testEnv.authenticatedContext('admin-b', {
    admin: true,
    academyId: 'outra-academia'
  }).firestore()
  const target = 'academies/sotalia/members/member-b'

  await assertSucceeds(setDoc(doc(adminDb, target), { name: 'Aluno B', authUid: 'student-b' }))
  await assertFails(getDoc(doc(otherAdminDb, target)))
})

test('eventos de auditoria so podem ser criados por administrador', async () => {
  const eventPath = 'academies/sotalia/appEvents/event-1'
  const event = {
    memberId: 'member-a',
    type: 'member-saved',
    source: 'sotalia-admin',
    createdAt: Timestamp.now()
  }
  const studentDb = testEnv.authenticatedContext('student-a').firestore()
  const adminDb = testEnv.authenticatedContext('admin-a', {
    admin: true,
    academyId: 'sotalia'
  }).firestore()

  await assertFails(setDoc(doc(studentDb, eventPath), event))
  await assertSucceeds(setDoc(doc(adminDb, eventPath), event))
})

test('colecoes desconhecidas e Storage permanecem fechados', async () => {
  const db = testEnv.authenticatedContext('admin-a', { admin: true, superAdmin: true }).firestore()
  await assertFails(setDoc(doc(db, 'internal/config'), { enabled: true }))

  const storage = testEnv.authenticatedContext('admin-a', { admin: true, superAdmin: true }).storage()
  const objectRef = ref(storage, 'users/admin-a/images/avatar.png')
  await assertFails(uploadString(objectRef, 'not-an-image'))
  await assertFails(getBytes(objectRef))
})
