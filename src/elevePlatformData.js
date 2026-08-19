import { sanitizeSingleLine, validateEmail, validatePhone } from './inputValidation.js'

const today = '2026-08-19'

export const eleveRoles = [
  { id: 'ceo', label: 'CEO / Diretoria', unitScope: 'all' },
  { id: 'manager', label: 'Gerente de unidade', unitScope: 'continente' },
  { id: 'consultant', label: 'Consultor comercial', unitScope: 'continente' },
  { id: 'trainer', label: 'Personal trainer', unitScope: 'continente', trainerId: 'personal-marina' },
  { id: 'student', label: 'Aluno', unitScope: 'continente', studentId: 'aluno-ana' }
]

export const eleveAdminRoles = eleveRoles.filter((role) => role.id !== 'student')

export const eleveSeed = {
  academy: { id: 'shapp-premium-demo', name: 'Academia Demonstrativa', tagline: 'Gestão Premium', referenceDate: today, termsVersion: '1.0', privacyVersion: '1.0' },
  units: [
    { id: 'continente', name: 'Unidade Centro', city: 'Florianópolis - SC', students: 684, capacity: 900, manager: 'Mariana', satisfaction: 4.7 },
    { id: 'caxias', name: 'Unidade Norte', city: 'Joinville - SC', students: 426, capacity: 650, manager: 'Renata', satisfaction: 4.5 }
  ],
  plans: [
    { id: 'premium', name: 'Premium Multiunidade', price: 249, units: ['continente', 'caxias'], modalities: 9, personalSessions: 4, assessments: true, benefits: ['Todas as unidades', 'Personal', 'Avaliações', 'Benefícios exclusivos'] },
    { id: 'annual', name: 'Plano Anual', price: 149, units: ['continente'], modalities: 9, personalSessions: 1, assessments: true, benefits: ['Unidade principal', '9 modalidades', 'Avaliação periódica'] },
    { id: 'recurring', name: 'Plano Recorrente', price: 189, units: ['continente'], modalities: 6, personalSessions: 0, assessments: false, benefits: ['Unidade principal', '6 modalidades', 'Agenda coletiva'] },
    { id: 'health', name: 'Plano Essencial', price: 79, units: ['continente'], modalities: 3, personalSessions: 0, assessments: false, benefits: ['Acesso em horário definido', '3 modalidades'] }
  ],
  trainers: [
    { id: 'personal-marina', name: 'Marina Duarte', role: 'Personal trainer', unitId: 'continente', students: 28, satisfaction: 4.9, availability: ['07:00', '08:00', '17:00', '18:00'] },
    { id: 'personal-caio', name: 'Caio Mendes', role: 'Personal trainer', unitId: 'continente', students: 24, satisfaction: 4.7, availability: ['09:00', '10:00', '18:00', '19:00'] },
    { id: 'prof-livia', name: 'Lívia Rocha', role: 'Professora', unitId: 'caxias', students: 31, satisfaction: 4.8, availability: ['07:00', '12:00', '17:00'] }
  ],
  team: [
    { id: 'team-mariana', name: 'Mariana Lopes', email: 'mariana@academia.demo', role: 'Gerente de unidade', unitId: 'continente', students: 0, rating: 4.8, status: 'active' },
    { id: 'team-marina', name: 'Marina Duarte', email: 'marina@academia.demo', role: 'Personal trainer', unitId: 'continente', students: 28, rating: 4.9, status: 'active' },
    { id: 'team-caio', name: 'Caio Mendes', email: 'caio@academia.demo', role: 'Personal trainer', unitId: 'continente', students: 24, rating: 4.7, status: 'active' },
    { id: 'team-renata', name: 'Renata Alves', email: 'renata@academia.demo', role: 'Gerente de unidade', unitId: 'caxias', students: 0, rating: 4.6, status: 'active' },
    { id: 'team-livia', name: 'Lívia Rocha', email: 'livia@academia.demo', role: 'Professora', unitId: 'caxias', students: 31, rating: 4.8, status: 'active' }
  ],
  students: [
    { id: 'aluno-ana', name: 'Ana Carolina Silva', cpf: '***.482.***-09', phone: '(48) 99911-2233', email: 'ana@exemplo.com', unitId: 'continente', planId: 'premium', trainerId: 'personal-marina', status: 'active', joinedAt: '2025-11-02', lastVisit: '2026-08-18', frequency30d: 15, satisfaction: 5, financialStatus: 'paid', contractEndsAt: '2026-11-02', risk: 'low', sessionsUsed: 2, sessionsLimit: 4, assessmentDue: '2026-10-15', gamification: { xp: 2840, level: 12, streak: 8, weeklyGoal: 4, weeklyDone: 3, badges: ['Sequência de 7 dias', 'Meta mensal', 'Primeira avaliação'] }, assessment: { date: '2026-07-15', weight: 64.2, height: 1.68, bmi: 22.7, bodyFat: 22.1, muscleMass: 43.8, leanMass: 50, waist: 72, arms: 27, thighs: 53, bodyWater: 55.4, visceralFat: 5, medicalHistory: 'Sem doenças crônicas diagnosticadas.', diseases: 'Não informado.', surgeriesInjuries: 'Entorse leve no tornozelo direito em 2022.', medications: 'Não utiliza medicação contínua.', sleepWork: 'Sono médio de 7 horas; trabalho predominantemente sentado.', goals: 'Ganho de força, melhora postural e constância semanal.', posture: 'Leve anteriorização de ombros.', flexibility: 'Boa, com atenção à cadeia posterior.', strength: 'Intermediária.', cardiorespiratory: 'Bom condicionamento.', mobility: 'Mobilidade de quadril em evolução.' } },
    { id: 'aluno-bruno', name: 'Bruno Almeida', cpf: '***.771.***-42', phone: '(48) 99822-1177', email: 'bruno@exemplo.com', unitId: 'continente', planId: 'annual', trainerId: 'personal-caio', status: 'active', joinedAt: '2026-01-12', lastVisit: '2026-08-08', frequency30d: 5, satisfaction: 3, financialStatus: 'overdue', contractEndsAt: '2027-01-12', risk: 'high', sessionsUsed: 1, sessionsLimit: 1, assessmentDue: '2026-08-10', assessment: { date: '2026-05-10', weight: 91.5, bodyFat: 28.3, muscleMass: 56.1, waist: 101 } },
    { id: 'aluno-camila', name: 'Camila Nunes', cpf: '***.144.***-80', phone: '(48) 99123-8844', email: 'camila@exemplo.com', unitId: 'continente', planId: 'recurring', trainerId: null, status: 'active', joinedAt: '2026-05-20', lastVisit: '2026-08-13', frequency30d: 9, satisfaction: 4, financialStatus: 'paid', contractEndsAt: '2027-05-20', risk: 'medium', sessionsUsed: 0, sessionsLimit: 0, assessmentDue: null, assessment: null },
    { id: 'aluno-diego', name: 'Diego Martins', cpf: '***.927.***-16', phone: '(48) 99773-2210', email: 'diego@exemplo.com', unitId: 'continente', planId: 'health', trainerId: null, status: 'active', joinedAt: '2026-07-01', lastVisit: '2026-08-17', frequency30d: 12, satisfaction: 5, financialStatus: 'pending', contractEndsAt: '2027-07-01', risk: 'low', sessionsUsed: 0, sessionsLimit: 0, assessmentDue: null, assessment: null },
    { id: 'aluno-elisa', name: 'Elisa Cardoso', cpf: '***.321.***-55', phone: '(54) 99118-5544', email: 'elisa@exemplo.com', unitId: 'caxias', planId: 'premium', trainerId: 'prof-livia', status: 'active', joinedAt: '2025-09-14', lastVisit: '2026-08-16', frequency30d: 17, satisfaction: 5, financialStatus: 'paid', contractEndsAt: '2026-09-14', risk: 'low', sessionsUsed: 1, sessionsLimit: 4, assessmentDue: '2026-09-01', assessment: { date: '2026-06-01', weight: 59.8, bodyFat: 20.4, muscleMass: 42.6, waist: 68 } },
    { id: 'aluno-felipe', name: 'Felipe Costa', cpf: '***.612.***-33', phone: '(54) 99718-2244', email: 'felipe@exemplo.com', unitId: 'caxias', planId: 'annual', trainerId: 'prof-livia', status: 'active', joinedAt: '2026-02-10', lastVisit: '2026-08-04', frequency30d: 4, satisfaction: 2, financialStatus: 'overdue', contractEndsAt: '2027-02-10', risk: 'high', sessionsUsed: 1, sessionsLimit: 1, assessmentDue: '2026-08-04', assessment: { date: '2026-05-04', weight: 84.1, bodyFat: 25.7, muscleMass: 53.4, waist: 94 } }
  ],
  appointments: [
    { id: 'agenda-1', date: '2026-08-20', time: '07:00', unitId: 'continente', trainerId: 'personal-marina', studentId: 'aluno-ana', type: 'Personal', status: 'confirmed' },
    { id: 'agenda-2', date: '2026-08-20', time: '09:00', unitId: 'continente', trainerId: 'personal-caio', studentId: 'aluno-bruno', type: 'Avaliação', status: 'confirmed' },
    { id: 'agenda-3', date: '2026-08-20', time: '17:00', unitId: 'caxias', trainerId: 'prof-livia', studentId: 'aluno-elisa', type: 'Personal', status: 'pending' }
  ],
  workouts: [
    { id: 'workout-ana-a', studentId: 'aluno-ana', name: 'Treino A · Força e postura', goal: 'Fortalecimento geral com ênfase em membros inferiores e estabilidade escapular.', updatedAt: today, exercises: [
      { id: 'ex-1', name: 'Agachamento livre', sets: 4, reps: '10', load: '30 kg', rest: '75s' },
      { id: 'ex-2', name: 'Remada baixa', sets: 3, reps: '12', load: '25 kg', rest: '60s' },
      { id: 'ex-3', name: 'Elevação pélvica', sets: 4, reps: '12', load: '40 kg', rest: '75s' },
      { id: 'ex-4', name: 'Prancha frontal', sets: 3, reps: '40s', load: 'Corporal', rest: '45s' }
    ] },
    { id: 'workout-bruno-a', studentId: 'aluno-bruno', name: 'Treino A · Retorno gradual', goal: 'Retomar frequência com segurança e melhorar capacidade cardiorrespiratória.', updatedAt: today, exercises: [
      { id: 'ex-5', name: 'Leg press', sets: 3, reps: '12', load: 'Moderada', rest: '75s' },
      { id: 'ex-6', name: 'Supino máquina', sets: 3, reps: '12', load: 'Moderada', rest: '60s' }
    ] }
  ],
  invites: [],
  leads: [
    { id: 'lead-1', name: 'Fernanda Souza', owner: 'João', unitId: 'continente', stage: 'Visita agendada', nextAction: '20/08 às 16h', value: 249 },
    { id: 'lead-2', name: 'Ricardo Lima', owner: 'Paula', unitId: 'continente', stage: 'Aguardando retorno', nextAction: 'Hoje', value: 189 },
    { id: 'lead-3', name: 'Marcela Alves', owner: 'Bruna', unitId: 'caxias', stage: 'Proposta enviada', nextAction: '21/08', value: 249 }
  ],
  goals: [
    { id: 'goal-revenue', name: 'Faturamento mensal', current: 238400, target: 260000, format: 'currency' },
    { id: 'goal-new', name: 'Novos alunos', current: 42, target: 55, format: 'number' },
    { id: 'goal-retention', name: 'Retenção', current: 92, target: 95, format: 'percent' },
    { id: 'goal-satisfaction', name: 'Satisfação', current: 4.6, target: 4.8, format: 'score' }
  ],
  finance: { recurringRevenue: 238400, overdue: 12450, receivables: 33180, paidThisMonth: 214720, expenses: 146300 }
}

