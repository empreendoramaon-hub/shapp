import React, { Component, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { QRCodeCanvas } from 'qrcode.react'
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  Copy,
  Dumbbell,
  ExternalLink,
  Plus,
  QrCode,
  Save,
  ShieldCheck,
  LogIn,
  LogOut,
  Sparkles,
  Trash2,
  UserPlus,
  Users
} from 'lucide-react'
import {
  deleteSotaliaMember,
  deleteSotaliaActivity,
  deleteSotaliaEvent,
  hasSotaliaFirebaseConfig,
  loadSotaliaActivities,
  loadSotaliaEvents,
  loadSotaliaMembers,
  saveSotaliaActivity,
  saveSotaliaEvent,
  saveSotaliaMember,
  signInSotaliaAdmin,
  signOutSotaliaAdmin,
  subscribeToAdminSession
} from './sotaliaFirebase.js'
import {
	  cloneSotaliaWorkouts,
	  createSotaliaMember,
	  createSotaliaToken,
	  deleteLocalSotaliaMember,
	  filterFutureSotaliaActivities,
	  readLocalSotaliaWorkoutTemplates,
	  readLocalSotaliaMembers,
	  sotaliaDateToISO,
	  sotaliaISOToDate,
	  sotaliaCapacityLabel,
	  sotaliaCapacityTotal,
	  sotaliaConfirmedMembers,
	  sotaliaActivityDateTime,
	  sotaliaNameFromToken,
	  sotaliaAcademy as academy,
  sotaliaAssets as assets,
  sotaliaSchedule,
  todaySotaliaDate,
  sotaliaWorkoutTemplates,
  uniqueSotaliaIds,
  writeLocalSotaliaWorkoutTemplate,
  writeLocalSotaliaMember
} from './sotaliaData.js'
import { formatDateInput, formatPhone, sentenceCase, titleCase } from './dataFormat.js'
import './sotaliaAdmin.css'

const emptyExercise = {
  workoutName: 'Treino A',
  focus: 'Biceps costas',
  name: '',
  sets: '3',
  reps: '12',
  load: 'Moderada',
  rest: '60s',
  tip: ''
}

class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('Erro no painel Sotalia', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="sotAuthGate">
          <ShieldCheck size={42} />
          <h1>Erro ao abrir o cadastro.</h1>
          <p>Atualize o painel e tente abrir o aluno novamente. O cadastro foi protegido contra tela branca.</p>
        </main>
      )
    }
    return this.props.children
  }
}

function metricValue(members, key) {
  return members.reduce((sum, member) => sum + Number(member[key] || 0), 0)
}

function normalizeText(value) {
  return value.trim().replace(/\s+/g, ' ')
}

