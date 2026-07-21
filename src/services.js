export async function saveLead(payload) {
  const cleanPayload = {
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    profile: payload.profile,
    interest: payload.interest,
    source: payload.source || 'shapp-landing',
    createdAt: new Date().toISOString()
  }

  const key = 'shappLandingLeads'
  const current = JSON.parse(localStorage.getItem(key) || '[]')
  current.push(cleanPayload)
  localStorage.setItem(key, JSON.stringify(current))

  return { local: true }
}
