import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Flame,
  Menu,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap
} from 'lucide-react'
import { saveLead } from './services.js'
import ShappFitMvp from './shappFitMvp.jsx'
import './styles.css'

const productLinks = {
  fit: import.meta.env.VITE_SHAPP_FIT_URL || '/aluno/demo-ana-cassoni',
  coach: import.meta.env.VITE_SHAPP_COACH_URL || '/painel',
  gym: import.meta.env.VITE_SHAPP_GYM_URL || '/painel'
}

const products = [
  {
    key: 'fit',
    name: 'SH▲PP Fit',
    eyebrow: 'Aluno final',
    headline: 'Treino, check-in e evolução no bolso.',
    description:
      'Para quem quer sair do ciclo começa-na-segunda e enxergar progresso com rotina, lembretes, metas e histórico.',
    icon: Dumbbell,
    cta: 'Entrar no Fit',
    url: productLinks.fit,
    bullets: ['Treino do dia', 'Evolução visual', 'Lembretes e metas']
  },
  {
    key: 'coach',
    name: 'SH▲PP Coach',
    eyebrow: 'Personal trainer',
    headline: 'Acompanhe alunos antes que eles sumam.',
    description:
      'Painel para montar treinos, ver frequência, receber alertas de dor e detectar risco de abandono.',
    icon: Users,
    cta: 'Entrar no Coach',
    url: productLinks.coach,
    bullets: ['Painel de alunos', 'Alertas de dor', 'Radar de abandono']
  },
  {
    key: 'gym',
    name: 'SH▲PP Gym',
    eyebrow: 'Academias',
    headline: 'Retenção, presença e resultado em uma central.',
    description:
      'Ferramenta para academias acompanharem check-ins, desafios, evolução e alunos em risco de cancelamento.',
    icon: Building2,
    cta: 'Entrar no Gym',
    url: productLinks.gym,
    bullets: ['Check-in por unidade', 'Campanhas internas', 'Relatórios de retenção']
  }
]

const featureMap = [
  {
    title: 'Do cuidado ao treino',
    text: 'A mesma lógica de rotina, alerta e acompanhamento vira gestão fitness: aluno, personal e academia conectados.',
    icon: ShieldCheck
  },
  {
    title: 'Radar de desistência',
    text: 'Sinais de ausência, queda de frequência e check-ins perdidos aparecem no painel antes do aluno evaporar.',
    icon: BarChart3
  },
  {
    title: 'MVP modular',
    text: 'Vídeos, chat, rankings, fotos e gamificação podem ser ativados por academia, sem engessar o produto.',
    icon: Rocket
  }
]

const stats = [
  ['03', 'produtos conectados'],
  ['01', 'marca principal'],
  ['QR', 'acesso por convite'],
  ['LGPD', 'consentimento registrado']
]

function useScrollProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setProgress(max <= 0 ? 0 : window.scrollY / max)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return progress
}

function Header() {
  const [open, setOpen] = useState(false)
  const progress = useScrollProgress()

  return (
    <header className="siteHeader">
      <div className="scrollBeam" style={{ transform: `scaleX(${progress})` }} />
      <a href="#top" className="brandMark" aria-label="SHAPP início">
        <span className="brandText">SH<span>▲</span>PP</span>
        <small>Fit ecosystem</small>
      </a>

      <nav className={`mainNav ${open ? 'isOpen' : ''}`} aria-label="Menu principal">
        <a href="#produtos" onClick={() => setOpen(false)}>Produtos</a>
        <a href="#engine" onClick={() => setOpen(false)}>Motor</a>
        <a href="#lead" onClick={() => setOpen(false)}>Lista beta</a>
        <a href="/painel" className="navCta" data-text="Abrir painel">
          <span>Abrir painel</span>
        </a>
      </nav>

      <button className="menuButton" type="button" onClick={() => setOpen((value) => !value)} aria-label="Abrir menu">
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>
    </header>
  )
}

