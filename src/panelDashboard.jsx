import React, { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { QRCodeCanvas } from 'qrcode.react'
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Copy,
  Download,
  Dumbbell,
  ExternalLink,
  Flame,
  MessageCircle,
  Plus,
  QrCode,
  Salad,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users
} from 'lucide-react'
import { buildStudentInviteUrl, formatDateInput, formatPhone, isValidBrazilianDate, normalizeStudent, sentenceCase, titleCase } from './dataFormat.js'
import './panelDashboard.css'
import './panelDashboardStudents.css'

const STORAGE_KEY = 'shappFitMvpState'

const workoutTemplates = [
  {
    id: 'abc-hipertrofia',
    name: 'ABC hipertrofia',
    description: 'Ficha completa para aluno intermediÃ¡rio treinar em sequÃªncia.',
    workouts: [
      {
        id: 'workout-a',
        sequence: 1,
        name: 'Treino A',
        focus: 'Pernas e glÃºteos',
        exercises: [
          { name: 'Agachamento livre', sets: '4', reps: '10', load: 'Progressiva', rest: '90s', tip: 'Manter tronco firme e joelhos alinhados.', videoOptional: true },
          { name: 'Leg press', sets: '4', reps: '12', load: 'Moderada', rest: '75s', tip: 'Controlar a descida sem tirar o quadril do banco.', videoOptional: true },
          { name: 'Cadeira extensora', sets: '3', reps: '15', load: 'Controle total', rest: '60s', tip: 'Segurar um segundo no topo.', videoOptional: false },
          { name: 'ElevaÃ§Ã£o pÃ©lvica', sets: '4', reps: '12', load: 'Moderada', rest: '75s', tip: 'Contrair glÃºteos no final do movimento.', videoOptional: true }
        ]
      },
      {
        id: 'workout-b',
        sequence: 2,
        name: 'Treino B',
        focus: 'Costas e bÃ­ceps',
        exercises: [
          { name: 'Puxada frontal', sets: '4', reps: '12', load: 'Moderada', rest: '75s', tip: 'Levar a barra atÃ© a linha do peito.', videoOptional: true },
          { name: 'Remada baixa', sets: '4', reps: '10', load: 'Progressiva', rest: '90s', tip: 'Puxar com os cotovelos e manter peito aberto.', videoOptional: false },
          { name: 'Pulldown articulado', sets: '3', reps: '12', load: 'Moderada', rest: '75s', tip: 'Evitar balanÃ§o do tronco.', videoOptional: false },
          { name: 'Rosca direta', sets: '3', reps: '12', load: 'TÃ©cnica limpa', rest: '60s', tip: 'Subir sem projetar os ombros.', videoOptional: false }
        ]
      },
      {
        id: 'workout-c',
        sequence: 3,
        name: 'Treino C',
        focus: 'Peito, ombro e trÃ­ceps',
        exercises: [
          { name: 'Supino reto', sets: '4', reps: '10', load: 'Progressiva', rest: '90s', tip: 'EscÃ¡pulas encaixadas durante toda a sÃ©rie.', videoOptional: true },
          { name: 'Supino inclinado halteres', sets: '3', reps: '12', load: 'Moderada', rest: '75s', tip: 'Descer com controle atÃ© a linha do peito.', videoOptional: true },
          { name: 'Desenvolvimento', sets: '3', reps: '12', load: 'Moderada', rest: '75s', tip: 'NÃ£o arquear a lombar.', videoOptional: false },
          { name: 'TrÃ­ceps corda', sets: '3', reps: '15', load: 'Controle', rest: '60s', tip: 'Abrir a corda ao final do movimento.', videoOptional: false }
        ]
      }
    ]
  },
  {
    id: 'iniciante-fullbody',
    name: 'Iniciante full body',
    description: 'Duas rotinas simples para adaptaÃ§Ã£o, forÃ§a bÃ¡sica e seguranÃ§a.',
    workouts: [
      {
        id: 'workout-a-fullbody',
        sequence: 1,
        name: 'Treino A',
        focus: 'Corpo todo e tÃ©cnica',
        exercises: [
          { name: 'Leg press', sets: '3', reps: '12', load: 'Leve a moderada', rest: '60s', tip: 'Priorizar amplitude confortÃ¡vel.', videoOptional: true },
          { name: 'Puxada frontal', sets: '3', reps: '12', load: 'Leve', rest: '60s', tip: 'Controlar a volta do cabo.', videoOptional: true },
          { name: 'Supino mÃ¡quina', sets: '3', reps: '12', load: 'Leve', rest: '60s', tip: 'Manter punhos neutros.', videoOptional: false },
          { name: 'Prancha', sets: '3', reps: '30s', load: 'Peso corporal', rest: '45s', tip: 'Quadril alinhado com tronco.', videoOptional: false }
        ]
      },
      {
        id: 'workout-b-fullbody',
        sequence: 2,
        name: 'Treino B',
        focus: 'Estabilidade e resistÃªncia',
        exercises: [
          { name: 'Cadeira flexora', sets: '3', reps: '12', load: 'Leve', rest: '60s', tip: 'Evitar levantar o quadril.', videoOptional: false },
          { name: 'Remada sentada', sets: '3', reps: '12', load: 'Leve', rest: '60s', tip: 'Ombros longe das orelhas.', videoOptional: false },
          { name: 'ElevaÃ§Ã£o lateral', sets: '3', reps: '12', load: 'Leve', rest: '45s', tip: 'Cotovelos levemente flexionados.', videoOptional: false },
          { name: 'Esteira', sets: '1', reps: '15 min', load: 'Moderada', rest: 'Livre', tip: 'Manter ritmo em que ainda consiga conversar.', videoOptional: false }
        ]
      }
    ]
  },
  {
    id: 'emagrecimento-condicionamento',
    name: 'Emagrecimento e condicionamento',
    description: 'Rotina A/B/C com musculaÃ§Ã£o e blocos metabÃ³licos.',
    workouts: [
      {
        id: 'workout-a-metabolico',
        sequence: 1,
        name: 'Treino A',
        focus: 'Pernas e cardio intervalado',
        exercises: [
          { name: 'Agachamento goblet', sets: '4', reps: '12', load: 'Moderada', rest: '60s', tip: 'Descer mantendo coluna neutra.', videoOptional: true },
          { name: 'Passada alternada', sets: '3', reps: '12', load: 'Leve', rest: '60s', tip: 'Passo firme e controle do joelho.', videoOptional: false },
          { name: 'Bike intervalada', sets: '8', reps: '30s forte / 30s leve', load: 'Cardio', rest: 'Livre', tip: 'Aumentar intensidade sÃ³ se mantiver tÃ©cnica.', videoOptional: false }
        ]
      },
      {
        id: 'workout-b-metabolico',
        sequence: 2,
        name: 'Treino B',
        focus: 'Superiores e core',
        exercises: [
          { name: 'Puxada frontal', sets: '3', reps: '15', load: 'Moderada', rest: '60s', tip: 'Executar sem impulso.', videoOptional: true },
          { name: 'Supino halteres', sets: '3', reps: '12', load: 'Moderada', rest: '60s', tip: 'Descer os halteres com controle.', videoOptional: true },
          { name: 'Abdominal dead bug', sets: '3', reps: '12', load: 'Peso corporal', rest: '45s', tip: 'Manter lombar apoiada.', videoOptional: false }
        ]
      },
      {
        id: 'workout-c-metabolico',
        sequence: 3,
        name: 'Treino C',
        focus: 'Circuito funcional',
        exercises: [
          { name: 'Kettlebell swing', sets: '4', reps: '15', load: 'Moderada', rest: '60s', tip: 'Movimento vem do quadril, nÃ£o dos braÃ§os.', videoOptional: true },
          { name: 'Remada TRX', sets: '4', reps: '12', load: 'Peso corporal', rest: '60s', tip: 'Corpo em bloco durante a puxada.', videoOptional: false },
          { name: 'Escada ou transport', sets: '1', reps: '12 min', load: 'Cardio', rest: 'Livre', tip: 'Manter respiraÃ§Ã£o controlada.', videoOptional: false }
        ]
      }
    ]
  }
]