export function createEleveBrandedSeed() {
  const state = structuredClone(eleveSeed)
  state.academy = { ...state.academy, id: 'eleve', name: 'Eleve', brandMark: 'eleve.', tagline: 'Gestão inteligente' }
  state.units = [
    { ...state.units[0], name: 'Continente Shopping', city: 'São José - SC', manager: 'Nayane' },
    { ...state.units[1], name: 'Caxias do Sul', city: 'Caxias do Sul - RS', manager: 'Renata' }
  ]
  state.plans = state.plans.map((plan) => ({ ...plan, name: plan.id === 'premium' ? 'Eleve Premium' : plan.id === 'health' ? 'Eleve Basic' : plan.name.replace('Plano ', 'Eleve ') }))
  state.team = state.team.map((member) => ({ ...member, email: member.email.replace('@academia.demo', '@eleve.demo') }))
  state.notifications = [
    { id: 'notice-1', audience: 'all', title: 'Avaliação periódica', message: 'Sua próxima avaliação pode ser agendada diretamente com a equipe.', type: 'assessment' },
    { id: 'notice-2', audience: 'premium', title: 'Benefício Premium', message: 'Seu plano libera acesso às duas unidades e sessões com personal.', type: 'benefit' },
    { id: 'notice-3', audience: 'all', title: 'Lembrete de treino', message: 'Mantenha sua sequência semanal e acompanhe o progresso no aplicativo.', type: 'workout' }
  ]
  state.auditLogs = [
    { id: 'audit-1', date: '2026-08-19T09:12:00', actor: 'CEO / Diretoria', action: 'Relatório consolidado consultado', unitId: 'all' },
    { id: 'audit-2', date: '2026-08-19T08:45:00', actor: 'Gerente de unidade', action: 'Carteira de alunos revisada', unitId: 'continente' }
  ]
  return state
}

