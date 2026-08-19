import test from 'node:test'
import assert from 'node:assert/strict'
import { managementPremiumOffer, shappCommercialPlans } from '../src/shappCommercialPlans.js'

test('Gestão Premium está disponível no catálogo comercial', () => {
  const premium = shappCommercialPlans.find((plan) => plan.id === 'management-premium')
  assert.ok(premium)
  assert.equal(premium.monthlyPrice, 3980)
  assert.equal(premium.href, '/gestao-premium')
  assert.match(premium.setupLabel, /39\.800/)
})

test('oferta premium mantém limites e adicional das lojas explícitos', () => {
  assert.equal(managementPremiumOffer.activeStudents, 1500)
  assert.equal(managementPremiumOffer.units, 2)
  assert.equal(managementPremiumOffer.technicalHoursPerMonth, 12)
  assert.equal(managementPremiumOffer.appStoresAddon, 14800)
  assert.equal(managementPremiumOffer.appStoreFeesIncluded, false)
})

test('oferta premium cobre os módulos estratégicos', () => {
  assert.ok(managementPremiumOffer.modules.includes('Gestão multiunidade'))
  assert.ok(managementPremiumOffer.modules.includes('Frequência e risco de churn'))
  assert.ok(managementPremiumOffer.environments.includes('Executivo'))
  assert.ok(managementPremiumOffer.environments.includes('Aluno'))
})
