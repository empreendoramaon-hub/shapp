import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'

const require = createRequire(import.meta.url)
const { assertNoSensitiveData, buildSecurityEvent } = require('../functions/security-logging.js')

test('log estruturado não copia dados pessoais da requisição', () => {
  const request = {
    auth: { uid: 'uid-secreto', token: { email: 'privado@exemplo.com', name: 'Ana Privada' } },
    app: { appId: 'app-check-id' },
    rawRequest: { ip: '203.0.113.42' },
    data: { studentName: 'Ana Privada', studentToken: 'token-secreto', phone: '48999999999' }
  }
  const record = buildSecurityEvent('reservation_saved', request, { result: 'allowed', reason: 'none' })
  const serialized = JSON.stringify(record)

  assert.equal(serialized.includes('Ana Privada'), false)
  assert.equal(serialized.includes('privado@exemplo.com'), false)
  assert.equal(serialized.includes('48999999999'), false)
  assert.equal(serialized.includes('token-secreto'), false)
  assert.equal(serialized.includes('203.0.113.42'), false)
  assert.equal(record.authenticated, true)
  assert.equal(record.appCheckVerified, true)
})

test('fingerprints só são criadas quando existe segredo de HMAC', () => {
  const previous = process.env.SECURITY_LOG_HASH_KEY
  delete process.env.SECURITY_LOG_HASH_KEY
  const withoutKey = buildSecurityEvent('auth_rejected', { auth: { uid: 'uid-1' }, rawRequest: { ip: '127.0.0.1' } }, { result: 'blocked', reason: 'missing_auth' })
  assert.equal('uidFingerprint' in withoutKey, false)
  assert.equal('ipFingerprint' in withoutKey, false)

  process.env.SECURITY_LOG_HASH_KEY = 'segredo-de-teste-com-32-caracteres'
  const withKey = buildSecurityEvent('rate_limit_blocked', { auth: { uid: 'uid-1' }, rawRequest: { ip: '127.0.0.1' } }, { result: 'blocked', reason: 'rate_limit' })
  assert.match(withKey.uidFingerprint, /^[a-f0-9]{24}$/)
  assert.match(withKey.ipFingerprint, /^[a-f0-9]{24}$/)
  assert.equal(JSON.stringify(withKey).includes('uid-1'), false)
  assert.equal(JSON.stringify(withKey).includes('127.0.0.1'), false)

  if (previous === undefined) delete process.env.SECURITY_LOG_HASH_KEY
  else process.env.SECURITY_LOG_HASH_KEY = previous
})

test('chaves sensíveis são bloqueadas pelo utilitário', () => {
  assert.throws(() => assertNoSensitiveData({ email: 'privado@exemplo.com' }), /Sensitive logging key blocked/)
  assert.throws(() => buildSecurityEvent('evento-desconhecido', {}, {}), /Unknown security event/)
})

test('Function nunca envia request.data diretamente ao logger', async () => {
  const source = await readFile(new URL('../functions/index.js', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /logger\.(?:info|warn|error)\([^\n]*request\.data/)
  assert.match(source, /rate_limit_blocked/)
  assert.match(source, /input_rejected/)
  assert.match(source, /reservation_saved/)
})