import React, { useMemo, useState } from 'react'
import { Activity, BarChart3, CheckCircle2, CircleDollarSign, Download, Mail, ShieldCheck, Star, UserPlus, Users, WalletCards } from 'lucide-react'
import { buildManagementReportPdf } from './premiumReportPdf.js'
import './premiumReports.css'

const financialMonths = [['Mar', 198000], ['Abr', 207000], ['Mai', 214000], ['Jun', 221000], ['Jul', 229000], ['Ago', 238400]]
const brl = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value || 0)

export function Reports({ state, students, unitId }) {
  const [period, setPeriod] = useState('Últimos 6 meses')
  const [reportType, setReportType] = useState('Consolidado')
  const selectedUnit = unitId === 'all' ? 'Todas as unidades' : state.units.find((unit) => unit.id === unitId)?.name
  const activeTeam = (state.team || []).filter((member) => member.status === 'active' && (unitId === 'all' || member.unitId === unitId))
  const averageFrequency = students.length ? students.reduce((sum, item) => sum + item.frequency30d, 0) / students.length : 0
  const satisfaction = students.length ? students.reduce((sum, item) => sum + item.satisfaction, 0) / students.length : 0
  const maxMonth = Math.max(...financialMonths.map(([, value]) => value))
  const downloadPdf = () => {
    const bytes = buildManagementReportPdf({
      subtitle: `${reportType} | ${selectedUnit} | ${period}`,
      revenue: state.finance.recurringRevenue, received: state.finance.paidThisMonth, overdue: state.finance.overdue,
      result: state.finance.paidThisMonth - state.finance.expenses, students: students.length,
      frequency: averageFrequency.toFixed(1), satisfaction: satisfaction.toFixed(1), activeTeam: activeTeam.length,
      months: financialMonths.map(([month, value]) => ({ month, value })),
      team: activeTeam.map((member) => ({ ...member, students: member.students || 0, rating: member.rating || '—' })),
      generatedAt: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date())
    })
    const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = `relatorio-shapp-${new Date().toISOString().slice(0, 10)}.pdf`; anchor.click(); URL.revokeObjectURL(url)
  }
  return <><header className="eleveSectionHeader"><div><p>RELATÓRIOS GERENCIAIS</p><h1>Dados claros para decisões melhores.</h1><span>Financeiro, operação, alunos e equipe reunidos em uma visão exportável.</span></div><button onClick={downloadPdf}><Download /> Baixar relatório em PDF</button></header><section className="sprFilters"><label>Relatório<select value={reportType} onChange={(event) => setReportType(event.target.value)}><option>Consolidado</option><option>Financeiro</option><option>Desempenho da equipe</option><option>Alunos e retenção</option></select></label><label>Período<select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Últimos 30 dias</option><option>Últimos 3 meses</option><option>Últimos 6 meses</option><option>Ano atual</option></select></label><span><ShieldCheck /> {selectedUnit}</span></section><section className="eleveKpis"><article className="eleveKpi good"><span><CircleDollarSign /></span><div><small>Receita recorrente</small><strong>{brl(state.finance.recurringRevenue)}</strong><p>mês atual</p></div></article><article className="eleveKpi"><span><WalletCards /></span><div><small>Resultado estimado</small><strong>{brl(state.finance.paidThisMonth - state.finance.expenses)}</strong><p>recebido menos despesas</p></div></article><article className="eleveKpi"><span><Activity /></span><div><small>Frequência média</small><strong>{averageFrequency.toFixed(1)}x</strong><p>últimos 30 dias</p></div></article><article className="eleveKpi"><span><Users /></span><div><small>Equipe ativa</small><strong>{activeTeam.length}</strong><p>no recorte selecionado</p></div></article></section><section className="sprGrid"><article className="eleveCard sprChart"><div className="eleveCardTitle"><span><BarChart3 /> Evolução do faturamento</span><b>+20,4%</b></div><div className="sprBars">{financialMonths.map(([month, value]) => <div key={month}><small>{brl(value)}</small><i><span style={{ height: `${Math.round(value / maxMonth * 100)}%` }} /></i><b>{month}</b></div>)}</div></article><article className="eleveCard sprFinance"><div className="eleveCardTitle"><span><CircleDollarSign /> Resumo financeiro</span></div>{[['Receita prevista', state.finance.recurringRevenue], ['Recebido no mês', state.finance.paidThisMonth], ['Contas a receber', state.finance.receivables], ['Inadimplência', state.finance.overdue], ['Despesas', state.finance.expenses]].map(([label, value], index) => <div key={label}><span><i className={index === 3 ? 'danger' : ''} />{label}</span><b>{brl(value)}</b></div>)}</article></section><section className="eleveCard sprTeamReport"><div className="eleveCardTitle"><span><Users /> Indicadores da equipe</span><small>Satisfação e carteira por profissional</small></div><div className="sprTeamHead"><b>Profissional</b><b>Função</b><b>Unidade</b><b>Alunos</b><b>Avaliação</b><b>Status</b></div>{activeTeam.map((member) => <div className="sprTeamRow" key={member.id}><span><i>{member.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</i><b>{member.name}</b></span><span>{member.role}</span><span>{state.units.find((unit) => unit.id === member.unitId)?.name}</span><strong>{member.students || 0}</strong><strong><Star /> {member.rating || '—'}</strong><em><CheckCircle2 /> Ativo</em></div>)}</section></>
}

