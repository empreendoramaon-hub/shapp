import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import {
  InputValidationError,
  assertAllowedKeys,
  assertJsonSize,
  sanitizeMultiline,
  sanitizeSingleLine,
  validateActivityInput,
  validateAssessmentInput,
  validateExerciseInput,
  validatePersonInput
} from '../src/inputValidation.js'

test('normaliza cadastro e aplica limites de texto', () => {
  const person = validatePersonInput({
    name: '  Ana   Souza  ',
    phone: '(48) 99999-9999',
    email: ' ANA@EXEMPLO.COM ',
    monthlyGoal: '20',
    notes: `Linha 1\u0000\nLinha 2${'x'.repeat(1200)}`
  })
  assert.equal(person.name, 'Ana Souza')
  assert.equal(person.email, 'ana@exemplo.com')
  assert.equal(person.monthlyGoal, 20)
  assert.equal(person.notes.includes('\u0000'), false)
  assert.equal(person.notes.length <= 1000, true)
})

test('rejeita e-mail, telefone e meta mensal malformados', () => {
  assert.throws(() => validatePersonInput({ name: 'Ana Souza', email: 'invalido', monthlyGoal: 20 }), InputValidationError)
  assert.throws(() => validatePersonInput({ name: 'Ana Souza', phone: '123', monthlyGoal: 20 }), InputValidationError)
  assert.throws(() => validatePersonInput({ name: 'Ana Souza', monthlyGoal: 99 }), InputValidationError)
})

test('valida datas, horários e campos da atividade', () => {
  const activity = validateActivityInput({ date: '2026-08-10', time: '18:30', title: ' Funcional ' })
  assert.equal(activity.title, 'Funcional')
  assert.throws(() => validateActivityInput({ date: '2026-02-30', time: '18:30', title: 'Aula' }), InputValidationError)
  assert.throws(() => validateActivityInput({ date: '2026-08-10', time: '29:90', title: 'Aula' }), InputValidationError)
})

test('valida faixas numéricas da avaliação física', () => {
  const assessment = validateAssessmentInput({ date: '10/08/2026', weight: '70.5', bodyFat: '20', muscleMass: '35', note: ' Evolução boa ' })
  assert.equal(assessment.weight, 70.5)
  assert.equal(assessment.note, 'Evolução boa')
  assert.throws(() => validateAssessmentInput({ date: '10/08/2026', weight: 900, bodyFat: 20, muscleMass: 35 }), InputValidationError)
})

test('normaliza exercício e remove caracteres de controle', () => {
  const exercise = validateExerciseInput({ workoutName: 'Treino A', name: 'Supino\u0000 reto', sets: '4', reps: '10' })
  assert.equal(exercise.name, 'Supino reto')
  assert.equal(sanitizeSingleLine(' a\t b '), 'a b')
  assert.equal(sanitizeMultiline('a\r\nb'), 'a\nb')
})

test('rejeita campos inesperados e payload excessivo', () => {
  assert.throws(() => assertAllowedKeys({ name: 'Ana', admin: true }, ['name']), InputValidationError)
  assert.throws(() => assertJsonSize({ note: 'x'.repeat(1000) }, 100), InputValidationError)
})

test('Function valida a lista de campos antes de persistir reserva', async () => {
  const source = await readFile(new URL('../functions/index.js', import.meta.url), 'utf8')
  assert.match(source, /assertOnlyKeys\(request\.data/)
  assert.match(source, /Buffer\.byteLength\(JSON\.stringify\(payload\)/)
})