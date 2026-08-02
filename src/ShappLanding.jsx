import React, { useEffect, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Cloud,
  Dumbbell,
  ExternalLink,
  Gauge,
  Globe2,
  Headphones,
  LineChart,
  Menu,
  Megaphone,
  Play,
  Plug,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
  Users,
  X
} from 'lucide-react'
import './shappLanding.css'

const heroBenefits = [
  [Dumbbell, 'TREINO', 'Rotina personalizada pelo seu professor'],
  [TrendingUp, 'EVOLUÇÃO', 'Frequência, XP, metas e conquistas'],
  [CalendarDays, 'AGENDA', 'Reserve aulas em poucos toques'],
  [Smartphone, 'PWA', 'Instale sem loja, direto na tela inicial']
]

const products = [
  {
    name: 'SH▲PP FIT',
    tag: 'PARA ALUNOS',
    text: 'Treino personalizado, metas, evolução, XP e acompanhamento no celular.',
    href: '/aluno/demo-ana-cassoni',
    icon: Dumbbell
  },
  {
    name: 'SH▲PP COACH',
    tag: 'PARA PERSONAIS',
    text: 'Organização de alunos, treinos, avaliações e frequência em um único painel.',
    href: '/painel/alunos',
    icon: Users
  },
  {
    name: 'SH▲PP GYM',
    tag: 'PARA ACADEMIAS',
    text: 'Gestão White Label, convites por QR Code ou WhatsApp, LGPD e controle de acesso.',
    href: '/painel',
    icon: Building2
  }
]

const flow = [
  ['01', 'Cadastro pela academia', 'A recepção cria o perfil, escolhe o professor, define objetivo e contrato.'],
  ['02', 'Convite individual', 'O sistema gera um link único e um QR Code para envio ao aluno.'],
  ['03', 'Aceite LGPD', 'Termos de Uso e Política de Privacidade aparecem antes da liberação.'],
  ['04', 'Treino no celular', 'O aluno acompanha exercícios, metas, evolução e gamificação.']
]

const plans = [
  {
    name: 'Starter',
    description: 'Ideal para academias de pequeno porte.',
    price: <>R$ 250<small>/mês</small></>,
    setup: 'Implantação: R$ 1.000 · parcelamento disponível',
    features: ['Até 100 alunos', 'Aplicativo personalizado', 'Área do aluno', 'Painel administrativo', 'Site institucional disponível por R$ 1.000', 'Hospedagem e atualizações', 'Suporte técnico']
  },
  {
    name: 'Growth',
    description: 'Para academias em crescimento.',
    price: <>R$ 390<small>/mês</small></>,
    setup: 'Implantação: R$ 1.000 · parcelamento disponível',
    badge: 'MAIS POPULAR',
    features: ['Tudo do plano Starter', 'Até 300 alunos', 'Site institucional disponível por R$ 1.000', 'Mais capacidade', 'Melhor desempenho', 'Recursos exclusivos conforme a evolução da plataforma']
  },
  {
    name: 'Performance',
    description: 'Para academias com grande número de alunos.',
    price: <>R$ 590<small>/mês</small></>,
    setup: 'Implantação: R$ 1.000 · parcelamento disponível',
    features: ['Tudo do plano Growth', 'Até 700 alunos', 'Site institucional disponível por R$ 1.000', 'Maior capacidade de armazenamento', 'Prioridade em suporte', 'Recursos avançados']
  }
]

const includedFeatures = [
  [Smartphone, 'Aplicativo personalizado', 'Nome, logotipo, cores e identidade visual exclusiva da academia.'],
  [Users, 'Área do aluno', 'Treinos, avaliações, comunicados, agenda e informações em um só lugar.'],
  [Gauge, 'Painel administrativo', 'Atualize a operação e o conteúdo sem depender de um desenvolvedor.'],
  [Cloud, 'Hospedagem incluída', 'Infraestrutura pronta, sem contratação separada de servidores.'],
  [RefreshCw, 'Atualizações contínuas', 'Melhorias e novos recursos adicionados durante a assinatura.'],
  [Headphones, 'Segurança e suporte', 'Backup, monitoramento, manutenção e suporte técnico especializado.']
]