export function TeamManagement({ state, setState, unitId }) {
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const defaultUnit = unitId === 'all' ? state.units[0].id : unitId
  const [form, setForm] = useState({ name: '', email: '', role: 'Personal trainer', unitId: defaultUnit })
  const team = useMemo(() => (state.team || []).filter((member) => unitId === 'all' || member.unitId === unitId), [state.team, unitId])
  const addMember = () => {
    if (form.name.trim().length < 3 || !form.email.includes('@')) return setMessage('Informe nome e e-mail válidos.')
    const member = { id: crypto.randomUUID(), ...form, status: 'invited', students: 0, rating: null }
    setState({ ...state, team: [member, ...(state.team || [])] }); setMessage('Convite enviado e acesso vinculado à unidade.'); setShowForm(false)
  }
  const toggle = (id) => setState({ ...state, team: state.team.map((member) => member.id === id ? { ...member, status: member.status === 'inactive' ? 'active' : 'inactive' } : member) })
  return <><header className="eleveSectionHeader"><div><p>GERENCIAMENTO DE EQUIPE</p><h1>Pessoas, acessos e desempenho.</h1><span>Controle funções, unidade, carteira de alunos e situação de cada acesso.</span></div><button onClick={() => setShowForm(!showForm)}><UserPlus /> Novo profissional</button></header>{showForm && <section className="eleveCard sprTeamForm"><label>Nome<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>E-mail<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label>Função<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option>Gerente de unidade</option><option>Consultor comercial</option><option>Personal trainer</option><option>Professor</option><option>Recepção</option></select></label><label>Unidade<select value={form.unitId} onChange={(event) => setForm({ ...form, unitId: event.target.value })}>{state.units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label><button onClick={addMember}><Mail /> Enviar convite</button></section>}{message && <p className="eleveSaveMessage">{message}</p>}<section className="eleveCard sprTeamManage"><div className="sprTeamHead"><b>Profissional</b><b>Função</b><b>Unidade</b><b>Carteira</b><b>Avaliação</b><b>Acesso</b></div>{team.map((member) => <div className="sprTeamRow" key={member.id}><span><i>{member.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</i><b>{member.name}<small>{member.email}</small></b></span><span>{member.role}</span><span>{state.units.find((unit) => unit.id === member.unitId)?.name}</span><strong>{member.students || 0} alunos</strong><strong><Star /> {member.rating || '—'}</strong><button className={member.status} onClick={() => toggle(member.id)}>{member.status === 'active' ? 'Ativo' : member.status === 'invited' ? 'Convidado' : 'Inativo'}</button></div>)}</section></>
}
