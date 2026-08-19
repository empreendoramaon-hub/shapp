import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity, Award, Bell, CalendarDays, Check, ChevronRight, Dumbbell, Flame, HeartPulse,
  Home, LockKeyhole, MapPin, Play, ShieldCheck, Star, Target, Trophy, UserRound, WalletCards
} from 'lucide-react'
import { createEleveSafeStorageState, hashElevePassword, hydrateEleveState, upsertEleveSatisfaction } from './elevePlatformData.js'
import './eleveStudentApp.css'
import './eleveStudentLogin.css'
import './shappPremiumOverrides.css'
import './eleveStudentPremiumVisual.css'

const IS_ELEVE = window.location.pathname.startsWith('/eleve')
const BASE_PATH = IS_ELEVE ? '/eleve' : '/gestao-premium'
const STORAGE_KEY = IS_ELEVE ? 'shappElevePlatformV2' : 'shappManagementPremiumV1'
const VARIANT = IS_ELEVE ? 'eleve' : 'generic'

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return hydrateEleveState(saved, VARIANT)
  } catch { return hydrateEleveState(null, VARIANT) }
}

const tabs = [
  ['home', 'Início', Home], ['workout', 'Treino', Dumbbell], ['agenda', 'Agenda', CalendarDays],
  ['progress', 'Evolução', Activity], ['profile', 'Perfil', UserRound]
]

