export function titleCase(value = '') {
  return value
    .trimStart()
    .toLocaleLowerCase('pt-BR')
    .replace(/(^|[\s'-])([\p{L}])/gu, (_, prefix, letter) => `${prefix}${letter.toLocaleUpperCase('pt-BR')}`)
}

export function sentenceCase(value = '') {
  const normalized = value.replace(/\s+/g, ' ').trimStart()
  if (!normalized) return ''
  return normalized.charAt(0).toLocaleUpperCase('pt-BR') + normalized.slice(1)
}

export function formatPhone(value = '') {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function formatDateInput(value = '') {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function isValidBrazilianDate(value = '') {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return false
  const [, dd, mm, yyyy] = match
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  return date.getFullYear() === Number(yyyy) && date.getMonth() === Number(mm) - 1 && date.getDate() === Number(dd)
}

export function normalizeStudent(student) {
  return {
    ...student,
    name: titleCase(student.name || ''),
    phone: formatPhone(student.phone || ''),
    birthDate: formatDateInput(student.birthDate || ''),
    goal: sentenceCase(student.goal || ''),
    notes: sentenceCase(student.notes || '')
  }
}

function toBase64Url(value) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(value))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value) {
  const normalized = `${value}`.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return JSON.parse(decodeURIComponent(escape(atob(padded))))
}

function compactWorkout(workout = {}) {
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

function expandWorkout(workout = {}) {
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

function compactStudent(student = {}) {
  return {
    i: student.id,
    t: student.token,
    n: student.name,
    p: student.phone,
    m: student.email,
    bd: student.birthDate,
    s: student.status,
    g: student.goal,
    tr: student.trainerId,
    mg: student.monthlyGoal,
    cm: student.completedThisMonth,
    x: student.xp,
    l: student.level,
    st: student.streak,
    w: Array.isArray(student.workouts) ? student.workouts.map(compactWorkout) : [],
    b: student.bookings || [],
    f: student.family || [],
    a: student.assessments || [],
    nu: student.nutrition || { enabled: false }
  }
}

function expandStudent(student = {}) {
  return {
    id: student.i,
    token: student.t,
    name: student.n,
    phone: student.p,
    email: student.m,
    birthDate: student.bd,
    status: student.s || 'active',
    goal: student.g,
    trainerId: student.tr,
    monthlyGoal: student.mg || 20,
    completedThisMonth: student.cm || 0,
    xp: student.x || 0,
    level: student.l || 1,
    streak: student.st || 0,
    workouts: Array.isArray(student.w) ? student.w.map(expandWorkout) : [],
    bookings: student.b || [],
    family: student.f || [],
    assessments: student.a || [],
    nutrition: student.nu || { enabled: false }
  }
}

export function buildStudentInviteUrl(origin, student, state) {
  const trainer = (state.trainers || []).find((item) => item.id === student.trainerId)
  const payload = {
    v: 1,
    academy: state.academy,
    trainers: trainer ? [trainer] : (state.trainers || []).slice(0, 1),
    schedule: state.schedule || [],
    student: compactStudent(student)
  }
  return `${origin}/aluno/${student.token}?i=${toBase64Url(payload)}`
}

export function readStudentInvite(search = '') {
  const invite = new URLSearchParams(search).get('i')
  if (!invite) return null
  const payload = fromBase64Url(invite)
  if (!payload?.student?.t) return null
  return {
    academy: payload.academy,
    trainers: payload.trainers || [],
    schedule: payload.schedule || [],
    student: expandStudent(payload.student)
  }
}