export function scopeEleveStudents(state, role, unitId = 'all') {
  let students = state.students || []
  if (role?.unitScope && role.unitScope !== 'all') students = students.filter((student) => student.unitId === role.unitScope)
  if (unitId !== 'all') students = students.filter((student) => student.unitId === unitId)
  if (role?.trainerId) students = students.filter((student) => student.trainerId === role.trainerId)
  if (role?.studentId) students = students.filter((student) => student.id === role.studentId)
  return students
}

export function calculateEleveMetrics(state, students) {
  const count = students.length || 1
  return {
    active: students.filter((student) => student.status === 'active').length,
    highRisk: students.filter((student) => student.risk === 'high').length,
    absent: students.filter((student) => student.frequency30d < 6).length,
    overdue: students.filter((student) => student.financialStatus === 'overdue').length,
    satisfaction: students.reduce((sum, student) => sum + (student.satisfaction || 0), 0) / count,
    averageFrequency: students.reduce((sum, student) => sum + student.frequency30d, 0) / count,
    recurringRevenue: students.reduce((sum, student) => sum + (state.plans.find((plan) => plan.id === student.planId)?.price || 0), 0)
  }
}

export function planAllowsAppointment(state, student, trainer, date, time) {
  const plan = state.plans.find((item) => item.id === student.planId)
  if (!plan) return { ok: false, reason: 'Plano não encontrado.' }
  if (!plan.units.includes(trainer.unitId)) return { ok: false, reason: 'O plano não permite acesso a esta unidade.' }
  if (!plan.personalSessions) return { ok: false, reason: 'O plano não inclui sessões com personal.' }
  if ((student.sessionsUsed || 0) >= plan.personalSessions) return { ok: false, reason: 'Limite de sessões do plano atingido.' }
  if (!trainer.availability.includes(time)) return { ok: false, reason: 'Horário indisponível para o profissional.' }
  const conflict = state.appointments.some((item) => item.trainerId === trainer.id && item.date === date && item.time === time && item.status !== 'cancelled')
  if (conflict) return { ok: false, reason: 'Este horário já está ocupado.' }
  return { ok: true, reason: 'Agendamento permitido.' }
}

