import React, { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { QRCodeCanvas } from 'qrcode.react'
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
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
import { formatDateInput, formatPhone, isValidBrazilianDate, normalizeStudent, sentenceCase, titleCase } from './dataFormat.js'
import './panelDashboard.css'
import './panelDashboardStudents.css'

const STORAGE_KEY = 'shappFitMvpState'

const demoWorkouts = [
  {
    id: 'workout-segunda',
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
    id: 'workout-quarta',
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
    id: 'workout-sexta',
    day: 'Sexta',
    name: 'Treino C',
    focus: 'Peito, ombro e tríceps',
    exercises: [
      { name: 'Supino reto', sets: '4', reps: '10', load: 'Progressiva', rest: '90s', videoOptional: true },
      { name: 'Desenvolvimento', sets: '3', reps: '12', load: 'Moderada', rest: '75s', videoOptional: false },
      { name: 'Tríceps corda', sets: '3', reps: '15', load: 'Controle', rest: '60s', videoOptional: false }
    ]
  }
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
      exercisePhotos: true,
      gamification: true,
      chat: true,
      nutrition: true
    }
  },
  trainers: [
    { id: 'trainer-ana', name: 'Ana Paula', role: 'Personal Trainer' },
    { id: 'trainer-lucas', name: 'Lucas Rocha', role: 'Professor de musculação' }
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
      goal: 'Hipertrofia e constância',
      trainerId: 'trainer-ana',
      monthlyGoal: 20,
      completedThisMonth: 8,
      xp: 1280,
      level: 7,
      streak: 4,
      workouts: demoWorkouts,
      nutrition: {
        enabled: true,
        diet: 'Café da manhã com proteína, almoço equilibrado e jantar leve nos dias de treino.',
        supplements: 'Creatina 3g ao dia e whey protein quando necessário.',
        professional: 'Nutricionista da academia'
      }
    }
  ],
  auditLog: []
}

const initialExercise = { day: 'Segunda', name: 'Treino A', focus: 'Pernas e glúteos', exercise: 'Agachamento livre', sets: '4', reps: '10', rest: '90s', load: 'Progressiva' }

