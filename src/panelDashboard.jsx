import React, { useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { QRCodeSVG } from 'qrcode.react'
import {
  ArrowRight,
  BarChart3,
  Copy,
  Download,
  Dumbbell,
  ExternalLink,
  Flame,
  MessageCircle,
  Plus,
  QrCode,
  ShieldCheck,
  UserPlus,
  Users
} from 'lucide-react'
import { formatDateInput, formatPhone, isValidBrazilianDate, normalizeStudent, sentenceCase, titleCase } from './dataFormat.js'
import './panelDashboard.css'

const STORAGE_KEY = 'shappFitMvpState'

const fallbackState = {
  academy: { id: 'ironfit-demo', name: 'Iron Fitness Club', logo: 'IF', primaryColor: '#d6001c', secondaryColor: '#ff465f', termsVersion: '2026.07.09', privacyVersion: '2026.07.09' },
  trainers: [
    { id: 'trainer-ana', name: 'Ana Paula', role: 'Personal Trainer' },
    { id: 'trainer-lucas', name: 'Lucas Rocha', role: 'Professor de musculação' }
  ],
  students: [
    { id: 'student-demo-001', token: 'demo-ana-cassoni', name: 'Ana Cassoni', phone: '(48) 98888-7777', email: 'ana@email.com', birthDate: '10/03/1994', status: 'active', goal: 'Hipertrofia e constância', trainerId: 'trainer-ana', monthlyGoal: 20, completedThisMonth: 8, xp: 1280, streak: 4, workouts: [{ id: 'workout-a', name: 'Treino A', focus: 'Pernas e glúteos', exercises: [] }] }
  ],
  auditLog: []
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (saved?.academy && Array.isArray(saved?.students)) return saved
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackState))
  return fallbackState
}

function createToken(name) {
  const slug = name.toLocaleLowerCase('pt-BR').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return `${slug || 'aluno'}-${Math.random().toString(36).slice(2, 8)}`
}

