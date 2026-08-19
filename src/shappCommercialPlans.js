export const shappCommercialPlans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Ideal para academias de pequeno porte.',
    monthlyPrice: 500,
    setupLabel: 'Implantação: R$ 2.000 · parcelamento disponível',
    features: ['Até 100 alunos', 'Aplicativo personalizado', 'Área do aluno', 'Painel administrativo', 'Site institucional disponível por R$ 2.000', 'Hospedagem e atualizações', 'Suporte técnico'],
    href: '/painel',
    cta: 'Liberar acesso'
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'Para academias em crescimento.',
    monthlyPrice: 780,
    setupLabel: 'Implantação: R$ 2.000 · parcelamento disponível',
    badge: 'MAIS POPULAR',
    features: ['Tudo do plano Starter', 'Até 300 alunos', 'Site institucional disponível por R$ 2.000', 'Mais capacidade', 'Melhor desempenho', 'Recursos exclusivos conforme a evolução da plataforma'],
    href: '/painel',
    cta: 'Liberar acesso'
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Para academias com grande número de alunos.',
    monthlyPrice: 1180,
    setupLabel: 'Implantação: R$ 2.000 · parcelamento disponível',
    features: ['Tudo do plano Growth', 'Até 700 alunos', 'Site institucional disponível por R$ 2.000', 'Maior capacidade de armazenamento', 'Prioridade em suporte', 'Recursos avançados'],
    href: '/painel',
    cta: 'Liberar acesso'
  },
  {
    id: 'management-premium',
    name: 'Gestão Premium',
    description: 'Plataforma personalizada para redes e operações orientadas por dados.',
    monthlyPrice: 3980,
    setupLabel: 'Implantação personalizada a partir de R$ 39.800',
    badge: 'GESTÃO SOB MEDIDA',
    features: ['Tudo do plano Performance', 'Até 1.500 alunos e 2 unidades', 'Perfis executivo, gestor, profissional e aluno', 'BI, metas, satisfação e risco de churn', 'Agenda, avaliações, planos e financeiro', 'Até 12 horas técnicas mensais'],
    href: '/gestao-premium',
    cta: 'Ver demonstração'
  }
]

export const managementPremiumOffer = {
  id: 'management-premium',
  setupPrice: 39800,
  monthlyPrice: 3980,
  activeStudents: 1500,
  units: 2,
  technicalHoursPerMonth: 12,
  appStoresAddon: 14800,
  appStoreFeesIncluded: false,
  environments: ['Executivo', 'Operacional', 'Profissional', 'Aluno'],
  modules: [
    'Gestão multiunidade',
    'Alunos, planos e contratos',
    'Agenda e personal',
    'Avaliações e evolução',
    'Frequência e risco de churn',
    'Satisfação e metas',
    'Financeiro e indicadores',
    'Segurança, logs e LGPD'
  ]
}
