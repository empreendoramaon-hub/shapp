import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { QRCodeCanvas } from 'qrcode.react'
import {
  Activity,
  Bell,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  Droplets,
  Dumbbell,
  Flame,
  HeartPulse,
  Home,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserRound,
  Users
} from 'lucide-react'
import { hasSotaliaFirebaseConfig, loadSotaliaActivities, loadSotaliaMember, saveSotaliaActivity, saveSotaliaEvent, saveSotaliaMember } from './sotaliaFirebase.js'
import {
  createSotaliaMember,
  filterFutureSotaliaActivities,
  formatSotaliaDate,
  getSotaliaMemberStorageKey,
  nextSotaliaWorkout,
  readLocalSotaliaMember,
  readSotaliaInvite,
  sotaliaAcademy as academy,
  sotaliaAssets as assets,
  sotaliaSchedule,
  sotaliaWhatsappUrl,
  sotaliaNameFromToken,
  sotaliaCapacityLabel,
  sotaliaConfirmedMembers,
  sotaliaCapacityTotal,
  uniqueSotaliaIds,
  writeLocalSotaliaMember
} from './sotaliaData.js'
import './sotaliaApp.css'

const LAST_MEMBER_ID_KEY = 'sotaliaLastMemberId'
const invite = readSotaliaInvite(window.location.search)
const requestedMemberId = new URLSearchParams(window.location.search).get('m')
const MEMBER_ID = requestedMemberId || invite?.member?.id || localStorage.getItem(LAST_MEMBER_ID_KEY) || ''
function withScheduleIcon(item) {
  const type = String(item.type || '').toLocaleLowerCase('pt-BR')
  return {
    ...item,
    icon: type.includes('agua') || type.includes('hidro') ? Droplets : type.includes('natacao') || type.includes('tecnica') ? HeartPulse : type.includes('cardio') || type.includes('coletiva') ? Activity : Dumbbell
  }
}

function normalizeSchedule(items = []) {
  return items.map(withScheduleIcon).sort((a, b) => `${a.date || ''} ${a.time || ''}`.localeCompare(`${b.date || ''} ${b.time || ''}`))
}

const defaultSchedule = normalizeSchedule(sotaliaSchedule)

const highlights = [
  { title: 'Piscina semiolimpica', text: 'Agenda de natacao, hidro e raia livre em um so lugar.', image: assets.pool, icon: Droplets },
  { title: 'Estrutura de 2.000 m2', text: 'Musculacao, cardio e aulas com historico do aluno.', image: assets.strength, icon: Dumbbell },
  { title: 'Toda a familia', text: 'Perfis conectados para responsaveis acompanharem filhos.', image: assets.kids, icon: Users }
]

const notices = [
  { id: 'n1', title: 'Evento aberto', text: 'A recepcao pode divulgar eventos, feriados e ajustes de horarios pelo app.' },
  { id: 'n2', title: 'Tour 360', text: 'Atalho para a experiencia virtual da estrutura Sotalia dentro do app.' }
]

function loadLocalMember() {
  if (!MEMBER_ID) return null
  if (hasSotaliaFirebaseConfig && MEMBER_ID !== 'demo-marina') return null
  return readLocalSotaliaMember(MEMBER_ID)
}

function persistDemoMember(member) {
  if (!hasSotaliaFirebaseConfig || member.id === 'demo-marina') {
    writeLocalSotaliaMember(member)
  }
}

function normalizeMemberBookingState(member) {
  const confirmations = member.bookingConfirmations || []
  const confirmedIds = uniqueSotaliaIds(confirmations.map((confirmation) => confirmation.classId))
  const legacyPending = (member.bookedClasses || []).filter((classId) => !confirmedIds.includes(classId))
  return {
    ...member,
    bookedClasses: confirmedIds,
    pendingBookings: uniqueSotaliaIds([...(member.pendingBookings || []), ...legacyPending]).filter((classId) => !confirmedIds.includes(classId)),
    bookingConfirmations: confirmations
  }
}

