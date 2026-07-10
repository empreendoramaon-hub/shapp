import React, { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Copy,
  Dumbbell,
  ExternalLink,
  Flame,
  Lock,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
  XCircle
} from 'lucide-react'
import './shappFitMvp.css'

const STORAGE_KEY = 'shappFitMvpState'
const CONSENT_KEY = 'shappFitConsent'

const defaultState = {
  academy: {
    id: 'ironfit-demo',
    name: 'Iron Fitness Club',
    slug: 'ironfit',
    logo: 'IF',
    primaryColor: '#b7ff2a',
    secondaryColor: '#ff7a1a',
    whatsapp: '48999999999',
    termsVersion: '2026.07.09',
    privacyVersion: '2026.07.09',
    modules: {
      exerciseVideos: false,
      gamification: true,
      chat: true,
      rankings: true,
      physicalAssessments: true,
      notifications: true
    }
  },
  trainers: [
    { id: 'trainer-ana', name: 'Ana Paula', role: 'Personal Trainer', cref: '123456-G/SC' },
    { id: 'trainer-lucas', name: 'Lucas Rocha', role: 'Professor de Musculação', cref: '654321-G/SC' }
  ],
  students: [
    {
      id: 'student-demo-001',
      token: 'demo-ana-cassoni',
      name: 'Ana Cassoni',
      phone: '48988887777',
      email: 'ana@email.com',
      status: 'active',
      goal: 'Hipertrofia e constância',
      trainerId: 'trainer-ana',
      monthlyGoal: 20,
      completedThisMonth: 8,
      xp: 1280,
      level: 7,
      streak: 4,
      weight: 64,
      height: 1.68,
      contractEndsAt: '2026-08-30',
      createdAt: '2026-07-09T12:00:00.000Z',
      workouts: [
        {
          id: 'workout-a',
          day: 'Segunda',
          name: 'Treino A',
          focus: 'Pernas e glúteos',
          exercises: [
            { name: 'Agachamento livre', sets: '4', reps: '10', load: 'Progressiva', rest: '90s', videoOptional: true },
            { name: 'Leg press', sets: '4', reps: '12', load: 'Moderada', rest: '75s', videoOptional: true },
            { name: 'Cadeira extensora', sets: '3', reps: '15', load: 'Controle total', rest: '60s', videoOptional: false }
          ]
        },
        {
          id: 'workout-b',
          day: 'Quarta',
          name: 'Treino B',
          focus: 'Costas e bíceps',
          exercises: [
            { name: 'Puxada frontal', sets: '4', reps: '12', load: 'Moderada', rest: '75s', videoOptional: true },
            { name: 'Remada baixa', sets: '4', reps: '10', load: 'Progressiva', rest: '90s', videoOptional: false },
            { name: 'Rosca direta', sets: '3', reps: '12', load: 'Técnica limpa', rest: '60s', videoOptional: false }
          ]
        },
        {
          id: 'workout-c',
          day: 'Sexta',
          name: 'Treino C',
          focus: 'Peito, ombro e tríceps',
          exercises: [
            { name: 'Supino reto', sets: '4', reps: '10', load: 'Progressiva', rest: '90s', videoOptional: true },
            { name: 'Desenvolvimento', sets: '3', reps: '12', load: 'Moderada', rest: '75s', videoOptional: false },
            { name: 'Tríceps corda', sets: '3', reps: '15', load: 'Controle', rest: '60s', videoOptional: false }
          ]
        }
      ],
      assessments: [
        { date: '2026-07-01', weight: 64, bodyFat: 22, waist: 74, note: 'Primeira avaliação registrada.' }
      ]
    }
  ],
  auditLog: [
    { id: 'log-001', action: 'Aluno demo criado', actor: 'Sistema', date: '2026-07-09T12:00:00.000Z' }
  ]
}

function makeToken(name) {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `${slug || 'aluno'}-${Math.random().toString(36).slice(2, 8)}`
}

function todayWorkout(student) {
  const dayIndex = new Date().getDay()
  const map = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  return student.workouts.find((workout) => workout.day === map[dayIndex]) || student.workouts[0]
}

function getInitialState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : defaultState
  } catch {
    return defaultState
  }
}

