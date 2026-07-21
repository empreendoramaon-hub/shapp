export const sotaliaAssets = {
  hero: 'https://sotalia.vercel.app/assets/hero-gym.jpg',
  pool: 'https://sotalia.vercel.app/assets/pool.jpg',
  strength: 'https://sotalia.vercel.app/assets/strength.jpg',
  classes: 'https://sotalia.vercel.app/assets/classes.jpg',
  swimming: 'https://sotalia.vercel.app/assets/swimming.jpg',
  hydro: 'https://sotalia.vercel.app/assets/hydro.jpg',
  kids: 'https://sotalia.vercel.app/assets/kids.jpg',
  logo: 'https://sotalia.vercel.app/assets/sotalia-logo-white.png'
}

export const sotaliaAcademy = {
  id: 'sotalia',
  name: 'Sotalia Sports',
  location: 'Campeche, Florianopolis',
  whatsapp: '5548991910761',
  privacyVersion: '2026.07',
  termsVersion: '2026.07',
  modules: ['Musculacao', 'Natacao', 'Hidro', 'Coletivas', 'Infantojuvenil']
}

export const sotaliaSchedule = [
  { id: 'musculacao-06', date: todaySotaliaDate(), time: '06:30', title: 'Musculacao guiada', place: 'Sala de musculacao', coach: 'Equipe Sotalia', type: 'Forca', capacity: '8 vagas', image: sotaliaAssets.strength },
  { id: 'hidro-07', date: todaySotaliaDate(), time: '07:30', title: 'Hidroginastica', place: 'Piscina semiolimpica', coach: 'Prof. Carla', type: 'Agua', capacity: 'Confirmada', image: sotaliaAssets.hydro },
  { id: 'coletiva-18', date: todaySotaliaDate(), time: '18:15', title: 'Aula coletiva', place: 'Studio principal', coach: 'Prof. Diego', type: 'Cardio', capacity: '5 vagas', image: sotaliaAssets.classes },
  { id: 'natacao-19', date: todaySotaliaDate(), time: '19:00', title: 'Natacao adulto', place: 'Raia 3', coach: 'Prof. Renata', type: 'Tecnica', capacity: '3 vagas', image: sotaliaAssets.swimming }
]

export const sotaliaWorkoutTemplates = [
  {
    id: 'forca-base',
    name: 'Forca base',
    goal: 'Musculacao e condicionamento',
    workouts: [
      {
        id: 'treino-a',
        sequence: 1,
        name: 'Treino A',
        focus: 'Pernas e gluteos',
        exercises: [
          { name: 'Agachamento livre', sets: '4', reps: '10', load: 'Progressiva', rest: '90s', tip: 'Tronco firme e joelhos alinhados.', videoOptional: true },
          { name: 'Leg press', sets: '4', reps: '12', load: 'Moderada', rest: '75s', tip: 'Controlar a descida.', videoOptional: true },
          { name: 'Cadeira extensora', sets: '3', reps: '15', load: 'Controle total', rest: '60s', tip: 'Segurar no topo.', videoOptional: false }
        ]
      },
      {
        id: 'treino-b',
        sequence: 2,
        name: 'Treino B',
        focus: 'Costas e biceps',
        exercises: [
          { name: 'Puxada frontal', sets: '4', reps: '12', load: 'Moderada', rest: '75s', tip: 'Barra ate a linha do peito.', videoOptional: true },
          { name: 'Remada baixa', sets: '4', reps: '10', load: 'Progressiva', rest: '90s', tip: 'Puxar com cotovelos.', videoOptional: false },
          { name: 'Rosca direta', sets: '3', reps: '12', load: 'Tecnica limpa', rest: '60s', tip: 'Evitar balanco.', videoOptional: false }
        ]
      }
    ]
  },
  {
    id: 'agua-performance',
    name: 'Agua + performance',
    goal: 'Natacao, hidro e fortalecimento',
    workouts: [
      {
        id: 'agua-1',
        sequence: 1,
        name: 'Piscina tecnica',
        focus: 'Respiracao e resistencia',
        exercises: [
          { name: 'Aquecimento livre', sets: '1', reps: '200m', load: 'Leve', rest: '60s', tip: 'Soltar ombros antes da serie.', videoOptional: false },
          { name: 'Educativo de crawl', sets: '6', reps: '25m', load: 'Tecnica', rest: '30s', tip: 'Alongar a entrada da mao.', videoOptional: true },
          { name: 'Serie continua', sets: '4', reps: '100m', load: 'Moderada', rest: '45s', tip: 'Manter ritmo constante.', videoOptional: false }
        ]
      },
      {
        id: 'forca-agua',
        sequence: 2,
        name: 'Forca complementar',
        focus: 'Core e superiores',
        exercises: [
          { name: 'Puxada frente', sets: '3', reps: '12', load: 'Moderada', rest: '75s', tip: 'Escapulas encaixadas.', videoOptional: true },
          { name: 'Remada sentada', sets: '3', reps: '12', load: 'Moderada', rest: '75s', tip: 'Peito aberto.', videoOptional: false },
          { name: 'Prancha', sets: '3', reps: '40s', load: 'Peso corporal', rest: '45s', tip: 'Quadril alinhado.', videoOptional: false }
        ]
      }
    ]
  }
]