async function readMemberFromSource() {
  if (!MEMBER_ID) return null
  if (invite?.member?.id === MEMBER_ID) {
    const invited = normalizeMemberBookingState(createSotaliaMember(invite.member))
    writeLocalSotaliaMember(invited)
    return invited
  }
  const localMember = readLocalSotaliaMember(MEMBER_ID)
  const baseMember = localMember || createSotaliaMember({
    id: MEMBER_ID,
    name: sotaliaNameFromToken(MEMBER_ID),
    workouts: [],
    bookedClasses: [],
    bookingConfirmations: []
  })
  const remote = await loadSotaliaMember(MEMBER_ID)
  if (remote) {
    const merged = normalizeMemberBookingState(createSotaliaMember({ ...baseMember, ...remote, id: MEMBER_ID }))
    writeLocalSotaliaMember(merged)
    return merged
  }
  if (!hasSotaliaFirebaseConfig || MEMBER_ID === 'demo-marina') {
    const local = loadLocalMember()
    if (local) return normalizeMemberBookingState(local)
  }
  const fallback = normalizeMemberBookingState(baseMember)
  writeLocalSotaliaMember(fallback)
  return fallback
}

function AppButton({ children, onClick, href, variant = 'dark' }) {
  const className = `saButton ${variant}`
  if (href) return <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>
  return <button className={className} type="button" onClick={onClick}>{children}</button>
}

function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null)
  const [message, setMessage] = useState('')
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    let manifestLink = document.querySelector('link[rel="manifest"]')
    if (!manifestLink) {
      manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      document.head.appendChild(manifestLink)
    }
    manifestLink.href = '/sotalia-manifest.webmanifest'
    manifestLink.dataset.sotaliaApp = 'true'

    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]')
    if (!appleIcon) {
      appleIcon = document.createElement('link')
      appleIcon.rel = 'apple-touch-icon'
      document.head.appendChild(appleIcon)
    }
    appleIcon.href = '/sotalia-icon-192.png'

    let themeColor = document.querySelector('meta[name="theme-color"]')
    if (!themeColor) {
      themeColor = document.createElement('meta')
      themeColor.name = 'theme-color'
      document.head.appendChild(themeColor)
    }
    themeColor.content = '#c90016'

    const appleMeta = {
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
      'apple-mobile-web-app-title': 'Sotalia'
    }
    Object.entries(appleMeta).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = name
        document.head.appendChild(meta)
      }
      meta.content = content
    })

    const standaloneQuery = window.matchMedia?.('(display-mode: standalone)')
    const detectStandalone = () => Boolean(standaloneQuery?.matches || window.navigator.standalone)
    setIsStandalone(detectStandalone())

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).then((registration) => registration.update()).catch(() => {})
    }

    function handleBeforeInstallPrompt(event) {
      event.preventDefault()
      setPromptEvent(event)
      setMessage('')
    }

    function handleInstalled() {
      setMessage('Acesso adicionado a tela inicial deste dispositivo.')
      setPromptEvent(null)
      setIsStandalone(true)
    }

    function handleStandaloneChange() {
      setIsStandalone(detectStandalone())
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    standaloneQuery?.addEventListener?.('change', handleStandaloneChange)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      standaloneQuery?.removeEventListener?.('change', handleStandaloneChange)
    }
  }, [])

  async function installApp() {
    if (isStandalone) {
      setMessage('O app ja esta instalado neste celular.')
      return
    }

    if (!promptEvent) {
      setMessage('Se a janela nao abrir, toque no menu do navegador e escolha Adicionar a tela inicial. No iPhone, use Compartilhar e depois Adicionar a Tela de Inicio.')
      return
    }

    promptEvent.prompt()
    const choice = await promptEvent.userChoice
    setPromptEvent(null)
    setMessage(choice.outcome === 'accepted' ? 'Acesso adicionado ao celular.' : 'Adicao cancelada.')
  }

  return { installApp, message, canInstall: Boolean(promptEvent), isStandalone }
}