function workoutSlug(value) {
  return normalizeText(value || 'Treino A')
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function formatEventDate(value) {
  if (!value) return 'Agora'
  if (value.toDate) return value.toDate().toLocaleString('pt-BR')
  if (value.seconds) return new Date(value.seconds * 1000).toLocaleString('pt-BR')
  return new Date(value).toLocaleString('pt-BR')
}

function eventTimestamp(value) {
  if (!value) return 0
  if (value.toMillis) return value.toMillis()
  if (value.toDate) return value.toDate().getTime()
  if (value.seconds) return value.seconds * 1000
  return new Date(value).getTime() || 0
}

function bookingEventKey(event) {
  return [event.type, event.memberId || '', event.classId || event.activityId || '', event.classDate || '', event.classTime || ''].join(':')
}

function bookingActivityFor(event, activities = []) {
  const classId = event.classId || event.activityId
  if (!classId) return null
  return [...activities, ...sotaliaSchedule].find((activity) => activity.id === classId) || null
}

function formatBookingActivityDate(event, activities = []) {
  const activity = bookingActivityFor(event, activities)
  return event.classDate || activity?.date || formatEventDate(event.createdAt)
}

function todayDateMask() {
  return todaySotaliaDate()
}

function formatTimeInput(value = '') {
  const digits = value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

function formatAdminField(field, value) {
  const text = String(value ?? '')
  if (field === 'name') return titleCase(text)
  if (field === 'phone') return formatPhone(text)
  if (field === 'nextAssessment' || field === 'date') return formatDateInput(text)
  if (['plan', 'goal', 'trainer', 'note', 'status', 'modality'].includes(field)) return sentenceCase(text)
  return value
}

function normalizeFamily(family = []) {
  return (Array.isArray(family) ? family : []).map((person) => ({
    name: titleCase(person.name || ''),
    modality: sentenceCase(person.modality || ''),
    status: sentenceCase(person.status || ''),
    activities: Array.isArray(person.activities)
      ? person.activities.map((item) => sentenceCase(String(item))).filter(Boolean)
      : String(person.activities || '').split(',').map((item) => sentenceCase(item)).filter(Boolean)
  }))
}

function normalizeAdminExercise(exercise = {}) {
  return {
    name: sentenceCase(String(exercise.name || '')),
    sets: String(exercise.sets || ''),
    reps: String(exercise.reps || ''),
    load: String(exercise.load || ''),
    rest: String(exercise.rest || ''),
    tip: sentenceCase(String(exercise.tip || '')),
    videoOptional: exercise.videoOptional === true
  }
}

function normalizeAdminWorkouts(workouts = []) {
  return (Array.isArray(workouts) ? workouts : []).map((workout, index) => {
    const name = sentenceCase(String(workout.name || `Treino ${String.fromCharCode(65 + index)}`))
    return {
      id: workout.id || workoutSlug(name),
      sequence: Number(workout.sequence || index + 1),
      name,
      focus: sentenceCase(String(workout.focus || 'Corpo todo')),
      exercises: (Array.isArray(workout.exercises) ? workout.exercises : []).map(normalizeAdminExercise)
    }
  })
}

function normalizeAdminMember(member) {
  const fallbackName = sotaliaNameFromToken(member.id || '')
  const normalized = createSotaliaMember({
    ...member,
    name: titleCase(member.name || fallbackName),
    phone: formatPhone(member.phone || ''),
    plan: sentenceCase(member.plan || ''),
    trainer: sentenceCase(member.trainer || ''),
    goal: sentenceCase(member.goal || ''),
    nextAssessment: formatDateInput(member.nextAssessment || ''),
    family: normalizeFamily(member.family || []),
    workouts: normalizeAdminWorkouts(member.workouts || []),
    bookedClasses: Array.isArray(member.bookedClasses) ? member.bookedClasses : [],
    pendingBookings: Array.isArray(member.pendingBookings) ? member.pendingBookings : [],
    bookingConfirmations: Array.isArray(member.bookingConfirmations) ? member.bookingConfirmations : [],
    assessments: Array.isArray(member.assessments) ? member.assessments : []
  })
  return {
    ...normalized,
    family: normalizeFamily(normalized.family || []),
    workouts: normalizeAdminWorkouts(normalized.workouts || []),
    bookedClasses: Array.isArray(normalized.bookedClasses) ? normalized.bookedClasses : [],
    pendingBookings: Array.isArray(normalized.pendingBookings) ? normalized.pendingBookings : [],
    bookingConfirmations: Array.isArray(normalized.bookingConfirmations) ? normalized.bookingConfirmations : [],
    assessments: Array.isArray(normalized.assessments) ? normalized.assessments : []
  }
}

function imageForActivityType(type = '') {
  const normalized = type.toLocaleLowerCase('pt-BR')
  if (normalized.includes('agua') || normalized.includes('hidro')) return assets.hydro
  if (normalized.includes('natacao') || normalized.includes('tecnica')) return assets.swimming
  if (normalized.includes('cardio') || normalized.includes('coletiva')) return assets.classes
  return assets.strength
}

function normalizeActivity(activity) {
  const type = sentenceCase(activity.type || 'Forca')
  const date = sotaliaISOToDate(activity.date || todayDateMask())
  return {
    id: activity.id || createSotaliaToken(`${activity.date}-${activity.time}-${activity.title}`),
    date: formatDateInput(date),
    time: formatTimeInput(activity.time || ''),
    title: sentenceCase(normalizeText(activity.title || 'Aula Sotalia')),
    place: sentenceCase(normalizeText(activity.place || 'Sotalia Sports')),
    coach: sentenceCase(normalizeText(activity.coach || 'Equipe Sotalia')),
    type,
    capacity: sentenceCase(normalizeText(activity.capacity || 'Vagas abertas')),
    capacityTotal: sotaliaCapacityTotal(activity) || undefined,
    confirmedMembers: sotaliaConfirmedMembers(activity),
    confirmedCount: sotaliaConfirmedMembers(activity).length || Number(activity.confirmedCount || 0),
    image: activity.image || imageForActivityType(type)
  }
}

function AdminWorkspace({ session }) {
  const [members, setMembers] = useState(() => hasSotaliaFirebaseConfig ? [] : readLocalSotaliaMembers())
  const [selectedId, setSelectedId] = useState('')
  const [newMember, setNewMember] = useState({ name: '', phone: '', email: '', plan: 'Plano familia', goal: 'Condicionamento, agua e constancia', monthlyGoal: 18 })
  const [exercise, setExercise] = useState(emptyExercise)
  const [deleteConfirmId, setDeleteConfirmId] = useState('')
  const [events, setEvents] = useState([])
  const [customTemplates, setCustomTemplates] = useState(readLocalSotaliaWorkoutTemplates)
  const [newTemplateName, setNewTemplateName] = useState('')
  const [workoutNotice, setWorkoutNotice] = useState('')
  const [activities, setActivities] = useState([])
  const [activitiesReady, setActivitiesReady] = useState(false)
  const [activityDraft, setActivityDraft] = useState(() => normalizeActivity({
    date: todayDateMask(),
    time: '07:30',
    title: 'Hidroginastica',
    place: 'Piscina semiolimpica',
    coach: 'Equipe Sotalia',
    type: 'Agua',
    capacity: '8 vagas'
  }))
  const [activityError, setActivityError] = useState('')
  const selected = members.find((member) => member.id === selectedId)
  const [draft, setDraft] = useState(selected || null)
  const [assessment, setAssessment] = useState({ date: todayDateMask(), weight: '', bodyFat: '', muscleMass: '', note: '' })
  const inviteLink = draft ? `${window.location.origin}/sotalia-app?m=${encodeURIComponent(draft.id)}` : ''

  useEffect(() => {
    document.title = 'Sotalia Admin | Painel'
  }, [])

  useEffect(() => {
    loadSotaliaMembers()
      .then((remote) => {
        if (!remote?.length) return
        const normalized = remote.map((member) => normalizeAdminMember(member))
        setMembers(normalized)
        setSelectedId((current) => normalized.some((item) => item.id === current) ? current : '')
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    refreshActivities()
    const interval = window.setInterval(refreshActivities, 60000)
    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    refreshEvents()
    const interval = window.setInterval(refreshEvents, 20000)
    return () => window.clearInterval(interval)
  }, [activities, activitiesReady])

  useEffect(() => {
    const next = members.find((member) => member.id === selectedId)
    if (next) {
      setDraft(next)
      setAssessment({ date: todayDateMask(), weight: '', bodyFat: '', muscleMass: '', note: '' })
      setDeleteConfirmId('')
    } else {
      setDraft(null)
    }
  }, [members, selectedId])

  const metrics = useMemo(() => [
    { label: 'Alunos', value: members.length, icon: Users },
    { label: 'Check-ins no mes', value: metricValue(members, 'checkinsMonth'), icon: CheckCircle2 },
    { label: 'Treinos montados', value: members.reduce((sum, member) => sum + (member.workouts?.length || 0), 0), icon: Dumbbell },
    { label: 'Reservas recentes', value: events.filter((event) => event.type === 'booking-created').length, icon: Bell }
  ], [members, events])

  const templateOptions = useMemo(() => [...sotaliaWorkoutTemplates, ...customTemplates], [customTemplates])
  const bookingEvents = useMemo(() => events.filter((event) => event.type === 'booking-created' || event.type === 'booking-cancelled').slice(0, 8), [events])
  const agendaItems = useMemo(() => filterFutureSotaliaActivities(activities).sort((a, b) => `${sotaliaDateToISO(a.date)} ${a.time}`.localeCompare(`${sotaliaDateToISO(b.date)} ${b.time}`)).slice(0, 24), [activities])
  const fichaOptions = useMemo(() => {
    const names = new Set(['Treino A', 'Treino B', 'Treino C', 'Piscina tecnica', 'Forca complementar'])
    draft?.workouts?.forEach((workout) => names.add(workout.name))
    templateOptions.forEach((template) => template.workouts?.forEach((workout) => names.add(workout.name)))
    return [...names]
  }, [draft, templateOptions])
  const focusOptions = ['Biceps costas', 'Pernas e gluteos', 'Costas e biceps', 'Peito, ombro e triceps', 'Core e superiores', 'Respiracao e resistencia', 'Corpo todo']
  const exerciseOptions = ['Agachamento livre', 'Leg press', 'Cadeira extensora', 'Puxada frontal', 'Remada baixa', 'Rosca direta', 'Supino reto', 'Prancha', 'Aquecimento livre', 'Educativo de crawl', 'Serie continua']

  function cleanupBookingEvents(items = []) {
    const activityById = new Map([...sotaliaSchedule, ...activities].map((activity) => [activity.id, activity]))
    const seen = new Set()
    const removable = []
    const visible = []
    const nonBooking = []
    const sorted = [...items].sort((a, b) => eventTimestamp(b.createdAt) - eventTimestamp(a.createdAt))

    sorted.forEach((event) => {
      const isBooking = event.type === 'booking-created' || event.type === 'booking-cancelled'
      if (!isBooking) {
        nonBooking.push(event)
        return
      }

      const classId = event.classId || event.activityId
      const activity = classId ? activityById.get(classId) : null
      const expired = activity
        ? sotaliaActivityDateTime(activity) < Date.now()
        : activitiesReady && Boolean(classId)
      if (expired) {
        removable.push(event)
        return
      }

      const key = bookingEventKey(event)
      if (seen.has(key)) {
        removable.push(event)
        return
      }
      seen.add(key)
      visible.push(event)
    })

    return {
      visible: [...visible, ...nonBooking].sort((a, b) => eventTimestamp(b.createdAt) - eventTimestamp(a.createdAt)),
      removable
    }
  }

  function refreshEvents() {
    loadSotaliaEvents()
      .then((items) => {
        const { visible, removable } = cleanupBookingEvents(items || [])
        setEvents(visible)
        removable.forEach((event) => {
          if (event.id) deleteSotaliaEvent(event.id).catch(() => {})
        })
      })
      .catch(() => {})
  }

  function refreshActivities() {
    loadSotaliaActivities(true)
      .then((items) => {
        const normalized = (items || []).map(normalizeActivity)
        const future = filterFutureSotaliaActivities(normalized)
        const expired = normalized.filter((item) => !future.some((activity) => activity.id === item.id))
        setActivities(future)
        setActivitiesReady(true)
        expired.forEach((item) => deleteSotaliaActivity(item.id).catch(() => {}))
      })
      .catch(() => setActivitiesReady(true))
  }

  function isBookingConfirmed(event) {
    const member = members.find((item) => item.id === event.memberId)
    return Boolean(member?.bookingConfirmations?.some((confirmation) => confirmation.classId === event.classId))
  }

  async function confirmBooking(event) {
    if (!event.memberId || !event.classId) return
    const target = members.find((member) => member.id === event.memberId) || createSotaliaMember({ id: event.memberId, name: event.memberName || event.memberId })
    const confirmation = {
      id: event.id || `${event.classId}-${Date.now()}`,
      classId: event.classId,
      classDate: event.classDate || bookingActivityFor(event, activities)?.date || '',
      classTitle: event.classTitle || event.classId,
      classTime: event.classTime || '',
      classPlace: event.classPlace || 'Sotalia Sports',
      confirmedAt: new Date().toISOString(),
      message: `Reserva confirmada pela Sotalia: ${event.classTitle || event.classId}${event.classTime ? ` as ${event.classTime}` : ''}.`
    }
    const bookingConfirmations = [
      confirmation,
      ...(target.bookingConfirmations || []).filter((item) => item.classId !== event.classId)
    ].slice(0, 20)
    const bookedClasses = Array.from(new Set([...(target.bookedClasses || []), event.classId]))
    const pendingBookings = (target.pendingBookings || []).filter((id) => id !== event.classId)
    const updated = { ...target, bookedClasses, pendingBookings, bookingConfirmations }
    const saved = hasSotaliaFirebaseConfig ? updated : writeLocalSotaliaMember(updated)

    setMembers((current) => {
      const exists = current.some((member) => member.id === saved.id)
      return exists ? current.map((member) => member.id === saved.id ? saved : member) : [saved, ...current]
    })
    if (draft?.id === saved.id) setDraft(saved)

    await saveSotaliaMember(saved.id, { bookedClasses, pendingBookings, bookingConfirmations })

    const activity = activities.find((item) => item.id === event.classId) || sotaliaSchedule.find((item) => item.id === event.classId)
    if (activity) {
      const confirmedMembers = uniqueSotaliaIds([...sotaliaConfirmedMembers(activity), saved.id])
      const capacityTotal = sotaliaCapacityTotal(activity)
      const updatedActivity = normalizeActivity({
        ...activity,
        confirmedMembers,
        confirmedCount: confirmedMembers.length,
        capacityTotal: capacityTotal || activity.capacityTotal
      })
      setActivities((current) => {
        const exists = current.some((item) => item.id === updatedActivity.id)
        return exists
          ? current.map((item) => item.id === updatedActivity.id ? updatedActivity : item)
          : [updatedActivity, ...current]
      })
      await saveSotaliaActivity(updatedActivity)
    }

    await saveSotaliaEvent({
      type: 'booking-confirmed',
      memberId: saved.id,
      memberName: saved.name,
      classId: confirmation.classId,
      classDate: confirmation.classDate,
      classTitle: confirmation.classTitle,
      classTime: confirmation.classTime,
      classPlace: confirmation.classPlace,
      source: 'sotalia-admin'
    })
    refreshEvents()
  }

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: formatAdminField(field, value) }))
  }

  function openStudentDashboard(memberId) {
    setSelectedId(memberId)
    window.setTimeout(() => document.getElementById('student-dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function updateNewMember(field, value) {
    setNewMember((current) => ({ ...current, [field]: formatAdminField(field, value) }))
  }

  function updateFamily(index, field, value) {
    setDraft((current) => ({
      ...current,
      family: (current.family || []).map((person, itemIndex) => itemIndex === index
        ? { ...person, [field]: field === 'activities' ? value.split(',').map((item) => sentenceCase(item)).filter(Boolean) : formatAdminField(field, value) }
        : person)
    }))
  }

  function addFamilyMember() {
    setDraft((current) => ({
      ...current,
      family: [...(current.family || []), { name: '', modality: '', status: 'Ativo', activities: [] }]
    }))
  }

  function removeFamilyMember(index) {
    setDraft((current) => ({
      ...current,
      family: (current.family || []).filter((_, itemIndex) => itemIndex !== index)
    }))
  }

  async function saveActivity(event) {
    event.preventDefault()
    setActivityError('')
    if (!activityDraft.title.trim() || !activityDraft.date.trim() || !activityDraft.time.trim()) return
    const saved = normalizeActivity(activityDraft)
    if (!filterFutureSotaliaActivities([saved]).length) {
      setActivityError('A data e hora da atividade ja passaram. Escolha um horario futuro.')
      return
    }
    setActivities((current) => [saved, ...current.filter((item) => item.id !== saved.id)])
    setActivityDraft(normalizeActivity({ date: todayDateMask(), time: '', title: '', place: '', coach: 'Equipe Sotalia', type: 'Forca', capacity: '' }))
    await saveSotaliaActivity(saved)
    await saveSotaliaEvent({ type: 'activity-created', activityId: saved.id, source: 'sotalia-admin' })
    refreshActivities()
  }

  function editActivity(activity) {
    setActivityError('')
    setActivityDraft(normalizeActivity(activity))
    window.setTimeout(() => document.getElementById('agenda')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  function cancelActivityEdit() {
    setActivityError('')
    setActivityDraft(normalizeActivity({ date: todayDateMask(), time: '', title: '', place: '', coach: 'Equipe Sotalia', type: 'Forca', capacity: '' }))
  }

  async function removeActivity(activityId) {
    setActivities((current) => current.filter((item) => item.id !== activityId))
    await deleteSotaliaActivity(activityId)
    await saveSotaliaEvent({ type: 'activity-deleted', activityId, source: 'sotalia-admin' })
  }

  function createMember(event) {
    event.preventDefault()
    if (!newMember.name.trim()) return
    const member = normalizeAdminMember({
      id: createSotaliaToken(newMember.name),
      ...newMember,
      workouts: [],
      activeWorkoutId: '',
      monthlyGoal: Number(newMember.monthlyGoal) || 18
    })
    const saved = hasSotaliaFirebaseConfig ? member : writeLocalSotaliaMember(member)
    setMembers((current) => [saved, ...current])
    setSelectedId(saved.id)
    setNewMember({ name: '', phone: '', email: '', plan: 'Plano familia', goal: 'Condicionamento, agua e constancia', monthlyGoal: 18 })
    saveSotaliaMember(saved.id, saved)
    saveSotaliaEvent({ type: 'member-created', memberId: saved.id, source: 'sotalia-admin' })
  }

  function applyTemplate(templateId) {
    const template = templateOptions.find((item) => item.id === templateId) || templateOptions[0]
    setDraft((current) => ({
      ...current,
      goal: template.goal,
      workouts: cloneSotaliaWorkouts(template.workouts),
      activeWorkoutId: template.workouts?.[0]?.id || current.activeWorkoutId
    }))
    setWorkoutNotice(`Modelo ${template.name} aplicado. Clique em Salvar treino para enviar ao app do aluno.`)
  }

  function saveCurrentAsTemplate() {
    if (!draft?.workouts?.length || !newTemplateName.trim()) return
    const saved = writeLocalSotaliaWorkoutTemplate({
      name: normalizeText(newTemplateName),
      goal: draft.goal || 'Modelo personalizado',
      workouts: draft.workouts
    })
    setCustomTemplates((current) => [saved, ...current.filter((item) => item.id !== saved.id)])
    setNewTemplateName('')
    saveSotaliaEvent({ type: 'workout-template-created', templateId: saved.id, templateName: saved.name, source: 'sotalia-admin' })
  }

  function addExercise(event) {
    event.preventDefault()
    setWorkoutNotice('')
    if (!exercise.name.trim()) {
      ensureWorkoutBlock(exercise.workoutName || 'Treino A', 'Preencha o campo Exercicio para adicionar na ficha.')
      return
    }
    setDraft((current) => addExerciseToMember(current, exercise))
    setExercise((current) => ({ ...current, name: '', tip: '' }))
    setWorkoutNotice('Exercicio adicionado na ficha. Clique em Salvar treino para enviar ao app do aluno.')
  }

  function addExerciseToMember(member, exerciseDraft) {
    const item = {
      name: sentenceCase(normalizeText(exerciseDraft.name)),
      sets: exerciseDraft.sets || '3',
      reps: exerciseDraft.reps || '12',
      load: exerciseDraft.load || 'Moderada',
      rest: exerciseDraft.rest || '60s',
      tip: sentenceCase(normalizeText(exerciseDraft.tip || '')),
      videoOptional: true
    }
    const workoutName = sentenceCase(normalizeText(exerciseDraft.workoutName || 'Treino A'))
    const id = workoutSlug(workoutName)
    const workouts = member.workouts?.length ? member.workouts : []
    const existing = workouts.find((workout) => workout.id === id || workout.name.toLocaleLowerCase('pt-BR') === workoutName.toLocaleLowerCase('pt-BR'))
    const nextWorkouts = existing
      ? workouts.map((workout) => workout.id === existing.id ? { ...workout, name: workoutName, focus: sentenceCase(normalizeText(exerciseDraft.focus)), exercises: [...(workout.exercises || []), item] } : workout)
      : [...workouts, { id, sequence: workouts.length + 1, name: workoutName, focus: sentenceCase(normalizeText(exerciseDraft.focus)), exercises: [item] }]
    return { ...member, workouts: nextWorkouts, activeWorkoutId: member.activeWorkoutId || id }
  }

  function ensureWorkoutBlockOnMember(member, name) {
    const workoutName = sentenceCase(normalizeText(name || 'Treino A'))
    const id = workoutSlug(workoutName)
    const workouts = member.workouts || []
    const existing = workouts.find((workout) => workout.id === id || workout.name.toLocaleLowerCase('pt-BR') === workoutName.toLocaleLowerCase('pt-BR'))
    if (existing) return { ...member, activeWorkoutId: existing.id }
    return {
      ...member,
      activeWorkoutId: member.activeWorkoutId || id,
      workouts: [...workouts, { id, sequence: workouts.length + 1, name: workoutName, focus: sentenceCase(normalizeText(exercise.focus || 'Biceps costas')), exercises: [] }]
    }
  }

  function ensureWorkoutBlock(name, notice = '') {
    const workoutName = sentenceCase(normalizeText(name || 'Treino A'))
    const id = workoutSlug(workoutName)
    setExercise((current) => ({ ...current, workoutName }))
    setDraft((current) => ensureWorkoutBlockOnMember(current, workoutName))
    setWorkoutNotice(notice || `${workoutName} criado/selecionado. Adicione exercicios e salve o treino.`)
  }

  function updateWorkoutField(workoutId, field, value) {
    setDraft((current) => ({
      ...current,
      workouts: (current.workouts || []).map((workout) => workout.id === workoutId ? { ...workout, [field]: field === 'name' ? sentenceCase(value) : sentenceCase(value) } : workout)
    }))
  }

  function updateExerciseField(workoutId, exerciseIndex, field, value) {
    setDraft((current) => ({
      ...current,
      workouts: (current.workouts || []).map((workout) => {
        if (workout.id !== workoutId) return workout
        return {
          ...workout,
          exercises: workout.exercises.map((item, index) => index === exerciseIndex ? { ...item, [field]: field === 'name' || field === 'tip' ? sentenceCase(value) : value } : item)
        }
      })
    }))
  }

  function removeExercise(workoutId, exerciseIndex) {
    setDraft((current) => ({
      ...current,
      workouts: (current.workouts || []).map((workout) => workout.id === workoutId ? { ...workout, exercises: workout.exercises.filter((_, index) => index !== exerciseIndex) } : workout)
    }))
  }

  function removeWorkout(workoutId) {
    setDraft((current) => {
      const workouts = (current.workouts || []).filter((workout) => workout.id !== workoutId)
      return {
        ...current,
        workouts,
        activeWorkoutId: current.activeWorkoutId === workoutId ? (workouts[0]?.id || '') : current.activeWorkoutId
      }
    })
  }

  function addAssessment(event) {
    event.preventDefault()
    const nextAssessment = {
      date: formatDateInput(assessment.date),
      weight: Number(assessment.weight || draft.weight || 0),
      bodyFat: Number(assessment.bodyFat || draft.bodyFat || 0),
      muscleMass: Number(assessment.muscleMass || draft.muscleMass || 0),
      note: sentenceCase(normalizeText(assessment.note || 'Avaliacao registrada pelo painel.'))
    }
    setDraft((current) => ({
      ...current,
      weight: nextAssessment.weight,
      bodyFat: nextAssessment.bodyFat,
      muscleMass: nextAssessment.muscleMass,
      assessments: [nextAssessment, ...(current.assessments || [])]
    }))
  }

  async function saveDraft() {
    let draftToSave = draft
    if (exercise.name.trim()) {
      draftToSave = addExerciseToMember(draftToSave, exercise)
      setDraft(draftToSave)
      setExercise((current) => ({ ...current, name: '', tip: '' }))
    } else if (!(draftToSave.workouts || []).length) {
      draftToSave = ensureWorkoutBlockOnMember(draftToSave, exercise.workoutName || 'Treino A')
      setDraft(draftToSave)
    }
    const normalized = normalizeAdminMember({
      ...draftToSave,
      monthlyGoal: Number(draftToSave.monthlyGoal) || 1,
      checkinsMonth: Number(draftToSave.checkinsMonth) || 0,
      xp: Number(draftToSave.xp) || 0,
      level: Number(draftToSave.level) || 1
    })
    const saved = hasSotaliaFirebaseConfig ? normalized : writeLocalSotaliaMember(normalized)
    setMembers((current) => current.map((member) => member.id === saved.id ? saved : member))
    setDraft(saved)
    await saveSotaliaMember(saved.id, saved)
    await saveSotaliaEvent({ type: 'member-saved', memberId: saved.id, source: 'sotalia-admin' })
    setWorkoutNotice('Treino salvo no app do aluno.')
  }

  function activateWorkout(workoutId) {
    setDraft((current) => ({ ...current, activeWorkoutId: workoutId }))
  }

  async function deleteMember(memberId) {
    if (!memberId || deleteConfirmId !== memberId) return

    const deletedId = memberId
    const nextIds = hasSotaliaFirebaseConfig ? [] : deleteLocalSotaliaMember(deletedId)
    const nextMembers = members.filter((member) => member.id !== deletedId)
    setMembers(nextMembers)
    if (selectedId === deletedId) {
      setSelectedId('')
      setDraft(null)
    }
    setDeleteConfirmId('')
    await deleteSotaliaMember(deletedId)
    await saveSotaliaEvent({ type: 'member-deleted', memberId: deletedId, source: 'sotalia-admin' })

    if (!nextMembers.length && nextIds.length) {
      setMembers(readLocalSotaliaMembers())
    }
  }

  async function deleteSelectedMember() {
    if (!draft) return
    await deleteMember(draft.id)
  }

  function copyInvite() {
    navigator.clipboard?.writeText(inviteLink)
  }

  return (
    <main className="sotaliaAdmin">
      <aside className="sotAdminSidebar">
        <img src={assets.logo} alt="Sotalia Sports" />
        <nav>
          <a href="#dashboard"><BarChart3 /> Dashboard</a>
          <a href="#alunos"><UserPlus /> Alunos</a>
          <a href="#agenda"><CalendarDays /> Agenda</a>
          <a href="#dashboard"><Bell /> Avisos</a>
        </nav>
        {session.demo ? (
          <span className="sotAdminSecurityStatus">Banco Sotalia conectado</span>
        ) : (
          <button className="sotAdminSignOut" type="button" onClick={signOutSotaliaAdmin}><LogOut /> Sair</button>
        )}
        <a className="sotAdminStudentLink" href="/sotalia-app?m=demo-marina" target="_blank" rel="noreferrer">Abrir app demo <ExternalLink /></a>
      </aside>

      <section className="sotAdminMain">
        <section className="sotAdminCard sotBookingAlerts" id="dashboard">
          <div className="sotWorkoutHead">
            <div className="sotCardTitle"><span>Lista de avisos</span><h2>Reservas e agendamentos</h2></div>
            <button type="button" onClick={refreshEvents}><Bell /> Atualizar avisos</button>
          </div>
          <div className="sotBookingList">
            {bookingEvents.map((event) => {
              const confirmed = isBookingConfirmed(event)
              return (
                <article className={confirmed ? 'isConfirmed' : ''} key={event.id || `${event.type}-${event.memberId}-${event.createdAt}`}>
                  <strong>{event.type === 'booking-created' ? 'Nova reserva' : 'Reserva cancelada'}</strong>
                  <span>{event.memberName || event.memberId} - {event.classTitle || event.classId} {event.classTime ? `as ${event.classTime}` : ''}</span>
                  <small>{event.classPlace || 'Sotalia Sports'} - {formatBookingActivityDate(event, activities)}</small>
                  {event.type === 'booking-created' && (
                    <button type="button" disabled={confirmed} onClick={() => confirmBooking(event)}>
                      <CheckCircle2 /> {confirmed ? 'Aluno ja notificado' : 'Confirmar e notificar aluno'}
                    </button>
                  )}
                </article>
              )
            })}
            {!bookingEvents.length && <p className="sotEmptyState">Nenhuma reserva nova registrada ainda.</p>}
          </div>
        </section>

        <section className="sotAdminGrid" id="alunos">
          <form className="sotAdminCard" onSubmit={createMember}>
            <div className="sotCardTitle"><span>Novo aluno</span><h2>Cadastrar no app</h2></div>
            <label>Nome<input value={newMember.name} onChange={(e) => updateNewMember('name', e.target.value)} placeholder="Nome completo" /></label>
            <label>WhatsApp<input inputMode="numeric" value={newMember.phone} onChange={(e) => updateNewMember('phone', e.target.value)} placeholder="(48) 99999-9999" /></label>
            <label>E-mail<input value={newMember.email} onChange={(e) => setNewMember({ ...newMember, email: e.target.value })} placeholder="aluno@email.com" /></label>
            <label>Plano<input value={newMember.plan} onChange={(e) => updateNewMember('plan', e.target.value)} /></label>
            <label>Objetivo<input value={newMember.goal} onChange={(e) => updateNewMember('goal', e.target.value)} /></label>
            <label>Meta mensal<input type="number" value={newMember.monthlyGoal} onChange={(e) => setNewMember({ ...newMember, monthlyGoal: e.target.value })} /></label>
            <button type="submit">Cadastrar aluno <Plus /></button>
          </form>

          <article className="sotAdminCard sotStudentList" id="lista-alunos">
            <div className="sotCardTitle"><span>Alunos</span><h2>Selecionar ou remover</h2></div>
            {members.length ? (
              <div className="sotStudentRows">
                {members.map((member) => (
                  <article key={member.id} className={selectedId === member.id ? 'isSelected' : ''}>
                    <button type="button" onClick={() => openStudentDashboard(member.id)}>
                      <strong>{member.name}</strong>
                      <span>{member.phone || 'Sem telefone'} - {member.workouts?.length || 0} fichas</span>
                    </button>
                    {deleteConfirmId === member.id ? (
                      <div>
                        <button className="sotDangerButton" type="button" onClick={() => deleteMember(member.id)}><Trash2 /> Confirmar</button>
                        <button className="sotNeutralButton" type="button" onClick={() => setDeleteConfirmId('')}>Cancelar</button>
                      </div>
                    ) : (
                      <button className="sotNeutralButton" type="button" onClick={() => setDeleteConfirmId(member.id)}><Trash2 /> Remover</button>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="sotEmptyState">Nenhum aluno cadastrado. Crie um aluno para gerar link e QR Code.</p>
            )}
          </article>
        </section>

        <section className="sotAdminCard sotActivityManager" id="agenda">
          <div className="sotWorkoutHead">
            <div className="sotCardTitle"><span>Agenda</span><h2>Cadastrar atividade</h2></div>
            <button type="button" onClick={refreshActivities}><CalendarDays /> Atualizar agenda</button>
          </div>
          <p className="sotAccessNote"><CalendarDays /> Toda atividade cadastrada aqui fica disponivel para visualizacao de todos os alunos no app, em Agenda. Atividades vencidas saem automaticamente quando a data e hora expiram.</p>
          <form className="sotActivityForm" onSubmit={saveActivity}>
            <label>Data<input type="date" value={sotaliaDateToISO(activityDraft.date)} onChange={(e) => setActivityDraft({ ...activityDraft, date: sotaliaISOToDate(e.target.value) })} /></label>
            <label>Hora<input type="time" value={activityDraft.time} onChange={(e) => setActivityDraft({ ...activityDraft, time: e.target.value })} /></label>
            <label>Atividade<input value={activityDraft.title} onChange={(e) => setActivityDraft({ ...activityDraft, title: sentenceCase(e.target.value) })} placeholder="Hidroginastica" /></label>
            <label>Tipo<input value={activityDraft.type} onChange={(e) => setActivityDraft({ ...activityDraft, type: sentenceCase(e.target.value), image: imageForActivityType(e.target.value) })} placeholder="Agua, Forca, Cardio" /></label>
            <label>Local<input value={activityDraft.place} onChange={(e) => setActivityDraft({ ...activityDraft, place: sentenceCase(e.target.value) })} placeholder="Piscina semiolimpica" /></label>
            <label>Professor<input value={activityDraft.coach} onChange={(e) => setActivityDraft({ ...activityDraft, coach: sentenceCase(e.target.value) })} placeholder="Equipe Sotalia" /></label>
            <label>Vagas/status<input value={activityDraft.capacity} onChange={(e) => setActivityDraft({ ...activityDraft, capacity: sentenceCase(e.target.value) })} placeholder="8 vagas" /></label>
            <button type="submit"><Plus /> {activities.some((activity) => activity.id === activityDraft.id) ? 'Atualizar atividade' : 'Publicar no app do aluno'}</button>
            {activities.some((activity) => activity.id === activityDraft.id) && <button className="sotNeutralButton" type="button" onClick={cancelActivityEdit}>Cancelar edicao</button>}
          </form>
          {activityError && <p className="sotFormError">{activityError}</p>}
          <div className="sotActivityList">
            {agendaItems.map((item) => (
              <article key={item.id}>
                <div>
                  <strong>{item.date} - {item.time} - {item.title}</strong>
                  <span>{item.place} com {item.coach} - {sotaliaCapacityLabel(item)}</span>
                </div>
                <div className="sotActivityActions">
                  <button className="sotNeutralButton" type="button" onClick={() => editActivity(item)}>Editar</button>
                  <button className="sotNeutralButton" type="button" onClick={() => removeActivity(item.id)}><Trash2 /> Remover</button>
                </div>
              </article>
            ))}
            {!agendaItems.length && <p className="sotEmptyState">Nenhuma atividade futura cadastrada.</p>}
          </div>
        </section>

        {draft && (
          <section className="sotAdminGrid wide sotStudentDashboard" id="student-dashboard">
            <article className="sotAdminCard sotStudentDashboardHead">
              <div className="sotCardTitle"><span>Dashboard do aluno</span><h2>{draft.name}</h2></div>
              <p>Edite os dados, gere o acesso do app e monte a ficha individual deste aluno.</p>
            </article>

            <article className="sotAdminCard sotProfileEditor">
              <div className="sotCardTitle"><span>Aluno selecionado</span><h2>{draft.name}</h2></div>
              <label>Nome<input value={draft.name} onChange={(e) => updateDraft('name', e.target.value)} /></label>
              <label>Personal/professor<input value={draft.trainer || ''} onChange={(e) => updateDraft('trainer', e.target.value)} /></label>
              <label>WhatsApp<input inputMode="numeric" value={draft.phone || ''} onChange={(e) => updateDraft('phone', e.target.value)} placeholder="(48) 99999-9999" /></label>
              <label>Proxima avaliacao<input inputMode="numeric" value={draft.nextAssessment || ''} onChange={(e) => updateDraft('nextAssessment', e.target.value)} placeholder="dd/mm/aaaa" /></label>
              <label>Objetivo<input value={draft.goal || ''} onChange={(e) => updateDraft('goal', e.target.value)} /></label>
              <label>Meta mensal<input type="number" value={draft.monthlyGoal || 1} onChange={(e) => updateDraft('monthlyGoal', e.target.value)} /></label>
              <label>Check-ins no mes<input type="number" value={draft.checkinsMonth || 0} onChange={(e) => updateDraft('checkinsMonth', e.target.value)} /></label>
              <label>XP<input type="number" value={draft.xp || 0} onChange={(e) => updateDraft('xp', e.target.value)} /></label>
              <div className="sotFamilyEditor">
                <div className="sotFamilyEditorHead">
                  <strong>Familia e modalidades</strong>
                  <button type="button" onClick={addFamilyMember}><Plus /> Adicionar</button>
                </div>
                {(draft.family || []).map((person, index) => (
                  <article key={`${person.name}-${index}`}>
                    <label>Nome<input value={person.name || ''} onChange={(e) => updateFamily(index, 'name', e.target.value)} placeholder="Nome do dependente" /></label>
                    <label>Modalidade<input value={person.modality || ''} onChange={(e) => updateFamily(index, 'modality', e.target.value)} placeholder="Natacao infantil" /></label>
                    <label>Status<input value={person.status || ''} onChange={(e) => updateFamily(index, 'status', e.target.value)} placeholder="Aula hoje" /></label>
                    <label>Atividades<input value={(person.activities || []).join(', ')} onChange={(e) => updateFamily(index, 'activities', e.target.value)} placeholder="Natacao infantil, Hidro kids" /></label>
                    <button className="sotNeutralButton" type="button" onClick={() => removeFamilyMember(index)}>Remover</button>
                  </article>
                ))}
                {!(draft.family || []).length && <p className="sotEmptyState">Nenhum dependente cadastrado para este aluno.</p>}
              </div>
              <button type="button" onClick={saveDraft}>Salvar aluno <Save /></button>
              <div className="sotDeleteBox">
                <div>
                  <strong>Excluir aluno da base</strong>
                  <span>Remove o aluno deste app, do armazenamento local e do Firestore quando conectado.</span>
                </div>
                {deleteConfirmId === draft.id ? (
                  <div className="sotDeleteActions">
                    <button className="sotDangerButton" type="button" onClick={deleteSelectedMember}><Trash2 /> Confirmar exclusao</button>
                    <button className="sotNeutralButton" type="button" onClick={() => setDeleteConfirmId('')}>Cancelar</button>
                  </div>
                ) : (
                  <button className="sotDangerButton" type="button" onClick={() => setDeleteConfirmId(draft.id)}><Trash2 /> Excluir aluno</button>
                )}
              </div>
            </article>

            <form className="sotAdminCard" onSubmit={addAssessment}>
              <div className="sotCardTitle"><span>Evolucao</span><h2>Avaliacao fisica</h2></div>
              <label>Data<input inputMode="numeric" value={assessment.date} onChange={(e) => setAssessment({ ...assessment, date: formatDateInput(e.target.value) })} placeholder="dd/mm/aaaa" /></label>
              <label>Peso<input value={assessment.weight} onChange={(e) => setAssessment({ ...assessment, weight: e.target.value })} placeholder={`${draft.weight || 0}`} /></label>
              <label>Gordura %<input value={assessment.bodyFat} onChange={(e) => setAssessment({ ...assessment, bodyFat: e.target.value })} placeholder={`${draft.bodyFat || 0}`} /></label>
              <label>Massa magra<input value={assessment.muscleMass} onChange={(e) => setAssessment({ ...assessment, muscleMass: e.target.value })} placeholder={`${draft.muscleMass || 0}`} /></label>
              <label className="full">Nota<textarea value={assessment.note} onChange={(e) => setAssessment({ ...assessment, note: sentenceCase(e.target.value) })} /></label>
              <button type="submit">Adicionar avaliacao <Plus /></button>
            </form>

            <article className="sotAdminCard" id="acesso">
              <div className="sotCardTitle"><span>Acesso exclusivo</span><h2>Link e QR do aluno</h2></div>
              <p className="sotAccessNote"><ShieldCheck /> Somente alunos cadastrados recebem o convite. O app nao fica exposto para download publico na Play Store ou App Store.</p>
              <div className="sotQrBox"><QRCodeCanvas value={inviteLink} size={188} includeMargin level="H" /></div>
              <code>{inviteLink}</code>
              <div className="sotInlineActions">
                <button type="button" onClick={copyInvite}><Copy /> Copiar</button>
                <a href={inviteLink} target="_blank" rel="noreferrer"><ExternalLink /> Abrir app</a>
              </div>
            </article>
          </section>
        )}

        {draft && (
          <section className="sotAdminCard sotWorkoutBuilder" id="treino">
            <div className="sotWorkoutHead">
              <div className="sotCardTitle"><span>Personal</span><h2>Montar treino do aluno</h2></div>
              <label>Personal<input value={draft.trainer || ''} onChange={(e) => updateDraft('trainer', e.target.value)} placeholder="Nome do personal" /></label>
              <label>Modelo pronto<select onChange={(e) => applyTemplate(e.target.value)} defaultValue=""><option value="" disabled>Escolher modelo</option>{templateOptions.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}</select></label>
            </div>
            <div className="sotWorkoutBlockShortcuts">
              {['Treino A', 'Treino B', 'Treino C'].map((name) => (
                <button key={name} type="button" onClick={() => ensureWorkoutBlock(name)}>{name}</button>
              ))}
            </div>
            <div className="sotTemplateCreator">
              <label>Novo modelo pronto<input value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="Ex: Hipertrofia iniciante Sotalia" /></label>
              <button type="button" onClick={saveCurrentAsTemplate}><Save /> Salvar modelo atual</button>
            </div>
            <datalist id="sotFichaOptions">{fichaOptions.map((item) => <option key={item} value={item} />)}</datalist>
            <datalist id="sotFocusOptions">{focusOptions.map((item) => <option key={item} value={item} />)}</datalist>
            <datalist id="sotExerciseOptions">{exerciseOptions.map((item) => <option key={item} value={item} />)}</datalist>
            <form className="sotExerciseForm" onSubmit={addExercise}>
              <label>Ficha<input list="sotFichaOptions" value={exercise.workoutName} onChange={(e) => setExercise({ ...exercise, workoutName: e.target.value })} placeholder="Escolha ou digite uma ficha" /></label>
              <label>Foco<input list="sotFocusOptions" value={exercise.focus} onChange={(e) => setExercise({ ...exercise, focus: e.target.value })} /></label>
              <label>Exercicio<input list="sotExerciseOptions" value={exercise.name} onChange={(e) => setExercise({ ...exercise, name: e.target.value })} placeholder="Supino reto" /></label>
              <label>Series<input value={exercise.sets} onChange={(e) => setExercise({ ...exercise, sets: e.target.value })} /></label>
              <label>Reps<input value={exercise.reps} onChange={(e) => setExercise({ ...exercise, reps: e.target.value })} /></label>
              <label>Carga<input value={exercise.load} onChange={(e) => setExercise({ ...exercise, load: e.target.value })} /></label>
              <label>Descanso<input value={exercise.rest} onChange={(e) => setExercise({ ...exercise, rest: e.target.value })} /></label>
              <label>Dica<input value={exercise.tip} onChange={(e) => setExercise({ ...exercise, tip: e.target.value })} /></label>
              <button type="submit">Adicionar <Plus /></button>
            </form>
            {workoutNotice && <p className="sotFormError">{workoutNotice}</p>}
            <div className="sotWorkoutPreview">
              {(draft.workouts || []).map((workout) => (
                <article key={workout.id} className={`sotWorkoutBlock ${draft.activeWorkoutId === workout.id ? 'isActiveWorkout' : ''}`}>
                  <div className="sotWorkoutBlockHead">
                    <small>{draft.activeWorkoutId === workout.id ? 'Treino ativo' : `Sequencia ${workout.sequence}`}</small>
                    <div className="sotWorkoutActions">
                      <button type="button" onClick={() => activateWorkout(workout.id)}>Ativar</button>
                      <button className="sotNeutralButton" type="button" onClick={() => removeWorkout(workout.id)}><Trash2 /> Remover ficha</button>
                    </div>
                  </div>
                  <div className="sotWorkoutBlockMeta">
                    <label>Ficha<input value={workout.name} onChange={(e) => updateWorkoutField(workout.id, 'name', e.target.value)} /></label>
                    <label>Foco<input value={workout.focus} onChange={(e) => updateWorkoutField(workout.id, 'focus', e.target.value)} /></label>
                  </div>
                  <div className="sotWorkoutExerciseEditor">
                    {!!workout.exercises.length && (
                      <div className="sotExerciseHeader">
                        <span>Exercicio</span><span>Series</span><span>Reps</span><span>Carga</span><span>Descanso</span><span>Dica</span><span></span>
                      </div>
                    )}
                    {workout.exercises.map((item, index) => (
                      <div className="sotExerciseRow" key={`${item.name}-${index}`}>
                        <label>Exercicio<input value={item.name} onChange={(e) => updateExerciseField(workout.id, index, 'name', e.target.value)} /></label>
                        <label>Series<input value={item.sets} onChange={(e) => updateExerciseField(workout.id, index, 'sets', e.target.value)} /></label>
                        <label>Reps<input value={item.reps} onChange={(e) => updateExerciseField(workout.id, index, 'reps', e.target.value)} /></label>
                        <label>Carga<input value={item.load} onChange={(e) => updateExerciseField(workout.id, index, 'load', e.target.value)} /></label>
                        <label>Descanso<input value={item.rest} onChange={(e) => updateExerciseField(workout.id, index, 'rest', e.target.value)} /></label>
                        <label>Dica<input value={item.tip || ''} onChange={(e) => updateExerciseField(workout.id, index, 'tip', e.target.value)} /></label>
                        <button className="sotNeutralButton" type="button" onClick={() => removeExercise(workout.id, index)}><Trash2 /></button>
                      </div>
                    ))}
                  </div>
                  {!workout.exercises.length && <p className="sotEmptyState">Bloco criado. Adicione exercicios usando os campos acima.</p>}
                </article>
              ))}
              {!(draft.workouts || []).length && <p className="sotEmptyState">Este aluno ainda nao tem ficha. Use os campos acima para adicionar o primeiro exercicio.</p>}
            </div>
            <button className="sotSaveWorkout" type="button" onClick={saveDraft}>Salvar treino no app do aluno <ArrowRight /></button>
          </section>
        )}
      </section>
    </main>
  )
}

function AdminPanel() {
  const [session, setSession] = useState({ loading: true, user: null, demo: false })
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => subscribeToAdminSession(setSession), [])

  async function handleSignIn(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signInSotaliaAdmin(credentials.email, credentials.password)
    } catch {
      setError('Nao foi possivel entrar. Verifique o e-mail, a senha e as permissoes.')
    } finally {
      setSubmitting(false)
    }
  }

  if (session.loading) {
    return <main className="sotAuthGate"><ShieldCheck /><h1>Verificando acesso...</h1></main>
  }

  if (!session.demo && (!session.user || !session.authorized)) {
    return (
      <main className="sotAuthGate">
        <form onSubmit={handleSignIn}>
          <ShieldCheck size={42} />
          <p>Painel administrativo</p>
          <h1>Acesso restrito</h1>
          {session.user && !session.authorized && (
            <div className="sotAuthError">Esta conta nao possui a claim de administrador da academia.</div>
          )}
          <label>E-mail<input type="email" autoComplete="username" required value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} /></label>
          <label>Senha<input type="password" autoComplete="current-password" required value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} /></label>
          {error && <div className="sotAuthError">{error}</div>}
          <button type="submit" disabled={submitting}><LogIn /> {submitting ? 'Entrando...' : 'Entrar com seguranca'}</button>
          {session.user && <button className="sotAuthSecondary" type="button" onClick={signOutSotaliaAdmin}>Usar outra conta</button>}
        </form>
      </main>
    )
  }

  return (
    <AdminErrorBoundary>
      <AdminWorkspace session={session} />
    </AdminErrorBoundary>
  )
}

createRoot(document.getElementById('root')).render(<AdminPanel />)
