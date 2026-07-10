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
