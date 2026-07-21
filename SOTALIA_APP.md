# Sotalia App

Experiencia digital exclusiva para alunos e familias da Sotalia Sports, seguindo a mesma identidade visual e os principios de UX do site institucional.

## Distribuicao privada

O App Sotalia nao sera publicado na Play Store nem na App Store. A recepcao ou o professor cadastra o aluno e entrega um link individual ou QR Code vinculado a matricula.

O aluno pode adicionar esse acesso a tela inicial do celular como PWA. Quando o app e aberto por esse atalho, o ultimo acesso individual valido fica lembrado no dispositivo.

Essa estrategia:

- restringe a distribuicao a alunos convidados pela academia;
- evita downloads publicos sem relacao com uma matricula;
- reduz o atrito de procurar, baixar e atualizar um app em uma loja;
- mantem a experiencia com a marca Sotalia;
- permite suspender o acesso quando a matricula deixa de estar ativa.

A exclusividade comercial nao substitui a seguranca tecnica. Em producao, o link individual deve trabalhar em conjunto com autenticacao, regras do Firestore e validacao do status da matricula.

## Rota

```txt
/sotalia-admin
/sotalia-app
/sotalia-app?m=demo-marina
```

## Firebase

O app usa as mesmas variaveis `VITE_FIREBASE_*` ja previstas no projeto. Quando elas existem, ele tenta ler e gravar em:

```txt
academies/sotalia/members/{memberId}
academies/sotalia/appEvents/{eventId}
```

Sem Firebase configurado, o app continua funcionando em modo demo com `localStorage`.

## Funcionalidades iniciais

- Painel administrativo para cadastrar alunos.
- Exclusao de aluno da base local do app e do Firestore quando conectado.
- Painel do personal para montar treino por aluno.
- Link e QR Code do app do aluno.
- Carteirinha digital com QR Code.
- Check-in do aluno.
- Treino do aluno com checklist e finalizacao.
- Evolucao fisica com avaliacoes.
- Metricas de frequencia, XP, nivel e streak.
- Agenda e reserva de aulas.
- Cadastro administrativo de atividades da agenda com data e hora, publicado no item Aulas de hoje do app.
- Confirmacao de reserva no painel administrativo com aviso no item Aulas de hoje do app do aluno.
- Modulo de piscina, hidro e natacao.
- Perfil familiar para responsaveis acompanharem Nana, Zoe ou outros dependentes.
- Padronizacao no painel: nomes com primeira letra maiuscula, WhatsApp no formato (xx) xxxxx-xxxx e datas no formato dd/mm/aaaa.
- Botao PWA no perfil do aluno para aceitar termos e instalar o app na tela inicial do smartphone.
- Comunicados e eventos preparados para Firestore.
- Adicao do PWA a tela inicial pelo perfil do aluno, sem Play Store ou App Store.

## Diretrizes de UX

- Mobile first para a jornada do aluno.
- Hierarquia visual clara e chamadas objetivas.
- Fotos reais da estrutura como parte da percepcao de valor.
- Reducao de atrito entre convite, primeiro acesso e uso diario.
- Consistencia entre site, painel e app.
- Privacidade e LGPD visiveis durante a experiencia.

## Origem visual

O app usa a identidade e imagens publicas do site atual da academia:

```txt
https://sotalia.vercel.app/
```
