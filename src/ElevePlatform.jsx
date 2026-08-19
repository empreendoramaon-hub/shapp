import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, AlertTriangle, ArrowUpRight, BarChart3, Building2, CalendarDays, CheckCircle2,
  ChevronRight, CircleDollarSign, ClipboardCheck, Copy, CreditCard, Dumbbell, ExternalLink,
  Gauge, HeartPulse, LayoutDashboard, Mail, Menu, MessageCircle, Plus, Save, Search, ShieldCheck,
  Star, Target, Trash2, UserPlus, UserRound, Users, WalletCards, X
} from 'lucide-react'
import { buildEleveInvitePath, buildEleveStudentAppPath, calculateEleveMetrics, createEleveInvite, createEleveSafeStorageState, eleveAdminRoles, eleveRoles, hydrateEleveState, planAllowsAppointment, scopeEleveStudents, upsertEleveAssessment, upsertEleveSatisfaction, upsertEleveWorkout } from './elevePlatformData.js'
import './elevePlatform.css'
import './shappPremiumOverrides.css'
import { Reports, TeamManagement } from './PremiumReports.jsx'
import { AuditLogs, Contracts } from './EleveComplianceModules.jsx'

const IS_ELEVE = window.location.pathname.startsWith('/eleve')
const BASE_PATH = IS_ELEVE ? '/eleve' : '/gestao-premium'
const STORAGE_KEY = IS_ELEVE ? 'shappElevePlatformV2' : 'shappManagementPremiumV1'
const VARIANT = IS_ELEVE ? 'eleve' : 'generic'

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return hydrateEleveState(saved, VARIANT)
  } catch {
    return hydrateEleveState(null, VARIANT)
  }
}

function money(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value || 0)
}

