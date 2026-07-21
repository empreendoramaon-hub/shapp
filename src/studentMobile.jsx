import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Download,
  Dumbbell,
  Flame,
  Home,
  Lock,
  PlayCircle,
  Salad,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  Users
} from 'lucide-react'
import { readStudentInvite } from './dataFormat.js'
import './studentMobile.css'

const STORAGE_KEY = 'shappFitMvpState'
const CONSENT_KEY = 'shappFitConsent'

const fallbackWorkouts = [
  {
    id: 'workout-a',
    sequence: 1,
    name: 'Treino A',
    focus: 'Pernas e glÃºteos',
    exercises: [
      { name: 'Agachamento livre', sets: '4', reps: '10', load: 'Progressiva', rest: '90s', tip: 'Manter tronco firme e joelhos alinhados.', videoOptional: true },
      { name: 'Leg press', sets: '4', reps: '12', load: 'Moderada', rest: '75s', tip: 'Controlar a descida sem tirar o quadril do banco.', videoOptional: true },
      { name: 'Cadeira extensora', sets: '3', reps: '15', load: 'Controle total', rest: '60s', tip: 'Segurar um segundo no topo.', videoOptional: false }
    ]
  }
]

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

const fallbackSchedule = [
  { id: 'musculacao-07', date: todayISO(), time: '07:00', title: 'Musculacao guiada', place: 'Sala de musculacao', coach: 'Equipe tecnica', type: 'Forca', capacity: '8 vagas' },
  { id: 'funcional-18', date: todayISO(), time: '18:30', title: 'Funcional', place: 'Studio principal', coach: 'Prof. Lucas', type: 'Cardio', capacity: 'Confirmada' },
  { id: 'kids-17', date: todayISO(), time: '17:00', title: 'Kids movimento', place: 'Sala kids', coach: 'Equipe infantil', type: 'Kids', capacity: 'Turma aberta' }
]

function studentActivityTime(activity = {}) {
  return new Date(`${activity.date || '1970-01-01'}T${activity.time || '00:00'}:00`).getTime()
}

function filterFutureStudentActivities(items = []) {
  const now = Date.now()
  return (items || [])
    .filter((item) => studentActivityTime(item) >= now)
    .sort((a, b) => studentActivityTime(a) - studentActivityTime(b))
}

const fallbackState = {
  academy: {
    id: 'ironfit-demo',
    name: 'Iron Fitness Club',
    logo: 'IF',
    primaryColor: '#b7ff2a',
    secondaryColor: '#d40019',
    termsVersion: '2026.07.09',
    privacyVersion: '2026.07.09',
    modules: { exerciseVideos: true, gamification: true, chat: true, nutrition: true }
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
      goal: 'Hipertrofia e constÃ¢ncia',
      trainerId: 'trainer-ana',
      monthlyGoal: 20,
      completedThisMonth: 8,
      xp: 1280,
      level: 7,
      streak: 4,
      workouts: fallbackWorkouts,
      bookings: [{ activityId: 'funcional-18', status: 'confirmed', confirmedAt: new Date().toISOString() }],
      family: [
        { name: 'Nana Cassoni', relation: 'Filha', age: '8', activities: ['Kids movimento', 'Natacao infantil'] },
        { name: 'Zoe Cassoni', relation: 'Filha', age: '5', activities: ['Kids movimento'] }
      ],
      assessments: [
        { date: todayISO(), weight: 68, bodyFat: 23, waist: 74, muscleMass: 42, note: 'Boa evolucao de constancia.' }
      ],
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

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    const invite = readStudentInvite(window.location.search)
    const baseState = stored?.academy && Array.isArray(stored?.students) ? stored : fallbackState
    const state = invite ? {
      ...baseState,
      academy: { ...baseState.academy, ...(invite.academy || {}) },
      trainers: [...(baseState.trainers || []).filter((trainer) => !(invite.trainers || []).some((item) => item.id === trainer.id)), ...(invite.trainers || [])],
      schedule: invite.schedule?.length ? invite.schedule : baseState.schedule,
      students: [...(baseState.students || []).filter((student) => student.token !== invite.student.token), invite.student]
    } : baseState
    const normalized = {
      ...state,
      academy: {
        ...fallbackState.academy,
        ...state.academy,
        modules: { ...fallbackState.academy.modules, ...(state.academy?.modules || {}) }
      },
      schedule: Array.isArray(state.schedule) && state.schedule.length ? state.schedule : fallbackSchedule,
      students: state.students.map((student) => ({
        ...student,
        level: student.level || Math.max(1, Math.floor((student.xp || 0) / 220) + 1),
        workouts: Array.isArray(student.workouts) ? student.workouts : fallbackWorkouts,
        bookings: Array.isArray(student.bookings) ? student.bookings : [],
        family: Array.isArray(student.family) ? student.family : [],
        assessments: Array.isArray(student.assessments) ? student.assessments : [],
        nutrition: student.nutrition || { enabled: false, diet: '', supplements: '', professional: '' }
      }))
    }
    if (invite) localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
    return normalized
  } catch {
    return fallbackState
  }
}