function mergeFallbackState(saved) {
  const state = saved?.academy && Array.isArray(saved?.students) ? saved : fallbackState
  return {
    ...state,
    academy: {
      ...fallbackState.academy,
      ...state.academy,
      modules: { ...fallbackState.academy.modules, ...(state.academy?.modules || {}) }
    },
    students: state.students.map((student) => ({
      ...normalizeStudent(student),
      level: student.level || Math.max(1, Math.floor((student.xp || 0) / 220) + 1),
      workouts: Array.isArray(student.workouts) && student.workouts.length ? student.workouts : demoWorkouts,
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
  const [form, setForm] = useState({ name: '', phone: '', email: '', birthDate: '', goal: '', trainerId: state.trainers[0]?.id || '', monthlyGoal: 20, notes: '' })
  const [exerciseForm, setExerciseForm] = useState(initialExercise)
  const [workoutDraft, setWorkoutDraft] = useState(demoWorkouts.slice(0, 1))
  const [nutritionEnabled, setNutritionEnabled] = useState(true)
  const [nutritionForm, setNutritionForm] = useState({ diet: '', supplements: '', professional: '' })
  const [error, setError] = useState('')
  const qrRef = useRef(null)

  const selectedStudent = state.students.find((student) => student.token === selectedToken) || state.students[0]
  const activeStudents = state.students.filter((student) => student.status === 'active')
  const recentStudents = state.students.slice(0, 6)
  const inviteLink = selectedStudent ? `${window.location.origin}/aluno/${selectedStudent.token}` : ''
  const whatsappLink = selectedStudent ? `https://wa.me/55${selectedStudent.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Ola, ${titleCase(selectedStudent.name)}! Seu acesso ao app da ${state.academy.name} esta pronto: ${inviteLink}`)}` : '#'

  const metrics = useMemo(() => [
    { label: 'Alunos ativos', value: activeStudents.length, icon: Users },
    { label: 'Rotinas de treino', value: state.students.reduce((sum, student) => sum + (student.workouts?.length || 0), 0), icon: Dumbbell },
    { label: 'Textos padronizados', value: '100%', icon: ClipboardList },
    { label: 'Planos nutricionais', value: state.students.filter((student) => student.nutrition?.enabled).length, icon: Salad }
  ], [state, activeStudents.length])

  function trainerName(id) {
    return titleCase(state.trainers.find((trainer) => trainer.id === id)?.name || 'Não definido')
  }

  function updateForm(field, value) {
    const formatters = { name: titleCase, phone: formatPhone, birthDate: formatDateInput, goal: sentenceCase, notes: sentenceCase }
    setForm((current) => ({ ...current, [field]: formatters[field] ? formatters[field](value) : value }))
  }

  function updateNutrition(field, value) {
    setNutritionForm((current) => ({ ...current, [field]: sentenceCase(value) }))
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
      videoOptional: true
    }
    const workoutId = `${exerciseForm.day}-${exerciseForm.name}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '-').toLocaleLowerCase('pt-BR')
    setWorkoutDraft((current) => {
      const existing = current.find((workout) => workout.day === exerciseForm.day && workout.name === exerciseForm.name)
      if (existing) {
        return current.map((workout) => workout === existing ? { ...workout, focus: sentenceCase(exerciseForm.focus), exercises: [...workout.exercises, exercise] } : workout)
      }
      return [...current, { id: workoutId, day: exerciseForm.day, name: titleCase(exerciseForm.name), focus: sentenceCase(exerciseForm.focus), exercises: [exercise] }]
    })
    setExerciseForm((current) => ({ ...current, exercise: '', sets: '3', reps: '12', rest: '60s', load: '' }))
  }

  function saveStudent(event) {
    event.preventDefault()
    if (!form.name.trim()) return setError('Informe o nome do aluno.')
    if (form.birthDate && !isValidBrazilianDate(form.birthDate)) return setError('Informe uma data de nascimento válida em dd/mm/aaaa.')

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
      workouts: workoutDraft.length ? workoutDraft : demoWorkouts,
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
      auditLog: [{ id: crypto.randomUUID?.() || token, action: `Aluno ${student.name} cadastrado`, actor: 'Recepção', date: new Date().toISOString() }, ...(state.auditLog || [])]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setState(updated)
    setSelectedToken(token)
    setForm({ name: '', phone: '', email: '', birthDate: '', goal: '', trainerId: state.trainers[0]?.id || '', monthlyGoal: 20, notes: '' })
    setWorkoutDraft(demoWorkouts.slice(0, 1))
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
          <a href="#rotina"><Dumbbell /> Rotinas de treino</a>
          <a href="#nutricao"><Salad /> Nutricionista</a>
          <a href="#acesso"><QrCode /> QR / WhatsApp</a>
          <a href="#lgpd"><ShieldCheck /> LGPD</a>
        </nav>
      </aside>

      <section className="academyMain">
        <header className="academyHero">
          <div>
            <span className="academyTag"><Sparkles size={16} /> Academia, aluno e rotina conectados</span>
            <h1>O painel da academia com a mesma energia da experiencia Shapp.</h1>
            <p>Cadastro padronizado, QR Code real, lista de alunos, treino por dias e um módulo de nutricionista para academias que oferecem o serviço.</p>
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

        <section className="academyGrid">
          <form className="academyCard academyForm" id="cadastro" onSubmit={saveStudent}>
            <div className="cardTitle"><div><span>Cadastro</span><h2>Novo aluno</h2></div><Plus /></div>
            <div className="academyFormGrid">
              <label>Nome completo<input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Ana Cassoni" /></label>
              <label>Telefone<input inputMode="numeric" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="(48) 99999-9999" /></label>
              <label>E-mail<input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value.trimStart().toLocaleLowerCase('pt-BR'))} placeholder="aluno@email.com" /></label>
              <label>Data de nascimento<input inputMode="numeric" value={form.birthDate} onChange={(e) => updateForm('birthDate', e.target.value)} placeholder="dd/mm/aaaa" /></label>
              <label>Objetivo<input value={form.goal} onChange={(e) => updateForm('goal', e.target.value)} placeholder="Hipertrofia e constância" /></label>
              <label>Professor<select value={form.trainerId} onChange={(e) => updateForm('trainerId', e.target.value)}>{state.trainers.map((trainer) => <option key={trainer.id} value={trainer.id}>{titleCase(trainer.name)}</option>)}</select></label>
              <label>Meta mensal<input type="number" min="1" max="31" value={form.monthlyGoal} onChange={(e) => updateForm('monthlyGoal', e.target.value)} /></label>
              <label className="fullField">Observações<textarea value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} placeholder="Informações adicionais em escrita normal." /></label>
            </div>
            {error && <p className="formError">{error}</p>}
            <button className="academyPrimary" type="submit">Cadastrar e gerar acesso <ArrowRight /></button>
          </form>

          <article className="academyCard accessCard" id="acesso">
            <div className="cardTitle"><div><span>Acesso do aluno</span><h2>QR Code real</h2></div><QrCode /></div>
            {selectedStudent ? <>
              <label>Aluno selecionado<select value={selectedStudent.token} onChange={(e) => setSelectedToken(e.target.value)}>{state.students.map((student) => <option key={student.id} value={student.token}>{titleCase(student.name)}</option>)}</select></label>
              <div className="realQr" ref={qrRef}><QRCodeCanvas value={inviteLink} size={220} level="H" includeMargin bgColor="#ffffff" fgColor="#080808" /></div>
              <div className="studentAccessData"><strong>{titleCase(selectedStudent.name)}</strong><span>{formatPhone(selectedStudent.phone)} · {selectedStudent.birthDate || 'Data não informada'}</span><code>{inviteLink}</code></div>
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
          <div className="cardTitle"><div><span>Treino do aluno</span><h2>Dias, series e repeticoes</h2></div><Dumbbell /></div>
          <form className="routineBuilder" onSubmit={addExercise}>
            <label>Dia<select value={exerciseForm.day} onChange={(e) => setExerciseForm({ ...exerciseForm, day: e.target.value })}>{['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map((day) => <option key={day}>{day}</option>)}</select></label>
            <label>Rotina<input value={exerciseForm.name} onChange={(e) => setExerciseForm({ ...exerciseForm, name: titleCase(e.target.value) })} /></label>
            <label>Foco<input value={exerciseForm.focus} onChange={(e) => setExerciseForm({ ...exerciseForm, focus: sentenceCase(e.target.value) })} /></label>
            <label>Exercício<input value={exerciseForm.exercise} onChange={(e) => setExerciseForm({ ...exerciseForm, exercise: titleCase(e.target.value) })} /></label>
            <label>Séries<input value={exerciseForm.sets} onChange={(e) => setExerciseForm({ ...exerciseForm, sets: e.target.value.replace(/\D/g, '').slice(0, 2) })} /></label>
            <label>Repetições<input value={exerciseForm.reps} onChange={(e) => setExerciseForm({ ...exerciseForm, reps: e.target.value.replace(/[^\d-]/g, '').slice(0, 5) })} /></label>
            <label>Descanso<input value={exerciseForm.rest} onChange={(e) => setExerciseForm({ ...exerciseForm, rest: e.target.value })} /></label>
            <label>Carga<input value={exerciseForm.load} onChange={(e) => setExerciseForm({ ...exerciseForm, load: sentenceCase(e.target.value) })} /></label>
            <button type="submit">Adicionar exercício <Plus /></button>
          </form>
          <div className="routinePreview">
            {workoutDraft.map((workout) => (
              <article key={`${workout.day}-${workout.name}`}>
                <small>{workout.day}</small>
                <h3>{workout.name}</h3>
                <p>{workout.focus}</p>
                {workout.exercises.map((exercise) => <span key={`${workout.id}-${exercise.name}`}>{exercise.name}: {exercise.sets}x{exercise.reps} · {exercise.rest}</span>)}
              </article>
            ))}
          </div>
        </section>

        <section className="academyCard nutritionCard" id="nutricao">
          <div className="cardTitle"><div><span>Módulo opcional</span><h2>Nutricionista</h2></div><Salad /></div>
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
                  <div className="dashboardStudentIdentity"><span>{initials(student.name)}</span><div><strong>{titleCase(student.name)}</strong><small>{formatPhone(student.phone)} · {student.birthDate || 'Data não informada'}</small></div></div>
                  <div><small>Professor</small><strong>{trainerName(student.trainerId)}</strong></div>
                  <div><small>Objetivo</small><strong>{sentenceCase(student.goal)}</strong></div>
                  <div><small>Rotinas</small><strong>{student.workouts?.length || 0} dias</strong></div>
                  <div><small>Meta mensal</small><strong>{student.completedThisMonth || 0}/{student.monthlyGoal || 0} treinos</strong><div className="dashboardProgress"><span style={{ width: `${progress}%` }} /></div></div>
                  <a href={`/aluno/${student.token}`} target="_blank" rel="noreferrer">Abrir app <ExternalLink /></a>
                </article>
              )
            })}
          </div>
        </section>

        <section className="academyCard lgpdCard" id="lgpd"><ShieldCheck /><div><span>Privacidade integrada</span><h2>Consentimento antes do primeiro treino.</h2><p>Termos, Política de Privacidade e tratamento de dados aparecem antes do acesso ao app do aluno.</p></div></section>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<Dashboard />)
