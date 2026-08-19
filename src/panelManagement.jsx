import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bell,
  CalendarDays,
  ClipboardList,
  Download,
  Dumbbell,
  LineChart,
  Megaphone,
  Plug,
  Sparkles,
  TrendingUp,
  UserRoundCheck,
  Users
} from 'lucide-react'
import './panelManagement.css'

const STORAGE_KEY = 'shappFitMvpState'

const emptyState = {
  academy: { name: 'Sua academia', logo: 'SH' },
  students: [],
  trainers: [],
  schedule: [],
  auditLog: []
}

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return saved?.academy && Array.isArray(saved.students) ? { ...emptyState, ...saved } : emptyState
  } catch {
    return emptyState
  }
}

function percent(value, total) {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

function safeCsvCell(value) {
  let text = String(value ?? '')
  if (/^[=+@\-\t\r]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

function DashboardMetric({ icon: Icon, label, value, detail, tone = '' }) {
  return <article className={`pmMetric ${tone}`}><Icon /><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
}

function PanelManagement() {
  const [state, setState] = useState(readState)
  const [updatedAt, setUpdatedAt] = useState(new Date())

  useEffect(() => {
    document.title = 'Painel Gerencial | Shapp Fit'
    const refresh = () => { setState(readState()); setUpdatedAt(new Date()) }
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  const report = useMemo(() => {
    const students = state.students || []
    const trainers = state.trainers || []
    const schedule = state.schedule || []
    const activeStudents = students.filter(student => student.status !== 'inactive')
    const studentsWithWorkout = activeStudents.filter(student => (student.workouts || []).length > 0)
    const completed = activeStudents.reduce((sum, student) => sum + Number(student.completedThisMonth || 0), 0)
    const monthlyGoal = activeStudents.reduce((sum, student) => sum + Number(student.monthlyGoal || 0), 0)
    const bookings = students.flatMap(student => student.bookings || [])
    const pendingBookings = bookings.filter(booking => booking.status === 'pending')
    const confirmedBookings = bookings.filter(booking => booking.status === 'confirmed')
    const today = new Date().toISOString().slice(0, 10)
    const upcomingActivities = schedule.filter(item => !item.date || item.date >= today)

    const teacherRows = trainers.map(trainer => {
      const assigned = activeStudents.filter(student => student.trainerId === trainer.id)
      const workouts = assigned.reduce((sum, student) => sum + (student.workouts || []).length, 0)
      const trainingVolume = assigned.reduce((sum, student) => sum + Number(student.completedThisMonth || 0), 0)
      const goal = assigned.reduce((sum, student) => sum + Number(student.monthlyGoal || 0), 0)
      return {
        id: trainer.id,
        name: trainer.name,
        role: trainer.role || 'Professor',
        students: assigned.length,
        workouts,
        trainingVolume,
        progress: percent(trainingVolume, goal)
      }
    }).sort((a, b) => b.students - a.students)

    return {
      students,
      trainers,
      schedule,
      activeStudents,
      studentsWithWorkout,
      completed,
      monthlyGoal,
      pendingBookings,
      confirmedBookings,
      upcomingActivities,
      teacherRows,
      activeRate: percent(activeStudents.length, students.length),
      workoutCoverage: percent(studentsWithWorkout.length, activeStudents.length),
      goalProgress: percent(completed, monthlyGoal)
    }
  }, [state])

  function exportReport() {
    const lines = [
      ['Relatório gerencial ShappFit'],
      ['Academia', state.academy?.name || ''],
      ['Gerado em', new Date().toLocaleString('pt-BR')],
      [],
      ['Indicador', 'Valor'],
      ['Alunos ativos', report.activeStudents.length],
      ['Cobertura de treinos', `${report.workoutCoverage}%`],
      ['Treinos concluídos no mês', report.completed],
      ['Progresso das metas mensais', `${report.goalProgress}%`],
      ['Atividades futuras', report.upcomingActivities.length],
      ['Reservas pendentes', report.pendingBookings.length],
      [],
      ['Professor', 'Função', 'Alunos', 'Fichas', 'Treinos no mês', 'Progresso das metas'],
      ...report.teacherRows.map(row => [row.name, row.role, row.students, row.workouts, row.trainingVolume, `${row.progress}%`])
    ]
    const csv = lines.map(line => line.map(safeCsvCell).join(';')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-gerencial-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="pmPage">
      <aside className="pmSidebar">
        <a className="pmBrand" href="/"><span>{state.academy?.logo || 'SH'}</span><div><strong>Shapp Fit</strong><small>{state.academy?.name || 'Sua academia'}</small></div></a>
        <nav>
          <a href="/painel"><ArrowLeft /> Voltar ao painel</a>
          <a className="isActive" href="#visao"><BarChart3 /> Visão geral</a>
          <a href="#equipe"><Users /> Equipe</a>
          <a href="#atividades"><CalendarDays /> Atividades</a>
          <a href="#relatorios"><ClipboardList /> Relatórios</a>
          <a href="/painel/integracoes"><Plug /> Integrações</a>
        </nav>
      </aside>

      <section className="pmMain">
        <header className="pmHero" id="visao">
          <div><span><Sparkles /> Painel gerencial</span><h1>Gestão baseada em dados.</h1><p>Indicadores operacionais construídos com as informações que a academia já registra no ShappFit.</p></div>
          <button type="button" onClick={exportReport}><Download /> Baixar relatório</button>
        </header>

        <div className="pmEvolution"><TrendingUp /><div><strong>Plataforma em constante evolução</strong><p>Novos indicadores gerenciais serão adicionados continuamente, ampliando a capacidade de análise e gestão sem custo adicional para clientes ativos, conforme o plano contratado.</p></div><small>Atualizado às {updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small></div>

        <section className="pmMetrics" aria-label="Resumo gerencial">
          <DashboardMetric icon={Users} label="Alunos ativos" value={report.activeStudents.length} detail={`${report.activeRate}% da base cadastrada`} />
          <DashboardMetric icon={Dumbbell} label="Cobertura de treinos" value={`${report.workoutCoverage}%`} detail={`${report.studentsWithWorkout.length} alunos com ficha`} tone="warm" />
          <DashboardMetric icon={Activity} label="Treinos no mês" value={report.completed} detail={`${report.goalProgress}% das metas somadas`} tone="dark" />
          <DashboardMetric icon={CalendarDays} label="Próximas atividades" value={report.upcomingActivities.length} detail={`${report.pendingBookings.length} reservas pendentes`} />
        </section>

        <section className="pmGrid">
          <article className="pmCard pmUsage">
            <div className="pmCardTitle"><div><span>Utilização da plataforma</span><h2>Indicadores disponíveis</h2></div><LineChart /></div>
            <div className="pmProgressRow"><div><strong>Alunos ativos</strong><small>{report.activeStudents.length} de {report.students.length}</small></div><div><span style={{ width: `${report.activeRate}%` }} /></div><b>{report.activeRate}%</b></div>
            <div className="pmProgressRow"><div><strong>Alunos com treino</strong><small>{report.studentsWithWorkout.length} de {report.activeStudents.length}</small></div><div><span style={{ width: `${report.workoutCoverage}%` }} /></div><b>{report.workoutCoverage}%</b></div>
            <div className="pmProgressRow"><div><strong>Metas mensais</strong><small>{report.completed} de {report.monthlyGoal} treinos</small></div><div><span style={{ width: `${Math.min(report.goalProgress, 100)}%` }} /></div><b>{report.goalProgress}%</b></div>
          </article>

          <article className="pmCard pmActivitySummary" id="atividades">
            <div className="pmCardTitle"><div><span>Agenda e interações</span><h2>Operação atual</h2></div><CalendarDays /></div>
            <div><span><CalendarDays /> Atividades cadastradas</span><strong>{report.schedule.length}</strong></div>
            <div><span><Bell /> Reservas pendentes</span><strong>{report.pendingBookings.length}</strong></div>
            <div><span><UserRoundCheck /> Reservas confirmadas</span><strong>{report.confirmedBookings.length}</strong></div>
          </article>
        </section>

        <section className="pmCard pmTeachers" id="equipe">
          <div className="pmCardTitle"><div><span>Atuação dos professores</span><h2>Distribuição da equipe</h2><p>Visão operacional baseada em alunos vinculados, fichas e treinos registrados — sem atribuir uma nota de produtividade.</p></div><Users /></div>
          <div className="pmTeacherTable">
            <div className="pmTeacherHead"><span>Professor</span><span>Alunos</span><span>Fichas</span><span>Treinos no mês</span><span>Metas</span></div>
            {report.teacherRows.map(row => <article key={row.id}><div><b>{row.name}</b><small>{row.role}</small></div><strong>{row.students}</strong><strong>{row.workouts}</strong><strong>{row.trainingVolume}</strong><span className="pmGoal"><i style={{ width: `${Math.min(row.progress, 100)}%` }} /><b>{row.progress}%</b></span></article>)}
            {!report.teacherRows.length && <p className="pmEmpty">Cadastre professores no painel para iniciar esta visão.</p>}
          </div>
        </section>

        <section className="pmRoadmap" id="relatorios">
          <article><Megaphone /><span>Comunicados e campanhas</span><h3>Alcance em preparação</h3><p>A coleta de entregas e visualizações será incorporada ao módulo de comunicados.</p><small>PRÓXIMA COLETA</small></article>
          <article><Bell /><span>Interações dos alunos</span><h3>Eventos de uso em evolução</h3><p>Novas interações serão adicionadas ao relatório conforme passam a ser registradas pela plataforma.</p><small>EM DESENVOLVIMENTO</small></article>
          <article><ClipboardList /><span>Relatórios</span><h3>Exportação disponível</h3><p>Baixe agora um resumo dos indicadores atuais e da distribuição por professor.</p><button type="button" onClick={exportReport}><Download /> Exportar CSV</button></article>
        </section>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<PanelManagement />)
