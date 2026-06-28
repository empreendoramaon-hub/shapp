# SH▲PP Landing

Landing page principal do ecossistema SH▲PP.

A URL principal atual é:

```txt
https://shappfit.vercel.app
```

Ela aponta para três produtos:

- SH▲PP Fit: aluno final
- SH▲PP Coach: personal trainer
- SH▲PP Gym: academias

## Stack

- React
- Vite
- Vercel
- PWA básico
- Firebase Firestore opcional para leads

## Como rodar localmente

```bash
npm install
npm run dev
```

Abra:

```txt
http://localhost:5173
```

## Links dos três produtos

Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite as variáveis:

```env
VITE_SHAPP_FIT_URL=https://shappfit.vercel.app
VITE_SHAPP_COACH_URL=https://shapp-coach.vercel.app
VITE_SHAPP_GYM_URL=https://shapp-gym.vercel.app
```

Quando os três projetos estiverem publicados, basta trocar esses links na Vercel.

## Lista beta

A versão publicada salva leads em modo local para teste inicial. O arquivo `firestore.rules` já deixa preparada a coleção `landingLeads` para uma futura conexão com Firestore.

## Deploy na Vercel

Na Vercel:

1. Importe este repositório.
2. Framework: Vite.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Configure as variáveis de ambiente se quiser trocar os links dos produtos.
6. Publique.

## Animação do botão

Os CTAs usam o padrão:

```html
<a class="motionLink" data-text="Escolher produto">
  <span>Escolher produto</span>
</a>
```

O CSS usa `::before` com `content: attr(data-text)` para criar o texto que desliza por cima do botão no hover.

## Observação visual

A direção é inspirada em sites esportivos premium e de performance, com hero forte, tipografia gigante, contraste escuro, cards por produto e microanimações. Não usa imagens, assets ou código proprietário de terceiros.
