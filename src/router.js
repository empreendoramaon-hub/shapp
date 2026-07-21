const path = window.location.pathname

if (path.startsWith('/sotalia-admin')) {
  import('./sotaliaAdmin.jsx')
} else if (path.startsWith('/sotalia-app')) {
  import('./sotaliaApp.jsx')
} else if (path.startsWith('/aluno/')) {
  import('./studentMobile.jsx')
} else if (path.startsWith('/painel/alunos')) {
  import('./panelStudents.jsx')
} else if (path.startsWith('/painel')) {
  import('./panelDashboard.jsx')
} else {
  import('./main.jsx')
}