function Dashboard() {
  const [state, setState] = useState(loadState)
  const [selectedToken, setSelectedToken] = useState(state.students[0]?.token || '')
  const [form, setForm] = useState({ name: '', phone: '', email: '', birthDate: '', goal: '', trainerId: state.trainers[0]?.id || '', monthlyGoal: 20, notes: '' })
  const [error, setError] = useState('')
  const qrRef = useRef(null)

  const selectedStudent = state.students.find((student) => student.token === selectedToken) || state.students[0]
  const activeStudents = state.students.filter((student) => student.status === 'active')
  const recentStudents = state.students.slice(0, 6)
  const inviteLink = selectedStudent ? `${window.location.origin}/aluno/${selectedStudent.token}` : ''
  const whatsappLink = selectedStudent ? `https://wa.me/55${selectedStudent.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${selectedStudent.name}! Seu acesso ao app da ${state.academy.name} está pronto: ${inviteLink}`)}` : '#'

  const metrics = useMemo(() => [
    { label: 'Alunos ativos', value: activeStudents.length, icon: Users },
    { label: 'Treinos cadastrados', value: state.students.reduce((sum, student) => sum + (student.workouts?.length || 0), 0), icon: Dumbbell },
    { label: 'XP médio', value: Math.round(state.students.reduce((sum, student) => sum + (student.xp || 0), 0) / Math.max(state.students.length, 1)), icon: Flame },
    { label: 'LGPD vigente', value: state.academy.privacyVersion, icon: ShieldCheck }
  ], [state, activeStudents.length])

  function trainerName(id) {
    return titleCase(state.trainers.find((trainer) => trainer.id === id)?.name || 'Não definido')
  }

  function updateForm(field, value) {
    const formatters = { name: titleCase, phone: formatPhone, birthDate: formatDateInput, goal: sentenceCase, notes: sentenceCase }
    setForm((current) => ({ ...current, [field]: formatters[field] ? formatters[field](value) : value }))
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
      streak: 0,
      workouts: fallbackState.students[0].workouts
    })

    const updated = { ...state, students: [student, ...state.students] }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setState(updated)
    setSelectedToken(token)
    setForm({ name: '', phone: '', email: '', birthDate: '', goal: '', trainerId: state.trainers[0]?.id || '', monthlyGoal: 20, notes: '' })
    setError('')
  }

  function copyLink() {
    navigator.clipboard?.writeText(inviteLink)
  }

  function downloadQr() {
    const svg = qrRef.current?.querySelector('svg')
    if (!svg || !selectedStudent) return
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `qr-${selectedStudent.token}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="academyPanelPage">
      <aside className="academySidebar">
        <a className="academyBrand" href="/"><span>{state.academy.logo}</span><div><strong>Shapp Fit</strong><small>{state.academy.name}</small></div></a>
        <nav>
          <a className="active" href="/painel"><BarChart3 /> Visão geral</a>
          <a href="#cadastro"><UserPlus /> Cadastrar aluno</a>
          <a href="#lista-alunos"><Users /> Lista de alunos</a>
          <a href="#acesso"><QrCode /> QR Code e WhatsApp</a>
          <a href="#lgpd"><ShieldCheck /> LGPD</a>
        </nav>
      </aside>

      <section className="academyMain">
        <header className="academyHero">
          <div><span className="academyTag">Painel da academia</span><h1>Gestão clara. Acesso simples. Treino em movimento.</h1><p>Cadastre alunos, acompanhe a lista, gere o QR Code real e envie o acesso por WhatsApp em uma única central.</p></div>
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
              <div className="realQr" ref={qrRef}><QRCodeSVG value={inviteLink} size={210} level="H" includeMargin bgColor="#ffffff" fgColor="#0a0a0a" /></div>
              <div className="studentAccessData"><strong>{titleCase(selectedStudent.name)}</strong><span>{formatPhone(selectedStudent.phone)} · {selectedStudent.birthDate || 'Data não informada'}</span><code>{inviteLink}</code></div>
              <div className="accessActions">
                <button onClick={copyLink}><Copy /> Copiar link</button>
                <button onClick={downloadQr}><Download /> Baixar QR</button>
                <a href={whatsappLink} target="_blank" rel="noreferrer"><MessageCircle /> WhatsApp</a>
                <a href={inviteLink} target="_blank" rel="noreferrer"><ExternalLink /> Abrir app</a>
              </div>
            </> : <p>Nenhum aluno cadastrado.</p>}
          </article>
        </section>

        <section className="academyCard dashboardStudents" id="lista-alunos">
          <div className="dashboardStudentsHeader">
            <div><span>Alunos cadastrados</span><h2>Lista de alunos</h2><p>Visualização rápida dos cadastros mais recentes.</p></div>
            <a href="/painel/alunos">Abrir lista completa <ArrowRight /></a>
          </div>
          <div className="dashboardStudentsList">
            {recentStudents.map((student) => {
              const progress = Math.min(100, Math.round(((student.completedThisMonth || 0) / Math.max(student.monthlyGoal || 1, 1)) * 100))
              return (
                <article key={student.id}>
                  <div className="dashboardStudentIdentity"><span>{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</span><div><strong>{titleCase(student.name)}</strong><small>{formatPhone(student.phone)} · {student.birthDate || 'Data não informada'}</small></div></div>
                  <div><small>Professor</small><strong>{trainerName(student.trainerId)}</strong></div>
                  <div><small>Objetivo</small><strong>{sentenceCase(student.goal)}</strong></div>
                  <div><small>Meta mensal</small><strong>{student.completedThisMonth || 0}/{student.monthlyGoal || 0} treinos</strong><div className="dashboardProgress"><span style={{ width: `${progress}%` }} /></div></div>
                  <a href={`/aluno/${student.token}`} target="_blank" rel="noreferrer">Abrir app <ExternalLink /></a>
                </article>
              )
            })}
          </div>
        </section>

        <section className="academyCard lgpdCard" id="lgpd"><ShieldCheck /><div><span>Privacidade integrada</span><h2>Consentimento antes do primeiro treino.</h2><p>Termos, Política de Privacidade e tratamento de dados são apresentados antes do acesso ao app do aluno.</p></div></section>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<Dashboard />)
