import { UsersRound } from 'lucide-react'
import React from 'react'
import { createRoot } from 'react-dom/client'

function StudentsIcon() {
  return React.createElement(UsersRound, { size: 18 })
}

function addStudentsLink() {
  if (!window.location.pathname.startsWith('/painel') || window.location.pathname.startsWith('/painel/alunos')) return
  const nav = document.querySelector('.fitSidebar nav')
  if (!nav || nav.querySelector('[data-students-link]')) return

  const link = document.createElement('a')
  link.href = '/painel/alunos'
  link.dataset.studentsLink = 'true'
  link.className = 'fitStudentsNavLink'

  const iconHost = document.createElement('span')
  iconHost.className = 'fitNavIconHost'
  const label = document.createElement('span')
  label.textContent = 'Lista de alunos'
  link.append(iconHost, label)

  const registerLink = [...nav.querySelectorAll('a')].find((item) => item.getAttribute('href') === '#cadastro')
  if (registerLink?.nextSibling) nav.insertBefore(link, registerLink.nextSibling)
  else nav.appendChild(link)

  createRoot(iconHost).render(React.createElement(StudentsIcon))
}

const observer = new MutationObserver(addStudentsLink)
observer.observe(document.documentElement, { childList: true, subtree: true })
addStudentsLink()
