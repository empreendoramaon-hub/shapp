export class InputValidationError extends Error {
  constructor(message, field = '') {
    super(message)
    this.name = 'InputValidationError'
    this.field = field
  }
}

export const INPUT_LIMITS = Object.freeze({
  name: 90,
  email: 160,
  phone: 24,
  shortText: 90,
  goal: 160,
  note: 600,
  notes: 1000,
  family: 2000,
  multiline: 4000,
  payloadBytes: 100000
})

function rawString(value) {
  return String(value ?? '')
}

export function sanitizeSingleLine(value, maximum = INPUT_LIMITS.shortText) {
  return rawString(value)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maximum)
}

export function sanitizeMultiline(value, maximum = INPUT_LIMITS.multiline) {
  return rawString(value)
    .replace(/\r\n?/g, '\n')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
    .split('\n')
    .map((line) => line.replace(/[\t ]+/g, ' ').trimEnd())
    .join('\n')
    .trim()
    .slice(0, maximum)
}

export function validateIdentifier(value, field = 'identificador') {
  const normalized = sanitizeSingleLine(value, 100)
  if (!/^[A-Za-z0-9_-]{1,100}$/.test(normalized)) {
    throw new InputValidationError(`Informe um ${field} válido.`, field)
  }
  return normalized
}

export function validateEmail(value, { required = false } = {}) {
  const email = sanitizeSingleLine(value, INPUT_LIMITS.email).toLocaleLowerCase('pt-BR')
  if (!email && !required) return ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    throw new InputValidationError('Informe um e-mail válido.', 'email')
  }
  return email
}

export function validatePhone(value, { required = false } = {}) {
  const phone = sanitizeSingleLine(value, INPUT_LIMITS.phone)
  const digits = phone.replace(/\D/g, '')
  if (!digits && !required) return ''
  if (digits.length < 10 || digits.length > 13) {
    throw new InputValidationError('Informe um telefone válido com DDD.', 'phone')
  }
  return phone
}

export function validateInteger(value, { field, minimum, maximum, fallback } = {}) {
  const number = value === '' || value == null ? fallback : Number(value)
  if (!Number.isInteger(number) || number < minimum || number > maximum) {
    throw new InputValidationError(`${field} deve ficar entre ${minimum} e ${maximum}.`, field)
  }
  return number
}

export function validateNumber(value, { field, minimum, maximum } = {}) {
  const number = Number(value)
  if (!Number.isFinite(number) || number < minimum || number > maximum) {
    throw new InputValidationError(`${field} deve ficar entre ${minimum} e ${maximum}.`, field)
  }
  return number
}

function isRealDate(day, month, year) {
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function validateDate(value, field = 'data') {
  const date = sanitizeSingleLine(value, 10)
  let day
  let month
  let year
  let match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) [, year, month, day] = match.map(Number)
  else {
    match = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (match) [, day, month, year] = match.map(Number)
  }
  if (!match || !isRealDate(day, month, year)) {
    throw new InputValidationError(`Informe uma ${field} válida.`, field)
  }
  return date
}

export function validateTime(value) {
  const time = sanitizeSingleLine(value, 5)
  const match = time.match(/^(\d{2}):(\d{2})$/)
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
    throw new InputValidationError('Informe um horário válido.', 'time')
  }
  return time
}

function requiredText(value, maximum, message, field) {
  const text = sanitizeSingleLine(value, maximum)
  if (text.length < 2) throw new InputValidationError(message, field)
  return text
}

export function validatePersonInput(input = {}) {
  return {
    ...input,
    name: requiredText(input.name, INPUT_LIMITS.name, 'Informe o nome completo.', 'name'),
    phone: validatePhone(input.phone),
    email: validateEmail(input.email),
    plan: sanitizeSingleLine(input.plan, INPUT_LIMITS.shortText),
    goal: sanitizeSingleLine(input.goal, INPUT_LIMITS.goal),
    notes: sanitizeMultiline(input.notes, INPUT_LIMITS.notes),
    family: sanitizeMultiline(input.family, INPUT_LIMITS.family),
    monthlyGoal: validateInteger(input.monthlyGoal, { field: 'Meta mensal', minimum: 1, maximum: 31, fallback: 20 })
  }
}

export function validateActivityInput(input = {}) {
  return {
    ...input,
    date: validateDate(input.date, 'data'),
    time: validateTime(input.time),
    title: requiredText(input.title, INPUT_LIMITS.shortText, 'Informe o nome da atividade.', 'title'),
    place: sanitizeSingleLine(input.place || 'Academia', INPUT_LIMITS.shortText),
    coach: sanitizeSingleLine(input.coach || 'Equipe técnica', INPUT_LIMITS.shortText),
    type: sanitizeSingleLine(input.type || 'Aula', 50),
    capacity: sanitizeSingleLine(input.capacity || 'Turma aberta', 50)
  }
}

export function validateExerciseInput(input = {}) {
  return {
    ...input,
    workoutName: sanitizeSingleLine(input.workoutName || input.name || 'Treino A', INPUT_LIMITS.shortText),
    focus: sanitizeSingleLine(input.focus, INPUT_LIMITS.shortText),
    name: requiredText(input.exercise || input.name, INPUT_LIMITS.shortText, 'Informe o exercício.', 'exercise'),
    sets: sanitizeSingleLine(input.sets || '3', 12),
    reps: sanitizeSingleLine(input.reps || '12', 20),
    load: sanitizeSingleLine(input.load || 'Moderada', 50),
    rest: sanitizeSingleLine(input.rest || '60s', 20),
    tip: sanitizeSingleLine(input.tip, 240)
  }
}

export function validateAssessmentInput(input = {}) {
  return {
    date: validateDate(input.date, 'data da avaliação'),
    weight: validateNumber(input.weight, { field: 'Peso', minimum: 20, maximum: 400 }),
    bodyFat: validateNumber(input.bodyFat, { field: 'Gordura corporal', minimum: 0, maximum: 80 }),
    muscleMass: validateNumber(input.muscleMass, { field: 'Massa magra', minimum: 0, maximum: 250 }),
    note: sanitizeMultiline(input.note || 'Avaliação registrada pelo painel.', INPUT_LIMITS.note)
  }
}

export function assertAllowedKeys(payload, allowedKeys, label = 'payload') {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new InputValidationError(`${label} inválido.`, label)
  }
  const allowed = allowedKeys instanceof Set ? allowedKeys : new Set(allowedKeys)
  const unexpected = Object.keys(payload).filter((key) => !allowed.has(key))
  if (unexpected.length) {
    throw new InputValidationError(`${label} contém campos não permitidos.`, unexpected[0])
  }
  return payload
}

export function assertJsonSize(payload, maximum = INPUT_LIMITS.payloadBytes) {
  let serialized
  try {
    serialized = JSON.stringify(payload)
  } catch {
    throw new InputValidationError('Não foi possível validar os dados.', 'payload')
  }
  if (new TextEncoder().encode(serialized).length > maximum) {
    throw new InputValidationError('Os dados excedem o limite permitido.', 'payload')
  }
  return payload
}