function InstallPanel({ member, setMember, installApp, installMessage, canInstall, isStandalone, variant = 'profile' }) {
  const acceptedCurrentTerms = member.termsVersion === academy.termsVersion && member.privacyVersion === academy.privacyVersion && Boolean(member.termsAcceptedAt)

  async function acceptTermsAndInstall() {
    const acceptedAt = new Date().toISOString()
    const updated = {
      ...member,
      termsAcceptedAt: acceptedAt,
      termsVersion: academy.termsVersion,
      privacyVersion: academy.privacyVersion
    }
    persistDemoMember(updated)
    setMember(updated)
    await saveSotaliaMember(member.id, {
      termsAcceptedAt: acceptedAt,
      termsVersion: academy.termsVersion,
      privacyVersion: academy.privacyVersion
    })
    await saveSotaliaEvent({ type: 'terms-accepted', memberId: member.id, termsVersion: academy.termsVersion, source: 'sotalia-app' })
    await installApp()
  }

  return (
    <div className={`saInstallPanel ${variant === 'home' ? 'saInstallPanelHome' : ''}`}>
      <Download size={24} />
      <div>
        <strong>{isStandalone ? 'App instalado no celular' : 'Baixar App Sotalia no celular'}</strong>
        <span>{acceptedCurrentTerms ? 'Termos aceitos. Toque no botao para instalar o app na tela inicial.' : `Ao tocar no botao, voce aceita os Termos de Uso versao ${academy.termsVersion} e a Politica de Privacidade versao ${academy.privacyVersion}.`}</span>
      </div>
      <button type="button" onClick={acceptTermsAndInstall}>{isStandalone ? 'App ja instalado' : acceptedCurrentTerms ? 'Baixar app no celular' : 'Aceitar termos e baixar app'}</button>
      <small>{canInstall ? 'O navegador abrira a confirmacao de instalacao.' : 'Android: menu do navegador > Instalar app. iPhone: Compartilhar > Adicionar a Tela de Inicio.'}</small>
      {installMessage && <p>{installMessage}</p>}
    </div>
  )
}