function getToken() {
  return decodeURIComponent(window.location.pathname.replace('/aluno/', '').split('/')[0])
}

function nextWorkout(student) {
  if (Array.isArray(student?.workouts) && student.workouts.length === 0) {
    return { id: 'empty', sequence: 1, name: 'Ficha em branco', focus: 'Aguardando personal', exercises: [] }
  }
  const workouts = student?.workouts?.length ? student.workouts : fallbackWorkouts
  const ordered = [...workouts].sort((a, b) => (a.sequence || workouts.indexOf(a) + 1) - (b.sequence || workouts.indexOf(b) + 1))
  return ordered[(student?.completedThisMonth || 0) % ordered.length] || ordered[0]
}

function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [message, setMessage] = useState('Disponivel quando o navegador liberar a instalacao.')

  useEffect(() => {
    let manifestLink = document.querySelector('link[rel="manifest"]')
    if (!manifestLink) {
      manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      document.head.appendChild(manifestLink)
    }
    manifestLink.href = '/manifest.webmanifest'

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/aluno/' }).then((registration) => registration.update()).catch(() => {})
    }

    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      setPrompt(event)
      setMessage('Pronto para baixar e colocar na tela inicial.')
    }

    function handleInstalled() {
      setPrompt(null)
      setMessage('App instalado na tela inicial.')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  async function installApp() {
    if (!prompt) {
      setMessage('No celular, use Compartilhar > Adicionar a tela de inicio se o botao nativo nao aparecer.')
      return
    }
    prompt.prompt()
    const choice = await prompt.userChoice
    setPrompt(null)
    setMessage(choice.outcome === 'accepted' ? 'Instalacao iniciada.' : 'Instalacao cancelada.')
  }

  return { installApp, canInstall: Boolean(prompt), installMessage: message }
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
      <h1>Seu treino estÃ¡ pronto.</h1>
      <p>Antes de entrar, confirme os documentos obrigatÃ³rios da {academy.name}.</p>
      <label><input type="checkbox" checked={accepted.terms} onChange={(event) => setAccepted({ ...accepted, terms: event.target.checked })} /> <span>Li e aceito os Termos de Uso <small>VersÃ£o {academy.termsVersion}</small></span></label>
      <label><input type="checkbox" checked={accepted.privacy} onChange={(event) => setAccepted({ ...accepted, privacy: event.target.checked })} /> <span>Li e aceito a PolÃ­tica de Privacidade <small>VersÃ£o {academy.privacyVersion}</small></span></label>
      <label><input type="checkbox" checked={accepted.data} onChange={(event) => setAccepted({ ...accepted, data: event.target.checked })} /> <span>Concordo com o tratamento dos meus dados <small>Consentimento conforme LGPD</small></span></label>
      <button disabled={!ready} onClick={confirm}>Aceitar e acessar</button>
    </main>
  )
}