const demoWorkouts = workoutTemplates[0].workouts

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const fallbackSchedule = [
  { id: 'musculacao-07', date: todayISO(), time: '07:00', title: 'Musculacao guiada', place: 'Sala de musculacao', coach: 'Equipe tecnica', type: 'Forca', capacity: '8 vagas' },
  { id: 'funcional-18', date: todayISO(), time: '18:30', title: 'Funcional', place: 'Studio principal', coach: 'Prof. Lucas', type: 'Cardio', capacity: 'Confirmada' },
  { id: 'kids-17', date: todayISO(), time: '17:00', title: 'Kids movimento', place: 'Sala kids', coach: 'Equipe infantil', type: 'Kids', capacity: 'Turma aberta' }
]

const fallbackState = {
  academy: {
    id: 'ironfit-demo',
    name: 'Iron Fitness Club',
    logo: 'IF',
    primaryColor: '#b7ff2a',
    secondaryColor: '#d40019',
    termsVersion: '2026.07.09',
    privacyVersion: '2026.07.09',
    modules: {
      exerciseVideos: true,
      gamification: true,
      chat: true,
      nutrition: true
    }
  },
  trainers: [
    { id: 'trainer-ana', name: 'Ana Paula', role: 'Personal Trainer' },
    { id: 'trainer-lucas', name: 'Lucas Rocha', role: 'Professor de musculaÃ§Ã£o' }
  ],
  students: [
    {
      id: 'student-demo-001',
      token: 'demo-ana-cassoni',
      name: 'Ana Cassoni',
      phone: '(48) 98888-7777',
      email: 'ana@email.com',
      birthDate: '10/03/1994',
      status: 'active',
      goal: 'Hipertrofia e constÃ¢ncia',
      trainerId: 'trainer-ana',
      monthlyGoal: 20,
      completedThisMonth: 8,
      xp: 1280,
      level: 7,
      streak: 4,
      workouts: demoWorkouts,
      bookings: [{ activityId: 'funcional-18', status: 'confirmed', confirmedAt: new Date().toISOString() }],
      family: [
        { name: 'Nana Cassoni', relation: 'Filha', age: '8', activities: ['Kids movimento', 'Natacao infantil'] },
        { name: 'Zoe Cassoni', relation: 'Filha', age: '5', activities: ['Kids movimento'] }
      ],
      assessments: [{ date: todayISO(), weight: 68, bodyFat: 23, waist: 74, muscleMass: 42, note: 'Boa evolucao de constancia.' }],
      nutrition: {
        enabled: true,
        diet: 'CafÃ© da manhÃ£ com proteÃ­na, almoÃ§o equilibrado e jantar leve nos dias de treino.',
        supplements: 'Creatina 3g ao dia e whey protein quando necessÃ¡rio.',
        professional: 'Nutricionista da academia'
      }
    }
  ],
  schedule: fallbackSchedule,
  auditLog: []
}

