import React, { useEffect, useRef, useState } from 'react'
import './academyPrivacy.css'

const STORAGE_KEY = 'shapp-academy-cookie-consent'

function PolicyContent({ type }) {
  if (type === 'terms') return (
    <>
      <h3>Termos de Uso</h3>
      <p>Ao navegar neste site, você concorda em usar as informações de forma adequada, sem tentar comprometer a segurança, copiar indevidamente conteúdos ou prejudicar a experiência de outros usuários.</p>
      <h3>Informações comerciais</h3>
      <p>Planos, horários, modalidades e condições podem mudar. As informações deste site são demonstrativas e devem ser confirmadas diretamente com a equipe da academia.</p>
      <h3>Conteúdos e imagens</h3>
      <p>Textos, imagens, marca, identidade visual e materiais apresentados pertencem à Shapp ou são utilizados para demonstrar sua plataforma e seus serviços. O uso por terceiros depende de autorização.</p>
      <h3>Serviços de terceiros</h3>
      <p>Links para aplicativos, mapas, redes sociais e outras plataformas podem ter políticas próprias. Ao acessá-los, você também fica sujeito aos termos desses serviços.</p>
    </>
  )

  if (type === 'optout') return (
    <>
      <h3>Opt-out</h3>
      <p>Você pode rejeitar cookies não essenciais a qualquer momento. Isso não impede o funcionamento básico do site, mas pode limitar medições de audiência e melhorias de navegação.</p>
      <h3>Como controlar</h3>
      <ul>
        <li>Use “Rejeitar não essenciais” abaixo.</li>
        <li>Use “Customizar” para escolher análise e marketing separadamente.</li>
        <li>Você também pode limpar cookies nas configurações do navegador.</li>
      </ul>
      <p>Quando houver ferramentas de terceiros, como mapas, pixels ou conteúdos incorporados, esses fornecedores poderão oferecer controles próprios de privacidade.</p>
    </>
  )

  return (
    <>
      <h3>Política de Privacidade</h3>
      <p>A Shapp respeita a privacidade dos visitantes. Este site pode coletar dados técnicos básicos, como páginas acessadas, tipo de dispositivo, navegador e preferências de cookies, para funcionamento, segurança e melhoria da experiência.</p>
      <h3>Cookies essenciais</h3>
      <p>São necessários para recursos básicos, como lembrar suas preferências de privacidade, manter a estabilidade da navegação e exibir componentes essenciais.</p>
      <h3>Cookies de análise e terceiros</h3>
      <p>O site pode usar ferramentas de análise, mapas, conteúdos incorporados e campanhas de terceiros. Esses serviços podem definir cookies próprios para medir visitas, entender a origem do tráfego e melhorar a experiência.</p>
      <h3>LGPD</h3>
      <p>Nos termos da Lei Geral de Proteção de Dados, você pode solicitar informação, correção, exclusão ou revisão do uso dos seus dados entrando em contato com a Shapp pelos canais oficiais.</p>
    </>
  )
}

function Preferences({ values, onChange }) {
  return (
    <div className="shaPrivacyOptions">
      <label><span><strong>Essenciais</strong><small>Necessários para o funcionamento e para salvar suas escolhas.</small></span><input type="checkbox" checked disabled /></label>
      <label><span><strong>Análise</strong><small>Ajudam a entender visitas e melhorar a navegação.</small></span><input type="checkbox" checked={values.analytics} onChange={event => onChange({ ...values, analytics: event.target.checked })} /></label>
      <label><span><strong>Marketing</strong><small>Permitem medir campanhas e conteúdos de terceiros.</small></span><input type="checkbox" checked={values.marketing} onChange={event => onChange({ ...values, marketing: event.target.checked })} /></label>
    </div>
  )
}

export default function AcademyPrivacy() {
  const [showConsent, setShowConsent] = useState(false)
  const [modal, setModal] = useState(null)
  const [preferences, setPreferences] = useState({ analytics: false, marketing: false })
  const dialogRef = useRef(null)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (!saved) setShowConsent(true)
      else {
        const parsed = JSON.parse(saved)
        setPreferences({ analytics: Boolean(parsed.analytics), marketing: Boolean(parsed.marketing) })
      }
    } catch {
      setShowConsent(true)
    }

    const reopen = () => setShowConsent(true)
    window.addEventListener('shapp-privacy-open', reopen)
    return () => window.removeEventListener('shapp-privacy-open', reopen)
  }, [])

  useEffect(() => {
    if (!modal) return undefined
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.querySelector('button')?.focus()
    const onKeyDown = event => {
      if (event.key === 'Escape') setModal(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus?.()
    }
  }, [modal])

  const saveConsent = values => {
    const consent = { essential: true, ...values, updatedAt: new Date().toISOString() }
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent)) } catch { /* preferência válida apenas nesta sessão */ }
    setPreferences(values)
    setShowConsent(false)
    setModal(null)
  }

  const titles = { privacy: 'Política de Privacidade', terms: 'Termos de uso', optout: 'Opt-out', customize: 'Preferências de cookies' }

  return (
    <>
      {showConsent && (
        <section className="shaPrivacyConsent" aria-label="Controle de privacidade e cookies">
          <div className="shaPrivacyCard">
            <div className="shaPrivacyCardHead"><span>SH▲PP / PRIVACIDADE</span><h2>Controle sua privacidade</h2></div>
            <div className="shaPrivacyCardBody">
              <p>Usamos cookies essenciais para o site funcionar e, com sua permissão, cookies de análise e marketing para melhorar sua experiência.</p>
              <div className="shaPrivacyLinks" aria-label="Documentos de privacidade">
                <button type="button" onClick={() => setModal('privacy')}>Política de Privacidade</button><span>•</span>
                <button type="button" onClick={() => setModal('terms')}>Termos de uso</button><span>•</span>
                <button type="button" onClick={() => setModal('optout')}>Opt-out</button>
              </div>
              <div className="shaPrivacyActions">
                <button type="button" onClick={() => setModal('customize')}>Customizar</button>
                <button type="button" className="isDark" onClick={() => saveConsent({ analytics: false, marketing: false })}>Rejeitar</button>
                <button type="button" className="isPrimary" onClick={() => saveConsent({ analytics: true, marketing: true })}>Aceitar</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {modal && (
        <section className="shaPrivacyModal" role="dialog" aria-modal="true" aria-labelledby="shaPrivacyModalTitle" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null) }}>
          <div className="shaPrivacyDialog" ref={dialogRef}>
            <div className="shaPrivacyDialogHead"><h2 id="shaPrivacyModalTitle">{titles[modal]}</h2><button type="button" onClick={() => setModal(null)} aria-label="Fechar">×</button></div>
            <div className="shaPrivacyDialogBody">{modal === 'customize' ? <Preferences values={preferences} onChange={setPreferences} /> : <PolicyContent type={modal} />}</div>
            <div className="shaPrivacyDialogFoot">
              {modal === 'optout' && <button type="button" className="isDark" onClick={() => saveConsent({ analytics: false, marketing: false })}>Rejeitar não essenciais</button>}
              {modal !== 'customize' && <button type="button" className="isPrimary" onClick={() => setModal('customize')}>Customizar</button>}
              {modal === 'customize' && <button type="button" className="isPrimary" onClick={() => saveConsent(preferences)}>Salvar preferências</button>}
              <button type="button" onClick={() => setModal(null)}>Fechar</button>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
