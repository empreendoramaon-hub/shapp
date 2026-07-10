import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BarChart3,
  Check,
  ChevronRight,
  Dumbbell,
  Flame,
  Home,
  Lock,
  PlayCircle,
  Salad,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound
} from 'lucide-react'
import './studentMobile.css'

const STORAGE_KEY = 'shappFitMvpState'
const CONSENT_KEY = 'shappFitConsent'

const fallbackWorkouts = [
  {
    id: 'workout-demo',
    day: 'Segunda',
    name: 'Treino A',
    focus: 'Pernas e glúteos',
    exercises: [
      { name: 'Agachamento livre', sets: '4', reps: '10', load: 'Progressiva', rest: '90s', videoOptional: true },
      { name: 'Leg press', sets: '4', reps: '12', load: 'Moderada', rest: '75s', videoOptional: true },
      { name: 'Cadeira extensora', sets: '3', reps: '15', load: 'Controle total', rest: '60s', videoOptional: false }
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
    modules: { exerciseVideos: true, exercisePhotos: true, gamification: true, chat: true, nutrition: true }
  },
  trainers: [
    { id: 'trainer-ana', name: 'Ana Paula', role: 'Personal Trainer' }
  ],
  students: [
    {
      id: 'student-demo-001',
      token: 'demo-ana-cassoni',
      name: 'Ana Cassoni',
      phone: '(48) 98888-7777',
      email: 'ana@email.com',
      status: 'active',
      goal: 'Hipertrofia e constância',
      trainerId: 'trainer-ana',
      monthlyGoal: 20,
      completedThisMonth: 8,
      xp: 1280,
      level: 7,
      streak: 4,
      workouts: fallbackWorkouts,
      assessments: [],
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

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    const state = stored?.academy && Array.isArray(stored?.students) ? stored : fallbackState
    return {
      ...state,
      academy: {
        ...fallbackState.academy,
        ...state.academy,
        modules: { ...fallbackState.academy.modules, ...(state.academy?.modules || {}) }
      },
      students: state.students.map((student) => ({
        ...student,
        level: student.level || Math.max(1, Math.floor((student.xp || 0) / 220) + 1),
        workouts: student.workouts?.length ? student.workouts : fallbackWorkouts,
        nutrition: student.nutrition || { enabled: false, diet: '', supplements: '', professional: '' }
      }))
    }
  } catch {
    return fallbackState
  }
}

function getToken() {
  return decodeURIComponent(window.location.pathname.replace('/aluno/', '').split('/')[0])
}

function dayLabel() {
  return ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][new Date().getDay()]
}

function comparableDay(value = '') {
  return value.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function Consent({ academy, student, onAccept }) {
  const [accepted, setAccepted] = useState({ terms: false, privacy: false, data: false })
  const ready = Object.values(accepted).every(Boolean)

  function confirm() {
    const consent = {
      studentToken: student.token,
      academyId: academy.id,
      termsVersion: academy.termsVersion,
      privacyVersion: academy.privacyVersion,
      acceptedAt: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
    localStorage.setItem(`${CONSENT_KEY}:${student.token}`, JSON.stringify(consent))
    onAccept(consent)
  }

  return (
    <main className="mobileLegal" style={{ '--brand': academy.primaryColor }}>
      <div className="legalVisual">
        <img src="/fitness-athlete.svg" alt="Atleta em movimento" />
        <div className="legalLogo">{academy.logo}</div>
      </div>
      <p className="mobileEyebrow"><ShieldCheck size={15} /> Primeiro acesso</p>
      <h1>Seu treino está pronto.</h1>
      <p>Antes de entrar, confirme os documentos obrigatórios da {academy.name}.</p>
      <label><input type="checkbox" checked={accepted.terms} onChange={(event) => setAccepted({ ...accepted, terms: event.target.checked })} /> <span>Li e aceito os Termos de Uso <small>Versão {academy.termsVersion}</small></span></label>
      <label><input type="checkbox" checked={accepted.privacy} onChange={(event) => setAccepted({ ...accepted, privacy: event.target.checked })} /> <span>Li e aceito a Política de Privacidade <small>Versão {academy.privacyVersion}</small></span></label>
      <label><input type="checkbox" checked={accepted.data} onChange={(event) => setAccepted({ ...accepted, data: event.target.checked })} /> <span>Concordo com o tratamento dos meus dados <small>Consentimento conforme LGPD</small></span></label>
      <button disabled={!ready} onClick={confirm}>Aceitar e acessar</button>
    </main>
  )
}

function HomeTab({ student, academy, trainer, workout, goalProgress, remaining, setTab }) {
  return (
    <>
      <header className="mobileHero">
        <div className="heroImageWrap">
          <img src="/fitness-athlete.svg" alt="Atleta treinando" />
        </div>
        <div className="mobileTopline">
          <div className="mobileAcademy"><span>{academy.logo}</span><small>{academy.name}</small></div>
          <div className="levelPill">Nível {student.level}</div>
        </div>
        <div className="heroCopyMobile">
          <p>Olá, {student.name.split(' ')[0]}.</p>
          <h1>Hoje é dia de virar a chave.</h1>
          <button onClick={() => setTab('workout')}>Abrir treino <ChevronRight size={20} /></button>
        </div>
      </header>

      <section className="mobileContent">
        <article className="visualWorkoutCard" onClick={() => setTab('workout')}>
          <img src="/workout-legs.svg" alt="Ilustração do treino de pernas" />
          <div className="visualWorkoutShade" />
          <div className="visualWorkoutCopy">
            <small>Treino de hoje</small>
            <h2>{workout.name}</h2>
            <p>{workout.focus} · {workout.exercises.length} exercícios</p>
            <span>Começar agora <ChevronRight size={18} /></span>
          </div>
        </article>

        <div className="quickStats">
          <article><Flame /><strong>{student.streak}</strong><span>dias seguidos</span></article>
          <article><Trophy /><strong>{student.xp}</strong><span>XP total</span></article>
        </div>

        <article className="goalCard">
          <div><small>Meta mensal</small><strong>{student.completedThisMonth}/{student.monthlyGoal}</strong></div>
          <div className="mobileProgress"><span style={{ width: `${goalProgress}%` }} /></div>
          <p>Faltam {remaining} treinos para completar a meta.</p>
        </article>

        <article className="motivationCard">
          <Sparkles size={22} />
          <div><small>Impulso do dia</small><strong>Constância vence intensidade solta.</strong></div>
        </article>

        <article className="coachCard">
          <div className="coachAvatar">{trainer?.name?.slice(0, 1) || 'P'}</div>
          <div><small>Seu professor</small><strong>{trainer?.name || 'Professor responsável'}</strong><span>{trainer?.role || 'Personal Trainer'}</span></div>
        </article>

        {student.nutrition?.enabled && (
          <article className="nutritionTeaser" onClick={() => setTab('nutrition')}>
            <Salad size={24} />
            <div><small>Nutricionista</small><strong>Dieta e suplementos liberados.</strong><span>Abrir plano alimentar</span></div>
          </article>
        )}
      </section>
    </>
  )
}

function WorkoutTab({ student, academy, workout, onFinish }) {
  const [done, setDone] = useState([])

  function toggle(index) {
    setDone((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])
  }

  return (
    <section className="mobilePage workoutPage">
      <div className="workoutVisualHeader">
        <img src="/workout-legs.svg" alt="Treino de pernas" />
        <div className="workoutVisualShade" />
        <div className="pageTitle">
          <p className="mobileEyebrow"><Dumbbell size={15} /> {dayLabel()}</p>
          <h1>{workout.name}</h1>
          <span>{workout.focus}</span>
        </div>
      </div>
      <div className="workoutSummary"><div><strong>{workout.exercises.length}</strong><span>exercícios</span></div><div><strong>{done.length}</strong><span>concluídos</span></div><div><strong>~45</strong><span>minutos</span></div></div>
      <div className="mobileExerciseList">
        {workout.exercises.map((exercise, index) => (
          <article key={exercise.name} className={done.includes(index) ? 'isDone' : ''}>
            <button className="checkButton" onClick={() => toggle(index)}>{done.includes(index) ? <Check /> : index + 1}</button>
            <div><h2>{exercise.name}</h2><p>{exercise.sets} séries · {exercise.reps} repetições</p><span>Carga: {exercise.load} · Descanso: {exercise.rest}</span></div>
            {academy.modules.exerciseVideos && exercise.videoOptional && <button className="videoButton"><PlayCircle size={22} /></button>}
          </article>
        ))}
      </div>
      <button className="finishButton" onClick={onFinish} disabled={done.length !== workout.exercises.length}>Finalizar treino +80 XP</button>
    </section>
  )
}

function ProgressTab({ student }) {
  const last = student.assessments?.[0]
  return (
    <section className="mobilePage progressPage">
      <div className="progressVisual">
        <img src="/fitness-athlete.svg" alt="Atleta representando evolução" />
        <div className="progressVisualShade" />
        <div className="pageTitle"><p className="mobileEyebrow"><BarChart3 size={15} /> Evolução</p><h1>Seu progresso.</h1><span>Pequenas vitórias, empilhadas.</span></div>
      </div>
      <article className="evolutionHero"><small>Objetivo principal</small><h2>{student.goal}</h2><div className="evolutionNumbers"><div><strong>{student.weight || '--'} kg</strong><span>Peso atual</span></div><div><strong>{last?.bodyFat || '--'}%</strong><span>Gordura</span></div><div><strong>{last?.waist || '--'} cm</strong><span>Cintura</span></div></div></article>
      <article className="historyCard"><h2>Histórico recente</h2>{last ? <div className="historyLine"><span>{new Date(last.date).toLocaleDateString('pt-BR')}</span><strong>{last.note}</strong></div> : <p>Sua primeira avaliação ainda não foi registrada.</p>}</article>
      <article className="photoExperience"><div className="photoFrame first" /><div className="photoFrame second" /><div className="photoExperienceCopy"><BarChart3 size={28} /><h2>Fotos de evolução</h2><p>Quando a academia liberar imagens, você verá comparativos organizados por data.</p></div></article>
    </section>
  )
}

function NutritionTab({ student }) {
  const nutrition = student.nutrition || {}
  return (
    <section className="mobilePage nutritionPage">
      <div className="nutritionVisual">
        <img src="/fitness-athlete.svg" alt="Plano alimentar integrado ao treino" />
        <div className="nutritionVisualShade" />
        <div className="pageTitle">
          <p className="mobileEyebrow"><Salad size={15} /> Nutricionista</p>
          <h1>Plano alimentar.</h1>
          <span>{nutrition.professional || 'Equipe da academia'}</span>
        </div>
      </div>
      <article className="nutritionPlan">
        <small>Dieta</small>
        <h2>{nutrition.diet || 'A academia ainda não inseriu uma dieta para este aluno.'}</h2>
      </article>
      <article className="supplementPlan">
        <small>Suplementos</small>
        <p>{nutrition.supplements || 'Nenhuma suplementação cadastrada.'}</p>
      </article>
    </section>
  )
}

function ProfileTab({ student, academy, trainer, consent }) {
  return (
    <section className="mobilePage profilePage">
      <div className="profileVisual"><img src="/fitness-athlete.svg" alt="Perfil fitness" /><div className="profileShade" /></div>
      <div className="profileHeader"><div>{student.name.split(' ').map((name) => name[0]).slice(0, 2).join('')}</div><h1>{student.name}</h1><p>{student.email}</p><span className="activeBadge">Matrícula ativa</span></div>
      <div className="profileList">
        <article><small>Academia</small><strong>{academy.name}</strong></article>
        <article><small>Professor responsável</small><strong>{trainer?.name || 'Não definido'}</strong></article>
        <article><small>Objetivo</small><strong>{student.goal}</strong></article>
        <article><small>Contrato até</small><strong>{student.contractEndsAt ? new Date(`${student.contractEndsAt}T12:00:00`).toLocaleDateString('pt-BR') : 'Não informado'}</strong></article>
        <article><small>Consentimento LGPD</small><strong>{consent?.acceptedAt ? `Aceito em ${new Date(consent.acceptedAt).toLocaleDateString('pt-BR')}` : 'Pendente'}</strong></article>
      </div>
      <button className="privacyButton"><ShieldCheck size={19} /> Privacidade e meus dados</button>
    </section>
  )
}

function StudentMobileApp() {
  const token = getToken()
  const [state, setState] = useState(loadState)
  const [tab, setTab] = useState('home')
  const student = state?.students?.find((item) => item.token === token)
  const academy = state?.academy
  const trainer = state?.trainers?.find((item) => item.id === student?.trainerId)
  const workout = useMemo(() => {
    const workouts = student?.workouts?.length ? student.workouts : fallbackWorkouts
    return workouts.find((item) => comparableDay(item.day) === comparableDay(dayLabel())) || workouts[0]
  }, [student])
  const [consent, setConsent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`${CONSENT_KEY}:${token}`) || 'null') } catch { return null }
  })

  if (!state || !student || !academy) return <main className="mobileBlocked"><Lock /><h1>Acesso não encontrado</h1><p>Solicite um novo link à recepção da academia.</p></main>
  if (student.status !== 'active') return <main className="mobileBlocked" style={{ '--brand': academy.primaryColor }}><Lock /><h1>Matrícula inativa</h1><p>O acesso e as atualizações foram pausados pela {academy.name}.</p></main>
  if (!consent || consent.termsVersion !== academy.termsVersion || consent.privacyVersion !== academy.privacyVersion) return <Consent academy={academy} student={student} onAccept={setConsent} />

  const goalProgress = Math.min(100, Math.round((student.completedThisMonth / Math.max(student.monthlyGoal, 1)) * 100))
  const remaining = Math.max(student.monthlyGoal - student.completedThisMonth, 0)

  function finishWorkout() {
    const updated = {
      ...state,
      students: state.students.map((item) => item.id === student.id ? { ...item, completedThisMonth: item.completedThisMonth + 1, xp: item.xp + 80, streak: item.streak + 1, level: Math.max(item.level, Math.floor((item.xp + 80) / 220) + 1) } : item),
      auditLog: [{ id: `${student.id}-${Date.now()}`, action: `${student.name} concluiu ${workout.name}`, actor: 'Aluno', date: new Date().toISOString() }, ...(state.auditLog || [])]
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setState(updated)
    setTab('home')
  }

  return (
    <main className="studentMobile" style={{ '--brand': academy.primaryColor, '--brand2': academy.secondaryColor }}>
      <div className="mobileViewport">
        {tab === 'home' && <HomeTab student={student} academy={academy} trainer={trainer} workout={workout} goalProgress={goalProgress} remaining={remaining} setTab={setTab} />}
        {tab === 'workout' && <WorkoutTab student={student} academy={academy} workout={workout} onFinish={finishWorkout} />}
        {tab === 'progress' && <ProgressTab student={student} />}
        {tab === 'nutrition' && <NutritionTab student={student} />}
        {tab === 'profile' && <ProfileTab student={student} academy={academy} trainer={trainer} consent={consent} />}
      </div>
      <nav className="mobileNav">
        <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}><Home /><span>Início</span></button>
        <button className={tab === 'workout' ? 'active' : ''} onClick={() => setTab('workout')}><Dumbbell /><span>Treino</span></button>
        <button className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}><BarChart3 /><span>Evolução</span></button>
        {student.nutrition?.enabled && <button className={tab === 'nutrition' ? 'active' : ''} onClick={() => setTab('nutrition')}><Salad /><span>Nutri</span></button>}
        <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}><UserRound /><span>Perfil</span></button>
      </nav>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<StudentMobileApp />)