const initialExercise = { name: 'Treino A', focus: 'Pernas e glÃºteos', exercise: 'Agachamento livre', sets: '4', reps: '10', rest: '90s', load: 'Progressiva', tip: 'Manter tronco firme e joelhos alinhados.' }

function cloneWorkouts(workouts) {
  return workouts.map((workout, index) => ({
    ...workout,
    sequence: workout.sequence || index + 1,
    exercises: workout.exercises.map((exercise) => ({ ...exercise }))
  }))
}

function mergeFallbackState(saved) {
  const state = saved?.academy && Array.isArray(saved?.students) ? saved : fallbackState
  return {
    ...state,
    academy: {
      ...fallbackState.academy,
      ...state.academy,
      modules: { ...fallbackState.academy.modules, ...(state.academy?.modules || {}) }
    },
    schedule: Array.isArray(state.schedule) && state.schedule.length ? state.schedule : fallbackSchedule,
    students: state.students.map((student) => ({
      ...normalizeStudent(student),
      level: student.level || Math.max(1, Math.floor((student.xp || 0) / 220) + 1),
      workouts: Array.isArray(student.workouts) ? student.workouts : demoWorkouts,
      bookings: Array.isArray(student.bookings) ? student.bookings : [],
      family: Array.isArray(student.family) ? student.family : [],
      assessments: Array.isArray(student.assessments) ? student.assessments : [],
      nutrition: student.nutrition || { enabled: false, diet: '', supplements: '', professional: '' }
    }))
  }
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    const state = mergeFallbackState(saved)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return state
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackState))
    return fallbackState
  }
}

