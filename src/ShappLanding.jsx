import React, { useEffect, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  Building2,
  CheckCircle2,
  Dumbbell,
  Menu,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
  Zap
} from 'lucide-react'
import './shappLanding.css'

const products = [
  {
    name: 'SH▲PP FIT',
    tag: 'PARA ALUNOS',
    number: '01',
    text: 'Treino personalizado, metas, evolução, XP e acesso liberado pela própria academia.',
    href: '/aluno/demo-ana-cassoni',
    icon: Dumbbell
  },
  {
    name: 'SH▲PP COACH',
    tag: 'PARA PERSONAIS',
    number: '02',
    text: 'Organize alunos, treinos, avaliações e frequência sem transformar a rotina em uma colcha de planilhas.',
    href: '/painel/alunos',
    icon: Users
  },
  {
    name: 'SH▲PP GYM',
    tag: 'PARA ACADEMIAS',
    number: '03',
    text: 'Painel completo, identidade White Label, QR Code, WhatsApp, LGPD e controle total do acesso.',
    href: '/painel',
    icon: Building2
  }
]

const flow = [
  ['01', 'A academia cadastra', 'A recepção cria o perfil com objetivo, professor, contrato e treino inicial.'],
  ['02', 'O acesso é enviado', 'O sistema gera um link único e QR Code para envio por WhatsApp.'],
  ['03', 'O aluno aceita a LGPD', 'Termos e Política de Privacidade são apresentados no primeiro acesso.'],
  ['04', 'O treino entra em ação', 'O aluno acompanha rotina, metas, evolução e gamificação no celular.']
]

function Brand() {
  return (
    <a className="slBrand" href="#top" aria-label="SHAPP início">
      <span>SH▲PP</span>
      <small>FIT SYSTEM</small>
    </a>
  )
}

