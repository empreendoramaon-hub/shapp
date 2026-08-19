import test from 'node:test'
import assert from 'node:assert/strict'
import { buildManagementReportPdf } from '../src/premiumReportPdf.js'

test('relatório gerencial gera um arquivo PDF válido com gráficos e equipe', () => {
  const pdf = buildManagementReportPdf({
    subtitle: 'Consolidado | Todas as unidades | Últimos 6 meses',
    revenue: 238400, received: 214720, overdue: 12450, result: 68420,
    students: 1110, frequency: '10.3', satisfaction: '4.3', activeTeam: 5,
    months: [{ month: 'Jul', value: 229000 }, { month: 'Ago', value: 238400 }],
    team: [{ name: 'Marina Duarte', role: 'Personal trainer', students: 28, rating: 4.9 }],
    generatedAt: '19/08/2026 10:00'
  })
  const content = new TextDecoder().decode(pdf)
  assert.equal(content.startsWith('%PDF-1.4'), true)
  assert.match(content, /Evolucao financeira/)
  assert.match(content, /Desempenho da equipe/)
  assert.match(content, /%%EOF$/)
})