function createToken(name) {
  const slug = name.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${slug || 'aluno'}-${Math.random().toString(36).slice(2, 8)}`
}

function initials(name = '') {
  return titleCase(name).split(' ').map((part) => part[0]).slice(0, 2).join('')
}

function Dashboard() {
  const [state, setState] = useState(loadState)
  const [selectedToken, setSelectedToken] = useState(state.students[0]?.token || '')
  const [form, setForm] = useState({ name: '', phone: '', email: '', birthDate: '', goal: '', trainerId: state.trainers[0]?.id || '', monthlyGoal: 20, notes: '', family: '' })
  const [exerciseForm, setExerciseForm] = useState(initialExercise)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [workoutDraft, setWorkoutDraft] = useState([])
  const [activityForm, setActivityForm] = useState({ date: todayISO(), time: '18:00', title: '', place: '', coach: '', type: 'Aula', capacity: 'Turma aberta' })
  const [nutritionEnabled, setNutritionEnabled] = useState(true)
  const [nutritionForm, setNutritionForm] = useState({ diet: '', supplements: '', professional: '' })
  const [error, setError] = useState('')
  const qrRef = useRef(null)

  const selectedStudent = state.students.find((student) => student.token === selectedToken) || state.students[0]
  const activeStudents = state.students.filter((student) => student.status === 'active')
  const recentStudents = state.students.slice(0, 6)
  const schedule = state.schedule || fallbackSchedule
  const pendingBookings = state.students.flatMap((student) => (student.bookings || [])
    .filter((booking) => booking.status === 'pending')
    .map((booking) => ({ ...booking, student, activity: schedule.find((item) => item.id === booking.activityId) })))
  const inviteLink = selectedStudent ? buildStudentInviteUrl(window.location.origin, selectedStudent, state) : ''
  const whatsappLink = selectedStudent ? `https://wa.me/55${selectedStudent.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Ola, ${titleCase(selectedStudent.name)}! Seu acesso ao app da ${state.academy.name} esta pronto: ${inviteLink}`)}` : '#'

  const metrics = useMemo(() => [
    { label: 'Alunos ativos', value: activeStudents.length, icon: Users },
    { label: 'Rotinas de treino', value: state.students.reduce((sum, student) => sum + (student.workouts?.length || 0), 0), icon: Dumbbell },
    { label: 'Reservas pendentes', value: pendingBookings.length, icon: CalendarDays },
    { label: 'Planos nutricionais', value: state.students.filter((student) => student.nutrition?.enabled).length, icon: Salad }
  ], [state, activeStudents.length, pendingBookings.length])

  function trainerName(id) {
    return titleCase(state.trainers.find((trainer) => trainer.id === id)?.name || 'NÃ£o definido')
  }

  function updateForm(field, value) {
    const formatters = { name: titleCase, phone: formatPhone, birthDate: formatDateInput, goal: sentenceCase, notes: sentenceCase }
    setForm((current) => ({ ...current, [field]: formatters[field] ? formatters[field](value) : value }))
  }

  function updateNutrition(field, value) {
    setNutritionForm((current) => ({ ...current, [field]: sentenceCase(value) }))
  }

  function parseFamily(value = '') {
    return value.split('\n').map((line) => {
      const [person, activitiesText = ''] = line.split(':')
      const [name = '', relation = '', age = ''] = person.split('|').map((part) => part.trim())
      const activities = activitiesText.split(',').map((item) => sentenceCase(item.trim())).filter(Boolean)
      return name ? { name: titleCase(name), relation: sentenceCase(relation || 'Dependente'), age, activities } : null
    }).filter(Boolean)
  }

  function saveActivity(event) {
    event.preventDefault()
    if (!activityForm.title.trim()) return
    const activity = {
      id: `${activityForm.date}-${activityForm.time}-${activityForm.title}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').toLocaleLowerCase('pt-BR'),
      date: activityForm.date,
      time: activityForm.time,
      title: titleCase(activityForm.title),
      place: sentenceCase(activityForm.place || 'Academia'),
      coach: titleCase(activityForm.coach || 'Equipe tecnica'),
      type: sentenceCase(activityForm.type || 'Aula'),
      capacity: sentenceCase(activityForm.capacity || 'Turma aberta')
    }
    const updated = {
      ...state,
      schedule: [activity, ...(state.schedule || []).filter((item) => item.id !== activity.id)],
      auditLog: [{ id: crypto.randomUUID?.() || activity.id, action: `Atividade ${activity.title} publicada`, actor: 'Painel', date: new Date().toISOString() }, ...(state.auditLog || [])]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setState(updated)
    setActivityForm({ date: todayISO(), time: '18:00', title: '', place: '', coach: '', type: 'Aula', capacity: 'Turma aberta' })
  }

  function confirmBooking(studentId, activityId) {
    const updated = {
      ...state,
      students: state.students.map((student) => {
        if (student.id !== studentId) return student
        return {
          ...student,
          bookings: (student.bookings || []).map((booking) => booking.activityId === activityId ? { ...booking, status: 'confirmed', confirmedAt: new Date().toISOString() } : booking)
        }
      }),
      auditLog: [{ id: `${studentId}-${activityId}-${Date.now()}`, action: 'Reserva confirmada e aluno notificado no app', actor: 'Painel', date: new Date().toISOString() }, ...(state.auditLog || [])]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setState(updated)
  }

  function addExercise(event) {
    event.preventDefault()
    if (!exerciseForm.exercise.trim()) return
    const exercise = {
      name: titleCase(exerciseForm.exercise),
      sets: String(exerciseForm.sets || '3'),
      reps: String(exerciseForm.reps || '12'),
      rest: sentenceCase(exerciseForm.rest || '60s'),
      load: sentenceCase(exerciseForm.load || 'Moderada'),
      tip: sentenceCase(exerciseForm.tip || ''),
      videoOptional: true
    }
    const workoutId = `${exerciseForm.name}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').toLocaleLowerCase('pt-BR')
    setWorkoutDraft((current) => {
      const existing = current.find((workout) => workout.name === exerciseForm.name)
      if (existing) {
        return current.map((workout) => workout === existing ? { ...workout, focus: sentenceCase(exerciseForm.focus), exercises: [...workout.exercises, exercise] } : workout)
      }
      return [...current, { id: workoutId, sequence: current.length + 1, name: titleCase(exerciseForm.name), focus: sentenceCase(exerciseForm.focus), exercises: [exercise] }]
    })
    setExerciseForm((current) => ({ ...current, exercise: '', sets: '3', reps: '12', rest: '60s', load: '', tip: '' }))
  }

  function applyTemplate(templateId) {
    if (!templateId) {
      setSelectedTemplate('')
      setWorkoutDraft([])
      return
    }
    const template = workoutTemplates.find((item) => item.id === templateId) || workoutTemplates[0]
    setSelectedTemplate(template.id)
    setWorkoutDraft(cloneWorkouts(template.workouts))
    setExerciseForm((current) => ({
      ...current,
      name: template.workouts[0]?.name || 'Treino A',
      focus: template.workouts[0]?.focus || '',
      exercise: '',
      sets: '3',
      reps: '12',
      rest: '60s',
      load: '',
      tip: ''
    }))
  }

  function saveStudent(event) {
    event.preventDefault()
    if (!form.name.trim()) return setError('Informe o nome do aluno.')
    if (form.birthDate && !isValidBrazilianDate(form.birthDate)) return setError('Informe uma data de nascimento vÃ¡lida em dd/mm/aaaa.')

    const token = createToken(form.name)
    const student = normalizeStudent({
      id: crypto.randomUUID?.() || token,
      token,
      ...form,
      status: 'active',
      monthlyGoal: Number(form.monthlyGoal) || 20,
      completedThisMonth: 0,
      xp: 0,
      level: 1,
      streak: 0,
      workouts: workoutDraft.length ? workoutDraft : [],
      bookings: [],
      family: parseFamily(form.family),
      assessments: [],
      nutrition: {
        enabled: nutritionEnabled,
        diet: sentenceCase(nutritionForm.diet),
        supplements: sentenceCase(nutritionForm.supplements),
        professional: titleCase(nutritionForm.professional)
      }
    })

    const updated = {
      ...state,
      students: [student, ...state.students],
      auditLog: [{ id: crypto.randomUUID?.() || token, action: `Aluno ${student.name} cadastrado`, actor: 'RecepÃ§Ã£o', date: new Date().toISOString() }, ...(state.auditLog || [])]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setState(updated)
    setSelectedToken(token)
    setForm({ name: '', phone: '', email: '', birthDate: '', goal: '', trainerId: state.trainers[0]?.id || '', monthlyGoal: 20, notes: '', family: '' })
    setSelectedTemplate('')
    setWorkoutDraft([])
    setNutritionForm({ diet: '', supplements: '', professional: '' })
    setNutritionEnabled(true)
    setError('')
  }

  function copyLink() {
    navigator.clipboard?.writeText(inviteLink)
  }

  function downloadQr() {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas || !selectedStudent) return
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `qr-${selectedStudent.token}.png`
    link.click()
  }

  return (
    <main className="academyPanelPage">
      <aside className="academySidebar">
        <a className="academyBrand" href="/"><span>{state.academy.logo}</span><div><strong>Shapp Fit</strong><small>{state.academy.name}</small></div></a>
        <nav>
          <a className="active" href="/painel"><BarChart3 /> Dashboard</a>
          <a href="#cadastro"><UserPlus /> Cadastrar aluno</a>
          <a href="#lista-alunos"><Users /> Lista de alunos</a>
          <a href="#agenda"><CalendarDays /> Agenda</a>
          <a href="#rotina"><Dumbbell /> Rotinas de treino</a>
          <a href="#nutricao"><Salad /> Nutricionista</a>
          <a href="#acesso"><QrCode /> QR / WhatsApp</a>
        </nav>
      </aside>

      <section className="academyMain">
        <header className="academyHero">
          <div>
            <span className="academyTag"><Sparkles size={16} /> Academia, aluno e rotina conectados</span>
            <h1>O painel da academia com a mesma energia da experiencia Shapp.</h1>
            <p>Cadastro padronizado, QR Code real, lista de alunos, treinos sequenciais e um mÃ³dulo de nutricionista para academias que oferecem o serviÃ§o.</p>
            <div className="academyHeroActions">
              <a href="#cadastro">Cadastrar aluno <ArrowRight /></a>
              <a href="/aluno/demo-ana-cassoni" target="_blank" rel="noreferrer">Ver app do aluno <ExternalLink /></a>
            </div>
          </div>
          <img src="/fitness-athlete.svg" alt="Atleta treinando" />
        </header>

        <section className="academyMetrics">
          {metrics.map(({ label, value, icon: Icon }) => <article key={label}><Icon /><strong>{value}</strong><span>{label}</span></article>)}
        </section>

        <section className="academyGrid adminActionGrid">
          <article className="academyCard bookingAlerts">
            <div className="cardTitle"><div><span>Lista de avisos</span><h2>Reservas e agendamentos</h2></div><CalendarDays /></div>
            {pendingBookings.map((booking) => (
              <div className="bookingAlertRow" key={`${booking.student.id}-${booking.activityId}`}>
                <div><strong>{titleCase(booking.student.name)}</strong><span>{booking.activity?.title || 'Atividade'} - {booking.activity?.time || '--:--'}</span></div>
                <button type="button" onClick={() => confirmBooking(booking.student.id, booking.activityId)}><CheckCircle2 /> Confirmar e notificar aluno</button>
              </div>
            ))}
            {!pendingBookings.length && <p className="panelEmpty">Nenhuma reserva pendente no momento.</p>}
          </article>

          <form className="academyCard activityManager" id="agenda" onSubmit={saveActivity}>
            <div className="cardTitle"><div><span>Agenda</span><h2>Cadastrar atividade</h2></div><Plus /></div>
            <div className="academyFormGrid">
              <label>Data<input type="date" value={activityForm.date} onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })} /></label>
              <label>Hora<input type="time" value={activityForm.time} onChange={(e) => setActivityForm({ ...activityForm, time: e.target.value })} /></label>
              <label>Atividade<input value={activityForm.title} onChange={(e) => setActivityForm({ ...activityForm, title: titleCase(e.target.value) })} placeholder="Funcional" /></label>
              <label>Local<input value={activityForm.place} onChange={(e) => setActivityForm({ ...activityForm, place: sentenceCase(e.target.value) })} placeholder="Studio principal" /></label>
              <label>Professor<input value={activityForm.coach} onChange={(e) => setActivityForm({ ...activityForm, coach: titleCase(e.target.value) })} placeholder="Prof. Lucas" /></label>
              <label>Tipo<input value={activityForm.type} onChange={(e) => setActivityForm({ ...activityForm, type: sentenceCase(e.target.value) })} placeholder="Cardio" /></label>
            </div>
            <button className="academyPrimary" type="submit">Publicar para todos os alunos <ArrowRight /></button>
          </form>
        </section>

        <section className="academyGrid">
          <form className="academyCard academyForm" id="cadastro" onSubmit={saveStudent}>
            <div className="cardTitle"><div><span>Cadastro</span><h2>Novo aluno</h2></div><Plus /></div>
            <div className="academyFormGrid">
              <label>Nome completo<input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Ana Cassoni" /></label>
              <label>Telefone<input inputMode="numeric" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="(48) 99999-9999" /></label>
              <label>E-mail<input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value.trimStart().toLocaleLowerCase('pt-BR'))} placeholder="aluno@email.com" /></label>
              <label>Data de nascimento<input inputMode="numeric" value={form.birthDate} onChange={(e) => updateForm('birthDate', e.target.value)} placeholder="dd/mm/aaaa" /></label>
              <label>Objetivo<input value={form.goal} onChange={(e) => updateForm('goal', e.target.value)} placeholder="Hipertrofia e constÃ¢ncia" /></label>
              <label>Professor<select value={form.trainerId} onChange={(e) => updateForm('trainerId', e.target.value)}>{state.trainers.map((trainer) => <option key={trainer.id} value={trainer.id}>{titleCase(trainer.name)}</option>)}</select></label>
              <label>Meta mensal<input type="number" min="1" max="31" value={form.monthlyGoal} onChange={(e) => updateForm('monthlyGoal', e.target.value)} /></label>
              <label className="fullField">ObservaÃ§Ãµes<textarea value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} placeholder="InformaÃ§Ãµes adicionais em escrita normal." /></label>
              <label className="fullField">Dependentes e atividades<textarea value={form.family} onChange={(e) => updateForm('family', e.target.value)} placeholder={"Nana | filha | 8: Kids movimento, Natacao infantil\nZoe | filha | 5: Kids movimento"} /></label>
            </div>
            {error && <p className="formError">{error}</p>}
            <button className="academyPrimary" type="submit">Cadastrar e gerar acesso <ArrowRight /></button>
          </form>

          <article className="academyCard accessCard" id="acesso">
            <div className="cardTitle"><div><span>Acesso do aluno</span><h2>QR Code real</h2></div><QrCode /></div>
            {selectedStudent ? <>
              <label>Aluno selecionado<select value={selectedStudent.token} onChange={(e) => setSelectedToken(e.target.value)}>{state.students.map((student) => <option key={student.id} value={student.token}>{titleCase(student.name)}</option>)}</select></label>
              <div className="realQr" ref={qrRef}><QRCodeCanvas value={inviteLink} size={220} level="H" includeMargin bgColor="#ffffff" fgColor="#080808" /></div>
              <div className="studentAccessData"><strong>{titleCase(selectedStudent.name)}</strong><span>{formatPhone(selectedStudent.phone)} Â· {selectedStudent.birthDate || 'Data nÃ£o informada'}</span><code>{inviteLink}</code></div>
              <div className="accessActions">
                <button type="button" onClick={copyLink}><Copy /> Copiar link</button>
                <button type="button" onClick={downloadQr}><Download /> Baixar QR</button>
                <a href={whatsappLink} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a>
                <a href={inviteLink} target="_blank" rel="noreferrer"><ExternalLink /> Abrir app</a>
              </div>
            </> : <p>Nenhum aluno cadastrado.</p>}
          </article>
        </section>

        <section className="academyCard routineCard" id="rotina">
          <div className="cardTitle"><div><span>Treino do aluno</span><h2>Rotinas, series e repeticoes</h2></div><Dumbbell /></div>
          <div className="routineTemplateBar">
            <label>Modelo pronto<select value={selectedTemplate} onChange={(e) => applyTemplate(e.target.value)}><option value="">Ficha em branco</option>{workoutTemplates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label>
            <p>{selectedTemplate ? workoutTemplates.find((template) => template.id === selectedTemplate)?.description : 'Novo aluno fica sem ficha ate o personal montar e salvar os blocos de treino.'}</p>
          </div>
          <form className="routineBuilder" onSubmit={addExercise}>
            <label>Rotina<input value={exerciseForm.name} onChange={(e) => setExerciseForm({ ...exerciseForm, name: titleCase(e.target.value) })} /></label>
            <label>Foco<input value={exerciseForm.focus} onChange={(e) => setExerciseForm({ ...exerciseForm, focus: sentenceCase(e.target.value) })} /></label>
            <label>ExercÃ­cio<input value={exerciseForm.exercise} onChange={(e) => setExerciseForm({ ...exerciseForm, exercise: titleCase(e.target.value) })} /></label>
            <label>SÃ©ries<input value={exerciseForm.sets} onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value.replace(/\D/g, '').slice(0, 2) })} /></label>
            <label>RepetiÃ§Ãµes<input value={exerciseForm.reps} onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value.replace(/[^\d-]/g, '').slice(0, 5) })} /></label>
            <label>Descanso<input value={exerciseForm.rest} onChange={(e) => setExerciseForm({ ...exerciseForm, rest: e.target.value })} /></label>
            <label>Carga<input value={exerciseForm.load} onChange={(e) => setExerciseForm({ ...exerciseForm, load: sentenceCase(e.target.value) })} /></label>
            <label>Dica de execuÃ§Ã£o<input value={exerciseForm.tip} onChange={(e) => setExerciseForm({ ...exerciseForm, tip: sentenceCase(e.target.value) })} /></label>
            <button type="submit">Adicionar exercÃ­cio <Plus /></button>
          </form>
          <div className="routinePreview">
            {workoutDraft.map((workout) => (
              <article key={`${workout.sequence}-${workout.name}`}>
                <small>SequÃªncia {workout.sequence || workoutDraft.indexOf(workout) + 1}</small>
                <h3>{workout.name}</h3>
                <p>{workout.focus}</p>
                {workout.exercises.map((exercise) => <span key={`${workout.id}-${exercise.name}`}>{exercise.name}: {exercise.sets}x{exercise.reps} Â· {exercise.rest}{exercise.tip ? ` Â· ${exercise.tip}` : ''}</span>)}
              </article>
            ))}
            {!workoutDraft.length && <article><small>Ficha vazia</small><h3>Aguardando personal</h3><p>Use os campos acima ou um modelo pronto para montar Treino A, B e C.</p></article>}
          </div>
        </section>

        <section className="academyCard nutritionCard" id="nutricao">
          <div className="cardTitle"><div><span>MÃ³dulo opcional</span><h2>Nutricionista</h2></div><Salad /></div>
          <label className="nutritionToggle"><input type="checkbox" checked={nutritionEnabled} onChange={(e) => setNutritionEnabled(e.target.checked)} /> Academia oferece acompanhamento nutricional para este aluno</label>
          <div className="academyFormGrid">
            <label>Profissional<input value={nutritionForm.professional} onChange={(e) => updateNutrition('professional', e.target.value)} placeholder="Nutricionista da academia" /></label>
            <label>Suplementos<input value={nutritionForm.supplements} onChange={(e) => updateNutrition('supplements', e.target.value)} placeholder="Creatina 3g ao dia" /></label>
            <label className="fullField">Dieta<textarea value={nutritionForm.diet} onChange={(e) => updateNutrition('diet', e.target.value)} placeholder="Plano alimentar em escrita normal." /></label>
          </div>
        </section>

        <section className="academyCard dashboardStudents" id="lista-alunos">
          <div className="dashboardStudentsHeader">
            <div><span>Alunos cadastrados</span><h2>Lista de alunos</h2><p>Consulta rapida dos cadastros recentes com treino e acesso.</p></div>
            <a href="/painel/alunos">Abrir lista completa <ArrowRight /></a>
          </div>
          <div className="dashboardStudentsList">
            {recentStudents.map((student) => {
              const progress = Math.min(100, Math.round(((student.completedThisMonth || 0) / Math.max(student.monthlyGoal || 1, 1)) * 100))
              return (
                <article key={student.id}>
                  <div className="dashboardStudentIdentity"><span>{initials(student.name)}</span><div><strong>{titleCase(student.name)}</strong><small>{formatPhone(student.phone)} Â· {student.birthDate || 'Data nÃ£o informada'}</small></div></div>
                  <div><small>Professor</small><strong>{trainerName(student.trainerId)}</strong></div>
                  <div><small>Objetivo</small><strong>{sentenceCase(student.goal)}</strong></div>
                  <div><small>Rotinas</small><strong>{student.workouts?.length || 0} fichas</strong></div>
                  <div><small>Meta mensal</small><strong>{student.completedThisMonth || 0}/{student.monthlyGoal || 0} treinos</strong><div className="dashboardProgress"><span style={{ width: `${progress}%` }} /></div></div>
                  <a href={`/aluno/${student.token}`} target="_blank" rel="noreferrer">Abrir app <ExternalLink /></a>
                </article>
              )
            })}
          </div>
        </section>

        <section className="academyCard lgpdCard" id="lgpd"><ShieldCheck /><div><span>Privacidade integrada</span><h2>Consentimento antes do primeiro treino.</h2><p>Termos, PolÃ­tica de Privacidade e tratamento de dados aparecem antes do acesso ao app do aluno.</p></div></section>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<Dashboard />)