export const SOTALIA_MEMBERS_INDEX_KEY = 'sotaliaMembersIndex'
export const SOTALIA_DELETED_MEMBERS_KEY = 'sotaliaDeletedMembers'
export const SOTALIA_CUSTOM_TEMPLATES_KEY = 'sotaliaCustomWorkoutTemplates'

export function todaySotaliaDate() {
  return new Date().toLocaleDateString('pt-BR')
}

export function sotaliaDateToISO(date = '') {
  const value = String(date || '').trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return ''
  return `${match[3]}-${match[2]}-${match[1]}`
}

export function sotaliaISOToDate(date = '') {
  const value = String(date || '').trim()
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return value
  return `${match[3]}/${match[2]}/${match[1]}`
}

export function sotaliaActivityDateTime(activity = {}) {
  const iso = sotaliaDateToISO(activity.date) || '1970-01-01'
  const time = String(activity.time || '00:00').slice(0, 5) || '00:00'
  return new Date(`${iso}T${time}:00`).getTime()
}

export function isSotaliaActivityExpired(activity = {}, now = new Date()) {
  return sotaliaActivityDateTime(activity) < now.getTime()
}

export function filterFutureSotaliaActivities(items = [], now = new Date()) {
  return (items || []).filter((item) => !isSotaliaActivityExpired(item, now))
}

export function uniqueSotaliaIds(items = []) {
  return Array.from(new Set((items || []).filter(Boolean).map(String)))
}

export function sotaliaCapacityTotal(activity = {}) {
  const explicit = Number(activity.capacityTotal || 0)
  if (explicit > 0) return explicit
  const match = String(activity.capacity || '').match(/\d+/)
  return match ? Number(match[0]) : 0
}

export function sotaliaConfirmedMembers(activity = {}) {
  return uniqueSotaliaIds(activity.confirmedMembers || [])
}

export function sotaliaCapacityLabel(activity = {}) {
  const total = sotaliaCapacityTotal(activity)
  const confirmed = sotaliaConfirmedMembers(activity).length || Number(activity.confirmedCount || 0)
  if (!total) return activity.capacity || 'Vagas abertas'
  const available = Math.max(0, total - confirmed)
  return available === 1 ? '1 vaga' : `${available} vagas`
}

export function getSotaliaMemberStorageKey(memberId) {
  return `sotaliaMember:${memberId}`
}

export function createSotaliaMember(overrides = {}) {
  const id = overrides.id || createSotaliaToken(overrides.name || 'Marina Alves')
  return {
    id,
    name: overrides.name || 'Marina Alves',
    phone: overrides.phone || '(48) 99191-0761',
    email: overrides.email || 'marina@sotalia.demo',
    plan: overrides.plan || 'Plano familia',
    status: overrides.status || 'active',
    trainer: overrides.trainer || 'Equipe Sotalia',
    goal: overrides.goal || 'Condicionamento, agua e constancia',
    streak: Number(overrides.streak ?? 5),
    checkinsMonth: Number(overrides.checkinsMonth ?? 12),
    monthlyGoal: Number(overrides.monthlyGoal ?? 18),
    xp: Number(overrides.xp ?? 820),
    level: Number(overrides.level ?? 4),
    nextAssessment: overrides.nextAssessment || '22/07/2026',
    weight: Number(overrides.weight ?? 64),
    bodyFat: Number(overrides.bodyFat ?? 22),
    muscleMass: Number(overrides.muscleMass ?? 31),
    family: overrides.family || [
      { name: 'Nana', modality: 'Natacao infantil', status: 'Aula hoje', activities: ['Natacao infantil', 'Hidro kids'] },
      { name: 'Zoe', modality: 'Infantojuvenil', status: 'Proxima aula quinta', activities: ['Funcional kids', 'Natacao infantil'] }
    ],
    bookedClasses: Array.isArray(overrides.bookedClasses) ? overrides.bookedClasses : [],
    pendingBookings: Array.isArray(overrides.pendingBookings) ? overrides.pendingBookings : [],
    bookingConfirmations: overrides.bookingConfirmations || [],
    noticesRead: overrides.noticesRead || [],
    termsAcceptedAt: overrides.termsAcceptedAt || '',
    termsVersion: overrides.termsVersion || '',
    privacyVersion: overrides.privacyVersion || '',
    workouts: overrides.workouts || cloneSotaliaWorkouts(sotaliaWorkoutTemplates[0].workouts),
    assessments: overrides.assessments || [
      { date: '2026-07-01', weight: 64, bodyFat: 22, muscleMass: 31, note: 'Avaliacao inicial registrada.' }
    ],
    ...overrides,
    id
  }
}

