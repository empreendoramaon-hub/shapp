const crypto = require('node:crypto')
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { initializeApp } = require('firebase-admin/app')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const logger = require('firebase-functions/logger')
const { buildSecurityEvent } = require('./security-logging')


initializeApp()
const db = getFirestore()

function cleanId(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .slice(0, 100)
}

function cleanText(value, maximum) {
  return String(value || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maximum)
}

function assertOnlyKeys(payload, allowedKeys) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new HttpsError('invalid-argument', 'Dados invalidos.')
  }
  const unexpected = Object.keys(payload).filter((key) => !allowedKeys.has(key))
  if (unexpected.length) {
    throw new HttpsError('invalid-argument', 'A requisicao contem campos nao permitidos.')
  }
  if (Buffer.byteLength(JSON.stringify(payload), 'utf8') > 20_000) {
    throw new HttpsError('invalid-argument', 'A requisicao excede o limite permitido.')
  }
}

async function consumeLimit(identity, scope, maximum, windowMs) {
  const id = crypto
    .createHash('sha256')
    .update(`${scope}:${identity}`)
    .digest('hex')
  const reference = db.collection('_rateLimits').doc(id)
  const now = Date.now()

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reference)
    const current = snapshot.data()

    if (!current || now - current.startedAt >= windowMs) {
      transaction.set(reference, {
        scope,
        startedAt: now,
        count: 1,
        expiresAt: now + windowMs
      })
      return
    }

    if (current.count >= maximum) {
      throw new HttpsError(
        'resource-exhausted',
        'Muitas tentativas. Aguarde um minuto.'
      )
    }

    transaction.update(reference, {
      count: FieldValue.increment(1)
    })
  })
}

exports.saveReservation = onCall(
  {
    region: 'southamerica-east1',
    enforceAppCheck: true
  },
  async (request) => {
    if (!request.auth) {
      logger.warn('security_event', buildSecurityEvent('auth_rejected', request, {
        result: 'blocked',
        reason: 'missing_auth'
      }))
      throw new HttpsError('unauthenticated', 'Entre novamente.')
    }

    const ip = request.rawRequest.ip || 'unknown'
    try {
      await consumeLimit(`ip:${ip}`, 'reservation', 30, 60_000)
      await consumeLimit(`uid:${request.auth.uid}`, 'reservation', 10, 60_000)
    } catch (error) {
      const rateLimited = error instanceof HttpsError && error.code === 'resource-exhausted'
      logger.warn('security_event', buildSecurityEvent(rateLimited ? 'rate_limit_blocked' : 'service_error', request, {
        result: rateLimited ? 'blocked' : 'failed',
        reason: rateLimited ? 'rate_limit' : 'write_failed'
      }))
      throw error
    }

    try {
      assertOnlyKeys(request.data, new Set([
        'studentId', 'studentToken', 'studentName', 'activityId', 'activityTitle',
        'activityDate', 'activityTime', 'activityPlace', 'status'
      ]))
    } catch (error) {
      logger.warn('security_event', buildSecurityEvent('input_rejected', request, {
        result: 'blocked',
        reason: 'invalid_payload'
      }))
      throw error
    }

    const activityId = cleanId(request.data.activityId)
    const studentToken = cleanId(request.data.studentToken)
    const status = request.data.status === 'cancelled' ? 'cancelled' : 'pending'

    if (!activityId || !studentToken) {
      logger.warn('security_event', buildSecurityEvent('input_rejected', request, {
        result: 'blocked',
        reason: 'invalid_identifier'
      }))
      throw new HttpsError('invalid-argument', 'Reserva invalida.')
    }

    const reservationId = `${cleanId(request.auth.uid)}-${activityId}`

    try {
      await db.doc(`academies/shapp/reservations/${reservationId}`).set({
        academyId: 'shapp',
        createdBy: request.auth.uid,
        studentId: cleanId(request.data.studentId),
        studentToken,
        studentName: cleanText(request.data.studentName || 'Aluno', 90),
        activityId,
        activityTitle: cleanText(request.data.activityTitle, 90),
        activityDate: cleanText(request.data.activityDate, 10),
        activityTime: cleanText(request.data.activityTime, 5),
        activityPlace: cleanText(request.data.activityPlace, 90),
        status,
        requestedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true })
    } catch {
      logger.error('security_event', buildSecurityEvent('service_error', request, {
        result: 'failed',
        reason: 'write_failed'
      }))
      throw new HttpsError('internal', 'Nao foi possivel salvar a reserva.')
    }

    logger.info('security_event', buildSecurityEvent('reservation_saved', request, {
      result: 'allowed',
      reason: 'none'
    }))
    return { ok: true }
  }
)