function ShappLanding() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 90)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="slPage" id="top">
      <header className={`slHeader ${scrolled ? 'isScrolled' : ''}`}>
        <Brand />
        <nav className="slDesktopNav">
          <a href="#produto">Produto</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#white-label">White Label</a>
          <a href="#lgpd">LGPD</a>
        </nav>
        <div className="slHeaderActions">
          <a className="slTextLink" href="/aluno/demo-ana-cassoni">App do aluno</a>
          <a className="slHeaderCta" href="/painel">Abrir painel <ArrowRight size={17} /></a>
        </div>
      </header>

      <button className={`slMenuButton ${scrolled || menuOpen ? 'isVisible' : ''}`} type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">
        {menuOpen ? <X /> : <Menu />}
      </button>

      <div className={`slMenuOverlay ${menuOpen ? 'isOpen' : ''}`}>
        <div className="slMenuInner">
          <Brand />
          <nav>
            <a href="#produto" onClick={() => setMenuOpen(false)}>Produto</a>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a>
            <a href="#white-label" onClick={() => setMenuOpen(false)}>White Label</a>
            <a href="#lgpd" onClick={() => setMenuOpen(false)}>LGPD</a>
            <a href="/painel">Abrir painel</a>
          </nav>
        </div>
      </div>

      <main>
        <section className="slHero">
          <div className="slHeroShade" />
          <div className="slHeroGrid">
            <div className="slHeroCopy">
              <p className="slEyebrow"><Zap size={16} /> Academia, personal e aluno no mesmo ritmo</p>
              <h1>O APP QUE TRANSFORMA TREINO EM PRESENÇA.</h1>
              <p className="slHeroText">Uma plataforma White Label para academias entregarem treinos personalizados, metas, evolução e uma experiência digital com a própria marca.</p>
              <div className="slHeroActions">
                <a className="slPrimary" href="/painel">Conhecer o painel <ArrowRight /></a>
                <a className="slSecondary" href="/aluno/demo-ana-cassoni">Ver app do aluno</a>
              </div>
            </div>

            <div className="slHeroVisual" aria-label="Prévia do aplicativo SHAPP Fit">
              <div className="slPhone">
                <div className="slPhoneTop"><span>IRON FITNESS</span><small>09:41</small></div>
                <div className="slPhoneHello"><small>BEM-VINDA</small><strong>ANA</strong></div>
                <div className="slPhoneWorkout">
                  <span>TREINO DE HOJE</span>
                  <strong>Pernas & glúteos</strong>
                  <small>7 exercícios · 52 min</small>
                  <button>COMEÇAR TREINO</button>
                </div>
                <div className="slPhoneStats"><span><b>08</b> treinos</span><span><b>04</b> dias seguidos</span></div>
              </div>
              <div className="slFloatingCard slFloatOne"><QrCode /><span><small>ACESSO LIBERADO</small><strong>Link único enviado</strong></span></div>
              <div className="slFloatingCard slFloatTwo"><Target /><span><small>META MENSAL</small><strong>8 de 20 treinos</strong></span></div>
            </div>
          </div>
          <a className="slScrollCue" href="#produto"><ArrowDown /> DESCUBRA O SISTEMA</a>
        </section>

        <section className="slMarquee" aria-label="Recursos do SHAPP">
          <div>WHITE LABEL <span>•</span> QR CODE <span>•</span> WHATSAPP <span>•</span> LGPD <span>•</span> GAMIFICAÇÃO <span>•</span> EVOLUÇÃO <span>•</span> TREINO PERSONALIZADO <span>•</span></div>
        </section>

        <section className="slIntro" id="produto">
          <div className="slSectionTag">[ ECOSSISTEMA SHAPP ]</div>
          <div className="slIntroCopy">
            <h2>TRÊS EXPERIÊNCIAS.<br />UMA ÚNICA PLATAFORMA.</h2>
            <p>O SHAPP conecta quem administra, quem prescreve e quem treina. Cada perfil recebe exatamente o que precisa, sem menus desnecessários nem informações espalhadas.</p>
          </div>
        </section>

        <section className="slProductGrid">
          {products.map((product) => {
            const Icon = product.icon
            return (
              <a className="slProductCard" href={product.href} key={product.name}>
                <div className="slProductTop"><span>{product.number}</span><Icon /></div>
                <small>{product.tag}</small>
                <h3>{product.name}</h3>
                <p>{product.text}</p>
                <div className="slCardLink">ACESSAR <ArrowRight /></div>
              </a>
            )
          })}
        </section>

        <section className="slSplit" id="white-label">
          <div className="slSplitMedia">
            <div className="slBrandWall">
              <span>LOGO</span>
              <span>CORES</span>
              <span>FONTES</span>
              <span>APP</span>
            </div>
          </div>
          <div className="slSplitCopy">
            <p className="slEyebrow"><Sparkles size={16} /> White Label completo</p>
            <h2>A MARCA DA ACADEMIA NA MÃO DO ALUNO.</h2>
            <p>O aplicativo pode assumir logotipo, cores, fontes, nome, ícone, mensagens e módulos escolhidos pelo cliente. O aluno sente que está usando o app oficial da academia.</p>
            <ul>
              <li><CheckCircle2 /> Vídeos podem ser ativados ou desativados.</li>
              <li><CheckCircle2 /> Chat, ranking e gamificação são modulares.</li>
              <li><CheckCircle2 /> Cada academia mantém sua identidade visual.</li>
            </ul>
            <a className="slDarkButton" href="/painel">Configurar academia <ArrowRight /></a>
          </div>
        </section>

        <section className="slFlow" id="como-funciona">
          <div className="slFlowHeader">
            <div className="slSectionTag">[ DO CADASTRO AO TREINO ]</div>
            <h2>ENTRAR NO APP DEVE SER SIMPLES. O SISTEMA FAZ O PESADO.</h2>
          </div>
          <div className="slFlowGrid">
            {flow.map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="slSecurity" id="lgpd">
          <div className="slSecurityIcon"><ShieldCheck /></div>
          <div>
            <p className="slEyebrow">Privacidade desde a primeira tela</p>
            <h2>LGPD NÃO É RODAPÉ. É PARTE DO PRODUTO.</h2>
          </div>
          <div className="slSecurityText">
            <p>O aluno aceita Termos de Uso, Política de Privacidade e tratamento de dados antes de utilizar o app. O sistema registra versão, data e dispositivo.</p>
            <a href="/aluno/demo-ana-cassoni">Ver primeiro acesso <ArrowRight /></a>
          </div>
        </section>

        <section className="slCta">
          <div>
            <p className="slEyebrow"><MessageCircle size={16} /> A academia libera. O aluno começa.</p>
            <h2>SEU PRÓXIMO TREINO PODE COMEÇAR COM UM LINK.</h2>
          </div>
          <div className="slCtaActions">
            <a className="slPrimary" href="/painel">Abrir painel <ArrowRight /></a>
            <a className="slSecondary light" href="/painel/alunos">Ver lista de alunos</a>
          </div>
        </section>
      </main>

      <footer className="slFooter">
        <Brand />
        <p>Plataforma White Label para academias, personal trainers e alunos.</p>
        <div><a href="/painel">Painel</a><a href="/aluno/demo-ana-cassoni">App do aluno</a><a href="#lgpd">Privacidade</a></div>
      </footer>
    </div>
  )
}

export default ShappLanding