function useShappState() {
  const [state, setState] = useState(getInitialState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return [state, setState]
}

function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <article className="fitStatCard">
      <Icon size={22} />
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </div>
    </article>
  )
}

function FeatureSwitch({ checked, label, description, onChange }) {
  return (
    <button className={`fitSwitch ${checked ? 'isOn' : ''}`} type="button" onClick={onChange}>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <i>{checked ? 'Ativo' : 'Off'}</i>
    </button>
  )
}

function AcademyPanel({ state, setState }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    goal: 'Hipertrofia',
    trainerId: state.trainers[0]?.id || '',
    monthlyGoal: 20
  })
  const [selectedToken, setSelectedToken] = useState(state.students[0]?.token || '')
  const selectedStudent = state.students.find((student) => student.token === selectedToken) || state.students[0]
  const activeStudents = state.students.filter((student) => student.status === 'active')
  const inactiveStudents = state.students.filter((student) => student.status !== 'active')
  const inviteLink = selectedStudent ? `${window.location.origin}/aluno/${selectedStudent.token}` : ''
  const whatsappLink = selectedStudent
    ? `https://wa.me/55${selectedStudent.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Olá, ${selectedStudent.name}! Seu acesso ao app da ${state.academy.name} já está pronto. Clique no link para acessar seu treino personalizado: ${inviteLink}`
      )}`
    : '#'

  function addStudent(event) {
    event.preventDefault()
    if (!form.name.trim()) return

    const token = makeToken(form.name)
    const newStudent = {
      id: crypto.randomUUID?.() || token,
      token,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      status: 'active',
      goal: form.goal,
      trainerId: form.trainerId,
      monthlyGoal: Number(form.monthlyGoal) || 20,
      completedThisMonth: 0,
      xp: 0,
      level: 1,
      streak: 0,
      weight: 0,
      height: 0,
      contractEndsAt: '',
      createdAt: new Date().toISOString(),
      workouts: defaultState.students[0].workouts,
      assessments: []
    }

    setState((current) => ({
      ...current,
      students: [newStudent, ...current.students],
      auditLog: [
        { id: crypto.randomUUID?.() || token, action: `Aluno ${newStudent.name} cadastrado`, actor: 'Recepção', date: new Date().toISOString() },
        ...current.auditLog
      ]
    }))
    setSelectedToken(token)
    setForm({ name: '', phone: '', email: '', goal: 'Hipertrofia', trainerId: state.trainers[0]?.id || '', monthlyGoal: 20 })
  }

  function toggleStudentStatus(student) {
    const nextStatus = student.status === 'active' ? 'inactive' : 'active'
    setState((current) => ({
      ...current,
      students: current.students.map((item) => (item.id === student.id ? { ...item, status: nextStatus } : item)),
      auditLog: [
        { id: crypto.randomUUID?.() || `${student.id}-${Date.now()}`, action: `${student.name} alterado para ${nextStatus}`, actor: 'Admin Academia', date: new Date().toISOString() },
        ...current.auditLog
      ]
    }))
  }

  function deleteStudent(student) {
    setState((current) => ({
      ...current,
      students: current.students.filter((item) => item.id !== student.id),
      auditLog: [
        { id: crypto.randomUUID?.() || `${student.id}-${Date.now()}`, action: `${student.name} removido da base`, actor: 'Admin Academia', date: new Date().toISOString() },
        ...current.auditLog
      ]
    }))
    setSelectedToken(state.students.find((item) => item.id !== student.id)?.token || '')
  }

  function toggleModule(key) {
    setState((current) => ({
      ...current,
      academy: {
        ...current.academy,
        modules: { ...current.academy.modules, [key]: !current.academy.modules[key] }
      }
    }))
  }

  async function copyInvite() {
    await navigator.clipboard?.writeText(inviteLink)
  }

  return (
    <div className="fitShell">
      <aside className="fitSidebar">
        <div className="fitBrand">
          <span style={{ background: state.academy.primaryColor }}>{state.academy.logo}</span>
          <div>
            <strong>Shapp Fit</strong>
            <small>{state.academy.name}</small>
          </div>
        </div>
        <nav>
          <a href="#dashboard"><BarChart3 size={18} /> Dashboard</a>
          <a href="#cadastro"><UserPlus size={18} /> Cadastrar aluno</a>
          <a href="#convite"><QrCode size={18} /> QR / WhatsApp</a>
          <a href="#lgpd"><ShieldCheck size={18} /> LGPD</a>
        </nav>
      </aside>

      <main className="fitPanel">
        <section className="fitHeroPanel" id="dashboard">
          <div>
            <p className="fitKicker"><Sparkles size={16} /> Sprint 1 em desenvolvimento</p>
            <h1>Painel da academia com acesso por QR Code e link único.</h1>
            <p>
              A recepção cadastra o aluno, libera o QR Code ou envia o convite por WhatsApp. O aluno entra com os dados prontos, aceita os termos e usa o app personalizado.
            </p>
          </div>
          <a className="fitPrimaryButton" href="/aluno/demo-ana-cassoni" target="_blank" rel="noreferrer">
            Abrir app demo <ExternalLink size={18} />
          </a>
        </section>

        <section className="fitStatsGrid">
          <StatCard icon={Users} label="Alunos ativos" value={activeStudents.length} hint={`${inactiveStudents.length} inativos`} />
          <StatCard icon={Dumbbell} label="Treinos cadastrados" value={state.students.reduce((total, student) => total + student.workouts.length, 0)} />
          <StatCard icon={Flame} label="XP médio" value={Math.round(state.students.reduce((total, student) => total + student.xp, 0) / Math.max(state.students.length, 1))} />
          <StatCard icon={ShieldCheck} label="Política" value={state.academy.privacyVersion} hint="versão vigente" />
        </section>

        <section className="fitGridTwo">
          <form className="fitCard" id="cadastro" onSubmit={addStudent}>
            <p className="fitKicker"><UserPlus size={16} /> Recepção</p>
            <h2>Cadastrar novo aluno</h2>
            <div className="fitFormGrid">
              <label>Nome<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nome completo" /></label>
              <label>WhatsApp<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="48999999999" /></label>
              <label>E-mail<input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="aluno@email.com" /></label>
              <label>Objetivo<input value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} /></label>
              <label>Professor<select value={form.trainerId} onChange={(event) => setForm({ ...form, trainerId: event.target.value })}>{state.trainers.map((trainer) => <option key={trainer.id} value={trainer.id}>{trainer.name}</option>)}</select></label>
              <label>Meta mensal<input type="number" value={form.monthlyGoal} onChange={(event) => setForm({ ...form, monthlyGoal: event.target.value })} /></label>
            </div>
            <button className="fitPrimaryButton" type="submit">Cadastrar e gerar acesso</button>
          </form>

          <div className="fitCard" id="convite">
            <p className="fitKicker"><QrCode size={16} /> Convite seguro</p>
            <h2>QR Code e link único</h2>
            {selectedStudent ? (
              <>
                <label>Selecionar aluno<select value={selectedStudent.token} onChange={(event) => setSelectedToken(event.target.value)}>{state.students.map((student) => <option key={student.id} value={student.token}>{student.name} · {student.status}</option>)}</select></label>
                <div className="qrMock"><QrCode size={92} /><span>{selectedStudent.token}</span></div>
                <div className="inviteBox"><code>{inviteLink}</code><button type="button" onClick={copyInvite}><Copy size={16} /> Copiar</button></div>
                <div className="fitActions">
                  <a className="fitWhatsapp" href={whatsappLink} target="_blank" rel="noreferrer"><MessageCircle size={18} /> Enviar WhatsApp</a>
                  <button type="button" className="fitGhostButton" onClick={() => toggleStudentStatus(selectedStudent)}>
                    {selectedStudent.status === 'active' ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                    {selectedStudent.status === 'active' ? 'Inativar aluno' : 'Reativar aluno'}
                  </button>
                  <button type="button" className="fitDangerButton" onClick={() => deleteStudent(selectedStudent)}>Excluir dados</button>
                </div>
              </>
            ) : <p>Nenhum aluno cadastrado.</p>}
          </div>
        </section>

        <section className="fitGridTwo">
          <div className="fitCard">
            <p className="fitKicker"><Activity size={16} /> Módulos opcionais</p>
            <h2>Recursos por academia</h2>
            <FeatureSwitch checked={state.academy.modules.exerciseVideos} label="Vídeos dos exercícios" description="Cliente decide se quer usar ou não." onChange={() => toggleModule('exerciseVideos')} />
            <FeatureSwitch checked={state.academy.modules.gamification} label="Gamificação" description="XP, níveis, sequência e conquistas." onChange={() => toggleModule('gamification')} />
            <FeatureSwitch checked={state.academy.modules.chat} label="Chat professor-aluno" description="Contato direto dentro do app." onChange={() => toggleModule('chat')} />
          </div>

          <div className="fitCard" id="lgpd">
            <p className="fitKicker"><ShieldCheck size={16} /> LGPD</p>
            <h2>Consentimento e privacidade</h2>
            <ul className="fitChecklist">
              <li><CheckCircle2 size={18} /> Termos de Uso obrigatórios no primeiro acesso.</li>
              <li><CheckCircle2 size={18} /> Política de Privacidade obrigatória.</li>
              <li><CheckCircle2 size={18} /> Registro de versão, data e hora do aceite.</li>
              <li><CheckCircle2 size={18} /> Opção de inativar ou excluir dados do aluno.</li>
              <li><CheckCircle2 size={18} /> Controle multi-tenant por academia.</li>
            </ul>
          </div>
        </section>

        <section className="fitCard">
          <p className="fitKicker"><CalendarDays size={16} /> Auditoria</p>
          <h2>Últimas ações</h2>
          <div className="auditList">
            {state.auditLog.slice(0, 6).map((log) => (
              <div key={log.id}><strong>{log.action}</strong><span>{log.actor} · {new Date(log.date).toLocaleString('pt-BR')}</span></div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function ConsentScreen({ academy, student, onAccept }) {
  const [checks, setChecks] = useState({ terms: false, privacy: false, data: false })
  const canContinue = checks.terms && checks.privacy && checks.data

  function accept() {
    const payload = {
      studentToken: student.token,
      academyId: academy.id,
      termsVersion: academy.termsVersion,
      privacyVersion: academy.privacyVersion,
      acceptedAt: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
    localStorage.setItem(`${CONSENT_KEY}:${student.token}`, JSON.stringify(payload))
    onAccept(payload)
  }

  return (
    <main className="studentShell" style={{ '--brand': academy.primaryColor }}>
      <section className="consentCard">
        <div className="studentLogo">{academy.logo}</div>
        <p className="fitKicker"><ShieldCheck size={16} /> Primeiro acesso</p>
        <h1>Antes de acessar seus treinos, aceite os documentos da {academy.name}.</h1>
        <p>Registraremos seu consentimento conforme a LGPD, incluindo versões dos documentos, data e dispositivo.</p>
        <label className="consentLine"><input type="checkbox" checked={checks.terms} onChange={(event) => setChecks({ ...checks, terms: event.target.checked })} /> Li e aceito os Termos de Uso versão {academy.termsVersion}.</label>
        <label className="consentLine"><input type="checkbox" checked={checks.privacy} onChange={(event) => setChecks({ ...checks, privacy: event.target.checked })} /> Li e aceito a Política de Privacidade versão {academy.privacyVersion}.</label>
        <label className="consentLine"><input type="checkbox" checked={checks.data} onChange={(event) => setChecks({ ...checks, data: event.target.checked })} /> Concordo com o tratamento dos meus dados pessoais para uso do app.</label>
        <button className="fitPrimaryButton" type="button" disabled={!canContinue} onClick={accept}>Aceitar e entrar no app</button>
      </section>
    </main>
  )
}

function StudentApp({ state, setState, token }) {
  const student = state.students.find((item) => item.token === token)
  const [consent, setConsent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`${CONSENT_KEY}:${token}`) || 'null')
    } catch {
      return null
    }
  })

  const trainer = state.trainers.find((item) => item.id === student?.trainerId)
  const workout = student ? todayWorkout(student) : null
  const goalProgress = student ? Math.min(100, Math.round((student.completedThisMonth / Math.max(student.monthlyGoal, 1)) * 100)) : 0
  const remaining = student ? Math.max(student.monthlyGoal - student.completedThisMonth, 0) : 0

  function finishWorkout() {
    if (!student || student.status !== 'active') return
    setState((current) => ({
      ...current,
      students: current.students.map((item) => item.id === student.id
        ? { ...item, completedThisMonth: item.completedThisMonth + 1, xp: item.xp + 80, streak: item.streak + 1, level: Math.max(item.level, Math.floor((item.xp + 80) / 220) + 1) }
        : item),
      auditLog: [
        { id: crypto.randomUUID?.() || `${student.id}-${Date.now()}`, action: `${student.name} concluiu ${workout.name}`, actor: 'Aluno', date: new Date().toISOString() },
        ...current.auditLog
      ]
    }))
  }

  if (!student) {
    return (
      <main className="studentShell">
        <section className="blockedCard"><AlertTriangle size={48} /><h1>Convite não encontrado</h1><p>O link pode ter sido removido, expirado ou digitado incorretamente.</p><a className="fitPrimaryButton" href="/painel">Voltar ao painel</a></section>
      </main>
    )
  }

  if (student.status !== 'active') {
    return (
      <main className="studentShell" style={{ '--brand': state.academy.primaryColor }}>
        <section className="blockedCard"><Lock size={48} /><h1>Matrícula inativa</h1><p>Seu acesso foi pausado pela {state.academy.name}. Seus treinos deixam de atualizar até a reativação pela academia.</p><small>Essa tela simula o app ficando sem dados ativos para o aluno.</small></section>
      </main>
    )
  }

  if (!consent || consent.termsVersion !== state.academy.termsVersion || consent.privacyVersion !== state.academy.privacyVersion) {
    return <ConsentScreen academy={state.academy} student={student} onAccept={setConsent} />
  }

  return (
    <main className="studentShell" style={{ '--brand': state.academy.primaryColor }}>
      <section className="studentHeader">
        <div className="studentLogo">{state.academy.logo}</div>
        <div>
          <small>{state.academy.name}</small>
          <h1>Olá, {student.name.split(' ')[0]}.</h1>
          <p>Seu treino personalizado já está pronto. Nada de cadastro-labirinto: a academia já preparou tudo.</p>
        </div>
      </section>

      <section className="studentGrid">
        <article className="studentCard workoutToday">
          <p className="fitKicker"><Dumbbell size={16} /> Treino de hoje</p>
          <h2>{workout.name}: {workout.focus}</h2>
          <span>Professor: {trainer?.name || 'Não definido'}</span>
          <div className="exerciseList">
            {workout.exercises.map((exercise) => (
              <div key={exercise.name}>
                <strong>{exercise.name}</strong>
                <small>{exercise.sets} séries · {exercise.reps} reps · descanso {exercise.rest}</small>
                {state.academy.modules.exerciseVideos && exercise.videoOptional && <em>Vídeo opcional disponível</em>}
              </div>
            ))}
          </div>
          <button className="fitPrimaryButton" type="button" onClick={finishWorkout}>Finalizar treino e ganhar XP</button>
        </article>

        <article className="studentCard progressCard">
          <p className="fitKicker"><Flame size={16} /> Meta mensal</p>
          <h2>{student.completedThisMonth}/{student.monthlyGoal} treinos</h2>
          <div className="progressTrack"><span style={{ width: `${goalProgress}%` }} /></div>
          <p>Faltam {remaining} treinos para bater sua meta. Sequência atual: {student.streak} dias.</p>
        </article>

        <article className="studentCard">
          <p className="fitKicker"><Sparkles size={16} /> Gamificação</p>
          <h2>Nível {student.level}</h2>
          <p>{student.xp} XP acumulados.</p>
          <div className="badgeRow"><span>🔥 Constância</span><span>💪 Força</span><span>🏆 Meta</span></div>
        </article>

        <article className="studentCard">
          <p className="fitKicker"><BarChart3 size={16} /> Evolução</p>
          <h2>{student.goal}</h2>
          <p>Peso atual: {student.weight || 'não informado'} kg. Última avaliação: {student.assessments[0]?.date || 'pendente'}.</p>
          <small>Histórico e medidas ficam sob controle da academia e do professor responsável.</small>
        </article>
      </section>
    </main>
  )
}

function MvpRouter() {
  const [state, setState] = useShappState()
  const path = window.location.pathname

  if (path.startsWith('/aluno/')) {
    const token = decodeURIComponent(path.replace('/aluno/', '').split('/')[0])
    return <StudentApp state={state} setState={setState} token={token} />
  }

  return <AcademyPanel state={state} setState={setState} />
}

export default MvpRouter