function date(value) {
  if (!value) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T12:00:00`))
}

const nav = [
  ['overview', 'Visão geral', LayoutDashboard], ['students', 'Alunos', Users], ['agenda', 'Agenda', CalendarDays],
  ['plans', 'Planos e acessos', WalletCards], ['contracts', 'Contratos', ClipboardCheck], ['workouts', 'Treinos', Dumbbell], ['assessments', 'Avaliações', HeartPulse], ['experience', 'Experiência', Star],
  ['finance', 'Financeiro', CircleDollarSign], ['reports', 'Relatórios', BarChart3], ['team', 'Equipe', Users], ['audit', 'Atividades', ShieldCheck], ['units', 'Unidades', Building2]
]

function Kpi({ icon: Icon, label, value, note, tone = '' }) {
  return <article className={`eleveKpi ${tone}`}><span><Icon /></span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article>
}

function Risk({ value }) {
  const labels = { low: 'Baixo', medium: 'Médio', high: 'Alto' }
  return <span className={`eleveRisk is-${value}`}>{labels[value] || value}</span>
}

function Progress({ value, target }) {
  const progress = Math.min(100, Math.round((value / target) * 100))
  return <div className="eleveProgress"><i style={{ width: `${progress}%` }} /><b>{progress}%</b></div>
}

function Overview({ state, students, metrics, role, unitId, setSection }) {
  const unitName = unitId === 'all' ? 'Todas as unidades' : state.units.find((unit) => unit.id === unitId)?.name
  const alerts = [
    { tone: 'red', title: `${metrics.absent} alunos com baixa frequência`, text: 'Frequência abaixo de 6 visitas nos últimos 30 dias.', section: 'students' },
    { tone: 'orange', title: `${metrics.highRisk} alunos com alto risco`, text: 'Sinais combinados de ausência, satisfação ou financeiro.', section: 'students' },
    { tone: 'red', title: `${metrics.overdue} mensalidades em atraso`, text: `${money(state.finance.overdue)} aguardando ação da equipe.`, section: 'finance' },
    { tone: 'green', title: `Satisfação média ${metrics.satisfaction.toFixed(1)}`, text: 'Experiência acompanhada por unidade e profissional.', section: 'experience' }
  ]
  return <>
    <header className="eleveSectionHeader"><div><p>PAINEL EXECUTIVO</p><h1>Gestão que transforma dados em ação.</h1><span>{role.label} · {unitName}</span></div><button onClick={() => setSection('students')}>Ver alunos em risco <ArrowUpRight /></button></header>
    <section className="eleveKpis">
      <Kpi icon={Users} label="Alunos no recorte" value={metrics.active} note="ativos na operação" />
      <Kpi icon={Activity} label="Frequência média" value={`${metrics.averageFrequency.toFixed(1)}x`} note="visitas nos últimos 30 dias" />
      <Kpi icon={Star} label="Satisfação" value={metrics.satisfaction.toFixed(1)} note="de 5 pontos" tone="good" />
      <Kpi icon={WalletCards} label="Receita recorrente" value={money(metrics.recurringRevenue)} note="base demonstrativa" />
    </section>
    <section className="eleveOverviewGrid">
      <article className="eleveCard eleveAlerts"><div className="eleveCardTitle"><span><AlertTriangle /> Alertas que pedem atenção</span><button onClick={() => setSection('students')}>Abrir central</button></div>{alerts.map((item) => <button key={item.title} onClick={() => setSection(item.section)} className={`eleveAlert ${item.tone}`}><i /><div><b>{item.title}</b><small>{item.text}</small></div><ChevronRight /></button>)}</article>
      <article className="eleveCard"><div className="eleveCardTitle"><span><Target /> Metas do mês</span></div><div className="eleveGoals">{state.goals.map((goal) => <div key={goal.id}><header><b>{goal.name}</b><span>{goal.format === 'currency' ? money(goal.current) : goal.format === 'percent' ? `${goal.current}%` : goal.current}</span></header><Progress value={goal.current} target={goal.target} /><small>Meta: {goal.format === 'currency' ? money(goal.target) : goal.format === 'percent' ? `${goal.target}%` : goal.target}</small></div>)}</div></article>
    </section>
    <section className="eleveCard eleveUnitsCompare"><div className="eleveCardTitle"><span><BarChart3 /> Comparativo entre unidades</span><button onClick={() => setSection('units')}>Ver detalhes</button></div><div className="eleveCompareHead"><b>Unidade</b><b>Alunos</b><b>Ocupação</b><b>Satisfação</b><b>Receita estimada</b></div>{state.units.map((unit) => <div className="eleveCompareRow" key={unit.id}><span><i>{unit.name.slice(0, 2).toUpperCase()}</i><b>{unit.name}</b><small>{unit.city}</small></span><strong>{unit.students}</strong><strong>{Math.round((unit.students / unit.capacity) * 100)}%</strong><strong>{unit.satisfaction.toFixed(1)}</strong><strong>{money(unit.students * 189)}</strong></div>)}</section>
  </>
}

function Students({ state, setState, students, role, unitId, onOpenModule }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const defaultUnit = unitId === 'all' ? state.units[0]?.id : unitId
  const [showEnrollment, setShowEnrollment] = useState(false)
  const [inviteForm, setInviteForm] = useState({ name: '', phone: '', email: '', unitId: defaultUnit, planId: state.plans[0]?.id || '' })
  const [createdInvite, setCreatedInvite] = useState(null)
  const [inviteMessage, setInviteMessage] = useState('')
  useEffect(() => { if (unitId !== 'all') setInviteForm((current) => ({ ...current, unitId })) }, [unitId])
  const visible = students.filter((student) => `${student.name} ${student.email}`.toLowerCase().includes(query.toLowerCase()))
  const canTrain = ['ceo', 'manager', 'trainer'].includes(role.id)
  function generateInvite() {
    try { const result = createEleveInvite(state, inviteForm); setState(result.state); setCreatedInvite(result.invite); setInviteMessage('Convite criado. O aluno aparecerá na lista após aceitar os termos e concluir o cadastro.') }
    catch (error) { setInviteMessage(error.message) }
  }
  const inviteUrl = createdInvite ? `${window.location.origin}${buildEleveInvitePath(createdInvite.token, BASE_PATH)}` : ''
  return <><header className="eleveSectionHeader"><div><p>GESTÃO DE ALUNOS</p><h1>Uma visão completa de cada relacionamento.</h1><span>Frequência, plano, financeiro, avaliação, treino e comunicação em um só perfil.</span></div><button onClick={() => setShowEnrollment(!showEnrollment)}><UserPlus /> Novo aluno</button></header>{showEnrollment && <section className="eleveCard eleveEnrollment"><div className="eleveCardTitle"><span><UserPlus /> Matrícula e convite individual</span><small>O vínculo com a unidade é definido antes do envio.</small></div><div className="eleveEnrollmentForm"><label>Nome completo<input value={inviteForm.name} onChange={(event) => setInviteForm({ ...inviteForm, name: event.target.value })} /></label><label>WhatsApp<input value={inviteForm.phone} onChange={(event) => setInviteForm({ ...inviteForm, phone: event.target.value })} placeholder="(48) 99999-9999" /></label><label>E-mail<input type="email" value={inviteForm.email} onChange={(event) => setInviteForm({ ...inviteForm, email: event.target.value })} /></label><label>Unidade<select value={inviteForm.unitId} disabled={role.unitScope !== 'all'} onChange={(event) => setInviteForm({ ...inviteForm, unitId: event.target.value })}>{state.units.filter((unit) => role.unitScope === 'all' || unit.id === role.unitScope).map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label><label>Plano<select value={inviteForm.planId} onChange={(event) => setInviteForm({ ...inviteForm, planId: event.target.value })}>{state.plans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name}</option>)}</select></label><button onClick={generateInvite}>Gerar acesso do aplicativo</button></div>{createdInvite && <div className="eleveInviteResult"><code>{inviteUrl}</code><button onClick={() => navigator.clipboard?.writeText(inviteUrl)}><Copy /> Copiar link</button><a href={`https://wa.me/55${createdInvite.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${createdInvite.name}! Seu acesso ao aplicativo da ${state.academy.name} está pronto: ${inviteUrl}`)}`} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a><a href={`mailto:${encodeURIComponent(createdInvite.email)}?subject=${encodeURIComponent(`Seu acesso ao aplicativo da ${state.academy.name}`)}&body=${encodeURIComponent(`Olá, ${createdInvite.name}! Conclua seu cadastro e instale o aplicativo: ${inviteUrl}`)}`}><Mail /> E-mail</a><a href={inviteUrl} target="_blank" rel="noreferrer"><ExternalLink /> Testar convite</a></div>}{inviteMessage && <p className="eleveSaveMessage">{inviteMessage}</p>}<div className="elevePendingInvites"><b>Convites recentes</b>{(state.invites || []).slice(0, 4).map((invite) => <span key={invite.id}><i className={invite.status} />{invite.name}<small>{state.units.find((unit) => unit.id === invite.unitId)?.name}</small><strong>{invite.status === 'registered' ? 'Cadastro concluído' : 'Aguardando aceite'}</strong></span>)}</div></section>}<section className="eleveCard"><div className="eleveTableTools"><label><Search /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar aluno" /></label><span>{visible.length} alunos no recorte</span></div><div className="eleveStudentTable eleveTableHead"><b>Aluno</b><b>Plano</b><b>Última visita</b><b>Frequência</b><b>Financeiro</b><b>Risco</b></div>{visible.map((student) => { const plan = state.plans.find((item) => item.id === student.planId); return <button className="eleveStudentTable" key={student.id} onClick={() => setSelected(student)}><span><i>{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</i><b>{student.name}{student.status === 'new' && <em>NOVO</em>}</b><small>{state.units.find((unit) => unit.id === student.unitId)?.name}</small></span><strong>{plan?.name}</strong><strong>{date(student.lastVisit)}</strong><strong>{student.frequency30d}x / 30d</strong><strong className={`finance-${student.financialStatus}`}>{student.financialStatus === 'paid' ? 'Em dia' : student.financialStatus === 'overdue' ? 'Em atraso' : 'Pendente'}</strong><Risk value={student.risk} /></button>})}</section>{selected && <div className="eleveModalBackdrop" onClick={() => setSelected(null)}><article className="eleveStudentModal eleveStudentRecord" onClick={(e) => e.stopPropagation()}><button className="eleveClose" onClick={() => setSelected(null)}><X /></button><header><i>{selected.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</i><div><p>FICHA DO ALUNO · ACESSO {role.label.toUpperCase()}</p><h2>{selected.name}</h2><span>{selected.email} · {selected.phone}</span></div><Risk value={selected.risk} /></header><div className="eleveRecordActions">{canTrain && <button onClick={() => onOpenModule('workouts', selected.id)}><Dumbbell /> Editar treino</button>}{canTrain && <button onClick={() => onOpenModule('assessments', selected.id)}><HeartPulse /> Inserir avaliação</button>}<a href={`https://wa.me/55${selected.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${selected.name}! A equipe da ${state.academy.name} está entrando em contato pelo seu acompanhamento.`)}`} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a><a href={`mailto:${encodeURIComponent(selected.email)}?subject=${encodeURIComponent(`Acompanhamento ${state.academy.name}`)}`}><Mail /> E-mail</a><button onClick={() => navigator.clipboard?.writeText(`${window.location.origin}${BASE_PATH}/aluno/${selected.id}`)}><Copy /> Copiar link do app</button><a href={`${BASE_PATH}/aluno/${selected.id}`} target="_blank" rel="noreferrer"><ExternalLink /> Visualizar app</a></div><div className="eleveProfileGrid"><div><small>Plano</small><b>{state.plans.find((plan) => plan.id === selected.planId)?.name}</b></div><div><small>Unidade principal</small><b>{state.units.find((unit) => unit.id === selected.unitId)?.name}</b></div><div><small>Status</small><b>{selected.status === 'new' ? 'Novo · aguardando avaliação' : 'Ativo'}</b></div><div><small>Frequência mensal</small><b>{selected.frequency30d} visitas</b></div><div><small>Satisfação</small><b>{selected.satisfaction || '—'}/5</b></div><div><small>Contrato até</small><b>{date(selected.contractEndsAt)}</b></div></div>{canTrain && <div className="eleveRecordClinical"><article><small>ÚLTIMA AVALIAÇÃO</small><b>{selected.assessment ? date(selected.assessment.date) : 'Avaliação pendente'}</b><span>{selected.assessment ? `${selected.assessment.weight} kg · IMC ${selected.assessment.bmi || '—'} · ${selected.assessment.bodyFat || '—'}% gordura` : 'Preencha a anamnese e os testes iniciais.'}</span></article><article><small>TREINO ATUAL</small><b>{state.workouts?.find((workout) => workout.studentId === selected.id)?.name || 'Treino pendente'}</b><span>{state.workouts?.find((workout) => workout.studentId === selected.id)?.goal || 'Monte a primeira rotina do aluno.'}</span></article></div>}<section><h3>Leitura recomendada</h3><p>{selected.status === 'new' ? 'Novo cadastro confirmado. Próximas ações: atribuir personal, realizar avaliação inicial e publicar o primeiro treino.' : selected.risk === 'high' ? 'Contato prioritário: combinar regularização financeira, ouvir a experiência e reagendar avaliação.' : selected.risk === 'medium' ? 'Acompanhar frequência e oferecer orientação para aumentar a constância.' : 'Aluno engajado. Manter reconhecimento e benefícios do plano.'}</p></section></article></div>}</>
}