export function cloneSotaliaWorkouts(workouts) {
  return workouts.map((workout, index) => ({
    ...workout,
    sequence: workout.sequence || index + 1,
    exercises: (workout.exercises || []).map((exercise) => ({ ...exercise }))
  }))
}

export function createSotaliaToken(name) {
  const slug = name
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `${slug || 'aluno'}-${Math.random().toString(36).slice(2, 7)}`
}

function toSotaliaBase64Url(value) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromSotaliaBase64Url(value) {
  const normalized = `${value}`.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return JSON.parse(decodeURIComponent(escape(atob(padded))))
}

function compactSotaliaWorkout(workout = {}) {
  return {
    i: workout.id,
    q: workout.sequence,
    n: workout.name,
    f: workout.focus,
    e: (workout.exercises || []).map((exercise) => ({
      n: exercise.name,
      s: exercise.sets,
      r: exercise.reps,
      l: exercise.load,
      d: exercise.rest,
      t: exercise.tip,
      v: exercise.videoOptional === true
    }))
  }
}

function expandSotaliaWorkout(workout = {}) {
  return {
    id: workout.i,
    sequence: workout.q,
    name: workout.n,
    focus: workout.f,
    exercises: (workout.e || []).map((exercise) => ({
      name: exercise.n,
      sets: exercise.s,
      reps: exercise.r,
      load: exercise.l,
      rest: exercise.d,
      tip: exercise.t,
      videoOptional: exercise.v === true
    }))
  }
}

function compactSotaliaMember(member = {}) {
  return {
    i: member.id,
    n: member.name,
    p: member.phone,
    m: member.email,
    pl: member.plan,
    s: member.status,
    tr: member.trainer,
    g: member.goal,
    st: member.streak,
    cm: member.checkinsMonth,
    mg: member.monthlyGoal,
    x: member.xp,
    l: member.level,
    na: member.nextAssessment,
    w: member.weight,
    bf: member.bodyFat,
    mm: member.muscleMass,
    f: member.family || [],
    bc: member.bookedClasses || [],
    pb: member.pendingBookings || [],
    cf: member.bookingConfirmations || [],
    nw: Array.isArray(member.workouts) ? member.workouts.map(compactSotaliaWorkout) : [],
    a: member.assessments || []
  }
}

function expandSotaliaMember(member = {}) {
  return createSotaliaMember({
    id: member.i,
    name: member.n,
    phone: member.p,
    email: member.m,
    plan: member.pl,
    status: member.s,
    trainer: member.tr,
    goal: member.g,
    streak: member.st,
    checkinsMonth: member.cm,
    monthlyGoal: member.mg,
    xp: member.x,
    level: member.l,
    nextAssessment: member.na,
    weight: member.w,
    bodyFat: member.bf,
    muscleMass: member.mm,
    family: member.f,
    bookedClasses: member.bc,
    pendingBookings: member.pb,
    bookingConfirmations: member.cf,
    workouts: Array.isArray(member.nw) ? member.nw.map(expandSotaliaWorkout) : [],
    assessments: member.a
  })
}

export function buildSotaliaInviteUrl(origin, member, activities = []) {
  const payload = {
    v: 1,
    member: compactSotaliaMember(member),
    activities: (activities || []).slice(0, 30)
  }
  return `${origin}/sotalia-app?m=${member.id}&i=${toSotaliaBase64Url(payload)}`
}

export function readSotaliaInvite(search = '') {
  const invite = new URLSearchParams(search).get('i')
  if (!invite) return null
  const payload = fromSotaliaBase64Url(invite)
  if (!payload?.member?.i) return null
  return {
    member: expandSotaliaMember(payload.member),
    activities: payload.activities || []
  }
}

