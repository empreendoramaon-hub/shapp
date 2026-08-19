import { isShappAdmin, signInShappAdmin, subscribeShappAuth } from './shappFirebase.js'
import './panelAccess.css'

function addTextElement(parent, tag, text, className = '') {
  const element = document.createElement(tag)
  if (className) element.className = className
  element.textContent = text
  parent.appendChild(element)
  return element
}

export function requireShappAdmin(loadPanel) {
  const root = document.getElementById('root')
  let panelLoaded = false

  function renderAccess(message = '') {
    root.replaceChildren()
    const page = document.createElement('main')
    page.className = 'panelAccessPage'
    const card = document.createElement('section')
    card.className = 'panelAccessCard'
    addTextElement(card, 'span', 'SHAPP FIT · ACESSO PROTEGIDO', 'panelAccessKicker')
    addTextElement(card, 'h1', 'Entre para acessar o painel.')
    addTextElement(card, 'p', 'Os dados administrativos são restritos à conta autorizada da Shapp.')
    if (message) addTextElement(card, 'div', message, 'panelAccessError')
    const button = addTextElement(card, 'button', 'Entrar com Google')
    button.type = 'button'
    button.addEventListener('click', async () => {
      button.disabled = true
      button.textContent = 'Abrindo acesso seguro...'
      try {
        await signInShappAdmin()
      } catch (error) {
        renderAccess(error?.message || 'Não foi possível confirmar sua conta.')
      }
    })
    page.appendChild(card)
    root.appendChild(page)
  }

  return subscribeShappAuth((user) => {
    if (panelLoaded) return
    if (!isShappAdmin(user)) {
      renderAccess()
      return
    }
    panelLoaded = true
    root.replaceChildren()
    Promise.resolve(loadPanel()).catch(() => {
      panelLoaded = false
      renderAccess('Não foi possível carregar o painel. Atualize a página e tente novamente.')
    })
  })
}