function Agenda({ state, setState, students }) {
  const [studentId, setStudentId] = useState(students[0]?.id || '')
  const [trainerId, setTrainerId] = useState(state.trainers[0]?.id || '')
  const [appointmentDate, setAppointmentDate] = useState('2026-08-21')
  const [time, setTime] = useState('08:00')
  const [message, setMessage] = useState('')
  function book() {
    const student = state.students.find((item) => item.id === studentId)
    const trainer = state.trainers.find((item) => item.id === trainerId)
    const validation = planAllowsAppointment(state, student, trainer, appointmentDate, time)
    setMessage(validation.reason)
    if (!validation.ok) return
    const next = { ...state, appointments: [...state.appointments, { id: crypto.randomUUID(), studentId, trainerId, unitId: trainer.unitId, date: appointmentDate, time, type: 'Personal', status: 'confirmed' }], students: state.students.map((item) => item.id === studentId ? { ...item, sessionsUsed: (item.sessionsUsed || 0) + 1 } : item) }
    setState(next)
  }
  return <><header className="eleveSectionHeader"><div><p>AGENDA INTEGRADA</p><h1>Disponibilidade, regras e confirmação.</h1><span>O sistema valida plano, unidade, limite de sessões e conflitos.</span></div></header><section className="eleveAgendaGrid"><article className="eleveCard"><div className="eleveCardTitle"><span><CalendarDays /> Próximos agendamentos</span></div>{state.appointments.map((item) => <div className="eleveAppointment" key={item.id}><time><b>{item.time}</b><small>{date(item.date)}</small></time><div><b>{state.students.find((student) => student.id === item.studentId)?.name}</b><small>{item.type} · {state.trainers.find((trainer) => trainer.id === item.trainerId)?.name}</small></div><span className={`status-${item.status}`}>{item.status === 'confirmed' ? 'Confirmado' : 'Pendente'}</span></div>)}</article><article className="eleveCard eleveBooking"><div className="eleveCardTitle"><span><ClipboardCheck /> Novo agendamento</span></div><label>Aluno<select value={studentId} onChange={(e) => setStudentId(e.target.value)}>{students.map((student) => <option value={student.id} key={student.id}>{student.name}</option>)}</select></label><label>Profissional<select value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>{state.trainers.map((trainer) => <option value={trainer.id} key={trainer.id}>{trainer.name} · {state.units.find((unit) => unit.id === trainer.unitId)?.name}</option>)}</select></label><div><label>Data<input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} /></label><label>Horário<select value={time} onChange={(e) => setTime(e.target.value)}>{['07:00', '08:00', '09:00', '10:00', '17:00', '18:00', '19:00'].map((slot) => <option key={slot}>{slot}</option>)}</select></label></div><button onClick={book}>Validar e confirmar</button>{message && <p className="eleveBookingMessage">{message}</p>}</article></section></>
}

