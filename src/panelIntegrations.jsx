import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AlertTriangle, ArrowLeft, Check, Database, Download, FileSpreadsheet, Plug, RefreshCw, ShieldCheck, Users, Webhook } from 'lucide-react'
import './panelIntegrations.css'

const DRAFT_KEY = 'shappFitIntegrationDraft'
const defaultDraft = {
  systemName: '',
  method: 'api',
  endpoint: '',
  academyId: '',
  direction: 'to-shapp',
  entities: { students: true, enrollment: true, plans: true, attendance: false, trainers: false }
}

function readDraft() {
  try { return { ...defaultDraft, ...JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') } } catch { return defaultDraft }
}

const methods = [
  ['api', Plug, 'API', 'Sincronização automática e programada.'],
  ['webhook', Webhook, 'Webhook', 'Atualizações enviadas pelo sistema atual.'],
  ['file', FileSpreadsheet, 'Arquivo', 'Importação periódica por CSV ou Excel.']
]

const entities = [
  ['students', 'Cadastro dos alunos'],
  ['enrollment', 'Situação da matrícula'],
  ['plans', 'Planos e contratos'],
  ['attendance', 'Frequência e acessos'],
  ['trainers', 'Professores responsáveis']
]

function PanelIntegrations() {
  const [draft, setDraft] = useState(readDraft)
  const [saved, setSaved] = useState(false)

  const update = (field, value) => { setSaved(false); setDraft(current => ({ ...current, [field]: value })) }
  const toggleEntity = key => { setSaved(false); setDraft(current => ({ ...current, entities: { ...current.entities, [key]: !current.entities[key] } })) }

  function saveDraft() {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    setSaved(true)
  }

  function downloadChecklist() {
    const selected = entities.filter(([key]) => draft.entities[key]).map(([, label]) => `- ${label}`).join('\n')
    const text = `CHECKLIST DE INTEGRAÇÃO SHAPP FIT\n\nSistema atual: ${draft.systemName || 'A definir'}\nMétodo preferencial: ${draft.method.toUpperCase()}\nIdentificador da academia: ${draft.academyId || 'A definir'}\nEndpoint/documentação: ${draft.endpoint || 'A fornecer'}\nDireção: ${draft.direction === 'bidirectional' ? 'Bidirecional' : 'Sistema atual → Shapp'}\n\nDados desejados:\n${selected}\n\nO fornecedor deve disponibilizar documentação, ambiente de testes, autenticação segura, limites de uso e contato técnico. Credenciais não devem ser enviadas por e-mail nem cadastradas nesta tela.`
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'checklist-integracao-shapp.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="piPage">
      <aside className="piSidebar">
        <a className="piBrand" href="/"><span>SH</span><div><strong>Shapp Fit</strong><small>Central administrativa</small></div></a>
        <nav><a href="/painel"><ArrowLeft /> Voltar ao painel</a><a href="/painel/gestao"><Database /> Gestão</a><a className="isActive" href="#configuracao"><Plug /> Integrações</a></nav>
      </aside>

      <section className="piMain">
        <header className="piHero">
          <div><span><Plug /> Central de integrações</span><h1>Conecte o sistema que sua academia já usa.</h1><p>Prepare a sincronização de alunos, matrículas, planos e frequência sem substituir imediatamente o sistema atual.</p></div>
          <div className="piStatus"><i /><span><strong>Estrutura preparada</strong>Aguardando dados do fornecedor</span></div>
        </header>

        <div className="piNotice"><ShieldCheck /><p><strong>Serviço adicional e credenciais protegidas</strong>A análise e a implementação do conector são orçadas separadamente conforme o fornecedor e a complexidade. Esta preparação salva apenas um rascunho; tokens, senhas e chaves serão configurados somente no servidor seguro.</p></div>

        <section className="piGrid" id="configuracao">
          <article className="piCard">
            <div className="piCardHead"><span>ETAPA 01</span><h2>Sistema atual</h2><p>Informe os dados básicos para avaliarmos a compatibilidade.</p></div>
            <label className="piField"><span>Nome do sistema</span><input value={draft.systemName} onChange={event => update('systemName', event.target.value)} placeholder="Ex.: sistema de gestão da academia" /></label>
            <label className="piField"><span>Identificador da academia</span><input value={draft.academyId} onChange={event => update('academyId', event.target.value)} placeholder="Código usado pelo fornecedor" /></label>
            <label className="piField"><span>Documentação ou endereço da API</span><input type="url" value={draft.endpoint} onChange={event => update('endpoint', event.target.value)} placeholder="https://..." /></label>
          </article>

          <article className="piCard">
            <div className="piCardHead"><span>ETAPA 02</span><h2>Forma de conexão</h2><p>Escolha a opção disponível no sistema atual.</p></div>
            <div className="piMethods">{methods.map(([key, Icon, title, text]) => <button type="button" className={draft.method === key ? 'isSelected' : ''} onClick={() => update('method', key)} key={key}><Icon /><span><strong>{title}</strong><small>{text}</small></span>{draft.method === key && <Check />}</button>)}</div>
            <label className="piField"><span>Direção da sincronização</span><select value={draft.direction} onChange={event => update('direction', event.target.value)}><option value="to-shapp">Sistema atual → Shapp</option><option value="bidirectional">Bidirecional</option></select></label>
          </article>

          <article className="piCard piDataCard">
            <div className="piCardHead"><span>ETAPA 03</span><h2>Dados a sincronizar</h2><p>Marque somente as informações autorizadas e necessárias.</p></div>
            <div className="piEntities">{entities.map(([key, label]) => <label key={key}><span><Users /> {label}</span><input type="checkbox" checked={Boolean(draft.entities[key])} onChange={() => toggleEntity(key)} /></label>)}</div>
          </article>

          <article className="piCard piReadiness">
            <div className="piCardHead"><span>PRÓXIMOS PASSOS</span><h2>Checklist técnico</h2></div>
            <ul><li><Check /> Documentação da API ou modelo do arquivo</li><li><Check /> Contato técnico do fornecedor</li><li><Check /> Ambiente de testes</li><li><Check /> Regras de autenticação e limites</li><li><AlertTriangle /> Validação de consentimento e LGPD</li></ul>
            <button type="button" onClick={downloadChecklist}><Download /> Baixar checklist para o fornecedor</button>
          </article>
        </section>

        <footer className="piActions"><div><RefreshCw /><span><strong>{saved ? 'Rascunho salvo' : 'Configuração ainda não salva'}</strong>{saved ? 'A preparação ficará disponível neste navegador.' : 'Nenhuma integração será ativada nesta etapa.'}</span></div><button type="button" onClick={saveDraft}>Salvar preparação</button></footer>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<PanelIntegrations />)