function HomeTab({ student, academy, trainer, workout, goalProgress, remaining, setTab, schedule }) {
  const confirmed = (student.bookings || []).filter((item) => item.status === 'confirmed')
  const nextClass = schedule.find((item) => confirmed.some((booking) => booking.activityId === item.id)) || schedule[0]
  const levelProgress = Math.min(100, Math.round((((student.xp || 0) % 220) / 220) * 100))
  const support = goalProgress >= 70
    ? { emoji: '🔥', title: 'Ritmo forte', text: `Voce ja cumpriu ${goalProgress}% da meta. Mantenha a sequencia.` }
    : goalProgress >= 35
      ? { emoji: '💪', title: 'Um treino por vez', text: `Faltam ${remaining} treinos. O importante e voltar hoje.` }
      : { emoji: '✨', title: 'Comeco inteligente', text: 'Cada check-in soma pontos e aproxima voce da meta.' }

  return (
    <>
      <header className="mobileHero">
        <div className="heroImageWrap">
          <img src="/fitness-athlete.svg" alt="Atleta treinando" />
        </div>
        <div className="mobileTopline">
          <div className="mobileAcademy"><span>{academy.logo}</span><small>{academy.name}</small></div>
          <div className="levelPill">Nivel {student.level}</div>
        </div>
        <div className="heroCopyMobile">
          <p>Ola, {student.name.split(' ')[0]}.</p>
          <h1>Meta, treino e evolucao no mesmo app.</h1>
          <button onClick={() => setTab('workout')}>Abrir treino <ChevronRight size={20} /></button>
        </div>
      </header>

      <section className="mobileContent">
        <article className="studentGameCard">
          <div>
            <small>Nivel {student.level}</small>
            <strong>{student.xp || 0} XP</strong>
            <span>{levelProgress}% ate o proximo nivel</span>
          </div>
          <div className="mobileProgress"><span style={{ width: `${levelProgress}%` }} /></div>
          <p><Flame size={15} /> Finalizar treino soma +80 XP.</p>
        </article>

        <section className="gamePanel">
          <div className="gameStreak">
            <div className="gameStreakHead"><span><Flame size={15} /> Ofensiva</span><strong>{student.streak} dias</strong></div>
            <div className="gameStreakRow">
              {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, index) => (
                <span key={index} className={index < Math.min(student.streak, 7) ? 'on' : ''}>{index < Math.min(student.streak, 7) ? '🔥' : day}</span>
              ))}
            </div>
          </div>
          <div className="badgesRow">
            {[
              { icon: '🥇', label: '1º treino', got: (student.xp || 0) > 0 },
              { icon: '🔥', label: 'Streak 7', got: (student.streak || 0) >= 7 },
              { icon: '💪', label: '10 treinos', got: (student.completedThisMonth || 0) >= 10 },
              { icon: '🏆', label: 'Nivel 10', got: (student.level || 0) >= 10 }
            ].map((badge) => (
              <div key={badge.label} className={badge.got ? 'badgeItem got' : 'badgeItem lock'}><em>{badge.icon}</em><small>{badge.label}</small></div>
            ))}
          </div>
        </section>

        <article className="visualWorkoutCard" onClick={() => setTab('workout')}>
          <img src="/workout-legs.svg" alt="Ilustracao do treino" />
          <div className="visualWorkoutShade" />
          <div className="visualWorkoutCopy">
            <small>Proximo treino</small>
            <h2>{workout.name}</h2>
            <p>{workout.focus} - {workout.exercises.length} exercicios</p>
            <span>Comecar agora <ChevronRight size={18} /></span>
          </div>
        </article>

        {nextClass && (
          <button className="studentNextClass" type="button" onClick={() => setTab('agenda')}>
            <CalendarDays />
            <span><small>Aulas de hoje</small><strong>{nextClass.time} - {nextClass.title}</strong><em>{nextClass.place}</em></span>
            <ChevronRight />
          </button>
        )}

        <div className="quickStats">
          <article><Flame /><strong>{student.streak}</strong><span>dias seguidos</span></article>
          <article><Trophy /><strong>{student.xp}</strong><span>XP total</span></article>
        </div>

        <article className="goalCard">
          <div><small>Meta mensal</small><strong>{student.completedThisMonth}/{student.monthlyGoal}</strong></div>
          <div className="mobileProgress"><span style={{ width: `${goalProgress}%` }} /></div>
          <p>Faltam {remaining} treinos para completar a meta.</p>
        </article>

        <article className="weeklyChallenge">
          <small>Desafio da semana</small>
          <strong>Faca 5 treinos</strong>
          <div className="challengeBar"><span style={{ width: `${Math.min((Math.min(student.streak, 5) / 5) * 100, 100)}%` }} /></div>
          <p>{Math.min(student.streak, 5)} de 5 · +300 XP ao concluir</p>
        </article>

        <article className="rankCard">
          <div className="rankHead"><Trophy size={16} /> <strong>Ranking da academia</strong></div>
          {[
            { name: 'Marina R.', xp: (student.xp || 0) + 830 },
            { name: 'Diego S.', xp: (student.xp || 0) + 270 },
            { name: student.name.split(' ')[0], xp: student.xp || 0, me: true },
            { name: 'Bruno L.', xp: Math.max(0, (student.xp || 0) - 280) },
            { name: 'Carla M.', xp: Math.max(0, (student.xp || 0) - 540) }
          ].sort((a, b) => b.xp - a.xp).map((row, index) => (
            <div key={`${row.name}-${index}`} className={row.me ? 'rankRow me' : 'rankRow'}>
              <span className="rankPos">{index + 1}</span>
              <span className="rankName">{row.name}{row.me ? ' · voce' : ''}</span>
              <span className="rankPts">{row.xp} XP</span>
            </div>
          ))}
        </article>

        <article className="motivationCard">
          <span className="motivationEmoji">{support.emoji}</span>
          <div><small>{support.title}</small><strong>{support.text}</strong></div>
        </article>

        <article className="coachCard">
          <div className="coachAvatar">{trainer?.name?.slice(0, 1) || 'P'}</div>
          <div><small>Seu professor</small><strong>{trainer?.name || 'Professor responsavel'}</strong><span>{trainer?.role || 'Personal Trainer'}</span></div>
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
function AgendaTab({ student, setStudentState, schedule }) {
  function statusFor(item) {
    return (student.bookings || []).find((booking) => booking.activityId === item.id)?.status || ''
  }

  function toggleBooking(item) {
    const currentStatus = statusFor(item)
    const nextStatus = currentStatus === 'confirmed' ? 'cancelled' : 'pending'
    setStudentState((current) => {
      const updated = {
        ...current,
        students: current.students.map((entry) => {
          if (entry.id !== student.id) return entry
          const bookings = (entry.bookings || []).filter((booking) => booking.activityId !== item.id)
          return { ...entry, bookings: [...bookings, { activityId: item.id, status: nextStatus, requestedAt: new Date().toISOString() }] }
        }),
        auditLog: [{ id: `${student.id}-${Date.now()}`, action: `${student.name} ${nextStatus === 'pending' ? 'solicitou reserva' : 'cancelou reserva'} em ${item.title}`, actor: 'Aluno', date: new Date().toISOString() }, ...(current.auditLog || [])]
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }

  return (
    <section className="mobilePage agendaPage">
      <div className="pageTitle"><p className="mobileEyebrow"><CalendarDays size={15} /> Agenda</p><h1>Aulas de hoje</h1><span>Reservas e avisos confirmados pela academia.</span></div>
      <div className="studentAgendaList">
        {schedule.map((item) => {
          const status = statusFor(item)
          return (
            <article key={item.id} className={status === 'confirmed' ? 'isConfirmed' : ''}>
              <div><small>{item.time} - {item.type}</small><h2>{item.title}</h2><p>{item.place} - {item.coach}</p><span>{item.capacity}</span></div>
              <button type="button" onClick={() => toggleBooking(item)}>
                {status === 'confirmed' ? <><CheckCircle2 /> Confirmada</> : status === 'pending' ? 'Aguardando confirmacao' : 'Reservar'}
              </button>
            </article>
          )
        })}
        {!schedule.length && <article><div><small>Agenda</small><h2>Nenhuma atividade futura</h2><p>Quando a academia publicar novas aulas, elas aparecem aqui com data e horario.</p></div></article>}
      </div>
    </section>
  )
}
function WorkoutTab({ student, academy, workout, onFinish }) {
  const [done, setDone] = useState([])

  function toggle(index) {
    setDone((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])
  }

  if (!workout.exercises.length) {
    return (
      <section className="mobilePage workoutPage">
        <div className="pageTitle"><p className="mobileEyebrow"><Dumbbell size={15} /> Treino</p><h1>Ficha em branco</h1><span>O personal ainda vai programar este treino.</span></div>
        <article className="historyCard"><h2>Aguardando montagem</h2><p>Quando o painel salvar os blocos Treino A, B ou C, os exercicios aparecem aqui automaticamente.</p></article>
      </section>
    )
  }

  return (
    <section className="mobilePage workoutPage">
      <div className="workoutVisualHeader">
        <img src="/workout-legs.svg" alt="Treino de pernas" />
        <div className="workoutVisualShade" />
        <div className="pageTitle">
          <p className="mobileEyebrow"><Dumbbell size={15} /> SequÃªncia {workout.sequence || 1}</p>
          <h1>{workout.name}</h1>
          <span>{workout.focus}</span>
        </div>
      </div>
      <div className="workoutSummary"><div><strong>{workout.exercises.length}</strong><span>exercÃ­cios</span></div><div><strong>{done.length}</strong><span>concluÃ­dos</span></div><div><strong>~45</strong><span>minutos</span></div></div>
      <div className="mobileExerciseList">
        {workout.exercises.map((exercise, index) => (
          <article key={exercise.name} className={done.includes(index) ? 'isDone' : ''}>
            <button className="checkButton" onClick={() => toggle(index)}>{done.includes(index) ? <Check /> : index + 1}</button>
            <div><h2>{exercise.name}</h2><p>{exercise.sets} sÃ©ries Â· {exercise.reps} repetiÃ§Ãµes</p><span>Carga: {exercise.load} Â· Descanso: {exercise.rest}{exercise.tip ? ` Â· ${exercise.tip}` : ''}</span></div>
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
  const progress = Math.min(100, Math.round(((student.completedThisMonth || 0) / Math.max(student.monthlyGoal || 1, 1)) * 100))
  const bars = [42, 56, 48, 72, 64, progress].map((value, index) => ({ value, label: ['S', 'T', 'Q', 'Q', 'S', 'H'][index] }))
  const bodyFat = Number(last?.bodyFat || 22)
  const muscleMass = Number(last?.muscleMass || 40)

  return (
    <section className="mobilePage progressPage">
      <div className="progressVisual">
        <img src="/fitness-athlete.svg" alt="Atleta representando evolucao" />
        <div className="progressVisualShade" />
        <div className="pageTitle"><p className="mobileEyebrow"><BarChart3 size={15} /> Evolucao</p><h1>Metricas e resultados.</h1><span>Graficos para acompanhar treino, corpo e constancia.</span></div>
      </div>
      <article className="evolutionHero"><small>Objetivo principal</small><h2>{student.goal}</h2><div className="evolutionNumbers"><div><strong>{student.weight || last?.weight || '--'} kg</strong><span>Peso atual</span></div><div><strong>{bodyFat}%</strong><span>Gordura</span></div><div><strong>{last?.waist || '--'} cm</strong><span>Cintura</span></div></div></article>
      <article className="studentChartCard">
        <div><small>Constancia semanal</small><strong>{progress}% da meta mensal</strong></div>
        <div className="studentBarChart">{bars.map((bar) => <span key={bar.label} style={{ height: `${Math.max(bar.value, 8)}%` }}><em>{bar.label}</em></span>)}</div>
        <p>{progress >= 70 ? 'Frequencia forte nesta semana.' : 'Cada check-in aumenta sua evolucao.'}</p>
      </article>
      <div className="studentRingGrid">
        <article style={{ '--value': `${Math.min(bodyFat * 3.6, 360)}deg` }}><span>{bodyFat}%</span><small>Gordura</small></article>
        <article style={{ '--value': `${Math.min(muscleMass * 2, 360)}deg` }}><span>{muscleMass}kg</span><small>Massa magra</small></article>
        <article style={{ '--value': `${progress * 3.6}deg` }}><span>{progress}%</span><small>Meta</small></article>
      </div>
      <article className="historyCard"><h2>Historico recente</h2>{last ? <div className="historyLine"><span>{new Date(`${last.date}T12:00:00`).toLocaleDateString('pt-BR')}</span><strong>{last.note}</strong></div> : <p>Sua primeira avaliacao ainda nao foi registrada.</p>}</article>
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
        <h2>{nutrition.diet || 'A academia ainda nÃ£o inseriu uma dieta para este aluno.'}</h2>
      </article>
      <article className="supplementPlan">
        <small>Suplementos</small>
        <p>{nutrition.supplements || 'Nenhuma suplementaÃ§Ã£o cadastrada.'}</p>
      </article>
    </section>
  )
}

function childMatchesActivity(item, child) {
  const activities = Array.isArray(child.activities) ? child.activities : `${child.activities || ''}`.split(',')
  const haystack = `${item.title} ${item.type}`.toLocaleLowerCase('pt-BR')
  return activities.some((activity) => activity && haystack.includes(`${activity}`.toLocaleLowerCase('pt-BR').trim()))
}

function ProfileTab({ student, academy, trainer, consent, installApp, installMessage, canInstall, schedule }) {
  return (
    <section className="mobilePage profilePage">
      <div className="profileVisual"><img src="/fitness-athlete.svg" alt="Perfil fitness" /><div className="profileShade" /></div>
      <div className="profileHeader"><div>{student.name.split(' ').map((name) => name[0]).slice(0, 2).join('')}</div><h1>{student.name}</h1><p>{student.email}</p><span className="activeBadge">Matricula ativa</span></div>
      <button className="installBigButton" type="button" onClick={installApp}><Download /> {canInstall ? 'Baixar app no celular' : 'Adicionar na tela inicial'}<small>{installMessage}</small></button>
      <div className="profileList">
        <article><small>Academia</small><strong>{academy.name}</strong></article>
        <article><small>Professor responsavel</small><strong>{trainer?.name || 'Nao definido'}</strong></article>
        <article><small>Objetivo</small><strong>{student.goal}</strong></article>
        <article><small>Contrato ate</small><strong>{student.contractEndsAt ? new Date(`${student.contractEndsAt}T12:00:00`).toLocaleDateString('pt-BR') : 'Nao informado'}</strong></article>
        <article><small>Consentimento LGPD</small><strong>{consent?.acceptedAt ? `Aceito em ${new Date(consent.acceptedAt).toLocaleDateString('pt-BR')}` : 'Pendente'}</strong></article>
      </div>
      {!!(student.family || []).length && (
        <section className="studentFamilyBlock">
          <div className="pageTitle"><p className="mobileEyebrow"><Users size={15} /> Familia</p><h1>Atividades dos filhos</h1><span>Controle das modalidades vinculadas ao plano familiar.</span></div>
          {(student.family || []).map((child) => {
            const matches = schedule.filter((item) => childMatchesActivity(item, child))
            const tags = Array.isArray(child.activities) ? child.activities : `${child.activities || ''}`.split(',').map((item) => item.trim()).filter(Boolean)
            return (
              <article key={child.name}>
                <div><strong>{child.name}</strong><small>{child.relation || 'Dependente'} {child.age ? `- ${child.age} anos` : ''}</small></div>
                <div className="studentFamilyTags">{tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <div className="studentChildSchedule">{matches.length ? matches.map((item) => <small key={item.id}>{item.time} - {item.title}</small>) : <small>Nenhuma aula vinculada hoje.</small>}</div>
              </article>
            )
          })}
        </section>
      )}
      <button className="privacyButton"><ShieldCheck size={19} /> Privacidade e meus dados</button>
    </section>
  )
}
function StudentMobileApp() {
  const token = getToken()
  const [state, setState] = useState(loadState)
  const [tab, setTab] = useState('home')
  const install = useInstallPrompt()
  const student = state?.students?.find((item) => item.token === token)
  const academy = state?.academy
  const trainer = state?.trainers?.find((item) => item.id === student?.trainerId)
  const schedule = filterFutureStudentActivities(state?.schedule || fallbackSchedule)
  const workout = useMemo(() => {
    return nextWorkout(student)
  }, [student])
  const [consent, setConsent] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`${CONSENT_KEY}:${token}`) || 'null') } catch { return null }
  })

  if (!state || !student || !academy) return <main className="mobileBlocked"><Lock /><h1>Acesso nÃ£o encontrado</h1><p>Solicite um novo link Ã  recepÃ§Ã£o da academia.</p></main>
  if (student.status !== 'active') return <main className="mobileBlocked" style={{ '--brand': academy.primaryColor }}><Lock /><h1>MatrÃ­cula inativa</h1><p>O acesso e as atualizaÃ§Ãµes foram pausados pela {academy.name}.</p></main>
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
	        {tab === 'home' && <HomeTab student={student} academy={academy} trainer={trainer} workout={workout} goalProgress={goalProgress} remaining={remaining} setTab={setTab} schedule={schedule} />}
	        {tab === 'workout' && <WorkoutTab student={student} academy={academy} workout={workout} onFinish={finishWorkout} />}
	        {tab === 'agenda' && <AgendaTab student={student} setStudentState={setState} schedule={schedule} />}
	        {tab === 'progress' && <ProgressTab student={student} />}
	        {tab === 'nutrition' && <NutritionTab student={student} />}
	        {tab === 'profile' && <ProfileTab student={student} academy={academy} trainer={trainer} consent={consent} schedule={schedule} {...install} />}
	      </div>
	      <nav className="mobileNav">
	        <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}><Home /><span>InÃ­cio</span></button>
	        <button className={tab === 'workout' ? 'active' : ''} onClick={() => setTab('workout')}><Dumbbell /><span>Treino</span></button>
	        <button className={tab === 'agenda' ? 'active' : ''} onClick={() => setTab('agenda')}><CalendarDays /><span>Agenda</span></button>
	        <button className={tab === 'progress' ? 'active' : ''} onClick={() => setTab('progress')}><BarChart3 /><span>EvoluÃ§Ã£o</span></button>
        {student.nutrition?.enabled && <button className={tab === 'nutrition' ? 'active' : ''} onClick={() => setTab('nutrition')}><Salad /><span>Nutri</span></button>}
        <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}><UserRound /><span>Perfil</span></button>
      </nav>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<StudentMobileApp />)
