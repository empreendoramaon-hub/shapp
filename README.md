# SH▲PP Landing + Shapp Fit MVP

Landing page principal do ecossistema SH▲PP com a primeira versão funcional do **Shapp Fit** para academias, personal trainers e alunos.

A URL principal atual é:

```txt
https://shappfit.vercel.app
```

## Produtos

- **SH▲PP Fit:** app do aluno final.
- **SH▲PP Coach:** área do personal trainer.
- **SH▲PP Gym:** painel da academia.

## Sprint 1 implementada

O MVP inicial já possui:

- Painel da academia em `/painel`.
- Cadastro de aluno pela recepção.
- Geração de token/link único por aluno.
- Envio do convite por WhatsApp.
- App do aluno em `/aluno/:token`.
- Demo do aluno em `/aluno/demo-ana-cassoni`.
- Aceite obrigatório de Termos de Uso, Política de Privacidade e tratamento de dados conforme LGPD.
- Registro local do consentimento com versão dos documentos, data e dispositivo.
- Módulos opcionais por academia, incluindo vídeos dos exercícios.
- Treino personalizado por aluno.
- Metas, XP, streak e gamificação básica.
- Inativação do aluno com bloqueio do app.
- Exclusão simulada dos dados do aluno.
- Auditoria local das ações importantes.

## Stack

- React
- Vite
- Vercel
- PWA básico
- Firebase Firestore preparado para a próxima etapa
- LocalStorage como modo demo inicial

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra:

```txt
http://localhost:5173
```

Rotas principais:

```txt
http://localhost:5173
http://localhost:5173/painel
http://localhost:5173/aluno/demo-ana-cassoni
```

## Fluxo do aluno

1. A recepção cadastra o aluno no painel.
2. O sistema gera um link único.
3. A academia copia o link ou envia pelo WhatsApp.
4. O aluno abre o app com os dados já prontos.
5. No primeiro acesso, aceita Termos de Uso, Política de Privacidade e consentimento LGPD.
6. O app libera treinos, metas e evolução.
7. Se a academia inativar o aluno, o app bloqueia os dados.

## Módulos opcionais

A academia pode decidir quais módulos aparecem no app:

- Vídeos dos exercícios.
- Fotos/GIFs dos exercícios.
- Gamificação.
- Chat professor-aluno.
- Rankings.
- Avaliações físicas.
- Notificações.

## Deploy na Vercel

Na Vercel:

1. Importe este repositório.
2. Framework: Vite.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. O arquivo `vercel.json` já contém rewrites para `/painel` e `/aluno/:token`.
6. Publique.

## Próximos passos

- Conectar Firebase Authentication.
- Conectar Firestore multi-tenant por academia.
- Criar regras de segurança Firebase.
- Trocar o QR Code mockado por geração real de QR Code.
- Criar CRUD completo de professores, treinos e exercícios.
- Criar páginas reais de Termos de Uso e Política de Privacidade versionadas.
- Adicionar dashboard com relatórios reais.
- Preparar build PWA instalável.

## Observação visual

A direção é inspirada em produtos esportivos premium e painéis SaaS modernos, com contraste escuro, cards fortes, microinterações e foco em retenção de alunos.
