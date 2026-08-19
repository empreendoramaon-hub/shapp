import test from 'node:test'
import assert from 'node:assert/strict'
import { activateEleveInvite, buildEleveInvitePath, calculateEleveMetrics, createEleveBrandedSeed, createEleveInvite, eleveAdminRoles, eleveRoles, eleveSeed, hashElevePassword, hydrateEleveState, planAllowsAppointment, scopeEleveStudents, upsertEleveAssessment, upsertEleveSatisfaction, upsertEleveWorkout } from '../src/elevePlatformData.js'

test('gerente visualiza somente alunos da unidade atribuída', () => {
  const manager = eleveRoles.find((role) => role.id === 'manager')
  const students = scopeEleveStudents(eleveSeed, manager)
  assert.ok(students.length > 0)
  assert.ok(students.every((student) => student.unitId === 'continente'))
})

test('personal visualiza somente sua carteira', () => {
  const trainer = eleveRoles.find((role) => role.id === 'trainer')
  const students = scopeEleveStudents(eleveSeed, trainer)
  assert.ok(students.every((student) => student.trainerId === trainer.trainerId))
})

test('plano sem personal bloqueia agendamento', () => {
  const student = eleveSeed.students.find((item) => item.id === 'aluno-camila')
  const trainer = eleveSeed.trainers.find((item) => item.id === 'personal-marina')
  const result = planAllowsAppointment(eleveSeed, student, trainer, '2026-08-21', '08:00')
  assert.equal(result.ok, false)
  assert.match(result.reason, /não inclui/i)
})

test('métricas consolidam risco, inadimplência e frequência', () => {
  const metrics = calculateEleveMetrics(eleveSeed, eleveSeed.students)
  assert.equal(metrics.highRisk, 2)
  assert.equal(metrics.overdue, 2)
  assert.ok(metrics.averageFrequency > 0)
})

test('satisfação do aluno é atualizada sem mutar o estado original', () => {
  const next = upsertEleveSatisfaction(eleveSeed, 'aluno-ana', 4)
  assert.equal(next.students.find((student) => student.id === 'aluno-ana').satisfaction, 4)
  assert.equal(eleveSeed.students.find((student) => student.id === 'aluno-ana').satisfaction, 5)
})

test('painel administrativo não oferece o perfil de aluno', () => {
  assert.equal(eleveAdminRoles.some((role) => role.id === 'student'), false)
})

test('treino é criado sem mutar o catálogo original', () => {
  const workout = { id: 'novo', studentId: 'aluno-camila', name: 'Treino inicial', exercises: [{ id: 'x', name: 'Agachamento', sets: 3, reps: '12' }] }
  const next = upsertEleveWorkout(eleveSeed, workout)
  assert.ok(next.workouts.some((item) => item.id === 'novo'))
  assert.equal(eleveSeed.workouts.some((item) => item.id === 'novo'), false)
})

test('avaliação calcula IMC e preserva o estado original', () => {
  const next = upsertEleveAssessment(eleveSeed, 'aluno-camila', { date: '2026-08-19', weight: 70, height: 1.75, medicalHistory: 'Sem restrições.' })
  assert.equal(next.students.find((student) => student.id === 'aluno-camila').assessment.bmi, 22.9)
  assert.equal(eleveSeed.students.find((student) => student.id === 'aluno-camila').assessment, null)
  assert.equal(next.students.find((student) => student.id === 'aluno-camila').assessments.length, 1)
})

test('instância Eleve preserva o modelo genérico e aplica a marca do cliente', () => {
  const branded = createEleveBrandedSeed()
  assert.equal(branded.academy.id, 'eleve')
  assert.equal(branded.academy.name, 'Eleve')
  assert.equal(branded.units[0].name, 'Continente Shopping')
  assert.equal(eleveSeed.academy.id, 'shapp-premium-demo')
})

test('links podem usar o endereço dedicado da Eleve', () => {
  const token = 'ABCD1234EFGH5678'
  assert.equal(buildEleveInvitePath(token, '/eleve'), `/eleve/convite/${token}`)
})

test('hidratação acrescenta gamificação e treinos em estados antigos', () => {
  const old = { academy: { id: 'shapp-premium-demo' }, students: eleveSeed.students.map(({ gamification, ...student }) => student) }
  const hydrated = hydrateEleveState(old)
  assert.ok(hydrated.workouts.length > 0)
  assert.ok(hydrated.students.find((student) => student.id === 'aluno-ana').gamification.xp > 0)
})

test('convite da Gestão Premium carrega somente token no link', () => {
  const token = 'conviteSeguro123456'
  const result = createEleveInvite(eleveSeed, { name: 'Nova Aluna', phone: '(48) 99999-1111', email: 'nova@exemplo.com', unitId: 'continente', planId: 'premium' }, token)
  const path = buildEleveInvitePath(result.invite.token)
  assert.equal(path, `/gestao-premium/convite/${token}`)
  assert.equal(path.includes('nova@exemplo.com'), false)
  assert.equal(result.state.students.some((student) => student.email === 'nova@exemplo.com'), false)
})

test('aceite do convite ativa aluno novo na unidade correta', async () => {
  const token = 'conviteSeguro654321'
  const invited = createEleveInvite(eleveSeed, { name: 'Nova Aluna', phone: '(48) 99999-1111', email: 'nova@exemplo.com', unitId: 'caxias', planId: 'annual' }, token)
  const passwordHash = await hashElevePassword('senha-segura')
  const activated = activateEleveInvite(invited.state, token, { terms: true, privacy: true, data: true, passwordHash })
  assert.equal(activated.student.status, 'new')
  assert.equal(activated.student.unitId, 'caxias')
  assert.equal(activated.student.auth.passwordHash, passwordHash)
  assert.equal(activated.state.invites[0].status, 'registered')
})