export function upsertEleveSatisfaction(state, studentId, score) {
  return {
    ...state,
    students: state.students.map((student) => student.id === studentId ? { ...student, satisfaction: score } : student)
  }
}

export function upsertEleveWorkout(state, workout) {
  if (!workout?.studentId || !workout?.name?.trim()) throw new Error('Aluno e nome do treino são obrigatórios.')
  const exercises = (workout.exercises || []).filter((exercise) => exercise.name?.trim())
  if (!exercises.length) throw new Error('Adicione ao menos um exercício.')
  const normalized = { ...workout, exercises, updatedAt: new Date().toISOString().slice(0, 10) }
  const exists = (state.workouts || []).some((item) => item.id === normalized.id)
  return { ...state, workouts: exists ? state.workouts.map((item) => item.id === normalized.id ? normalized : item) : [...(state.workouts || []), normalized] }
}

export function upsertEleveAssessment(state, studentId, assessment) {
  if (!studentId) throw new Error('Selecione um aluno.')
  const weight = Number(assessment.weight) || 0
  const height = Number(assessment.height) || 0
  const bmi = height > 0 ? Number((weight / (height * height)).toFixed(1)) : 0
  const normalized = { ...assessment, weight, height, bmi, date: assessment.date || new Date().toISOString().slice(0, 10) }
  return { ...state, students: state.students.map((student) => student.id === studentId ? { ...student, assessment: normalized, assessments: [normalized, ...(student.assessments || []).filter((item) => item.date !== normalized.date)] } : student) }
}