function HomeTab({ member, setMember, onCheckin, setTab, schedule, installApp, installMessage, canInstall, isStandalone }) {
  const progress = Math.min(100, Math.round((member.checkinsMonth / Math.max(member.monthlyGoal, 1)) * 100))
  const xp = member.xp || 0
  const level = member.level || 1
  const xpInLevel = xp % 240
  const nextLevelProgress = Math.round((xpInLevel / 240) * 100)
  const remainingCheckins = Math.max(0, member.monthlyGoal - member.checkinsMonth)
  const motivation = progress >= 100
    ? { emoji: '\u{1f3c6}', title: 'Meta batida', text: 'Voce fechou a meta do mes. Agora e manter o ritmo e proteger essa conquista.' }
    : progress >= 70
      ? { emoji: '\u{1f525}', title: 'Reta final', text: `Faltam ${remainingCheckins} check-ins para completar sua meta. Voce ja fez a parte mais dificil.` }
      : progress >= 35
        ? { emoji: '\u{1f4aa}', title: 'Ritmo bom', text: `Voce ja cumpriu ${progress}% da meta. Um treino por vez, sem precisar ser perfeito.` }
        : { emoji: '\u2728', title: 'Comeco conta muito', text: 'Hoje e um bom dia para somar pontos. Faca o possivel e volte amanha.' }
  const nextClass = schedule.find((item) => member.bookedClasses.includes(item.id)) || schedule[0]
  const workout = nextSotaliaWorkout(member)

  return (
    <>
      <section className="saHero">
        <div className="saHeroMedia"><img src={assets.hero} alt="Academia Sotalia Sports" /></div>
        <div className="saHeroTop">
          <img src={assets.logo} alt="Sotalia Sports" />
          <span>{MEMBER_ID === 'demo-marina' ? 'Modo demo' : 'Acesso exclusivo'}</span>
        </div>
        <div className="saHeroCopy">
          <p>{academy.location}</p>
          <h1>Ola, {member.name.split(' ')[0]}.</h1>
          <span>Seu app Sotalia para treinar, nadar, reservar aulas e acompanhar a familia.</span>
          <div className="saHeroChart" aria-hidden="true">
            <span style={{ height: '28%' }} />
            <span style={{ height: '44%' }} />
            <span style={{ height: '38%' }} />
            <span style={{ height: '62%' }} />
            <span style={{ height: '74%' }} />
            <span style={{ height: `${Math.max(18, progress)}%` }} />
          </div>
          <div className="saHeroMiniStats">
            <strong>{progress}%</strong>
            <span>da meta mensal</span>
            <strong>{xp}</strong>
            <span>XP acumulado</span>
          </div>
          <AppButton onClick={onCheckin}>Fazer check-in <CheckCircle2 size={19} /></AppButton>
        </div>
      </section>

      <section className="saContent">
        <div className="saGamePanel">
          <div className="saGameHeader">
            <span>{motivation.emoji}</span>
            <div>
              <small>Meta e pontuacao</small>
              <strong>{motivation.title}</strong>
              <p>{motivation.text}</p>
            </div>
          </div>
          <div className="saGameStats">
            <article><strong>{member.checkinsMonth}/{member.monthlyGoal}</strong><span>Meta do mes</span></article>
            <article><strong>{xp}</strong><span>XP total</span></article>
            <article><strong>{level}</strong><span>Nivel</span></article>
            <article><strong>{member.streak}</strong><span>Dias seguidos</span></article>
          </div>
          <div className="saProgressBlock">
            <div><small>Progresso da meta</small><b>{progress}%</b></div>
            <div className="saProgress"><span style={{ width: `${progress}%` }} /></div>
          </div>
          <div className="saProgressBlock">
            <div><small>Proximo nivel</small><b>{240 - xpInLevel} XP para subir</b></div>
            <div className="saLevelProgress"><span style={{ width: `${nextLevelProgress}%` }} /></div>
          </div>
          <p className="saGameFoot"><Flame size={16} /> Proxima avaliacao em {formatSotaliaDate(member.nextAssessment)}. Finalizar um treino soma +90 XP.</p>
        </div>

        <InstallPanel
          member={member}
          setMember={setMember}
          installApp={installApp}
          installMessage={installMessage}
          canInstall={canInstall}
          isStandalone={isStandalone}
          variant="home"
        />

        <button className="saNextClass saWorkoutShortcut" type="button" onClick={() => setTab('treino')}>
          <img src={assets.strength} alt="" />
          <span>
            <small>Treino montado pelo personal</small>
            <strong>{workout.name} - {workout.focus}</strong>
            <em>{workout.exercises.length} exercicios - +90 XP ao finalizar <ChevronRight size={17} /></em>
          </span>
        </button>

        <button className="saNextClass" type="button" onClick={() => setTab('agenda')}>
          <img src={nextClass.image} alt="" />
          <span>
            <small>Proxima reserva</small>
            <strong>{nextClass.time} - {nextClass.title}</strong>
            <em>{nextClass.place} <ChevronRight size={17} /></em>
          </span>
        </button>

        <div className="saQuickGrid">
          <button type="button" onClick={() => setTab('agua')}><Droplets /><strong>Piscina</strong><span>Hidro, natacao e raias</span></button>
          <button type="button" onClick={() => setTab('evolucao')}><BarChart3 /><strong>Evolucao</strong><span>Medidas e metricas</span></button>
          <a href={sotaliaWhatsappUrl('Ola Sotalia! Quero falar com a recepcao pelo app.')} target="_blank" rel="noreferrer"><MessageCircle /><strong>WhatsApp</strong><span>Recepcao Sotalia</span></a>
        </div>

        <section className="saSectionTitle">
          <small>Experiencias</small>
          <h2>Produto digital para a academia.</h2>
        </section>
        <div className="saHighlights">
          {highlights.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title}>
                <img src={item.image} alt="" />
                <div>
                  <Icon size={20} />
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}

function AgendaTab({ member, setMember, schedule, setSchedule }) {
  const confirmations = member.bookingConfirmations || []
  const recentConfirmations = confirmations.slice(0, 3)

  function confirmationFor(item) {
    return confirmations.find((confirmation) => confirmation.classId === item.id)
  }

  async function updateActivityVacancies(item, memberId, shouldConfirm) {
    const currentConfirmed = sotaliaConfirmedMembers(item)
    const confirmedMembers = shouldConfirm
      ? uniqueSotaliaIds([...currentConfirmed, memberId])
      : currentConfirmed.filter((id) => id !== memberId)
    const capacityTotal = sotaliaCapacityTotal(item)
    const updatedActivity = {
      ...item,
      confirmedMembers,
      confirmedCount: confirmedMembers.length,
      capacityTotal: capacityTotal || item.capacityTotal
    }
    setSchedule((current) => current.map((activity) => activity.id === item.id ? { ...activity, ...updatedActivity } : activity))
    await saveSotaliaActivity(updatedActivity)
  }

  async function toggleBooking(item) {
    const confirmed = member.bookedClasses.includes(item.id) && Boolean(confirmationFor(item))
    const pending = (member.pendingBookings || []).includes(item.id)
    const bookedClasses = confirmed ? member.bookedClasses.filter((id) => id !== item.id) : member.bookedClasses
    const pendingBookings = pending
      ? (member.pendingBookings || []).filter((id) => id !== item.id)
      : confirmed
        ? (member.pendingBookings || [])
        : uniqueSotaliaIds([...(member.pendingBookings || []), item.id])
    const bookingConfirmations = confirmed ? confirmations.filter((confirmation) => confirmation.classId !== item.id) : confirmations
    const updated = { ...member, bookedClasses, pendingBookings, bookingConfirmations }
    persistDemoMember(updated)
    setMember(updated)
    await saveSotaliaMember(member.id, { bookedClasses, pendingBookings, bookingConfirmations })
    if (confirmed) await updateActivityVacancies(item, member.id, false)
    await saveSotaliaEvent({
      type: confirmed || pending ? 'booking-cancelled' : 'booking-created',
      memberId: member.id,
      memberName: member.name,
      classId: item.id,
      classDate: item.date || '',
      classTitle: item.title,
      classTime: item.time,
      classPlace: item.place,
      source: 'sotalia-app'
    })
  }

  return (
    <section className="saPage">
      <header className="saPageHeader">
        <p><CalendarDays size={16} /> Agenda</p>
        <h1>Agenda de atividades</h1>
      </header>
      {recentConfirmations.length > 0 && (
        <div className="saAgendaNotice">
          <CheckCircle2 />
          <span>
            <strong>{recentConfirmations[0].classTitle || 'Reserva confirmada'}</strong>
            <em>{recentConfirmations[0].message || `Confirmada pela Sotalia${recentConfirmations[0].classTime ? ` as ${recentConfirmations[0].classTime}` : ''}.`}</em>
          </span>
        </div>
      )}
      <div className="saScheduleList">
        {schedule.map((item) => {
          const Icon = item.icon
          const confirmation = confirmationFor(item)
          const confirmed = member.bookedClasses.includes(item.id) && Boolean(confirmation)
          const pending = !confirmed && (member.pendingBookings || []).includes(item.id)
          const booked = confirmed || pending
          return (
            <article key={item.id} className={`${booked ? 'isBooked' : ''} ${confirmed ? 'isConfirmed' : ''} ${pending ? 'isPending' : ''}`.trim()}>
              <img src={item.image} alt="" />
              <div>
                <small><Clock3 size={14} /> {item.date || 'Hoje'} - {item.time} - {item.type}</small>
                <h2>{item.title}</h2>
                <p>{item.place} com {item.coach}</p>
                <span>{sotaliaCapacityLabel(item)}</span>
                {booked && (
                  <em className="saBookingConfirmation">
                    {confirmed ? (confirmation.message || 'Reserva confirmada pela Sotalia.') : 'Pedido enviado. Aguardando confirmacao da academia.'}
                  </em>
                )}
              </div>
              <button type="button" onClick={() => toggleBooking(item)}>
                {booked ? <CheckCircle2 /> : <Icon />} {confirmed ? 'Confirmada' : pending ? 'Aguardando' : 'Reservar'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function WorkoutTab({ member, setMember }) {
  const workout = nextSotaliaWorkout(member)
  const [done, setDone] = useState([])
  const complete = workout.exercises.length > 0 && done.length === workout.exercises.length

  function toggle(index) {
    setDone((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])
  }

  async function finishWorkout() {
    if (!complete) return
    const updated = {
      ...member,
      checkinsMonth: member.checkinsMonth + 1,
      streak: member.streak + 1,
      xp: (member.xp || 0) + 90,
      level: Math.max(member.level || 1, Math.floor(((member.xp || 0) + 90) / 240) + 1)
    }
    persistDemoMember(updated)
    setMember(updated)
    setDone([])
    await saveSotaliaMember(member.id, {
      checkinsMonth: updated.checkinsMonth,
      streak: updated.streak,
      xp: updated.xp,
      level: updated.level
    })
    await saveSotaliaEvent({ type: 'workout-finished', memberId: member.id, workoutId: workout.id })
  }

  return (
    <section className="saPage">
      <header className="saWorkoutHero">
        <img src={assets.strength} alt="Treino Sotalia" />
        <div>
          <p><Dumbbell size={16} /> Sequencia {workout.sequence || 1}</p>
          <h1>{workout.name}</h1>
          <span>{workout.focus} por {member.trainer || 'Equipe Sotalia'}</span>
        </div>
      </header>

      <div className="saWorkoutSummary">
        <article><strong>{workout.exercises.length}</strong><span>exercicios</span></article>
        <article><strong>{done.length}</strong><span>concluidos</span></article>
        <article><strong>{member.level || 1}</strong><span>nivel</span></article>
      </div>

      <div className="saExerciseList">
        {workout.exercises.map((exercise, index) => (
          <article key={`${exercise.name}-${index}`} className={done.includes(index) ? 'isDone' : ''}>
            <button type="button" onClick={() => toggle(index)}>{done.includes(index) ? <CheckCircle2 /> : index + 1}</button>
            <div>
              <h2>{exercise.name}</h2>
              <p>{exercise.sets} series - {exercise.reps} reps - descanso {exercise.rest}</p>
              <span>Carga: {exercise.load}. {exercise.tip}</span>
            </div>
          </article>
        ))}
      </div>

      <button className="saFinishWorkout" type="button" disabled={!complete} onClick={finishWorkout}>
        Finalizar treino +90 XP
      </button>
    </section>
  )
}

function ProgressTab({ member }) {
  const last = member.assessments?.[0]
  const progress = Math.min(100, Math.round((member.checkinsMonth / Math.max(member.monthlyGoal, 1)) * 100))
  const levelProgress = Math.round(((member.xp || 0) % 240) / 240 * 100)
  const chartBars = [42, 58, 46, 72, 64, Math.max(18, progress)]
  const weightDelta = Number(((last?.weight || member.weight) - member.weight).toFixed(1))
  const bodyFat = last?.bodyFat || member.bodyFat
  const muscleMass = last?.muscleMass || member.muscleMass

  return (
    <section className="saPage">
      <header className="saPageHeader saProgressHeader">
        <p><BarChart3 size={16} /> Evolucao</p>
        <h1>Metricas do aluno</h1>
      </header>

      <div className="saMetricGrid">
        <article><strong>{member.checkinsMonth}/{member.monthlyGoal}</strong><span>treinos no mes</span></article>
        <article><strong>{member.xp || 0}</strong><span>XP acumulado</span></article>
        <article><strong>{member.streak}</strong><span>dias em sequencia</span></article>
        <article><strong>{member.level || 1}</strong><span>nivel atual</span></article>
      </div>

      <div className="saProgressPanel">
        <div><small>Frequencia mensal</small><strong>{progress}%</strong></div>
        <div className="saProgress"><span style={{ width: `${progress}%` }} /></div>
        <p>Meta acompanhada pelo personal e pela recepcao.</p>
      </div>

      <section className="saChartCard">
        <div>
          <small>Grafico semanal</small>
          <strong>Constancia de treino</strong>
        </div>
        <div className="saBarChart" aria-label="Grafico de frequencia semanal">
          {chartBars.map((value, index) => <span key={index} style={{ height: `${value}%` }} />)}
        </div>
        <p>{progress >= 70 ? 'Sua frequencia esta forte nesta semana.' : 'Cada check-in aumenta sua barra de evolucao.'}</p>
      </section>

      <section className="saBodyCharts">
        <article>
          <div className="saRingChart" style={{ '--value': `${Math.min(100, Math.max(0, bodyFat)) * 3.6}deg` }}>
            <strong>{bodyFat}%</strong>
          </div>
          <span>Gordura corporal</span>
        </article>
        <article>
          <div className="saRingChart mint" style={{ '--value': `${Math.min(100, Math.max(0, muscleMass * 2)) * 3.6}deg` }}>
            <strong>{muscleMass} kg</strong>
          </div>
          <span>Massa magra</span>
        </article>
        <article>
          <div className="saRingChart dark" style={{ '--value': `${levelProgress * 3.6}deg` }}>
            <strong>{levelProgress}%</strong>
          </div>
          <span>Proximo nivel</span>
        </article>
      </section>

      <article className="saAssessmentCard">
        <small>Ultima avaliacao</small>
        <h2>{member.goal}</h2>
        <div>
          <span><strong>{last?.weight || member.weight} kg</strong>Peso</span>
          <span><strong>{last?.bodyFat || member.bodyFat}%</strong>Gordura</span>
          <span><strong>{last?.muscleMass || member.muscleMass} kg</strong>Massa magra</span>
        </div>
        <p>{last?.note || 'Avaliacao pendente.'} {weightDelta !== 0 ? `Variacao de peso: ${weightDelta > 0 ? '+' : ''}${weightDelta} kg.` : ''}</p>
      </article>
    </section>
  )
}

function WaterTab() {
  return (
    <section className="saPage">
      <header className="saWaterHero">
        <img src={assets.pool} alt="Piscina da Sotalia Sports" />
        <div>
          <p><Droplets size={16} /> Area aquatica</p>
          <h1>Piscina, hidro e natacao.</h1>
          <span>Um modulo dedicado para reservas, raias, turmas e comunicados da piscina.</span>
        </div>
      </header>
      <div className="saWaterGrid">
        <article><strong>06:00 - 22:00</strong><span>Janela operacional</span></article>
        <article><strong>Ozonizada</strong><span>Comunicacao tecnica para alunos</span></article>
        <article><strong>Raias</strong><span>Reserva futura por horario</span></article>
      </div>
      <AppButton href={sotaliaWhatsappUrl('Ola Sotalia! Quero informacoes sobre natacao e hidro.')}>Falar sobre agua <MessageCircle size={18} /></AppButton>
    </section>
  )
}

function activityMatchesChild(activity, person) {
  const haystack = `${activity.title || ''} ${activity.type || ''} ${activity.place || ''}`.toLocaleLowerCase('pt-BR')
  const childActivities = Array.isArray(person.activities) ? person.activities : String(person.activities || '').split(',')
  const tokens = [person.modality, ...childActivities]
    .filter(Boolean)
    .flatMap((item) => String(item).toLocaleLowerCase('pt-BR').split(/\s+|\+/))
    .filter((item) => item.length > 3)
  return tokens.some((token) => haystack.includes(token))
}

function ProfileTab({ member, setMember, installApp, installMessage, canInstall, isStandalone, schedule }) {
  const qrValue = `${window.location.origin}/sotalia-app?m=${member.id}`

  return (
    <section className="saPage">
      <header className="saProfileHeader">
        <div>{member.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
        <h1>{member.name}</h1>
        <p>{member.plan} - matricula ativa</p>
      </header>

      <div className="saQrPanel">
        <QRCodeCanvas value={qrValue} size={168} level="H" includeMargin />
        <span>Carteirinha digital Sotalia</span>
      </div>

      <InstallPanel
        member={member}
        setMember={setMember}
        installApp={installApp}
        installMessage={installMessage}
        canInstall={canInstall}
        isStandalone={isStandalone}
      />

      <div className="saFamilyList">
        <h2>Familia conectada</h2>
        {member.family.map((person) => {
          const activityList = Array.isArray(person.activities) ? person.activities : String(person.activities || '').split(',').map((item) => item.trim()).filter(Boolean)
          const registeredActivities = activityList.length ? activityList : [person.modality].filter(Boolean)
          const nextActivities = schedule.filter((activity) => activityMatchesChild(activity, person)).slice(0, 2)
          return (
            <article key={person.name}>
              <Users size={18} />
              <div>
                <strong>{person.name}</strong>
                <span>{person.modality} - {person.status}</span>
                <div className="saFamilyTags">
                  {registeredActivities.map((activity) => <em key={activity}>{activity}</em>)}
                </div>
                <div className="saChildSchedule">
                  {nextActivities.length ? nextActivities.map((activity) => (
                    <small key={activity.id}>{activity.date || 'Hoje'} - {activity.time} - {activity.title}</small>
                  )) : <small>Nenhuma aula vinculada na agenda de hoje.</small>}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <div className="saPrivacy">
        <ShieldCheck size={22} />
        <div>
          <strong>Privacidade e LGPD</strong>
          <span>Versao {academy.privacyVersion}. Dados preparados para Firestore por academia, aluno e eventos.</span>
        </div>
      </div>
    </section>
  )
}

function SotaliaApp() {
  const [tab, setTab] = useState('home')
  const [member, setMember] = useState(loadLocalMember)
  const [schedule, setSchedule] = useState(defaultSchedule)
  const { installApp, message: installMessage, canInstall, isStandalone } = useInstallPrompt()
  const todaySchedule = useMemo(() => {
    const upcoming = filterFutureSotaliaActivities(schedule)
    return upcoming.length ? upcoming : defaultSchedule
  }, [schedule])

  useEffect(() => {
    document.title = 'Sotalia App | Acesso do aluno'
  }, [])

  useEffect(() => {
    let alive = true

    async function syncActivities() {
      try {
        const remote = await loadSotaliaActivities()
        if (!alive) return
        const merged = [...defaultSchedule, ...(invite?.activities || []), ...(remote || [])]
        const byId = new Map()
        merged.forEach((item) => {
          byId.set(item.id, { ...(byId.get(item.id) || {}), ...item })
        })
        setSchedule(normalizeSchedule([...byId.values()]))
      } catch {}
    }

    syncActivities()
    const interval = window.setInterval(syncActivities, 30000)
    return () => {
      alive = false
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (!MEMBER_ID) return undefined
    if (requestedMemberId) localStorage.setItem(LAST_MEMBER_ID_KEY, requestedMemberId)

    let alive = true
    readMemberFromSource()
      .then((remote) => {
        if (!alive) return
        if (!remote) {
          if (hasSotaliaFirebaseConfig && MEMBER_ID !== 'demo-marina') {
            localStorage.removeItem(getSotaliaMemberStorageKey(MEMBER_ID))
            if (localStorage.getItem(LAST_MEMBER_ID_KEY) === MEMBER_ID) localStorage.removeItem(LAST_MEMBER_ID_KEY)
            setMember(null)
          }
          return
        }
        setMember(remote)
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!MEMBER_ID) return undefined
    let alive = true

    async function syncCurrentMember() {
      try {
        const current = await readMemberFromSource()
        if (alive && current) setMember(current)
      } catch {}
    }

    const interval = window.setInterval(syncCurrentMember, 12000)
    return () => {
      alive = false
      window.clearInterval(interval)
    }
  }, [])

  const unread = useMemo(() => notices.filter((notice) => !(member?.noticesRead || []).includes(notice.id)).length, [member?.noticesRead])

  if (!member) {
    const accessWasProvided = Boolean(MEMBER_ID)
    return (
      <main className="sotaliaApp">
        <div className="saPhoneSurface">
          <section className="saRemovedAccess">
            <img src={assets.logo} alt="Sotalia Sports" />
            <ShieldCheck size={42} />
            <h1>{accessWasProvided ? 'Acesso nao encontrado.' : 'Acesso exclusivo para alunos.'}</h1>
            <p>{accessWasProvided
              ? 'Este convite nao esta ativo na base da Sotalia. Solicite um novo acesso na recepcao.'
              : 'O App Sotalia nao e distribuido em lojas. Cada aluno recebe da academia um link ou QR Code individual, vinculado a sua matricula.'}</p>
          </section>
        </div>
      </main>
    )
  }

  async function checkin() {
    const updated = {
      ...member,
      streak: member.streak + 1,
      checkinsMonth: member.checkinsMonth + 1
    }
    persistDemoMember(updated)
    setMember(updated)
    await saveSotaliaMember(member.id, { streak: updated.streak, checkinsMonth: updated.checkinsMonth, lastCheckinAt: new Date().toISOString() })
    await saveSotaliaEvent({ type: 'checkin', memberId: member.id, source: 'sotalia-app' })
  }

  return (
    <main className="sotaliaApp">
      <div className="saDesktopRail">
        <img src={assets.logo} alt="Sotalia Sports" />
        <h2>App Sotalia</h2>
        <p>Experiencia digital privada para alunos e familias, com acesso individual liberado pela academia.</p>
        <div><ShieldCheck size={17} /> Exclusivo para matriculas ativas</div>
        <div><MapPin size={17} /> {academy.location}</div>
        <div><Bell size={17} /> {unread} comunicados novos</div>
      </div>

      <div className="saPhoneSurface">
        {tab === 'home' && <HomeTab member={member} setMember={setMember} onCheckin={checkin} setTab={setTab} schedule={todaySchedule} installApp={installApp} installMessage={installMessage} canInstall={canInstall} isStandalone={isStandalone} />}
        {tab === 'treino' && <WorkoutTab member={member} setMember={setMember} />}
        {tab === 'agenda' && <AgendaTab member={member} setMember={setMember} schedule={todaySchedule} setSchedule={setSchedule} />}
        {tab === 'evolucao' && <ProgressTab member={member} />}
        {tab === 'agua' && <WaterTab />}
        {tab === 'perfil' && <ProfileTab member={member} setMember={setMember} installApp={installApp} installMessage={installMessage} canInstall={canInstall} isStandalone={isStandalone} schedule={todaySchedule} />}
      </div>

      <nav className="saBottomNav">
        <button className={tab === 'home' ? 'active' : ''} onClick={() => setTab('home')}><Home /><span>Inicio</span></button>
        <button className={tab === 'treino' ? 'active' : ''} onClick={() => setTab('treino')}><Dumbbell /><span>Treino</span></button>
        <button className={tab === 'agenda' ? 'active' : ''} onClick={() => setTab('agenda')}><CalendarDays /><span>Agenda</span></button>
        <button className={tab === 'evolucao' ? 'active' : ''} onClick={() => setTab('evolucao')}><BarChart3 /><span>Metricas</span></button>
        <button className={tab === 'perfil' ? 'active' : ''} onClick={() => setTab('perfil')}><UserRound /><span>Perfil</span></button>
      </nav>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<SotaliaApp />)
