function clean(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, ' ').replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)')
}

function money(value) {
  return `R$ ${Math.round(Number(value) || 0).toLocaleString('pt-BR')}`
}

export function buildManagementReportPdf(report) {
  const commands = ['0.08 0.12 0.09 rg', '0 760 595 82 re f', '0.58 0.89 0.11 rg', 'BT /F1 21 Tf 38 807 Td (SHAPP GESTAO PREMIUM) Tj ET', '1 1 1 rg', `BT /F1 9 Tf 38 786 Td (${clean(report.subtitle)}) Tj ET`]
  const text = (x, y, size, value, color = '0.08 0.12 0.09') => commands.push(`${color} rg BT /F1 ${size} Tf ${x} ${y} Td (${clean(value)}) Tj ET`)
  const box = (x, y, w, h, label, value) => {
    commands.push('0.95 0.97 0.94 rg', `${x} ${y} ${w} ${h} re f`)
    text(x + 12, y + h - 18, 8, label, '0.35 0.42 0.36')
    text(x + 12, y + 17, 15, value)
  }
  box(38, 692, 120, 54, 'RECEITA', money(report.revenue))
  box(168, 692, 120, 54, 'RECEBIDO', money(report.received))
  box(298, 692, 120, 54, 'INADIMPLENCIA', money(report.overdue))
  box(428, 692, 129, 54, 'RESULTADO', money(report.result))
  text(38, 661, 12, 'Evolucao financeira')
  const max = Math.max(...report.months.map((item) => item.value), 1)
  report.months.forEach((item, index) => {
    const height = Math.round((item.value / max) * 112)
    const x = 48 + index * 82
    commands.push('0.58 0.89 0.11 rg', `${x} 520 42 ${height} re f`)
    text(x, 503, 8, item.month)
    text(x - 4, 488, 7, `${Math.round(item.value / 1000)} mil`, '0.35 0.42 0.36')
  })
  text(38, 459, 12, 'Indicadores operacionais')
  box(38, 394, 120, 50, 'ALUNOS', report.students)
  box(168, 394, 120, 50, 'FREQUENCIA MEDIA', `${report.frequency}x`)
  box(298, 394, 120, 50, 'SATISFACAO', `${report.satisfaction}/5`)
  box(428, 394, 129, 50, 'EQUIPE ATIVA', report.activeTeam)
  text(38, 359, 12, 'Desempenho da equipe')
  text(42, 337, 8, 'PROFISSIONAL')
  text(250, 337, 8, 'FUNCAO')
  text(390, 337, 8, 'ALUNOS')
  text(470, 337, 8, 'AVALIACAO')
  let y = 315
  report.team.slice(0, 7).forEach((member) => {
    commands.push('0.87 0.9 0.86 RG', `38 ${y - 7} 519 1 re f`)
    text(42, y, 8, member.name)
    text(250, y, 8, member.role)
    text(405, y, 8, member.students)
    text(485, y, 8, member.rating)
    y -= 28
  })
  text(38, 92, 8, `Gerado em ${report.generatedAt} | Dados demonstrativos`, '0.4 0.45 0.41')
  const stream = commands.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n` })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n` })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  return new TextEncoder().encode(pdf)
}