function MotionLink({ href, children, variant = 'dark', className = '' }) {
  return (
    <a className={`motionLink ${variant} ${className}`} href={href} data-text={children}>
      <span>{children}</span>
      <ArrowUpRight size={18} />
    </a>
  )
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="heroBackdrop" aria-hidden="true">
        <div className="orbit orbitOne" />
        <div className="orbit orbitTwo" />
        <div className="speedLine lineOne" />
        <div className="speedLine lineTwo" />
        <div className="speedLine lineThree" />
      </div>

      <div className="heroCopy reveal">
        <p className="kicker"><Zap size={17} /> White label para academias</p>
        <h1>
          Sua academia vira app, o treino vira sistema.
        </h1>
        <p className="heroText">
          O <strong>SH▲PP Fit</strong> conecta recepção, professores e alunos com cadastro centralizado, convite por QR Code ou WhatsApp, aceite LGPD, treinos personalizados e evolução gamificada.
        </p>
        <div className="heroActions">
          <MotionLink href="/painel">Abrir MVP</MotionLink>
          <MotionLink href="/aluno/demo-ana-cassoni" variant="light">Ver app do aluno</MotionLink>
        </div>
      </div>

      <div className="heroStage reveal delayOne" aria-label="Prévia visual do painel SHAPP">
        <div className="heroCard mainDevice">
          <div className="deviceTop">
            <span>SH▲PP GYM</span>
            <span className="livePill">LIVE</span>
          </div>
          <div className="pulseBadge">
            <Flame size={22} />
            <div>
              <strong>86%</strong>
              <small>aderência semanal</small>
            </div>
          </div>
          <div className="miniGraph" aria-hidden="true">
            <span style={{ height: '42%' }} />
            <span style={{ height: '64%' }} />
            <span style={{ height: '51%' }} />
            <span style={{ height: '83%' }} />
            <span style={{ height: '72%' }} />
            <span style={{ height: '96%' }} />
          </div>
          <div className="alertStrip">
            <Activity size={18} />
            <span>Convite por QR Code pronto</span>
          </div>
        </div>

        <div className="floatingTile tileCoach">
          <Users size={21} />
          <span>Recepção</span>
          <strong>Link enviado no WhatsApp</strong>
        </div>

        <div className="floatingTile tileFit">
          <CheckCircle2 size={21} />
          <span>LGPD aceita</span>
          <strong>App liberado</strong>
        </div>

        <div className="athleteCut" aria-hidden="true">
          <div className="athleteHead" />
          <div className="athleteBody" />
          <div className="athleteArm leftArm" />
          <div className="athleteArm rightArm" />
          <div className="athleteLeg leftLeg" />
          <div className="athleteLeg rightLeg" />
        </div>
      </div>
    </section>
  )
}

