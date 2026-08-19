const path = window.location.pathname

import './publicDemoPanel.css'

function loadPublishedStylesheet(stylesheet) {
  if (document.querySelector(`link[data-published-panel-style="${stylesheet}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `/shapp-panel-v2/${stylesheet}`
  link.dataset.publishedPanelStyle = stylesheet
  document.head.appendChild(link)
}

function loadPublishedPanel(moduleName, stylesheet) {
  loadPublishedStylesheet(stylesheet)
  return import(/* @vite-ignore */ `/shapp-panel-v2/${moduleName}`)
}

async function loadProtectedPanel(loader) {
  const { requireShappAdmin } = await import('./panelAccess.js')
  requireShappAdmin(loader)
}

async function preparePublicDemoState() {
  const { mergeIronFitStudents } = await import('./workoutCatalog.js')
  const storageKey = 'shappFitMvpState'
  let savedState = null

  try {
    savedState = JSON.parse(localStorage.getItem(storageKey) || 'null')
  } catch {
    savedState = null
  }

  const state = savedState?.academy && Array.isArray(savedState?.students)
    ? savedState
    : {
        academy: {
          id: 'ironfit-demo',
          name: 'Iron Fitness Club',
          logo: 'IF',
          modules: { exerciseVideos: true, gamification: true, chat: true, nutrition: true }
        },
        trainers: [
          { id: 'trainer-ana', name: 'Ana Paula', role: 'Personal Trainer' },
          { id: 'trainer-lucas', name: 'Lucas Rocha', role: 'Professor de musculação' }
        ],
        students: [],
        schedule: [
          { id: 'musculacao-07', date: new Date().toISOString().slice(0, 10), time: '07:00', title: 'Musculação guiada', place: 'Sala de musculação', coach: 'Equipe técnica', type: 'Força' },
          { id: 'funcional-18', date: new Date().toISOString().slice(0, 10), time: '18:30', title: 'Funcional', place: 'Studio principal', coach: 'Prof. Lucas', type: 'Cardio' },
          { id: 'kids-17', date: new Date().toISOString().slice(0, 10), time: '17:00', title: 'Kids movimento', place: 'Sala kids', coach: 'Equipe infantil', type: 'Kids' }
        ],
        auditLog: []
      }

  state.students = mergeIronFitStudents(state.students)
  localStorage.setItem(storageKey, JSON.stringify(state))
  return state
}

async function loadPublicDemoPanel() {
  await preparePublicDemoState()
  addPanelShortcuts()
  return loadPublishedPanel('panelDashboard-CfPbic-D.js', 'panelDashboard-DUZUK0EB.css')
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
} else if (path.startsWith('/gestao-premium/convite/')) {
  import('./EleveStudentInvite.jsx')
} else if (path.startsWith('/gestao-premium/aluno')) {
  import('./EleveStudentApp.jsx')
} else if (path.startsWith('/gestao-premium')) {
  import('./ElevePlatform.jsx')
} else if (path.startsWith('/eleve/convite/')) {
  import('./EleveStudentInvite.jsx')
} else if (path.startsWith('/eleve/aluno')) {
  import('./EleveStudentApp.jsx')
} else if (path.startsWith('/eleve')) {
  import('./ElevePlatform.jsx')
} else if (path.startsWith('/aluno/')) {
  import('./studentMobile.jsx')
} else if (path.startsWith('/academia')) {
  import('./ShappAcademy.jsx')
} else if (path.startsWith('/painel/gestao')) {
  preparePublicDemoState().then(() => import('./panelManagement.jsx'))
} else if (path.startsWith('/painel/integracoes')) {
  loadProtectedPanel(() => import('./panelIntegrations.jsx'))
} else if (path.startsWith('/painel/aluno/')) {
  loadPublishedStylesheet('panelStudentDetail-Dp-FK_uQ.css')
  import('./panelStudentDemoDetail.jsx')
} else if (path.startsWith('/painel/alunos')) {
  loadPublicDemoPanel()
} else if (path.startsWith('/painel')) {
  loadPublicDemoPanel()
} else {
  import('./main.jsx')
}
