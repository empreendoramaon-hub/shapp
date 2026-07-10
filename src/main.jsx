import React from 'react'
import { createRoot } from 'react-dom/client'
import ShappFitMvp from './shappFitMvp.jsx'
import ShappLanding from './ShappLanding.jsx'
import './styles.css'

function App() {
  const path = window.location.pathname

  if (path.startsWith('/painel') || path.startsWith('/aluno/')) {
    return <ShappFitMvp />
  }

  return <ShappLanding />
}

createRoot(document.getElementById('root')).render(<App />)
