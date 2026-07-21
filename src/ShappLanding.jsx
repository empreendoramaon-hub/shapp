import React, { useState } from 'react'
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Dumbbell,
  Menu,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap
} from 'lucide-react'
import './shappLanding.css'

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

function Brand() {
  return (
    <a className="slBrand" href="#top" aria-label="SHAPP início">
      <strong>SH▲PP</strong>
      <small>FIT SYSTEM</small>
    </a>
  )
}

function PhonePreview() {
  return (
    <div className="slPreviewWrap" aria-label="Prévia do aplicativo do aluno">
      <div className="slPhone">
        <div className="slPhoneTop"><strong>IRON FITNESS</strong><span>09:41</span></div>
        <div className="slPhoneGreeting"><small>BEM-VINDA</small><h3>ANA</h3></div>
        <div className="slPhoneWorkout">
          <small>TREINO DE HOJE</small>
          <h4>Pernas e glúteos</h4>
          <p>7 exercícios · 52 minutos</p>
          <button>COMEÇAR TREINO</button>
        </div>
        <div className="slPhoneStats">
          <div><strong>08</strong><span>treinos no mês</span></div>
          <div><strong>04</strong><span>dias seguidos</span></div>
        </div>
      </div>
      <div className="slPreviewInfo">
        <div><QrCode size={20} /><span><small>ACESSO</small><strong>Link único enviado</strong></span></div>
        <div><CheckCircle2 size={20} /><span><small>META</small><strong>8 de 20 treinos</strong></span></div>
      </div>
    </div>
  )
}

function ShappLanding() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="slPage" id="top">
      <header className="slHeader">
        <Brand />
        <nav className={`slNav ${menuOpen ? 'isOpen' : ''}`}>
          <a href="#produto" onClick={() => setMenuOpen(false)}>Produto</a>
          <a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a>
          <a href="#white-label" onClick={() => setMenuOpen(false)}>White Label</a>
          <a href="#lgpd" onClick={() => setMenuOpen(false)}>LGPD</a>
        </nav>
        <div className="slHeaderActions">
          <a className="slTextLink" href="/aluno/demo-ana-cassoni">App do aluno</a>
          <a className="slHeaderCta" href="/painel">Abrir painel <ArrowRight size={17} /></a>
        </div>
        <button className="slMenuButton" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menu">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        <section className="slHero">
          <div className="slHeroCopy">
            <p className="slEyebrow"><Zap size={16} /> Academia, personal e aluno conectados</p>
            <h1>O APP QUE TRANSFORMA TREINO EM PRESENÇA.</h1>
            <p className="slHeroText">Uma plataforma White Label para academias entregarem treinos personalizados, metas, evolução e uma experiência digital com a própria marca.</p>
            <div className="slHeroActions">
              <a className="slPrimary" href="/painel">Conhecer o painel <ArrowRight /></a>
              <a className="slSecondary" href="/aluno/demo-ana-cassoni">Ver app do aluno</a>
            </div>
            <div className="slHeroTrust">
              <span><CheckCircle2 size={17} /> Link único por aluno</span>
              <span><CheckCircle2 size={17} /> Consentimento LGPD</span>
              <span><CheckCircle2 size={17} /> Vídeos opcionais</span>
            </div>
          </div>
          <PhonePreview />
        </section>

        <section className="slStrip" aria-label="Recursos principais">
          <span>WHITE LABEL</span><span>QR CODE</span><span>WHATSAPP</span><span>LGPD</span><span>GAMIFICAÇÃO</span><span>EVOLUÇÃO</span>
        </section>

        <section className="slSection" id="produto">
          <div className="slSectionHeading">
            <p className="slSectionTag">ECOSSISTEMA SHAPP</p>
            <h2>TRÊS EXPERIÊNCIAS.<br />UMA ÚNICA PLATAFORMA.</h2>
            <p>O sistema separa claramente o que cada perfil precisa, sem menus excessivos e sem informações espalhadas.</p>
          </div>
          <div className="slProductGrid">
            {products.map((product) => {
              const Icon = product.icon
              return (
                <a className="slProductCard" href={product.href} key={product.name}>
                  <Icon size={28} />
                  <small>{product.tag}</small>
                  <h3>{product.name}</h3>
                  <p>{product.text}</p>
                  <span>ACESSAR <ArrowRight size={18} /></span>
                </a>
              )
            })}
          </div>
        </section>

        <section className="slSplit" id="white-label">
          <div className="slSplitVisual">
            <div className="slColorBlock red">LOGO</div>
            <div className="slColorBlock black">CORES</div>
            <div className="slColorBlock white">FONTES</div>
            <div className="slColorBlock outline">MÓDULOS</div>
          </div>
          <div className="slSplitCopy">
            <p className="slEyebrow"><Sparkles size={16} /> White Label completo</p>
            <h2>A MARCA DA ACADEMIA NA MÃO DO ALUNO.</h2>
            <p>Logotipo, cores, fontes, mensagens e módulos podem ser configurados por cliente. O conteúdo em vídeo permanece opcional.</p>
            <ul>
              <li><CheckCircle2 /> Vídeos ativados somente quando a academia desejar.</li>
              <li><CheckCircle2 /> Chat, ranking e gamificação configuráveis.</li>
              <li><CheckCircle2 /> Identidade visual própria para cada academia.</li>
            </ul>
            <a className="slDarkButton" href="/painel">Configurar academia <ArrowRight /></a>
          </div>
        </section>

        <section className="slSection" id="como-funciona">
          <div className="slSectionHeading compact">
            <p className="slSectionTag">DO CADASTRO AO TREINO</p>
            <h2>O ALUNO RECEBE TUDO PRONTO.</h2>
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
          <ShieldCheck className="slSecurityIcon" />
          <div>
            <p className="slSectionTag">PRIVACIDADE DESDE O PRIMEIRO ACESSO</p>
            <h2>LGPD É PARTE DO PRODUTO.</h2>
          </div>
          <div>
            <p>O aluno aceita Termos de Uso, Política de Privacidade e tratamento de dados antes de usar o app. O sistema registra versão, data e dispositivo.</p>
            <a href="/aluno/demo-ana-cassoni">Ver primeiro acesso <ArrowRight size={18} /></a>
          </div>
        </section>

        <section className="slCta">
          <div>
            <p className="slEyebrow"><MessageCircle size={16} /> A academia libera. O aluno começa.</p>
            <h2>UM LINK. UM TREINO. UMA ROTINA ACOMPANHADA.</h2>
          </div>
          <div className="slCtaActions">
            <a className="slPrimary" href="/painel">Abrir painel <ArrowRight /></a>
            <a className="slSecondary" href="/painel/alunos">Ver alunos</a>
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
