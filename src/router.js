const path = window.location.pathname

if (path.startsWith('/aluno/')) {
  import('./studentMobile.jsx')
} else if (path.startsWith('/painel/alunos')) {
  import('./panelStudents.jsx')
} else {
  import('./main.jsx')
}
