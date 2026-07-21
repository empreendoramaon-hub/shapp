# Seguranca do SHAPP/Sotalia

Este repositorio parte de uma politica de negacao por padrao. O modo local e
apenas uma demonstracao: `localStorage`, links e QR Codes nao sao controles de
acesso e nao devem armazenar dados reais de alunos.

## O que o codigo ja exige

- Firestore nega colecoes desconhecidas e restringe membros por UID/claim.
- O painel conectado ao Firebase exige login e as claims `admin: true` e
  `academyId: "sotalia"` (ou `superAdmin: true`).
- O proprio usuario nunca pode gravar campos administrativos.
- Check-ins, XP, nivel e eventos de auditoria ficam reservados ao administrador;
  essas operacoes devem migrar para uma API autenticada antes da producao.
- Storage fica totalmente fechado enquanto uploads nao forem implementados e
  testados com limites de caminho, tamanho e tipo.
- App Check e inicializado quando `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` existe.
- A Vercel envia cabecalhos de seguranca; a CSP inicia em Report-Only.
- O CI testa as regras no Emulator, executa `npm audit` e valida o build.

## Antes de usar dados reais

1. Ative Firebase Authentication e crie contas administrativas fora do
   navegador. Custom Claims devem ser definidas somente por um ambiente seguro
   com Firebase Admin SDK.
2. Migre cada aluno para uma conta autenticada e grave o UID em `authUid` no
   documento do membro. Nao use o parametro `?m=` ou um slug como autenticacao.
3. Registre os dominios web no App Check com reCAPTCHA Enterprise, acompanhe as
   metricas e so depois habilite enforcement para Firestore/Storage.
4. Cadastre variaveis publicas `VITE_FIREBASE_*` por ambiente na Vercel. Nunca
   use o prefixo `VITE_` em uma chave privada ou segredo administrativo.
5. Mantenha Preview e Production com projetos/chaves separados e ative Vercel
   Authentication em Deployment Protection para previews.
6. No GitHub, ative Secret Scanning, Push Protection e Dependabot Alerts. Crie
   um ruleset para `main` exigindo pull request, os checks `Security checks` e
   `CodeQL`, resolucao de conversas, bloqueio de force-push e de exclusao.
7. Exija 2FA/passkeys no GitHub, Vercel, Google/Firebase e e-mail de recuperacao.

## Publicacao das regras

Teste localmente:

```bash
npm run security:check
```

Depois de selecionar explicitamente o projeto Firebase correto:

```bash
firebase use <project-id>
firebase deploy --only firestore:rules,storage
```

Nunca publique regras em um projeto de producao sem antes confirmar o alias e
executar os testes. A ativacao de App Check enforcement e as protecoes da Vercel
e GitHub sao etapas de console e nao sao alteradas automaticamente por este repo.

## Resposta a incidente

Se um segredo aparecer em commit, log, issue ou deployment: revogue-o, gere um
novo valor, atualize a Vercel por ambiente, faca novo deploy e revise todo o
historico Git. Apagar apenas o arquivo nao invalida a credencial exposta.
