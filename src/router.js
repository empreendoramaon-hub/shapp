const path = window.location.pathname

function loadPublishedPanel(moduleName, stylesheet) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `/shapp-panel-v2/${stylesheet}`
  document.head.appendChild(link)
  import(/* @vite-ignore */ `/shapp-panel-v2/${moduleName}`)
}

function addPanelShortcuts() {
  const inject = () => {
    const nav = document.querySelector('.adminV2Sidebar nav')
    if (!nav) return false
    if (!nav.querySelector('[data-management-link]')) {
      const management = document.createElement('button')
      management.type = 'button'
      management.dataset.managementLink = 'true'
      management.textContent = '▦  Gestão'
      management.addEventListener('click', () => { window.location.href = '/painel/gestao' })
      nav.appendChild(management)
    }
    if (!nav.querySelector('[data-integrations-link]')) {
      const integrations = document.createElement('button')
      integrations.type = 'button'
      integrations.dataset.integrationsLink = 'true'
      integrations.textContent = '⌁  Integrações'
      integrations.addEventListener('click', () => { window.location.href = '/painel/integracoes' })
      nav.appendChild(integrations)
    }
    return true
  }

  if (inject()) return
  const observer = new MutationObserver(() => {
    if (inject()) observer.disconnect()
  })
  observer.observe(document.getElementById('root'), { childList: true, subtree: true })
}

if (path.startsWith('/sotalia-admin')) {
  import('./sotaliaAdmin.jsx')
} else if (path.startsWith('/sotalia-app')) {
  import('./sotaliaApp.jsx')
} else if (path.startsWith('/aluno/')) {
  import('./studentMobile.jsx')
} else if (path.startsWith('/academia')) {
  import('./ShappAcademy.jsx')
} else if (path.startsWith('/painel/gestao')) {
  import('./panelManagement.jsx')
} else if (path.startsWith('/painel/integracoes')) {
  import('./panelIntegrations.jsx')
} else if (path.startsWith('/painel/aluno/')) {
  loadPublishedPanel('panelStudentDetail-DTaaWf6z.js', 'panelStudentDetail-Dp-FK_uQ.css')
} else if (path.startsWith('/painel/alunos')) {
  import('./panelStudents.jsx')
} else if (path.startsWith('/painel')) {
  addPanelShortcuts()
  loadPublishedPanel('panelDashboard-CfPbic-D.js', 'panelDashboard-DUZUK0EB.css')
} else {
  import('./main.jsx')
}