const managementMetrics = [
  [Users, 'Equipe e professores'],
  [LineChart, 'Uso da plataforma'],
  [CalendarDays, 'Atividades e eventos'],
  [Megaphone, 'Comunicados e campanhas']
]

const faqs = [
  ['Como funciona o White Label?', 'A academia configura logotipo, cores, fontes, mensagens e os módulos que deseja oferecer. O aluno vê a identidade da academia em toda a experiência.'],
  ['Preciso de conhecimento técnico para configurar?', 'Não. O painel foi desenhado para que a própria equipe da academia faça as configurações e libere acessos em poucos passos.'],
  ['O sistema funciona offline?', 'O app pode ser instalado como PWA e mantém a experiência rápida no celular. A sincronização de dados requer conexão com a internet.'],
  ['Como o aluno recebe acesso ao app?', 'A academia gera um link individual ou QR Code e pode enviá-lo diretamente pelo WhatsApp.'],
  ['Quais módulos posso ativar?', 'Treinos, evolução, frequência, agenda, chat, ranking, gamificação e vídeos podem ser ativados conforme o plano e a estratégia da academia.'],
  ['O sistema é compatível com a LGPD?', 'Sim. O primeiro acesso registra o aceite dos termos, da política de privacidade e do tratamento de dados.'],
  ['Preciso contratar hospedagem ou servidores?', 'Não. A infraestrutura, o monitoramento, os backups e a manutenção técnica já fazem parte da assinatura.'],
  ['O painel pode integrar com o sistema que a academia já utiliza?', 'Sim, quando o fornecedor disponibiliza API, webhook ou arquivos compatíveis. A análise, configuração e desenvolvimento do conector são serviços opcionais, orçados separadamente conforme o sistema e a complexidade da integração.'],
  ['A Shapp também desenvolve o site da academia?', 'Sim. Todos os planos podem contratar um site institucional padrão por R$ 1.000. Para academias que desejam direção visual própria, layout exclusivo, animações e maior personalização, os projetos profissionais começam em R$ 5.000.']
]

function Brand() {
  return (
    <a className="slBrand" href="#top" aria-label="SHAPP início">
      <strong><span>SH</span><span className="slBrandMark">▲</span><span>PP</span></strong>
      <small>FIT SYSTEM</small>
    </a>
  )
}

function CutButton({ children, className = '', ...props }) {
  return <a className={`slCutButton ${className}`.trim()} {...props}>{children}</a>
}

