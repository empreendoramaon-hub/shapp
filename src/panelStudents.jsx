import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, Copy, Dumbbell, Filter, MessageCircle, MoreHorizontal, QrCode, Salad, Search, UserPlus } from 'lucide-react'
import { formatPhone, sentenceCase, titleCase } from './dataFormat.js'
import './panelStudents.css'

const STORAGE_KEY = 'shappFitMvpState'

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
}

function StudentsPage() {
  const [state, setState] = useState(loadState)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [copied, setCopied] = useState('')

  const students = useMemo(() => {
    const list = state?.students || []
    return list.filter((student) => {
      const matchesQuery = `${student.name} ${student.email} ${student.goal}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))
      const matchesStatus = status === 'all' || student.status === status
      return matchesQuery && matchesStatus
    })
  }, [state, query, status])

  if (!state) return <main className="studentsEmpty">Nenhum dado do painel encontrado.</main>

  function trainerName(id) {
    return titleCase(state.trainers.find((trainer) => trainer.id === id)?.name || 'Não definido')
  }

  function inviteLink(student) {
    return `${window.location.origin}/aluno/${student.token}`
  }

  async function copyLink(student) {
    await navigator.clipboard?.writeText(inviteLink(student))
    setCopied(student.id)
    setTimeout(() => setCopied(''), 1800)
  }

  function toggleStatus(student) {
    const updated = {
      ...state,
      students: state.students.map((item) => item.id === student.id ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' } : item)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    setState(updated)
  }

  return (
    <main className="studentsPanel">
      <header className="studentsHeader">
        <div>
          <a href="/painel"><ArrowLeft size={18} /> Voltar ao painel</a>
          <p>Gestão da academia</p>
          <h1>Alunos</h1>
          <span>{state.students.length} cadastros na base</span>
        </div>
        <a className="newStudentButton" href="/painel#cadastro"><UserPlus size={19} /> Novo aluno</a>
      </header>

      <section className="studentsToolbar">
        <label className="searchBox"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, e-mail ou objetivo" /></label>
        <label className="statusFilter"><Filter size={17} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="active">Ativos</option><option value="inactive">Inativos</option></select></label>
      </section>

      <section className="studentCards">
        {students.map((student) => {
          const progress = Math.min(100, Math.round(((student.completedThisMonth || 0) / Math.max(student.monthlyGoal || 1, 1)) * 100))
          const displayName = titleCase(student.name)
          const whatsapp = `https://wa.me/55${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Ola, ${displayName}! Seu acesso ao app da ${state.academy.name}: ${inviteLink(student)}`)}`
          return (
            <article className="studentRow" key={student.id}>
              <div className="studentIdentity">
                <div className="studentAvatar">{displayName.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div>
                <div>
                  <h2>{displayName}</h2>
                  <p>{formatPhone(student.phone) || 'Sem telefone'} · {student.birthDate || 'Data não informada'}</p>
                  <small>{student.email || 'Sem e-mail'}</small>
                  <span className={`statusTag ${student.status}`}>{student.status === 'active' ? 'Ativo' : 'Inativo'}</span>
                </div>
              </div>
              <div className="studentMeta">
                <div><small>Professor</small><strong>{trainerName(student.trainerId)}</strong></div>
                <div><small>Objetivo</small><strong>{sentenceCase(student.goal || 'Não informado')}</strong></div>
                <div><small>Rotinas</small><strong><Dumbbell size={15} /> {student.workouts?.length || 0} dias</strong></div>
                <div><small>Nutricionista</small><strong><Salad size={15} /> {student.nutrition?.enabled ? 'Ativa' : 'Off'}</strong></div>
                <div><small>Frequência</small><strong>{student.completedThisMonth || 0}/{student.monthlyGoal || 0} treinos</strong><div className="tinyProgress"><span style={{ width: `${progress}%` }} /></div></div>
              </div>
              <div className="studentActions">
                <a href={`/aluno/${student.token}`} target="_blank" rel="noreferrer"><QrCode size={18} /> Abrir app</a>
                <a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={18} /> WhatsApp</a>
                <button onClick={() => copyLink(student)}><Copy size={18} /> {copied === student.id ? 'Copiado' : 'Copiar link'}</button>
                <button className="statusButton" onClick={() => toggleStatus(student)}><MoreHorizontal size={18} /> {student.status === 'active' ? 'Inativar' : 'Reativar'}</button>
              </div>
            </article>
          )
        })}
        {!students.length && <div className="noResults">Nenhum aluno encontrado com esses filtros.</div>}
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<StudentsPage />)
