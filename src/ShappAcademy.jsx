import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowRight, BarChart3, CalendarDays, Check, Dumbbell, Menu, MessageCircle, Smartphone, Sparkles, Users, X } from 'lucide-react'
import './shappAcademy.css'
import AcademyPrivacy from './AcademyPrivacy'

const modalities = [
  ['01', 'Musculação', 'Força e performance', '/deadlift.jpg'],
  ['02', 'Treino coletivo', 'Energia que conecta', '/hero-home.jpg'],
  ['03', 'Yoga & mobilidade', 'Corpo em equilíbrio', '/yoga.jpg'],
  ['04', 'Funcional', 'Movimento para a vida', '/highfive.webp']
]

const plans = [
  ['Start', 'R$ 129', ['Musculação livre', 'Avaliação inicial', 'App Shapp', 'Treino personalizado']],
  ['Performance', 'R$ 189', ['Todas as modalidades', 'App Shapp completo', 'Aulas coletivas', 'Acompanhamento mensal'], true],
  ['Family', 'Sob consulta', ['Plano para a família', 'Perfis conectados', 'Agenda compartilhada', 'Benefícios exclusivos']]
]

const marqueeItems = [
  ['TREINE MELHOR', '/deadlift.jpg', 'Musculação'],
  ['EVOLUA SEMPRE', '/hero-home.jpg', 'Treino coletivo'],
  ['VIVA SHAPP', '/highfive.webp', 'Energia fitness'],
  ['MOVA-SE', '/yoga.jpg', 'Yoga e mobilidade']
]

function FitnessMarquee() {
  const trackRef = useRef(null)
  const groupRef = useRef(null)

  useEffect(() => {
    const track = trackRef.current
    const group = groupRef.current
    if (!track || !group) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let offset = 0
    let loopWidth = group.offsetWidth
    let dragging = false
    let velocity = 0
    let previousX = 0
    let previousPointerTime = 0
    let previousFrameTime = performance.now()
    let animationFrame = 0

    const normalizeOffset = () => {
      if (!loopWidth) return
      while (offset <= -loopWidth) offset += loopWidth
      while (offset > 0) offset -= loopWidth
    }

    const animate = now => {
      const deltaTime = Math.min(32, now - previousFrameTime)
      previousFrameTime = now
      if (!dragging && !reducedMotion.matches) {
        if (Math.abs(velocity) > 0.015) {
          offset += velocity * deltaTime
          velocity *= 0.94
        } else {
          offset -= 0.065 * deltaTime
        }
      }
      normalizeOffset()
      track.style.transform = `translate3d(${offset}px, 0, 0)`
      animationFrame = window.requestAnimationFrame(animate)
    }

    const onPointerDown = event => {
      dragging = true
      velocity = 0
      previousX = event.clientX
      previousPointerTime = performance.now()
      track.classList.add('isDragging')
      track.setPointerCapture(event.pointerId)
    }

    const onPointerMove = event => {
      if (!dragging) return
      const now = performance.now()
      const movement = event.clientX - previousX
      const elapsed = Math.max(8, now - previousPointerTime)
      offset += movement
      velocity = movement / elapsed
      previousX = event.clientX
      previousPointerTime = now
      normalizeOffset()
    }

    const releasePointer = event => {
      if (!dragging) return
      dragging = false
      if (reducedMotion.matches) velocity = 0
      track.classList.remove('isDragging')
      if (track.hasPointerCapture?.(event.pointerId)) track.releasePointerCapture(event.pointerId)
    }

    const resizeObserver = new ResizeObserver(() => {
      loopWidth = group.offsetWidth
      normalizeOffset()
    })
    resizeObserver.observe(group)
    track.addEventListener('pointerdown', onPointerDown)
    track.addEventListener('pointermove', onPointerMove)
    track.addEventListener('pointerup', releasePointer)
    track.addEventListener('pointercancel', releasePointer)
    animationFrame = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      track.removeEventListener('pointerdown', onPointerDown)
      track.removeEventListener('pointermove', onPointerMove)
      track.removeEventListener('pointerup', releasePointer)
      track.removeEventListener('pointercancel', releasePointer)
    }
  }, [])

  const renderItems = hidden => marqueeItems.map(([title, image, alt]) => (
    <React.Fragment key={`${title}-${hidden ? 'copy' : 'original'}`}>
      <strong>{title}</strong>
      <figure><img src={image} alt={hidden ? '' : alt} draggable="false" /></figure>
    </React.Fragment>
  ))

  return (
    <section className="shaTicker" aria-label="Destaques da experiência Shapp. Arraste horizontalmente para explorar.">
      <div className="shaTickerTrack" ref={trackRef}>
        <div className="shaTickerGroup" ref={groupRef}>{renderItems(false)}</div>
        <div className="shaTickerGroup" aria-hidden="true">{renderItems(true)}</div>
      </div>
    </section>
  )
}

