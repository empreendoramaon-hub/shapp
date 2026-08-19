import React, { useState } from 'react'
import { CheckCircle2, ClipboardCheck, FileClock, Search, ShieldCheck } from 'lucide-react'
import './eleveCompliance.css'

const formatDate = (value) => value ? new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T12:00:00`)) : 'Não informado'

export function Contracts({ state, setState, students }) {
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const visible = students.filter((student) => student.name.toLowerCase().includes(query.toLowerCase()))
  function updatePlan(studentId, planId) {
    const plan = state.plans.find((item) => item.id === planId)
    setState({ ...state, students: state.students.map((student) => student.id === studentId ? { ...student, planId, sessionsLimit: plan.personalSessions } : student) }, 'Plano do contrato atualizado')
    setMessage('Plano e regras de acesso atualizados no painel e no aplicativo.')
  }
  function renew(studentId) {
    const current = state.students.find((student) => student.id === studentId)
    const end = new Date(`${current.contractEndsAt || new Date().toISOString().slice(0, 10)}T12:00:00`)
    end.setFullYear(end.getFullYear() + 1)
    setState({ ...state, students: state.students.map((student) => student.id === studentId ? { ...student, contractEndsAt: end.toISOString().slice(0, 10), financialStatus: 'paid' } : student) }, 'Contrato renovado')
    setMessage('Contrato renovado por 12 meses e situação atualizada.')
  }
  return <><header className="eleveSectionHeader"><div><p>PLANOS E CONTRATOS</p><h1>Regras comerciais conectadas ao acesso.</h1><span>Vigência, plano, unidade e benefícios sincronizados com o aplicativo do aluno.</span></div></header><section className="eleveCard ecContracts"><div className="eleveTableTools"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar contrato" /></label><span>{visible.length} contratos no recorte</span></div><div className="ecContractHead"><b>Aluno</b><b>Plano</b><b>Início</b><b>Vigência</b><b>Financeiro</b><b>Ação</b></div>{visible.map((student) => <div className="ecContractRow" key={student.id}><span><i>{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</i><b>{student.name}<small>{state.units.find((unit) => unit.id === student.unitId)?.name}</small></b></span><select value={student.planId} onChange={(event) => updatePlan(student.id, event.target.value)}>{state.plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select><span>{formatDate(student.joinedAt)}</span><strong>{formatDate(student.contractEndsAt)}</strong><em className={student.financialStatus}>{student.financialStatus === 'paid' ? 'Em dia' : student.financialStatus === 'overdue' ? 'Em atraso' : 'Pendente'}</em><button onClick={() => renew(student.id)}><CheckCircle2 /> Renovar</button></div>)}</section>{message && <p className="eleveSaveMessage">{message}</p>}</>
}

export function AuditLogs({ state, unitId }) {
  const logs = (state.auditLogs || []).filter((item) => unitId === 'all' || item.unitId === unitId || item.unitId === 'all')
  return <><header className="eleveSectionHeader"><div><p>SEGURANÇA E AUDITORIA</p><h1>Histórico das atividades administrativas.</h1><span>Rastreabilidade demonstrativa das alterações realizadas no painel.</span></div></header><section className="eleveCard ecAudit"><div className="eleveCardTitle"><span><ShieldCheck /> Registro de atividades</span><small>{logs.length} eventos</small></div>{logs.map((log) => <article key={log.id}><i><FileClock /></i><div><b>{log.action}</b><span>{log.actor} · {log.unitId === 'all' ? 'Todas as unidades' : state.units.find((unit) => unit.id === log.unitId)?.name}</span></div><time>{new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(log.date))}</time></article>)}</section></>
}