function ShappLanding() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [atTop, setAtTop] = useState(true)
  const [onLightBackground, setOnLightBackground] = useState(false)

  useEffect(() => {
    const backgroundIsLight = (element) => {
      let current = element
      while (current && current !== document.documentElement) {
        if (current.matches?.('.slHeroVisual, .slIncluded, .slPrivacy, .slProductCard, .slPlanCard, .slManagementPanel, .slFaqList details, .slFooter')) return false
        if (current.matches?.('.slPage, .slProducts, .slWhiteLabel, .slJourney, .slManagement, .slPlans, .slAppSection, .slWebsiteOffer, .slFaq')) return true
        const style = window.getComputedStyle(current)
        if (style.backgroundImage && style.backgroundImage !== 'none') return false
        const match = style.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
        if (match && Number(match[4] ?? 1) > .15) {
          const [, red, green, blue] = match.map(Number)
          return (red * .299 + green * .587 + blue * .114) > 112
        }
        current = current.parentElement
      }
      return false
    }

    const updateHeader = () => {
      const hero = document.querySelector('.slHero')
      const isOverHero = window.scrollY < Math.max(32, (hero?.offsetHeight || 0) - 80)
      setAtTop(isOverHero)
      if (isOverHero) {
        setOnLightBackground(false)
        return
      }

      const header = document.querySelector('.slHeader')
      const stack = document.elementsFromPoint(window.innerWidth / 2, 40)
      const underHeader = stack.find((element) => !header?.contains(element))
      setOnLightBackground(backgroundIsLight(underHeader))
    }
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    window.addEventListener('resize', updateHeader)
    return () => {
      window.removeEventListener('scroll', updateHeader)
      window.removeEventListener('resize', updateHeader)
    }
  }, [])

  return (
    <div className="slPage" id="top">
      <header className={`slHeader ${atTop ? 'isAtTop' : ''} ${onLightBackground ? 'isOnLight' : ''}`}>
        <Brand />
        <nav className={`slNav ${menuOpen ? 'isOpen' : ''}`} aria-label="Navegação principal">
          <a href="/academia" onClick={() => setMenuOpen(false)}>Academias</a>
          <a href="#planos" onClick={() => setMenuOpen(false)}>Planos</a>
          <a href="#app" onClick={() => setMenuOpen(false)}>App</a>
          <a href="/painel" onClick={() => setMenuOpen(false)}>Para academias</a>
        </nav>
        <CutButton className="slHeaderCta" href="/painel">
          Começar agora <ExternalLink size={14} />
        </CutButton>
        <button
          className="slMenuButton"
          type="button"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        <section className="slHero" aria-labelledby="hero-title">
          <div className="slHeroCopy">
            <p className="slOverline">Aplicativo, gestão e presença digital com a identidade da sua academia</p>
            <p className="slKicker">SAÚDE · FITNESS</p>
            <h1 id="hero-title">Transforme<br />a experiência</h1>
            <div className="slHeroActions">
              <CutButton href="/painel">Começar agora</CutButton>
              <a className="slVideoButton" href="#app"><Play size={17} /> Ver vídeo de apresentação</a>
            </div>
            <div className="slHeroBenefits">
              {heroBenefits.map(([Icon, title, text]) => (
                <article key={title}>
                  <Icon size={15} />
                  <div>
                    <small>{title}</small>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="slHeroVisual" aria-hidden="true" />
        </section>

        <section className="slSection slProducts" id="academias">
          <div className="slSectionIntro">
            <div>
              <p className="slSectionTag">ECOSSISTEMA SHAPP</p>
              <h2>Três experiências.<br />Uma única plataforma.</h2>
            </div>
            <p>O sistema separa claramente o que cada perfil precisa, sem menus excessivos e sem informações espalhadas.</p>
          </div>
          <div className="slProductGrid">
            {products.map(({ name, tag, text, href, icon: Icon }) => (
              <a className="slProductCard slCorner" href={href} key={name}>
                <Icon size={26} />
                <small>{tag}</small>
                <h3>{name}</h3>
                <p>{text}</p>
                <span>Acessar <ArrowRight size={16} /></span>
              </a>
            ))}
          </div>
        </section>

        <section className="slIncluded">
          <div className="slIncludedHeading">
            <p className="slSectionTag">TUDO INCLUÍDO</p>
            <h2>Uma plataforma completa.<br /><span>Sem preocupação técnica.</span></h2>
            <p>O ShappFit conecta a academia aos alunos com uma experiência organizada, profissional e sempre atualizada.</p>
          </div>
          <div className="slIncludedGrid">
            {includedFeatures.map(([Icon, title, text]) => (
              <article className="slCorner" key={title}>
                <Icon size={22} />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="slSection slWhiteLabel">
          <div className="slBrandTiles" aria-label="Opções de personalização">
            <div className="isLight">LOGO</div>
            <div>CORES</div>
            <div>FONTES</div>
            <div>MÓDULOS</div>
          </div>
          <div className="slWhiteCopy">
            <p className="slSectionTag"><Sparkles size={15} /> WHITE LABEL COMPLETO</p>
            <h2>A marca da academia<br />na mão do aluno.</h2>
            <p>Logotipo, cores, fontes, mensagens e módulos podem ser configurados por cliente. O conteúdo em vídeo permanece opcional.</p>
            <ul>
              <li><span /> Vídeos ativados somente quando a academia desejar.</li>
              <li><span /> Chat, ranking e gamificação configuráveis.</li>
              <li><span /> Identidade visual própria para cada academia.</li>
            </ul>
            <CutButton href="/painel">Configurar academia <ArrowRight size={16} /></CutButton>
          </div>
        </section>

        <section className="slSection slJourney">
          <p className="slSectionTag">DO CADASTRO AO TREINO</p>
          <h2>O aluno recebe tudo pronto.</h2>
          <div className="slFlowGrid">
            {flow.map(([number, title, text]) => (
              <article className="slCorner" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="slPrivacy">
          <div className="slPrivacyCopy">
            <p className="slSectionTag">PRIVACIDADE DESDE O PRIMEIRO ACESSO</p>
            <h2>LGPD é parte do produto.</h2>
            <p>O aluno aceita Termos de Uso, Política de Privacidade e tratamento de dados antes de usar o app. O sistema registra versão, data e dispositivo.</p>
            <a href="/aluno/demo-ana-cassoni">Ver primeiro acesso <ArrowRight size={16} /></a>
          </div>
          <div className="slPrivacyCard slCorner">
            {[
              ['Termos de Uso', 'Registro de versão, data e dispositivo do aceite.'],
              ['Política de Privacidade', 'Aceite explícito antes de qualquer funcionalidade.'],
              ['Tratamento de Dados', 'Consentimento granular por categoria de dado.']
            ].map(([title, text]) => (
              <div key={title}>
                <span><ShieldCheck size={18} /></span>
                <p><strong>{title}</strong><small>{text}</small></p>
              </div>
            ))}
          </div>
        </section>

        <section className="slSection slManagement">
          <div className="slManagementCopy">
            <p className="slSectionTag">PAINEL GERENCIAL</p>
            <h2>Decisões melhores começam com uma visão mais clara.</h2>
            <p>Acompanhe o funcionamento da academia, a atuação da equipe e o uso da plataforma por meio de indicadores que apoiam a gestão e a melhoria dos processos internos.</p>
            <div className="slEvolutionSeal"><Sparkles size={18} /><span><strong>Plataforma em constante evolução</strong>Novos indicadores gerenciais serão adicionados continuamente, conforme o plano contratado.</span></div>
            <div className="slEvolutionSeal slIntegrationSeal"><Plug size={18} /><span><strong>Integrações sob medida</strong>Conexões com sistemas externos por API, webhook ou migração de arquivos são contratadas e orçadas separadamente.</span></div>
          </div>
          <div className="slManagementPanel slCorner">
            <div className="slMetricMain"><small>VISÃO DA OPERAÇÃO</small><strong>Gestão baseada<br />em dados.</strong><span>Indicadores para identificar oportunidades e otimizar a experiência dos alunos.</span></div>
            <div className="slMetricGrid">
              {managementMetrics.map(([Icon, label]) => <article key={label}><Icon size={19} /><span>{label}</span></article>)}
            </div>
          </div>
        </section>

        <section className="slSection slPlans" id="planos">
          <div className="slPlansHeading">
            <p className="slSectionTag">PLANOS</p>
            <h2>Escolha o plano<br /><span>ideal para sua academia.</span></h2>
          </div>
          <div className="slPlansGrid">
            {plans.map((plan) => (
              <article className={`slPlanCard slCorner ${plan.badge ? 'isFeatured' : ''}`} key={plan.name}>
                {plan.badge && <span className="slPlanBadge">{plan.badge}</span>}
                <h3>{plan.name}</h3>
                <p>{plan.description}</p>
                <h4>{plan.price}</h4>
                <small className="slSetupPrice">{plan.setup}</small>
                <ul>
                  {plan.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}
                </ul>
                <CutButton href="/painel">Liberar acesso</CutButton>
              </article>
            ))}
          </div>
        </section>

        <section className="slSection slWebsiteOffer">
          <div className="slWebsiteVisual slCorner">
            <img src="/highfive.webp" alt="Academia moderna com experiência digital Shapp" />
            <span><Globe2 size={18} /> SOLUÇÃO COMPLETA</span>
          </div>
          <div className="slWebsiteCopy">
            <p className="slSectionTag">SITE PARA TODOS OS PLANOS</p>
            <h2>Da presença digital<br />ao treino do aluno.</h2>
            <p>Além do aplicativo, sua academia pode começar com um site institucional objetivo ou investir em uma presença digital exclusiva, com direção criativa, animações e layout totalmente personalizado.</p>
            <div className="slWebsiteTags">
              {['Institucional', 'Planos', 'Horários', 'Equipe', 'Blog', 'Agenda', 'Galeria', 'Formulários', 'SEO', 'Redes sociais'].map(item => <span key={item}>{item}</span>)}
            </div>
            <div className="slWebsiteOptions">
              <article>
                <small>SITE INSTITUCIONAL</small>
                <strong>R$ 1.000</strong>
                <span>Disponível em todos os planos, com identidade da academia e estrutura essencial.</span>
              </article>
              <article className="isPremium">
                <small>PROJETO PERSONALIZADO</small>
                <strong>A partir de R$ 5.000</strong>
                <span>Layout exclusivo, direção visual, animações e experiência sob medida — como este site demonstrativo.</span>
              </article>
            </div>
            <CutButton href="/academia">Ver site demonstrativo <ArrowRight size={16} /></CutButton>
          </div>
        </section>

        <section className="slSection slAppSection" id="app">
          <div className="slAppCopy">
            <p className="slSectionTag">EXPERIÊNCIA DO ALUNO</p>
            <h2>Seu shape<br /><span>na palma da mão.</span></h2>
            <p>Treinos personalizados, acompanhamento de evolução, gamificação e metas — tudo em um app rápido, leve e instalado direto na tela inicial.</p>
            <ul>
              <li><strong>Treinos diários</strong><span>— Atualizados em tempo real</span></li>
              <li><strong>XP e conquistas</strong><span>— Gamificação que motiva</span></li>
              <li><strong>Frequência</strong><span>— Acompanhe sua evolução</span></li>
              <li><strong>PWA nativo</strong><span>— Sem loja, sem instalação</span></li>
            </ul>
            <CutButton href="/aluno/demo-ana-cassoni">Ver app do aluno</CutButton>
          </div>
          <div className="slPhoneFrame slCorner">
            <img src="/shapp-phone-v02.png" alt="Aplicativo SHAPP FIT em um celular" />
          </div>
        </section>

        <section className="slSection slFaq">
          <div className="slFaqIntro">
            <p className="slSectionTag">PERGUNTAS FREQUENTES</p>
            <h2>Dúvidas<br />resolvidas.</h2>
            <p>Tudo que você precisa saber sobre o SHAPP FIT SYSTEM.</p>
          </div>
          <div className="slFaqList">
            {faqs.map(([question, answer]) => (
              <details className="slCorner" key={question}>
                <summary>{question}<ChevronDown size={18} /></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="slFinalCta">
          <div>
            <p className="slSectionTag">A ACADEMIA LIBERA. O ALUNO COMEÇA.</p>
            <h2>Um link. Um treino.<br />Uma rotina acompanhada.</h2>
            <p>Configure a academia, libere o acesso e acompanhe a evolução de cada aluno em tempo real.</p>
          </div>
          <div className="slFinalActions">
            <CutButton href="/painel">Abrir painel <ArrowRight size={16} /></CutButton>
            <a href="/painel/alunos">Ver alunos</a>
          </div>
        </section>
      </main>

      <footer className="slFooter">
        <Brand />
        <p>Plataforma White Label para academias, personal trainers e alunos.</p>
        <div>
          <a href="/painel">Painel</a>
          <a href="/aluno/demo-ana-cassoni">App do aluno</a>
          <a href="#top">Voltar ao topo</a>
        </div>
        <BarChart3 className="slFooterMark" aria-hidden="true" />
      </footer>
    </div>
  )
}

export default ShappLanding
