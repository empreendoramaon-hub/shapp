import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, CalendarDays, Copy, ExternalLink, LockKeyhole, MessageCircle, QrCode, ShieldCheck } from 'lucide-react'
import { buildStudentPath, formatPhone, titleCase } from './dataFormat.js'
import { mergeIronFitStudents } from './workoutCatalog.js'
import './panelStudentDemoDetail.css'

const demoSchedule = [
  { id: 'musculacao-07', title: 'Musculação guiada', time: '07:00', place: 'Sala de musculação' },
  { id: 'funcional-18', title: 'Funcional', time: '18:30', place: 'Studio principal' },
  { id: 'cardio-19', title: 'Cardio orientado', time: '19:15', place: 'Sala de cardio' }
]

function getToken() {
  return decodeURIComponent(window.location.pathname.replace('/painel/aluno/', '').split('/')[0])
}

function createDemoCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const random = new Uint8Array(8)
  crypto.getRandomValues(random)
  return Array.from(random, (value) => alphabet[value % alphabet.length]).join('')
}

function initials(name = '') {
  return titleCase(name).split(' ').map((part) => part[0]).slice(0, 2).join('')
}

function DemoStudentDetail() {
  const student = useMemo(() => {
    let currentStudents = []
    try {
      const saved = JSON.parse(localStorage.getItem('shappFitMvpState') || 'null')
      currentStudents = Array.isArray(saved?.students) ? saved.students : []
    } catch { /* usa somente as demonstrações canônicas */ }
    return mergeIronFitStudents(currentStudents).find((item) => item.token === getToken())
  }, [])
  const [linkCode, setLinkCode] = useState('')
  const [message, setMessage] = useState('')

  if (!student) {
    return <main className="studentDetailMissing"><div><h1>Aluno não encontrado</h1><p>Volte ao painel e selecione um aluno cadastrado.</p><a href="/painel"><ArrowLeft /> Voltar ao painel</a></div></main>
  }

  const appLink = `${window.location.origin}${buildStudentPath(student.token)}`
  const trainerName = student.trainerId === 'trainer-lucas' ? 'Lucas Rocha' : 'Ana Paula'
  const whatsapp = `https://wa.me/55${student.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá, ${student.name}! Acesse a demonstração do Shapp neste link: ${appLink}${linkCode ? `\nCódigo demonstrativo: ${linkCode}` : ''}`)}`

  function generateCode() {
    const code = createDemoCode()
    setLinkCode(code)
    setMessage(`Código demonstrativo ${code} gerado. O link de ${student.name} já está pronto para uso.`)
  }

  async function copyLink() {
    await navigator.clipboard?.writeText(appLink)
    setMessage(`Link do app de ${student.name} copiado.`)
  }

  return (
    <main className="studentDetailPage">
      <header className="studentDetailTop">
        <a href="/painel"><ArrowLeft /> Voltar ao painel</a>
        <div className="studentDetailIdentity">
          <span>{initials(student.name)}</span>
          <div><small>Ficha do aluno</small><h1>{titleCase(student.name)}</h1><p>{formatPhone(student.phone)} · {student.email}</p></div>
        </div>
        <div className="studentDetailTopActions">
          <a href={appLink} target="_blank" rel="noreferrer"><ExternalLink /> Abrir app</a>
          <span className="demoProtectedPill"><LockKeyhole /> Demo protegida</span>
        </div>
      </header>

      <section className="studentDetailGrid">
        <section className="studentDetailMain">
          <article className="studentDetailCard">
            <div className="studentDetailSectionHead">
              <div><span>Ficha de treino</span><h2>Treinos e exercícios</h2><p>Ficha demonstrativa em modo somente leitura.</p></div>
              <ShieldCheck />
            </div>
            <div className="detailWorkoutList">
              {student.workouts.map((workout, workoutIndex) => (
                <article className="detailWorkout" key={workout.id}>
                  <header><div><small>Sequência {workout.sequence || workoutIndex + 1}</small><h3>{workout.name}</h3><p>{workout.focus}</p></div><LockKeyhole className="demoWorkoutLock" /></header>
                  <div className="detailExerciseList">
                    {workout.exercises.map((exercise) => <div className="detailExercise demoExerciseReadOnly" key={`${workout.id}-${exercise.name}`}><span><strong>{exercise.name}</strong><small>{exercise.sets}x{exercise.reps} · {exercise.rest}{exercise.load ? ` · ${exercise.load}` : ''}</small></span></div>)}
                  </div>
                </article>
              ))}
            </div>
          </article>

          <article className="studentDetailCard">
            <div className="studentDetailSectionHead"><div><span>Atividades</span><h2>Agenda do aluno</h2><p>Atividades visíveis na demonstração do app.</p></div><CalendarDays /></div>
            <div className="detailActivityList">
              {demoSchedule.map((activity, index) => <label className={index < 2 ? 'isAssigned demoActivityReadOnly' : 'demoActivityReadOnly'} key={activity.id}><input type="checkbox" checked={index < 2} disabled readOnly /><span><strong>{activity.title}</strong><small>Hoje · {activity.time} · {activity.place}</small></span>{index < 2 && <ShieldCheck />}</label>)}
            </div>
          </article>
        </section>

        <aside className="studentDetailSide">
          <article className="studentDetailCard detailAccessCard">
            <div className="studentDetailSectionHead"><div><span>Acesso da demo</span><h2>Código e link</h2></div><QrCode /></div>
            <p>Gere um código demonstrativo ou abra o app de {student.name} diretamente pelo link protegido.</p>
            {linkCode && <strong className="detailLinkCode">{linkCode}</strong>}
            <code title={appLink}>{appLink}</code>
            <button className="detailQrExpand" type="button" onClick={generateCode}><ShieldCheck /> {linkCode ? 'Gerar novo código' : 'Gerar código de vínculo'}</button>
            <div className="detailAccessActions">
              <button type="button" onClick={copyLink}><Copy /> Copiar link do app</button>
              <a href={whatsapp} target="_blank" rel="noreferrer"><MessageCircle /> Enviar acesso</a>
            </div>
            {message && <p className="demoAccessMessage" role="status">{message}</p>}
          </article>

          <article className="studentDetailCard detailSettings">
            <div className="studentDetailSectionHead"><div><span>Configurações</span><h2>Matrícula</h2></div></div>
            <div className="demoReadOnlyField"><small>Professor responsável</small><strong>{trainerName}</strong></div>
            <div className="demoReadOnlyField"><small>Status</small><strong>Matrícula ativa</strong></div>
            <div className="detailTrainer"><small>Proteção da demonstração</small><strong>Dados bloqueados para edição</strong></div>
          </article>
        </aside>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<DemoStudentDetail />)
