import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CheckCircle2, Download, LockKeyhole, ShieldCheck } from 'lucide-react'
import { activateEleveInvite, buildEleveStudentAppPath, createEleveSafeStorageState, hashElevePassword, hydrateEleveState } from './elevePlatformData.js'
import './eleveStudentInvite.css'

const IS_ELEVE = window.location.pathname.startsWith('/eleve')
const BASE_PATH = IS_ELEVE ? '/eleve' : '/gestao-premium'
const STORAGE_KEY = IS_ELEVE ? 'shappElevePlatformV2' : 'shappManagementPremiumV1'
const VARIANT = IS_ELEVE ? 'eleve' : 'generic'

function loadState() {
  try { return hydrateEleveState(JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'), VARIANT) }
  catch { return hydrateEleveState(null, VARIANT) }
}

function EleveStudentInvite() {
  const token = decodeURIComponent(window.location.pathname.split('/').filter(Boolean).at(-1) || '')
  const [state, setState] = useState(loadState)
  const invite = (state.invites || []).find((item) => item.token === token)
  const [email, setEmail] = useState(invite?.email || '')
  const [password, setPassword] = useState('')
  const [checks, setChecks] = useState({ terms: false, privacy: false, data: false })
  const [error, setError] = useState('')
  const [complete, setComplete] = useState(false)

  if (!invite) return <div className="esiPage"><main className="esiCard"><div className="esiBrand"><b>{state.academy.brandMark || 'SH▲PP'}</b><span>APP DO ALUNO</span></div><h1>Convite não encontrado.</h1><p>Solicite um novo link à unidade onde sua matrícula foi realizada.</p></main></div>

  const unit = state.units.find((item) => item.id === invite.unitId)
  const plan = state.plans.find((item) => item.id === invite.planId)
  async function register() {
    if (invite.email && email.toLowerCase() !== invite.email.toLowerCase()) return setError('Utilize o mesmo e-mail informado na matrícula.')
    if (password.length < 8) return setError('Crie uma senha com pelo menos 8 caracteres.')
    try {
      const passwordHash = await hashElevePassword(password)
      const result = activateEleveInvite(state, token, { ...checks, email, passwordHash })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(createEleveSafeStorageState(result.state)))
      setState(result.state); setComplete(true); setError('')
      setTimeout(() => { window.location.href = buildEleveStudentAppPath(result.student, BASE_PATH) }, 900)
    } catch (registrationError) { setError(registrationError.message) }
  }
  if (complete) return <div className="esiPage"><main className="esiCard esiSuccess"><CheckCircle2 /><div className="esiBrand"><b>{state.academy.brandMark || 'SH▲PP'}</b><span>CADASTRO CONCLUÍDO</span></div><h1>Bem-vindo à {state.academy.name}.</h1><p>Seu perfil já apareceu no painel da unidade. Agora a equipe poderá realizar sua avaliação e preparar seu treino.</p><span>Abrindo o aplicativo...</span></main></div>
  return <div className="esiPage"><main className="esiCard"><div className="esiBrand"><b>{state.academy.brandMark || 'SH▲PP'}</b><span>CONVITE INDIVIDUAL</span></div><p className="esiEyebrow">SUA MATRÍCULA ESTÁ PRONTA</p><h1>Olá, {invite.name.split(' ')[0]}.</h1><p>Conclua seu acesso para entrar no aplicativo da unidade <b>{unit?.name}</b>.</p><div className="esiSummary"><span><small>Unidade</small><b>{unit?.name}</b></span><span><small>Plano</small><b>{plan?.name}</b></span></div><label>E-mail da matrícula<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Crie sua senha<div><LockKeyhole /><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" /></div></label><section><h2><ShieldCheck /> Privacidade e termos</h2><label><input type="checkbox" checked={checks.terms} onChange={(event) => setChecks({ ...checks, terms: event.target.checked })} /><span>Li e aceito os Termos de Uso <small>Versão {state.academy.termsVersion}</small></span></label><label><input type="checkbox" checked={checks.privacy} onChange={(event) => setChecks({ ...checks, privacy: event.target.checked })} /><span>Li e aceito a Política de Privacidade <small>Versão {state.academy.privacyVersion}</small></span></label><label><input type="checkbox" checked={checks.data} onChange={(event) => setChecks({ ...checks, data: event.target.checked })} /><span>Autorizo o tratamento dos dados necessários ao acompanhamento do treino</span></label></section>{error && <p className="esiError">{error}</p>}<button onClick={register}><Download /> Aceitar, criar login e abrir o app</button><footer>O link é individual e está vinculado à sua matrícula e unidade.</footer></main></div>
}

createRoot(document.getElementById('root')).render(<EleveStudentInvite />)