function Plans({ state }) {
  return <><header className="eleveSectionHeader"><div><p>PLANOS E ACESSOS</p><h1>O aplicativo se adapta ao plano do aluno.</h1><span>Unidades, modalidades, personal e avaliações liberados automaticamente.</span></div></header><section className="elevePlanGrid">{state.plans.map((plan) => <article className="elevePlan" key={plan.id}><p>{plan.name}</p><h2>{money(plan.price)}<small>/mês</small></h2><div><span><Building2 /> {plan.units.length === state.units.length ? 'Todas as unidades' : 'Unidade principal'}</span><span><Dumbbell /> {plan.modalities} modalidades</span><span><UserRound /> {plan.personalSessions ? `${plan.personalSessions} sessões com personal` : 'Sem personal incluso'}</span><span><HeartPulse /> {plan.assessments ? 'Avaliações liberadas' : 'Avaliação sob contratação'}</span></div><ul>{plan.benefits.map((benefit) => <li key={benefit}><CheckCircle2 /> {benefit}</li>)}</ul></article>)}</section></>
}

function Workouts({ state, setState, students, initialStudentId }) {
  const [studentId, setStudentId] = useState(students.some((student) => student.id === initialStudentId) ? initialStudentId : students[0]?.id || '')
  const [form, setForm] = useState({ id: crypto.randomUUID(), studentId, name: '', goal: '', exercises: [] })
  const [message, setMessage] = useState('')
  useEffect(() => {
    const saved = (state.workouts || []).find((item) => item.studentId === studentId)
    setForm(saved ? structuredClone(saved) : { id: crypto.randomUUID(), studentId, name: 'Novo treino', goal: '', exercises: [] })
    setMessage('')
  }, [studentId])
  function updateExercise(index, field, value) { setForm((current) => ({ ...current, exercises: current.exercises.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) })) }
  function addExercise() { setForm((current) => ({ ...current, exercises: [...current.exercises, { id: crypto.randomUUID(), name: '', sets: 3, reps: '12', load: '', rest: '60s' }] })) }
  function save() {
    try { const next = upsertEleveWorkout(state, { ...form, studentId }); setState(next); setMessage('Treino salvo e liberado no aplicativo do aluno.') }
    catch (error) { setMessage(error.message) }
  }
  return <><header className="eleveSectionHeader"><div><p>PRESCRIÇÃO DE TREINOS</p><h1>Crie, ajuste e publique a rotina do aluno.</h1><span>Séries, repetições, carga e descanso sincronizados com o aplicativo.</span></div><button onClick={() => window.open(`${BASE_PATH}/aluno`, '_blank')}>Ver app do aluno <ArrowUpRight /></button></header><section className="eleveWorkoutLayout"><article className="eleveCard eleveWorkoutEditor"><div className="eleveFormGrid"><label>Aluno<select value={studentId} onChange={(event) => setStudentId(event.target.value)}>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label><label>Nome do treino<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="fullField">Objetivo<textarea value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} /></label></div><div className="eleveExerciseHead"><b>Exercícios</b><button onClick={addExercise}><Plus /> Adicionar exercício</button></div><div className="eleveExerciseTable"><div className="head"><b>Exercício</b><b>Séries</b><b>Repetições</b><b>Carga</b><b>Descanso</b><b /></div>{form.exercises.map((exercise, index) => <div key={exercise.id}><input value={exercise.name} onChange={(event) => updateExercise(index, 'name', event.target.value)} placeholder="Nome do exercício" /><input type="number" min="1" value={exercise.sets} onChange={(event) => updateExercise(index, 'sets', Number(event.target.value))} /><input value={exercise.reps} onChange={(event) => updateExercise(index, 'reps', event.target.value)} /><input value={exercise.load} onChange={(event) => updateExercise(index, 'load', event.target.value)} /><input value={exercise.rest} onChange={(event) => updateExercise(index, 'rest', event.target.value)} /><button aria-label="Remover exercício" onClick={() => setForm({ ...form, exercises: form.exercises.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 /></button></div>)}</div><button className="elevePrimaryAction" onClick={save}><Save /> Salvar e publicar treino</button>{message && <p className="eleveSaveMessage">{message}</p>}</article><aside className="eleveCard eleveWorkoutSummary"><Dumbbell /><p>TREINO ATIVO</p><h2>{form.name || 'Sem título'}</h2><span>{form.goal || 'Defina o objetivo da prescrição.'}</span><strong>{form.exercises.length}</strong><small>exercícios configurados</small><div>O aluno visualiza a rotina, marca cada exercício e acumula XP ao concluir.</div></aside></section></>
}

const assessmentFields = {
  medical: [['medicalHistory', 'Histórico médico e doenças'], ['diseases', 'Doenças diagnosticadas'], ['surgeriesInjuries', 'Cirurgias ou lesões antigas'], ['medications', 'Uso de remédios'], ['sleepWork', 'Hábitos de vida, sono e trabalho'], ['goals', 'Metas e objetivos de treino']],
  body: [['weight', 'Peso (kg)', 'number'], ['height', 'Altura (m)', 'number'], ['waist', 'Cintura (cm)', 'number'], ['arms', 'Braços (cm)', 'number'], ['thighs', 'Coxas (cm)', 'number'], ['bodyFat', 'Gordura corporal (%)', 'number'], ['leanMass', 'Massa magra (kg)', 'number'], ['bodyWater', 'Água corporal (%)', 'number'], ['visceralFat', 'Gordura visceral', 'number']],
  tests: [['posture', 'Postura e alinhamento'], ['flexibility', 'Flexibilidade muscular'], ['strength', 'Força e resistência'], ['cardiorespiratory', 'Capacidade cardiorrespiratória'], ['mobility', 'Mobilidade das articulações']]
}

function Assessments({ state, setState, students, initialStudentId }) {
  const [studentId, setStudentId] = useState(students.some((student) => student.id === initialStudentId) ? initialStudentId : students[0]?.id || '')
  const selected = state.students.find((student) => student.id === studentId)
  const [form, setForm] = useState(() => ({ date: new Date().toISOString().slice(0, 10), ...(selected?.assessment || {}) }))
  const [message, setMessage] = useState('')
  useEffect(() => { const student = state.students.find((item) => item.id === studentId); setForm({ date: new Date().toISOString().slice(0, 10), ...(student?.assessment || {}) }); setMessage('') }, [studentId])
  function field(key, label, type = 'text') {
    const value = form[key] ?? ''
    return <label key={key}>{label}{type === 'number' ? <input type="number" step="0.1" value={value} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /> : <textarea value={value} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />}</label>
  }
  function save() { const next = upsertEleveAssessment(state, studentId, form); setState(next); setForm(next.students.find((student) => student.id === studentId).assessment); setMessage('Avaliação salva no histórico do aluno.') }
  const bmi = Number(form.height) > 0 ? (Number(form.weight || 0) / (Number(form.height) ** 2)).toFixed(1) : '—'
  return <><header className="eleveSectionHeader"><div><p>AVALIAÇÃO E EVOLUÇÃO</p><h1>Anamnese e desempenho em um único histórico.</h1><span>Dados de saúde protegidos e disponíveis somente aos perfis autorizados.</span></div></header><section className="eleveAssessmentLayout"><article className="eleveCard eleveAssessmentForm"><div className="eleveAssessmentToolbar"><label>Aluno<select value={studentId} onChange={(event) => setStudentId(event.target.value)}>{students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}</select></label><label>Data<input type="date" value={form.date || ''} onChange={(event) => setForm({ ...form, date: event.target.value })} /></label><span>IMC calculado<strong>{bmi}</strong></span></div><fieldset><legend>Dados de Saúde · Anamnese</legend><div className="eleveAssessmentFields medical">{assessmentFields.medical.map(([key, label, type]) => field(key, label, type))}</div></fieldset><fieldset><legend>Medidas e Composição Corporal · Antropometria</legend><div className="eleveAssessmentFields body">{assessmentFields.body.map(([key, label, type]) => field(key, label, type))}</div></fieldset><fieldset><legend>Testes Físicos, Postura e Mobilidade</legend><div className="eleveAssessmentFields tests">{assessmentFields.tests.map(([key, label, type]) => field(key, label, type))}</div></fieldset><button className="elevePrimaryAction" onClick={save}><Save /> Salvar avaliação</button>{message && <p className="eleveSaveMessage">{message}</p>}</article><aside className="eleveCard eleveAssessmentHistory"><div className="eleveCardTitle"><span><HeartPulse /> Últimas avaliações</span></div>{students.filter((student) => student.assessment).map((student) => <button key={student.id} onClick={() => setStudentId(student.id)}><i>{student.name[0]}</i><span><b>{student.name}</b><small>{date(student.assessment.date)}</small></span><strong>{student.assessment.weight} kg</strong><small>{student.assessment.bodyFat || '—'}% gordura</small></button>)}</aside></section></>
}

function Experience({ state, setState, students, role }) {
  const student = role.studentId ? state.students.find((item) => item.id === role.studentId) : null
  function rate(score) { const next = upsertEleveSatisfaction(state, student.id, score); setState(next) }
  const distribution = [5, 4, 3, 2, 1].map((score) => ({ score, count: students.filter((item) => item.satisfaction === score).length }))
  return <><header className="eleveSectionHeader"><div><p>EXPERIÊNCIA DO ALUNO</p><h1>Ouvir, entender e agir.</h1><span>Satisfação por aluno, unidade e profissional.</span></div></header>{student && <section className="eleveCard eleveRate"><Star /><div><p>Como você avalia sua experiência hoje?</p><h2>{student.name}, sua opinião melhora a academia.</h2><div>{[1, 2, 3, 4, 5].map((score) => <button className={score <= student.satisfaction ? 'active' : ''} onClick={() => rate(score)} key={score}><Star /></button>)}</div></div></section>}<section className="eleveExperienceGrid"><article className="eleveCard"><div className="eleveCardTitle"><span><Gauge /> Distribuição das avaliações</span></div>{distribution.map((item) => <div className="eleveDistribution" key={item.score}><b>{item.score} <Star /></b><i><span style={{ width: `${students.length ? (item.count / students.length) * 100 : 0}%` }} /></i><strong>{item.count}</strong></div>)}</article><article className="eleveCard"><div className="eleveCardTitle"><span><MessageCircle /> Últimos sinais</span></div><blockquote>“Equipe atenciosa e ambiente excelente.”<small>Ana · Unidade Centro · 5/5</small></blockquote><blockquote>“Quero mais opções de horário com personal.”<small>Bruno · Unidade Centro · 3/5</small></blockquote><blockquote>“A agenda pelo app ficou muito prática.”<small>Elisa · Unidade Norte · 5/5</small></blockquote></article></section></>
}

function Finance({ state }) {
  const f = state.finance
  return <><header className="eleveSectionHeader"><div><p>GESTÃO FINANCEIRA</p><h1>Receita, recebíveis e inadimplência.</h1><span>Visão gerencial inicial; cobrança automática prevista na Fase 2.</span></div></header><section className="eleveKpis"><Kpi icon={CreditCard} label="Receita recorrente" value={money(f.recurringRevenue)} note="mês atual" tone="good" /><Kpi icon={WalletCards} label="Recebido" value={money(f.paidThisMonth)} note="pagamentos confirmados" /><Kpi icon={AlertTriangle} label="Inadimplência" value={money(f.overdue)} note="requer follow-up" tone="danger" /><Kpi icon={CircleDollarSign} label="Resultado estimado" value={money(f.paidThisMonth - f.expenses)} note="recebido menos despesas" /></section><section className="eleveCard eleveFinanceBars"><div className="eleveCardTitle"><span><BarChart3 /> Evolução do faturamento</span></div>{[['Mar', 198], ['Abr', 207], ['Mai', 214], ['Jun', 221], ['Jul', 229], ['Ago', 238]].map(([month, value]) => <div key={month}><b>{month}</b><i><span style={{ height: `${value}px` }} /></i><small>R$ {value} mil</small></div>)}</section></>
}

function Units({ state }) {
  return <><header className="eleveSectionHeader"><div><p>GESTÃO MULTIUNIDADE</p><h1>Operações locais, visão consolidada.</h1><span>Cada gerente visualiza sua unidade; a direção compara toda a rede.</span></div></header><section className="eleveUnitGrid">{state.units.map((unit) => <article className="eleveUnit" key={unit.id}><header><i>{unit.name.slice(0, 2).toUpperCase()}</i><div><p>UNIDADE</p><h2>{unit.name}</h2><span>{unit.city}</span></div></header><div><span><small>Alunos</small><b>{unit.students}</b></span><span><small>Ocupação</small><b>{Math.round((unit.students / unit.capacity) * 100)}%</b></span><span><small>Satisfação</small><b>{unit.satisfaction}</b></span><span><small>Gestora</small><b>{unit.manager}</b></span></div><Progress value={unit.students} target={unit.capacity} /></article>)}</section></>
}

function StudentHome({ state, student, setSection }) {
  const plan = state.plans.find((item) => item.id === student.planId)
  const trainer = state.trainers.find((item) => item.id === student.trainerId)
  return <><header className="eleveStudentHero"><p>BOA TARDE,</p><h1>{student.name.split(' ')[0]}.</h1><span>Sua evolução começa com constância.</span><button onClick={() => setSection('agenda')}>Agendar personal <ChevronRight /></button></header><section className="eleveStudentSummary"><article><Activity /><small>Frequência</small><b>{student.frequency30d} treinos</b><span>nos últimos 30 dias</span></article><article><WalletCards /><small>Seu plano</small><b>{plan.name}</b><span>{plan.units.length} unidade(s) liberada(s)</span></article><article><UserRound /><small>Personal</small><b>{trainer?.name || 'Não incluído'}</b><span>{student.sessionsLimit - student.sessionsUsed} sessões disponíveis</span></article><article><Star /><small>Satisfação</small><b>{student.satisfaction}/5</b><button onClick={() => setSection('experience')}>Avaliar experiência</button></article></section><section className="eleveCard eleveStudentPlan"><div><p>SEU PLANO SE ADAPTA A VOCÊ</p><h2>{plan.name}</h2><span>{plan.benefits.join(' · ')}</span></div><Risk value={student.risk} /></section></>
}

function ElevePlatform() {
  const [state, setStateRaw] = useState(loadState)
  const [roleId, setRoleId] = useState('ceo')
  const [unitId, setUnitId] = useState('all')
  const [section, setSection] = useState('overview')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [targetStudentId, setTargetStudentId] = useState('')
  useEffect(() => {
    const syncState = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return
      try { setStateRaw(hydrateEleveState(JSON.parse(event.newValue))) } catch { /* mantém o último estado válido */ }
    }
    window.addEventListener('storage', syncState)
    return () => window.removeEventListener('storage', syncState)
  }, [])
  const adminRoles = eleveAdminRoles
  const role = adminRoles.find((item) => item.id === roleId) || adminRoles[0]
  const students = useMemo(() => scopeEleveStudents(state, role, unitId), [state, role, unitId])
  const metrics = useMemo(() => calculateEleveMetrics(state, students), [state, students])
  function setState(next, action = 'Dados operacionais atualizados') {
    const audited = { ...next, auditLogs: [{ id: crypto.randomUUID(), date: new Date().toISOString(), actor: role.label, action, unitId: unitId === 'all' ? 'all' : unitId }, ...(next.auditLogs || [])].slice(0, 80) }
    setStateRaw(audited); localStorage.setItem(STORAGE_KEY, JSON.stringify(createEleveSafeStorageState(audited)))
  }
  function changeRole(value) { setRoleId(value); const nextRole = eleveRoles.find((item) => item.id === value); setUnitId(nextRole.unitScope === 'all' ? 'all' : nextRole.unitScope); setSection('overview') }
  function openStudentModule(nextSection, studentId) { setTargetStudentId(studentId); setSection(nextSection) }
  const availableNav = role.id === 'trainer' ? nav.filter(([id]) => ['overview', 'students', 'agenda', 'workouts', 'assessments', 'experience'].includes(id)) : role.id === 'consultant' ? nav.filter(([id]) => ['overview', 'students', 'plans', 'contracts'].includes(id)) : nav
  const student = role.studentId ? state.students.find((item) => item.id === role.studentId) : null
  let content
  if (section === 'overview' && student) content = <StudentHome state={state} student={student} setSection={setSection} />
  else if (section === 'overview') content = <Overview state={state} students={students} metrics={metrics} role={role} unitId={unitId} setSection={setSection} />
  else if (section === 'students') content = <Students state={state} setState={setState} students={students} role={role} unitId={unitId} onOpenModule={openStudentModule} />
  else if (section === 'agenda') content = <Agenda state={state} setState={setState} students={students} />
  else if (section === 'plans') content = <Plans state={state} />
  else if (section === 'contracts') content = <Contracts state={state} setState={setState} students={students} />
  else if (section === 'workouts') content = <Workouts state={state} setState={setState} students={students} initialStudentId={targetStudentId} />
  else if (section === 'assessments') content = <Assessments state={state} setState={setState} students={students} initialStudentId={targetStudentId} />
  else if (section === 'experience') content = <Experience state={state} setState={setState} students={students} role={role} />
  else if (section === 'finance') content = <Finance state={state} />
  else if (section === 'reports') content = <Reports state={state} students={students} unitId={unitId} />
  else if (section === 'team') content = <TeamManagement state={state} setState={setState} unitId={unitId} />
  else if (section === 'audit') content = <AuditLogs state={state} unitId={unitId} />
  else content = <Units state={state} />
  return <div className={`elevePlatform ${IS_ELEVE ? 'isEleve' : ''}`}><aside className={mobileMenu ? 'open' : ''}><div className="eleveBrand"><b>{state.academy.brandMark || 'SH▲PP'}</b><span>{state.academy.tagline.toUpperCase()}</span><small>{IS_ELEVE ? 'PLATAFORMA PROPRIETÁRIA' : 'ACADEMIA DEMONSTRATIVA'}</small></div><nav>{availableNav.map(([id, label, Icon]) => <button className={section === id ? 'active' : ''} key={id} onClick={() => { setSection(id); setMobileMenu(false) }}><Icon /> {label}</button>)}</nav><footer><ShieldCheck /><span><b>Dados protegidos</b>Permissões por função e unidade</span></footer></aside><main><div className="eleveTopbar"><button className="eleveMenu" onClick={() => setMobileMenu(!mobileMenu)}><Menu /></button><div><label>Unidade<select value={role.unitScope === 'all' ? unitId : role.unitScope} disabled={role.unitScope !== 'all'} onChange={(e) => setUnitId(e.target.value)}>{role.unitScope === 'all' && <option value="all">Todas as unidades</option>}{state.units.filter((unit) => role.unitScope === 'all' || unit.id === role.unitScope).map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label><label>Perfil<select value={roleId} onChange={(e) => changeRole(e.target.value)}>{adminRoles.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label><span className="elevePremiumBadge">{IS_ELEVE ? 'ELEVE × SHAPP FIT SYSTEM' : 'SHAPP GESTÃO PREMIUM'}</span></div><span className="eleveTopUser"><i>{role.label.slice(0, 2).toUpperCase()}</i><b>{role.label}</b></span></div><div className="eleveContent">{content}</div></main></div>
}

createRoot(document.getElementById('root')).render(<ElevePlatform />)