export function sotaliaNameFromToken(memberId = '') {
  return memberId
    .replace(/-[a-z0-9]{4,8}$/i, '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toLocaleUpperCase('pt-BR') + part.slice(1))
    .join(' ') || 'Aluno Sotalia'
}

export function readLocalSotaliaMember(memberId) {
  if (isLocalSotaliaMemberDeleted(memberId)) return null

  try {
    const stored = JSON.parse(localStorage.getItem(getSotaliaMemberStorageKey(memberId)) || 'null')
    if (!stored && memberId !== 'demo-marina') return null
    return createSotaliaMember({ id: memberId, ...(stored || {}) })
  } catch {
    if (memberId !== 'demo-marina') return null
    return createSotaliaMember({ id: memberId })
  }
}

export function writeLocalSotaliaMember(member) {
  const normalized = createSotaliaMember(member)
  localStorage.setItem(getSotaliaMemberStorageKey(normalized.id), JSON.stringify(normalized))
  removeLocalDeletedSotaliaMember(normalized.id)
  const index = readLocalSotaliaMemberIndex()
  const next = [normalized.id, ...index.filter((id) => id !== normalized.id)]
  localStorage.setItem(SOTALIA_MEMBERS_INDEX_KEY, JSON.stringify(next))
  return normalized
}

export function readLocalSotaliaWorkoutTemplates() {
  try {
    const templates = JSON.parse(localStorage.getItem(SOTALIA_CUSTOM_TEMPLATES_KEY) || '[]')
    return Array.isArray(templates) ? templates : []
  } catch {
    return []
  }
}

export function writeLocalSotaliaWorkoutTemplate(template) {
  const normalized = {
    ...template,
    id: template.id || createSotaliaToken(template.name || 'modelo'),
    workouts: cloneSotaliaWorkouts(template.workouts || [])
  }
  const templates = readLocalSotaliaWorkoutTemplates()
  const next = [normalized, ...templates.filter((item) => item.id !== normalized.id)].slice(0, 20)
  localStorage.setItem(SOTALIA_CUSTOM_TEMPLATES_KEY, JSON.stringify(next))
  return normalized
}

export function deleteLocalSotaliaMember(memberId) {
  localStorage.removeItem(getSotaliaMemberStorageKey(memberId))
  const index = readLocalSotaliaMemberIndex()
  const next = index.filter((id) => id !== memberId)
  localStorage.setItem(SOTALIA_MEMBERS_INDEX_KEY, JSON.stringify(next))
  const deleted = readLocalDeletedSotaliaMembers()
  localStorage.setItem(SOTALIA_DELETED_MEMBERS_KEY, JSON.stringify([memberId, ...deleted.filter((id) => id !== memberId)]))
  return next
}

export function readLocalSotaliaMembers() {
  const index = readLocalSotaliaMemberIndex()
  const ids = index.length ? index : ['demo-marina']
  return ids.map((id) => readLocalSotaliaMember(id)).filter(Boolean)
}

export function isLocalSotaliaMemberDeleted(memberId) {
  return readLocalDeletedSotaliaMembers().includes(memberId)
}

function readLocalSotaliaMemberIndex() {
  try {
    const index = JSON.parse(localStorage.getItem(SOTALIA_MEMBERS_INDEX_KEY) || 'null')
    return Array.isArray(index) ? index : []
  } catch {
    return []
  }
}

function readLocalDeletedSotaliaMembers() {
  try {
    const deleted = JSON.parse(localStorage.getItem(SOTALIA_DELETED_MEMBERS_KEY) || '[]')
    return Array.isArray(deleted) ? deleted : []
  } catch {
    return []
  }
}

function removeLocalDeletedSotaliaMember(memberId) {
  const deleted = readLocalDeletedSotaliaMembers()
  if (!deleted.includes(memberId)) return
  localStorage.setItem(SOTALIA_DELETED_MEMBERS_KEY, JSON.stringify(deleted.filter((id) => id !== memberId)))
}

export function nextSotaliaWorkout(member) {
  if (Array.isArray(member.workouts) && member.workouts.length === 0) {
    return {
      id: 'empty-workout',
      sequence: 1,
      name: 'Treino nao montado',
      focus: 'Aguardando personal',
      exercises: []
    }
  }

  const workouts = member.workouts?.length ? member.workouts : sotaliaWorkoutTemplates[0].workouts
  const ordered = [...workouts].sort((a, b) => (a.sequence || workouts.indexOf(a) + 1) - (b.sequence || workouts.indexOf(b) + 1))
  const active = ordered.find((workout) => workout.id === member.activeWorkoutId)
  if (active) return active
  return ordered[(member.checkinsMonth || 0) % ordered.length] || ordered[0]
}

export function formatSotaliaDate(value) {
  if (!value) return 'Nao informado'
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value
  return new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR')
}

export function sotaliaWhatsappUrl(text) {
  return `https://api.whatsapp.com/send?phone=${sotaliaAcademy.whatsapp}&text=${encodeURIComponent(text)}`
}