function formatDate(value) {
  if (!value) return 'Não informado'
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${value}T12:00:00`))
}

function StudentHome({ state, student, plan, trainer, workout, setTab }) {
  const game = student.gamification || { xp: 0, level: 1, streak: 0, weeklyGoal: 4, weeklyDone: 0, badges: [] }
  const levelProgress = game.xp % 300
  return <>
    <section className="esaHero">
      {IS_ELEVE && <div className="esaHeroMedia"><img src="/athlete.jpg" alt="Aluno treinando" /></div>}
      <p>BOA TARDE,</p><h1>{student.name.split(' ')[0]}.</h1><span>Você está a um treino de manter sua sequência.</span>
      <div className="esaLevel"><Trophy /><div><small>NÍVEL {game.level}</small><b>{game.xp.toLocaleString('pt-BR')} XP</b><i><span style={{ width: `${(levelProgress / 300) * 100}%` }} /></i></div></div>
    </section>
    <section className="esaQuickStats">
      <article><Flame /><b>{game.streak} dias</b><span>de sequência</span></article>
      <article><Target /><b>{game.weeklyDone}/{game.weeklyGoal}</b><span>meta semanal</span></article>
      <article><Activity /><b>{student.frequency30d}</b><span>treinos em 30 dias</span></article>
    </section>
    <section className="esaCard esaToday">
      {IS_ELEVE && <img className="esaTodayImage" src="/workout.jpg" alt="Treino em destaque" />}
      <header><div><small>TREINO DE HOJE</small><h2>{workout?.name || 'Treino em preparação'}</h2></div><Dumbbell /></header>
      <p>{workout?.goal || 'Seu professor está preparando sua próxima rotina.'}</p>
      <div><span>{workout?.exercises?.length || 0} exercícios</span><span>+120 XP ao concluir</span></div>
      <button onClick={() => setTab('workout')}>Começar treino <Play /></button>
    </section>
    <section className="esaCard esaPlan"><div><WalletCards /><span><small>SEU PLANO</small><b>{plan.name}</b><p>{plan.benefits.join(' · ')}</p></span></div><ChevronRight /></section>
    <section className="esaCoach"><i>{trainer?.name?.split(' ').map((part) => part[0]).slice(0, 2).join('') || 'SH'}</i><div><small>PERSONAL RESPONSÁVEL</small><b>{trainer?.name || 'Equipe da academia'}</b><span>{student.sessionsLimit - student.sessionsUsed} sessões disponíveis</span></div></section>
    <section className="esaCard esaNotices"><header><Bell /><div><small>COMUNICADOS</small><h2>Novidades para você</h2></div></header>{(state.notifications || []).filter((item) => item.audience === 'all' || item.audience === student.planId).slice(0, 3).map((item) => <article key={item.id}><b>{item.title}</b><span>{item.message}</span></article>)}</section>
  </>
}

function Workout({ workout, completed, toggleExercise, finishWorkout }) {
  const done = Object.values(completed).filter(Boolean).length
  return <><header className="esaPageTitle esaVisualTitle esaWorkoutVisual">{IS_ELEVE && <img src="/pullup.jpg" alt="Treino de força" />}<p>MEU TREINO</p><h1>{workout?.name || 'Treino em preparação'}</h1><span>{workout?.goal}</span></header><section className="esaWorkoutProgress"><div><b>{done}/{workout?.exercises?.length || 0}</b><span>exercícios concluídos</span></div><i><span style={{ width: `${workout?.exercises?.length ? (done / workout.exercises.length) * 100 : 0}%` }} /></i></section><section className="esaExerciseList">{workout?.exercises?.map((exercise, index) => <button className={completed[exercise.id] ? 'done' : ''} key={exercise.id} onClick={() => toggleExercise(exercise.id)}><span>{completed[exercise.id] ? <Check /> : index + 1}</span><div><b>{exercise.name}</b><small>{exercise.sets} séries · {exercise.reps} repetições · {exercise.rest} descanso</small><strong>{exercise.load}</strong></div></button>)}</section><button className="esaFinish" disabled={!workout?.exercises?.length || done !== workout.exercises.length} onClick={finishWorkout}><Trophy /> Concluir treino e ganhar 120 XP</button></>
}

function Agenda({ state, setState, student }) {
  const items = state.appointments.filter((item) => item.studentId === student.id)
  function changeAppointment(item, action) {
    const date = new Date(`${item.date}T12:00:00`)
    if (action === 'reschedule') date.setDate(date.getDate() + 1)
    const next = { ...state, appointments: state.appointments.map((current) => current.id === item.id ? { ...current, status: action === 'cancel' ? 'cancelled' : 'pending', date: action === 'reschedule' ? date.toISOString().slice(0, 10) : current.date } : current) }
    setState(next)
  }
  return <><header className="esaPageTitle esaVisualTitle esaAgendaVisual">{IS_ELEVE && <img src="/meditation.jpg" alt="Bem-estar e agenda" />}<p>MINHA AGENDA</p><h1>Seu tempo, organizado.</h1><span>Acompanhe, cancele ou solicite o reagendamento de avaliações e sessões.</span></header><section className="esaCalendarStrip">{['SEG', 'TER', 'QUA', 'QUI', 'SEX'].map((day, index) => <div className={index === 2 ? 'active' : ''} key={day}><small>{day}</small><b>{20 + index}</b></div>)}</section><section className="esaCard"><h2>Próximos compromissos</h2>{items.length ? items.map((item) => <article className={`esaAppointment ${item.status}`} key={item.id}><time><b>{item.time}</b><span>{formatDate(item.date)}</span></time><div><b>{item.type}</b><span>{state.trainers.find((trainer) => trainer.id === item.trainerId)?.name}</span><small><MapPin /> {state.units.find((unit) => unit.id === item.unitId)?.name}</small>{item.status !== 'cancelled' && <nav><button onClick={() => changeAppointment(item, 'reschedule')}>Reagendar</button><button onClick={() => changeAppointment(item, 'cancel')}>Cancelar</button></nav>}</div><i>{item.status === 'confirmed' ? 'Confirmado' : item.status === 'cancelled' ? 'Cancelado' : 'Pendente'}</i></article>) : <p>Nenhum compromisso agendado.</p>}</section><button className="esaMainButton">Solicitar novo horário <ChevronRight /></button></>
}

function ProgressPage({ student }) {
  const assessment = student.assessment || {}
  const history = student.assessments?.length ? student.assessments : student.assessment ? [student.assessment] : []
  const metrics = [['Peso', `${assessment.weight || '—'} kg`], ['IMC', assessment.bmi || '—'], ['Gordura', `${assessment.bodyFat || '—'}%`], ['Massa magra', `${assessment.leanMass || assessment.muscleMass || '—'} kg`], ['Água corporal', `${assessment.bodyWater || '—'}%`], ['Gordura visceral', assessment.visceralFat || '—']]
  const tests = [['Postura', assessment.posture], ['Flexibilidade', assessment.flexibility], ['Força e resistência', assessment.strength], ['Cardiorrespiratório', assessment.cardiorespiratory], ['Mobilidade', assessment.mobility]]
  return <><header className="esaPageTitle esaVisualTitle esaProgressVisual">{IS_ELEVE && <img src="/stretch.jpg" alt="Evolução física" />}<p>MINHA EVOLUÇÃO</p><h1>Progresso que você consegue ver.</h1><span>Última avaliação em {formatDate(assessment.date)}.</span></header><section className="esaMetricGrid">{metrics.map(([label, value]) => <article key={label}><small>{label}</small><b>{value}</b></article>)}</section><section className="esaCard esaGoal"><Target /><div><small>OBJETIVO ATUAL</small><h2>{assessment.goals || 'Defina seus objetivos com a equipe.'}</h2></div></section><section className="esaCard esaTests"><h2>Testes físicos e mobilidade</h2>{tests.map(([label, value]) => <div key={label}><b>{label}</b><span>{value || 'Ainda não avaliado'}</span></div>)}</section><section className="esaCard esaAssessmentTimeline"><h2>Histórico de avaliações</h2>{history.map((item, index) => <article key={`${item.date}-${index}`}><span>{formatDate(item.date)}</span><b>{item.weight || '—'} kg</b><small>IMC {item.bmi || '—'} · Gordura {item.bodyFat || '—'}%</small></article>)}</section><section className="esaCard esaHealth"><ShieldCheck /><div><h2>Dados de saúde protegidos</h2><p>Anamnese, histórico médico, lesões e medicamentos ficam disponíveis somente para você e profissionais autorizados.</p></div></section></>
}

function Profile({ state, setState, student, plan, trainer }) {
  const [feedback, setFeedback] = useState(student.feedback?.comment || '')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  function saveFeedback() {
    const next = { ...state, students: state.students.map((item) => item.id === student.id ? { ...item, feedback: { score: item.satisfaction, comment: feedback.trim(), updatedAt: new Date().toISOString() } } : item) }
    setState(next); setFeedbackMessage('Obrigado. Sua avaliação foi enviada à equipe.')
  }
  function rate(score) { const next = upsertEleveSatisfaction(state, student.id, score); setState(next) }
  return <><header className="esaProfileHead">{IS_ELEVE && <img className="esaProfileCover" src="/highfive.webp" alt="Conquista no treino" />}<i>{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</i><h1>{student.name}</h1><span>{student.email}</span></header><section className="esaCard esaProfileDetails"><div><small>Plano</small><b>{plan.name}</b></div><div><small>Unidades liberadas</small><b>{plan.units.map((id) => state.units.find((unit) => unit.id === id)?.name).join(' · ')}</b></div><div><small>Personal</small><b>{trainer?.name || 'Equipe da academia'}</b></div><div><small>Contrato até</small><b>{formatDate(student.contractEndsAt)}</b></div><div><small>Situação financeira</small><b>{student.financialStatus === 'paid' ? 'Em dia' : student.financialStatus === 'overdue' ? 'Pagamento em atraso' : 'Pagamento pendente'}</b></div><div><small>Próximo vencimento</small><b>{formatDate(student.nextPaymentDue || student.contractEndsAt)}</b></div></section><section className="esaCard esaRating"><Star /><div><small>SUA EXPERIÊNCIA</small><h2>Como está sendo sua experiência na academia?</h2><div>{[1, 2, 3, 4, 5].map((score) => <button className={score <= student.satisfaction ? 'active' : ''} key={score} onClick={() => rate(score)}><Star /></button>)}</div><textarea value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Gostaria de deixar um comentário?" /><button className="esaFeedbackButton" onClick={saveFeedback}>Enviar avaliação</button>{feedbackMessage && <p>{feedbackMessage}</p>}</div></section><section className="esaBadges"><h2>Suas conquistas</h2><div>{(student.gamification?.badges || []).map((badge) => <span key={badge}><Award /> {badge}</span>)}</div></section></>
}

function EleveStudentApp() {
  const [state, setStateRaw] = useState(loadState)
  const [tab, setTab] = useState('home')
  const [completed, setCompleted] = useState({})
  const accessToken = decodeURIComponent(window.location.pathname.replace(`${BASE_PATH}/aluno/`, '').split('/')[0] || '')
  const student = state.students.find((item) => item.id === accessToken || item.appToken === accessToken || item.inviteToken === accessToken) || state.students.find((item) => item.id === 'aluno-ana')
  const [authenticated, setAuthenticated] = useState(() => !student.auth?.passwordHash)
  const [login, setLogin] = useState({ email: student.email || '', password: '' })
  const [loginError, setLoginError] = useState('')
  const plan = state.plans.find((item) => item.id === student.planId)
  const trainer = state.trainers.find((item) => item.id === student.trainerId)
  const workout = useMemo(() => (state.workouts || []).find((item) => item.studentId === student.id), [state, student.id])
  function setState(next) { setStateRaw(next); localStorage.setItem(STORAGE_KEY, JSON.stringify(createEleveSafeStorageState(next))) }
  function toggleExercise(id) { setCompleted((current) => ({ ...current, [id]: !current[id] })) }
  function finishWorkout() {
    const next = { ...state, students: state.students.map((item) => item.id === student.id ? { ...item, frequency30d: item.frequency30d + 1, gamification: { ...item.gamification, xp: item.gamification.xp + 120, weeklyDone: Math.min(item.gamification.weeklyGoal, item.gamification.weeklyDone + 1) } } : item) }
    setState(next); setCompleted({}); setTab('home')
  }
  async function authenticate() {
    try {
      const passwordHash = await hashElevePassword(login.password)
      if (login.email.toLowerCase() !== student.auth.email.toLowerCase() || passwordHash !== student.auth.passwordHash) throw new Error('E-mail ou senha inválidos.')
      setAuthenticated(true); setLoginError('')
    } catch (error) { setLoginError(error.message) }
  }
  if (!authenticated) return <div className="esaLogin"><main><div className="esaLoginBrand"><b>{state.academy.brandMark || 'SH▲PP'}</b><small>APP DO ALUNO</small></div><p>ACESSO INDIVIDUAL</p><h1>Entre para continuar.</h1><span>Use o e-mail e a senha definidos na ativação do aplicativo.</span><label>E-mail<input type="email" value={login.email} onChange={(event) => setLogin({ ...login, email: event.target.value })} /></label><label>Senha<div><LockKeyhole /><input type="password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} /></div></label>{loginError && <em>{loginError}</em>}<button onClick={authenticate}>Entrar no aplicativo</button></main></div>
  let content = <StudentHome state={state} student={student} plan={plan} trainer={trainer} workout={workout} setTab={setTab} />
  if (tab === 'workout') content = <Workout workout={workout} completed={completed} toggleExercise={toggleExercise} finishWorkout={finishWorkout} />
  if (tab === 'agenda') content = <Agenda state={state} setState={setState} student={student} />
  if (tab === 'progress') content = <ProgressPage student={student} />
  if (tab === 'profile') content = <Profile state={state} setState={setState} student={student} plan={plan} trainer={trainer} />
  return <div className={`esaPage ${IS_ELEVE ? 'isEleve' : ''}`}><header className="esaTop"><a href={BASE_PATH}><b>{state.academy.brandMark || 'SH▲PP'}</b><small>APP DO ALUNO</small></a><span><Flame /> {student.gamification?.streak || 0}</span></header><main>{content}</main><nav>{tabs.map(([id, label, Icon]) => <button className={tab === id ? 'active' : ''} key={id} onClick={() => setTab(id)}><Icon /><span>{label}</span></button>)}</nav></div>
}

createRoot(document.getElementById('root')).render(<EleveStudentApp />)