function StatsBar() {
  return (
    <section className="statsBar" aria-label="Indicadores do ecossistema">
      {stats.map(([value, label]) => (
        <div className="statItem" key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  )
}

function Products() {
  return (
    <section className="section products" id="produtos">
      <div className="sectionHeader reveal">
        <p className="kicker"><Sparkles size={17} /> Três portas, uma marca</p>
        <h2>Aluno, personal e academia dentro do mesmo ecossistema.</h2>
        <p>
          A landing funciona como vitrine principal. O MVP já inclui painel da academia e app do aluno com fluxo de convite seguro.
        </p>
      </div>

      <div className="productGrid">
        {products.map((product, index) => {
          const Icon = product.icon
          return (
            <article className={`productCard reveal delay${index + 1}`} key={product.key}>
              <div className="cardMedia">
                <Icon size={42} />
                <span>{product.eyebrow}</span>
              </div>
              <div className="cardCopy">
                <h3>{product.name}</h3>
                <h4>{product.headline}</h4>
                <p>{product.description}</p>
              </div>
              <ul className="bulletList">
                {product.bullets.map((bullet) => (
                  <li key={bullet}><CheckCircle2 size={17} /> {bullet}</li>
                ))}
              </ul>
              <MotionLink href={product.url} className="fullWidth">{product.cta}</MotionLink>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Engine() {
  return (
    <section className="section engine" id="engine">
      <div className="enginePanel reveal">
        <div>
          <p className="kicker"><Flame size={17} /> Shapp Fit Engine</p>
          <h2>Cadastro pela academia, acesso pelo aluno, controle sempre no painel.</h2>
          <p>
            O aluno recebe um link único ou QR Code. No primeiro acesso, aceita os termos e a política de privacidade. Se a matrícula for inativada, o app deixa de exibir dados atualizados.
          </p>
        </div>
        <div className="engineFlow">
          <span>Recepção</span>
          <ChevronRight />
          <span>QR/WhatsApp</span>
          <ChevronRight />
          <span>LGPD</span>
          <ChevronRight />
          <span>Treino</span>
        </div>
      </div>

      <div className="featureGrid">
        {featureMap.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div className={`featureCard reveal delay${index + 1}`} key={feature.title}>
              <Icon size={26} />
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function LeadForm() {
  const [form, setForm] = useState({ name: '', email: '', profile: 'Aluno', interest: 'SHAPP Fit' })
  const [status, setStatus] = useState('idle')

  const isValid = useMemo(() => form.name.trim().length > 1 && /\S+@\S+\.\S+/.test(form.email), [form])

  async function handleSubmit(event) {
    event.preventDefault()
    if (!isValid) {
      setStatus('invalid')
      return
    }

    setStatus('loading')
    try {
      await saveLead({ ...form, source: 'shapp-landing' })
      setStatus('success')
      setForm({ name: '', email: '', profile: 'Aluno', interest: 'SHAPP Fit' })
    } catch (error) {
      console.error(error)
      setStatus('error')
    }
  }

  return (
    <section className="section leadSection" id="lead">
      <div className="leadCopy reveal">
        <p className="kicker"><Rocket size={17} /> Lista beta</p>
        <h2>Capture interessados enquanto o produto ganha músculo.</h2>
        <p>
          O formulário está preparado para captura de leads. A versão atual salva em modo local e pode ser conectada ao Firebase com variáveis do projeto.
        </p>
      </div>

      <form className="leadForm reveal delayOne" onSubmit={handleSubmit}>
        <label>
          Nome
          <input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Ex: Gabriel Cassoni"
            autoComplete="name"
          />
        </label>
        <label>
          E-mail
          <input
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="voce@email.com"
            type="email"
            autoComplete="email"
          />
        </label>
        <label>
          Perfil
          <select value={form.profile} onChange={(event) => setForm((current) => ({ ...current, profile: event.target.value }))}>
            <option>Aluno</option>
            <option>Personal trainer</option>
            <option>Academia</option>
            <option>Investidor/parceiro</option>
          </select>
        </label>
        <label>
          Interesse
          <select value={form.interest} onChange={(event) => setForm((current) => ({ ...current, interest: event.target.value }))}>
            <option>SHAPP Fit</option>
            <option>SHAPP Coach</option>
            <option>SHAPP Gym</option>
            <option>Todos</option>
          </select>
        </label>
        <button className="motionButton" type="submit" data-text={status === 'loading' ? 'Enviando...' : 'Quero testar'} disabled={status === 'loading'}>
          <span>{status === 'loading' ? 'Enviando...' : 'Quero testar'}</span>
          <ArrowUpRight size={18} />
        </button>
        {status === 'success' && <p className="formMessage success">Lead salvo. O foguete entrou em aquecimento. 🚀</p>}
        {status === 'invalid' && <p className="formMessage">Preencha nome e e-mail válido.</p>}
        {status === 'error' && <p className="formMessage">Não consegui salvar agora. Verifique o projeto ou use o modo local.</p>}
      </form>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <a href="#top" className="brandMark">
        <span className="brandText">SH<span>▲</span>PP</span>
        <small>Seu shape no app</small>
      </a>
      <div className="footerLinks">
        <a href="/aluno/demo-ana-cassoni">Fit</a>
        <a href="/painel">Coach</a>
        <a href="/painel">Gym</a>
      </div>
    </footer>
  )
}

function LandingApp() {
  useEffect(() => {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatsBar />
        <Products />
        <Engine />
        <LeadForm />
      </main>
      <Footer />
    </>
  )
}

function App() {
  const path = window.location.pathname
  if (path.startsWith('/painel') || path.startsWith('/aluno/')) {
    return <ShappFitMvp />
  }
  return <LandingApp />
}

createRoot(document.getElementById('root')).render(<App />)