function AcademyBrand() {
  return <a className="shaBrand" href="#inicio" aria-label="Shapp Fit Center"><strong><span>SH</span><i>▲</i><span>PP</span></strong><small>FIT CENTER</small></a>
}

function ShappAcademy() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const zoomFrames = [...document.querySelectorAll('[data-scroll-zoom]')]
    const hero = document.querySelector('.shaHero')
    let animationFrame = 0

    const updateZoom = () => {
      animationFrame = 0
      if (reducedMotion.matches) {
        zoomFrames.forEach(frame => frame.style.setProperty('--sha-scroll-zoom', '1'))
        hero?.style.setProperty('--sha-hero-zoom', '1')
        hero?.style.setProperty('--sha-hero-shift', '0px')
        return
      }

      const viewportCenter = window.innerHeight / 2
      const mobileFactor = window.innerWidth < 760 ? 0.55 : 1
      zoomFrames.forEach(frame => {
        const rect = frame.getBoundingClientRect()
        const elementCenter = rect.top + rect.height / 2
        const distance = Math.min(1, Math.abs(elementCenter - viewportCenter) / (window.innerHeight + rect.height / 2))
        frame.style.setProperty('--sha-scroll-zoom', (1.12 - distance * 0.12 * mobileFactor).toFixed(4))
      })

      if (hero) {
        const progress = Math.min(1, Math.max(0, window.scrollY / Math.max(hero.offsetHeight, 1)))
        hero.style.setProperty('--sha-hero-zoom', (1.035 + progress * 0.11 * mobileFactor).toFixed(4))
        hero.style.setProperty('--sha-hero-shift', `${(progress * 34 * mobileFactor).toFixed(1)}px`)
      }
    }

    const requestZoomUpdate = () => {
      if (!animationFrame) animationFrame = window.requestAnimationFrame(updateZoom)
    }

    updateZoom()
    window.addEventListener('scroll', requestZoomUpdate, { passive: true })
    window.addEventListener('resize', requestZoomUpdate)
    reducedMotion.addEventListener?.('change', requestZoomUpdate)
    return () => {
      window.removeEventListener('scroll', requestZoomUpdate)
      window.removeEventListener('resize', requestZoomUpdate)
      reducedMotion.removeEventListener?.('change', requestZoomUpdate)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <main className="shaPage" id="inicio">
      <header className="shaHeader">
        <AcademyBrand />
        <nav className={menuOpen ? 'isOpen' : ''} aria-label="Navegação da academia">
          <a href="#estrutura" onClick={closeMenu}>Estrutura</a><a href="#modalidades" onClick={closeMenu}>Modalidades</a><a href="#planos" onClick={closeMenu}>Planos</a><a href="#app" onClick={closeMenu}>App</a><a href="#contato" onClick={closeMenu}>Contato</a>
        </nav>
        <a className="shaHeaderCta" href="#planos">Comece agora <ArrowRight /></a>
        <button className="shaMenu" type="button" aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <section className="shaHero">
        <div className="shaHeroShade" />
        <div className="shaHeroCopy"><p>ACADEMIA CONECTADA · EXPERIÊNCIA SHAPP</p><h1>Seu melhor<br /><em>movimento.</em></h1><span>Treino, acompanhamento e tecnologia em uma experiência criada para fazer você evoluir todos os dias.</span><div><a href="#planos">Quero treinar <ArrowRight /></a><a href="#estrutura">Conhecer a academia</a></div></div>
        <div className="shaHeroCounter"><strong>01</strong><span>/ 04</span></div><p className="shaHeroVertical">FORÇA · MOVIMENTO · EVOLUÇÃO</p>
      </section>

      <FitnessMarquee />

      <section className="shaIntro" id="estrutura">
        <div className="shaSectionLead"><p><b>01</b> Nossa experiência</p><h2>Uma academia que acompanha o seu ritmo.</h2></div>
        <div className="shaIntroGrid">
          <div className="shaIntroImage" data-scroll-zoom><img src="/highfive.webp" alt="Alunas celebrando o treino" /><span>ENERGIA QUE CONECTA</span></div>
          <div className="shaIntroCopy"><p>Ambientes bem planejados, equipe próxima e tecnologia Shapp para transformar cada treino em progresso visível.</p><div className="shaNumbers"><article><strong>1k+</strong><span>alunos em movimento</span></article><article><strong>30+</strong><span>profissionais preparados</span></article><article><strong>06</strong><span>modalidades integradas</span></article><article><strong>App</strong><span>treino e agenda na mão</span></article></div></div>
        </div>
      </section>

      <section className="shaModalities" id="modalidades">
        <div className="shaSectionLead isLight"><p><b>02</b> Modalidades</p><h2>Encontre o treino que move você.</h2></div>
        <div className="shaModalityGrid">{modalities.map(([number, name, subtitle, image]) => <article key={number} data-scroll-zoom><img src={image} alt={name} /><div><small>MODALIDADE / {number}</small><h3>{name}</h3><p>{subtitle}</p><span>Conhecer <ArrowRight /></span></div></article>)}</div>
      </section>

      <section className="shaApp" id="app">
        <div className="shaAppVisual" data-scroll-zoom><img src="/shapp-phone-v02.png" alt="Aplicativo Shapp no celular" /></div>
        <div className="shaAppCopy"><p><b>03</b> App Shapp</p><h2>Sua academia continua com você.</h2><span>Treinos, agenda, metas, frequência e evolução em um aplicativo com a identidade da sua academia.</span><ul><li><Dumbbell /> Treino atualizado pelo professor</li><li><CalendarDays /> Reservas e agenda em poucos toques</li><li><BarChart3 /> Métricas, metas e conquistas</li><li><Users /> Toda a família em um só acesso</li></ul><a href="/aluno/demo-ana-cassoni">Abrir app demonstrativo <ArrowRight /></a></div>
      </section>

      <section className="shaPlans" id="planos">
        <div className="shaSectionLead"><p><b>04</b> Planos</p><h2>Escolha como começar.</h2></div>
        <div className="shaPlanGrid">{plans.map(([name, price, items, featured]) => <article className={featured ? 'isFeatured' : ''} key={name}>{featured && <span className="shaPlanTag">MAIS ESCOLHIDO</span>}<p>{name}</p><h3>{price}</h3><small>por mês</small><ul>{items.map(item => <li key={item}><Check /> {item}</li>)}</ul><a href="#contato">Escolher plano <ArrowRight /></a></article>)}</div>
      </section>

      <section className="shaTestimonial"><Sparkles /><blockquote>“Aqui eu não recebi apenas uma ficha. Ganhei uma rotina possível, professores presentes e um app que mostra cada avanço.”</blockquote><p>Marina · aluna Shapp Fit Center</p></section>

      <section className="shaContact" id="contato"><div><p>COMECE HOJE</p><h2>O próximo passo<br />é seu.</h2></div><div className="shaContactCard"><MessageCircle /><h3>Fale com a equipe</h3><p>Conte seu objetivo e descubra o plano ideal para a sua rotina.</p><a href="mailto:contato@shappfit.com.br">Quero conhecer a academia <ArrowRight /></a></div></section>

      <footer className="shaFooter"><AcademyBrand /><p>Academia demonstrativa com tecnologia e identidade Shapp.</p><div><a href="/">Shapp Fit System</a><a href="/painel">Painel da academia</a><button className="shaFooterPrivacy" type="button" onClick={() => window.dispatchEvent(new CustomEvent('shapp-privacy-open'))}>Privacidade e cookies</button><a href="#inicio">Voltar ao topo</a></div><Smartphone aria-hidden="true" /></footer>
      <AcademyPrivacy />
    </main>
  )
}

createRoot(document.getElementById('root')).render(<ShappAcademy />)