export function hydrateEleveState(saved, variant = 'generic') {
  const base = variant === 'eleve' ? createEleveBrandedSeed() : structuredClone(eleveSeed)
  if (saved?.academy?.id !== base.academy.id) return base
  const students = base.students.map((student) => {
    const persisted = (saved.students || []).find((item) => item.id === student.id)
    if (!persisted) return student
    return {
      ...student,
      ...persisted,
      gamification: { ...(student.gamification || {}), ...(persisted.gamification || {}) },
      assessment: student.assessment || persisted.assessment ? { ...(student.assessment || {}), ...(persisted.assessment || {}) } : null,
      assessments: persisted.assessments || (persisted.assessment ? [persisted.assessment] : student.assessment ? [student.assessment] : [])
    }
  })
  const extraStudents = (saved.students || []).filter((student) => !students.some((item) => item.id === student.id))
  return { ...base, ...saved, students: [...students, ...extraStudents].map((student) => ({ ...student, appToken: student.appToken || `demo-${student.id}` })), workouts: saved.workouts?.length ? saved.workouts : base.workouts, invites: saved.invites || [] }
}

export function buildEleveInvitePath(token = '', basePath = '/gestao-premium') {
  if (!/^[A-Za-z0-9_-]{12,100}$/.test(token)) throw new Error('Convite inválido.')
  return `${basePath}/convite/${token}`
}

export function buildEleveStudentAppPath(student, basePath = '/gestao-premium') {
  const accessToken = student?.inviteToken || student?.appToken || student?.id
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(accessToken || '')) throw new Error('Acesso do aluno inválido.')
  return `${basePath}/aluno/${accessToken}`
}

export function createEleveInvite(state, input, token = crypto.randomUUID().replaceAll('-', '')) {
  const name = sanitizeSingleLine(input.name, 90)
  if (name.length < 3) throw new Error('Informe o nome completo do aluno.')
  const phone = validatePhone(input.phone, { required: true })
  const email = validateEmail(input.email, { required: true })
  if (!state.units.some((unit) => unit.id === input.unitId)) throw new Error('Selecione uma unidade válida.')
  if (!state.plans.some((plan) => plan.id === input.planId)) throw new Error('Selecione um plano válido.')
  const invite = { id: `invite-${token}`, token, name, phone, email, unitId: input.unitId, planId: input.planId, status: 'invited', createdAt: new Date().toISOString() }
  return { state: { ...state, invites: [invite, ...(state.invites || [])] }, invite }
}

export function activateEleveInvite(state, token, consent) {
  const invite = (state.invites || []).find((item) => item.token === token)
  if (!invite) throw new Error('Convite não encontrado ou expirado.')
  const existing = state.students.find((student) => student.inviteToken === token)
  if (existing) return { state, student: existing }
  if (!consent?.terms || !consent?.privacy || !consent?.data) throw new Error('É necessário aceitar os termos e a política de privacidade.')
  const student = {
    id: `student-${token.slice(0, 12)}`, inviteToken: token, appToken: token, name: invite.name, phone: invite.phone, email: invite.email,
    unitId: invite.unitId, planId: invite.planId, trainerId: null, status: 'new', joinedAt: new Date().toISOString().slice(0, 10),
    lastVisit: null, frequency30d: 0, satisfaction: 0, financialStatus: 'pending', contractEndsAt: null, risk: 'low',
    sessionsUsed: 0, sessionsLimit: state.plans.find((plan) => plan.id === invite.planId)?.personalSessions || 0,
    assessmentDue: null, assessment: null, gamification: { xp: 0, level: 1, streak: 0, weeklyGoal: 3, weeklyDone: 0, badges: ['Primeiro acesso'] },
    consent: { termsVersion: state.academy.termsVersion, privacyVersion: state.academy.privacyVersion, acceptedAt: new Date().toISOString() },
    auth: { email: invite.email, passwordHash: consent.passwordHash || '' }
  }
  return {
    student,
    state: { ...state, students: [student, ...state.students], invites: state.invites.map((item) => item.token === token ? { ...item, status: 'registered', registeredAt: student.consent.acceptedAt } : item) }
  }
}

export async function hashElevePassword(password) {
  const value = String(password || '')
  if (value.length < 8) throw new Error('A senha deve ter pelo menos 8 caracteres.')
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}
