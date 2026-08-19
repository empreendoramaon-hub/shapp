const crypto = require('node:crypto')

const SAFE_EVENTS = new Set([
  'auth_rejected',
  'input_rejected',
  'rate_limit_blocked',
  'reservation_saved',
  'service_error'
])
const SAFE_RESULTS = new Set(['allowed', 'blocked', 'failed'])
const SAFE_REASONS = new Set([
  'missing_auth',
  'invalid_payload',
  'invalid_identifier',
  'rate_limit',
  'write_failed',
  'none'
])
const SENSITIVE_KEY = /(name|email|phone|token|password|credential|payload|student|member|message|note|assessment)/i

function fingerprint(value) {
  const key = process.env.SECURITY_LOG_HASH_KEY
  if (!key || !value) return undefined
  return crypto.createHmac('sha256', key).update(String(value)).digest('hex').slice(0, 24)
}

function assertNoSensitiveData(value, path = 'event') {
  if (!value || typeof value !== 'object') return
  for (const [key, nested] of Object.entries(value)) {
    if (SENSITIVE_KEY.test(key)) throw new Error(`Sensitive logging key blocked at ${path}.${key}`)
    if (nested && typeof nested === 'object') assertNoSensitiveData(nested, `${path}.${key}`)
  }
}

function buildSecurityEvent(event, request, details = {}) {
  if (!SAFE_EVENTS.has(event)) throw new Error('Unknown security event')
  const result = SAFE_RESULTS.has(details.result) ? details.result : 'failed'
  const reason = SAFE_REASONS.has(details.reason) ? details.reason : 'none'
  const uidFingerprint = fingerprint(request?.auth?.uid)
  const ipFingerprint = fingerprint(request?.rawRequest?.ip)
  const record = {
    securityEvent: event,
    requestId: crypto.randomUUID(),
    result,
    reason,
    scope: 'reservation',
    authenticated: Boolean(request?.auth),
    appCheckVerified: Boolean(request?.app),
    ...(uidFingerprint ? { uidFingerprint } : {}),
    ...(ipFingerprint ? { ipFingerprint } : {})
  }
  assertNoSensitiveData(record)
  return record
}

module.exports = {
  assertNoSensitiveData,
  buildSecurityEvent
}