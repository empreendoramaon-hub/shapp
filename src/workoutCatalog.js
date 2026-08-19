const exercise = (name, sets, reps, load, rest, tip, videoOptional = false) => ({
  name, sets, reps, load, rest, tip, videoOptional
})

export const workoutPlans = [
  {
    id: 'abc-push-pull-legs',
    name: 'ABC — Empurrar, puxar e pernas',
    description: 'Divisão tradicional em três dias, com volume progressivo e execução controlada.',
    goal: 'Hipertrofia e força geral',
    workouts: [
      {
        id: 'abc-a-push', sequence: 1, name: 'Treino A', focus: 'Peito, ombros e tríceps', exercises: [
          exercise('Supino reto com barra', '4', '8–10', 'Progressiva', '90s', 'Mantenha as escápulas apoiadas e os pés firmes.', true),
          exercise('Supino inclinado com halteres', '3', '10–12', 'Moderada', '75s', 'Desça os halteres com controle até a linha do peito.', true),
          exercise('Desenvolvimento com halteres', '3', '10–12', 'Moderada', '75s', 'Evite arquear a lombar durante a subida.', true),
          exercise('Elevação lateral', '3', '12–15', 'Leve a moderada', '60s', 'Eleve até a linha dos ombros sem usar impulso.'),
          exercise('Tríceps na polia (pulley)', '3', '12–15', 'Controle', '60s', 'Mantenha os cotovelos próximos ao corpo.')
        ]
      },
      {
        id: 'abc-b-pull', sequence: 2, name: 'Treino B', focus: 'Costas e bíceps', exercises: [
          exercise('Puxada alta frontal', '4', '10–12', 'Moderada', '75s', 'Leve a barra à parte alta do peito.', true),
          exercise('Remada curvada com barra', '4', '8–10', 'Progressiva', '90s', 'Mantenha a coluna neutra e puxe com os cotovelos.', true),
          exercise('Remada unilateral (serrote)', '3', '10–12 cada lado', 'Moderada', '75s', 'Evite girar o tronco durante a puxada.'),
          exercise('Rosca direta com barra', '3', '10–12', 'Moderada', '60s', 'Não balance o corpo para subir a barra.'),
          exercise('Rosca martelo', '3', '12', 'Moderada', '60s', 'Mantenha punhos neutros e cotovelos estáveis.')
        ]
      },
      {
        id: 'abc-c-legs', sequence: 3, name: 'Treino C', focus: 'Pernas, panturrilhas e abdômen', exercises: [
          exercise('Agachamento livre', '4', '8–10', 'Progressiva', '90s', 'Joelhos alinhados e tronco firme.', true),
          exercise('Leg press 45°', '4', '10–12', 'Moderada', '90s', 'Não retire o quadril do banco.', true),
          exercise('Cadeira extensora', '3', '12–15', 'Controle', '60s', 'Segure um segundo no topo.'),
          exercise('Mesa flexora', '3', '12–15', 'Moderada', '60s', 'Controle a volta sem levantar o quadril.'),
          exercise('Elevação de panturrilhas em pé', '4', '15–20', 'Moderada', '45s', 'Use a amplitude completa sem quicar.'),
          exercise('Prancha abdominal', '3', '40s', 'Peso corporal', '45s', 'Mantenha quadril, tronco e cabeça alinhados.')
        ]
      }
    ]
  },
  {
    id: 'abcd-hypertrophy',
    name: 'ABCD — Hipertrofia dividida',
    description: 'Quatro dias com foco específico por grupamento muscular.',
    goal: 'Hipertrofia com maior volume semanal',
    workouts: [
      {
        id: 'abcd-a-chest-triceps', sequence: 1, name: 'Treino A', focus: 'Peito e tríceps', exercises: [
          exercise('Supino reto com barra', '4', '8–10', 'Progressiva', '90s', 'Mantenha as escápulas encaixadas.', true),
          exercise('Supino inclinado com halteres', '3', '10–12', 'Moderada', '75s', 'Controle toda a descida.', true),
          exercise('Crucifixo reto na máquina', '3', '12–15', 'Controle', '60s', 'Evite fechar excessivamente os ombros.'),
          exercise('Tríceps testa', '3', '10–12', 'Moderada', '60s', 'Mantenha os cotovelos apontados para cima.'),
          exercise('Tríceps pulley', '3', '12–15', 'Controle', '60s', 'Estenda os braços sem movimentar os ombros.')
        ]
      },
      {
        id: 'abcd-b-back-biceps', sequence: 2, name: 'Treino B', focus: 'Costas e bíceps', exercises: [
          exercise('Puxada frontal', '4', '10–12', 'Moderada', '75s', 'Puxe até a linha do peito.', true),
          exercise('Remada baixa', '4', '10–12', 'Progressiva', '75s', 'Mantenha o peito aberto.'),
          exercise('Pulldown', '3', '12–15', 'Controle', '60s', 'Inicie o movimento pelas escápulas.'),
          exercise('Rosca direta', '3', '10–12', 'Moderada', '60s', 'Evite projetar os ombros.'),
          exercise('Rosca Scott', '3', '10–12', 'Moderada', '60s', 'Não estenda o cotovelo de forma brusca.')
        ]
      },
      {
        id: 'abcd-c-legs', sequence: 3, name: 'Treino C', focus: 'Pernas completas', exercises: [
          exercise('Agachamento livre', '4', '8–10', 'Progressiva', '90s', 'Mantenha a coluna neutra.', true),
          exercise('Leg press 45°', '4', '10–12', 'Moderada', '90s', 'Controle a profundidade.', true),
          exercise('Stiff', '3', '10–12', 'Moderada', '75s', 'Leve o quadril para trás sem arredondar a coluna.'),
          exercise('Cadeira extensora', '3', '12–15', 'Controle', '60s', 'Segure no topo.'),
          exercise('Mesa flexora', '3', '12–15', 'Moderada', '60s', 'Faça a volta lentamente.')
        ]
      },
      {
        id: 'abcd-d-shoulders-core', sequence: 4, name: 'Treino D', focus: 'Ombros, trapézio e abdômen', exercises: [
          exercise('Desenvolvimento militar', '4', '8–10', 'Progressiva', '90s', 'Contraia o abdômen durante todo o movimento.', true),
          exercise('Elevação lateral', '3', '12–15', 'Moderada', '60s', 'Não eleve os ombros em direção às orelhas.'),
          exercise('Crucifixo inverso', '3', '12–15', 'Leve', '60s', 'Abra os braços mantendo o pescoço relaxado.'),
          exercise('Encolhimento com halteres', '4', '12–15', 'Moderada', '60s', 'Suba e desça os ombros sem girá-los.'),
          exercise('Abdominal na máquina', '3', '15–20', 'Moderada', '45s', 'Flexione o tronco sem puxar com os braços.')
        ]
      }
    ]
  },
  {
    id: 'functional-conditioning',
    name: 'Funcional — Mobilidade e condicionamento',
    description: 'Circuitos de corpo inteiro com potência, coordenação e estabilidade.',
    goal: 'Condicionamento, mobilidade e gasto energético',
    workouts: [
      {
        id: 'functional-a', sequence: 1, name: 'Funcional A', focus: 'Força global e core', exercises: [
          exercise('Agachamento goblet', '4', '12', 'Moderada', '45s', 'Mantenha o peso próximo ao peito.', true),
          exercise('Remada TRX', '4', '12', 'Peso corporal', '45s', 'Mantenha o corpo em bloco.'),
          exercise('Flexão de braços inclinada', '3', '10–15', 'Peso corporal', '45s', 'Desça o peito entre as mãos.'),
          exercise('Kettlebell swing', '4', '15', 'Moderada', '60s', 'A potência vem do quadril.', true),
          exercise('Prancha com toque nos ombros', '3', '20 alternadas', 'Peso corporal', '45s', 'Evite balançar o quadril.')
        ]
      },
      {
        id: 'functional-b', sequence: 2, name: 'Funcional B', focus: 'Unilateral e estabilidade', exercises: [
          exercise('Passada alternada', '3', '12 cada lado', 'Leve a moderada', '45s', 'Mantenha o joelho alinhado.'),
          exercise('Levantamento terra com kettlebell', '4', '12', 'Moderada', '60s', 'Empurre o chão e mantenha a coluna neutra.'),
          exercise('Desenvolvimento unilateral', '3', '10 cada lado', 'Leve', '45s', 'Não incline o tronco.'),
          exercise('Farmer walk', '4', '30m', 'Moderada', '45s', 'Caminhe com postura alta e passos curtos.'),
          exercise('Dead bug', '3', '12 cada lado', 'Peso corporal', '45s', 'Mantenha a lombar apoiada.')
        ]
      },
      {
        id: 'functional-c', sequence: 3, name: 'Funcional C', focus: 'Circuito metabólico', exercises: [
          exercise('Step-up no banco', '4', '12 cada lado', 'Leve', '30s', 'Suba usando a perna apoiada.'),
          exercise('Corda naval', '6', '30s', 'Intensa', '30s', 'Mantenha joelhos semiflexionados.'),
          exercise('Medicine ball slam', '4', '12', 'Moderada', '45s', 'Use quadril e abdômen para acelerar a bola.'),
          exercise('Mountain climber', '4', '30s', 'Peso corporal', '30s', 'Mantenha os ombros sobre as mãos.'),
          exercise('Caminhada leve de recuperação', '1', '8 min', 'Leve', 'Livre', 'Reduza gradualmente a frequência cardíaca.')
        ]
      }
    ]
  },
  {
    id: 'cardio-endurance',
    name: 'Cardio — Resistência e intervalos',
    description: 'Sessões progressivas alternando base aeróbica e estímulos intervalados.',
    goal: 'Resistência cardiovascular e recuperação',
    workouts: [
      {
        id: 'cardio-a', sequence: 1, name: 'Cardio A', focus: 'Base aeróbica', exercises: [
          exercise('Aquecimento na esteira', '1', '8 min', 'Leve', 'Livre', 'Aumente o ritmo de forma gradual.'),
          exercise('Caminhada inclinada', '1', '25 min', 'Moderada', 'Livre', 'Mantenha um ritmo em que ainda consiga conversar.'),
          exercise('Desaquecimento', '1', '5 min', 'Leve', 'Livre', 'Diminua a velocidade aos poucos.'),
          exercise('Mobilidade de quadril e panturrilha', '2', '40s por lado', 'Leve', '20s', 'Sem forçar além da amplitude confortável.')
        ]
      },
      {
        id: 'cardio-b', sequence: 2, name: 'Cardio B', focus: 'Intervalado na bicicleta', exercises: [
          exercise('Aquecimento na bike', '1', '6 min', 'Leve', 'Livre', 'Cadência confortável.'),
          exercise('Bike intervalada', '10', '40s forte / 80s leve', 'Cardio', 'Livre', 'Mantenha a mesma técnica nos tiros.'),
          exercise('Giro leve', '1', '6 min', 'Leve', 'Livre', 'Reduza a frequência cardíaca gradualmente.'),
          exercise('Prancha lateral', '3', '30s por lado', 'Peso corporal', '30s', 'Mantenha o quadril elevado.')
        ]
      },
      {
        id: 'cardio-c', sequence: 3, name: 'Cardio C', focus: 'Circuito misto', exercises: [
          exercise('Elíptico', '1', '12 min', 'Moderada', 'Livre', 'Mantenha ritmo constante.'),
          exercise('Escada', '6', '1 min forte / 1 min leve', 'Cardio', 'Livre', 'Apoie o pé por completo no degrau.'),
          exercise('Remo ergométrico', '5', '2 min moderado / 1 min leve', 'Cardio', 'Livre', 'Empurre com as pernas antes de puxar os braços.'),
          exercise('Respiração e alongamento leve', '1', '6 min', 'Leve', 'Livre', 'Respire profundamente sem prender o ar.')
        ]
      }
    ]
  }
]

export function cloneWorkoutPlan(planId) {
  const plan = workoutPlans.find((item) => item.id === planId) || workoutPlans[0]
  return plan.workouts.map((workout) => ({
    ...workout,
    exercises: workout.exercises.map((item) => ({ ...item }))
  }))
}

function createWorkoutVariation(planId, variationId, customizeExercise) {
  return cloneWorkoutPlan(planId).map((workout, workoutIndex) => ({
    ...workout,
    id: `${workout.id}-${variationId}`,
    exercises: workout.exercises.map((item, exerciseIndex) => ({
      ...item,
      ...(customizeExercise?.(item, workoutIndex, exerciseIndex) || {})
    }))
  }))
}

function createHybridWorkouts() {
  const functional = cloneWorkoutPlan('functional-conditioning')
  const cardio = cloneWorkoutPlan('cardio-endurance')
  return [functional[0], cardio[1], functional[2], cardio[0]].map((workout, index) => ({
    ...workout,
    id: `${workout.id}-hybrid`,
    sequence: index + 1,
    name: `Treino ${String.fromCharCode(65 + index)}`,
    focus: index % 2 === 0 ? `Funcional: ${workout.focus}` : `Cardio: ${workout.focus}`
  }))
}

export function isDemoStudent(studentOrToken = '') {
  const token = typeof studentOrToken === 'string' ? studentOrToken : studentOrToken?.token
  return `${token || ''}`.startsWith('demo-') || studentOrToken?.isDemo === true
}

export function createIronFitDemoStudents(today = new Date().toISOString().slice(0, 10)) {
  return [
    {
      id: 'student-demo-001', token: 'demo-ana-cassoni', name: 'Ana Cassoni', phone: '(48) 98888-7777', email: 'ana@email.com', birthDate: '10/03/1994', status: 'active', goal: 'Hipertrofia e constância', trainerId: 'trainer-ana', monthlyGoal: 20, completedThisMonth: 8, xp: 1280, level: 7, streak: 4,
      workouts: cloneWorkoutPlan('abc-push-pull-legs'), bookings: [],
      family: [{ name: 'Nana Cassoni', relation: 'Filha', age: '8', activities: ['Kids movimento', 'Natação infantil'] }, { name: 'Zoe Cassoni', relation: 'Filha', age: '5', activities: ['Kids movimento'] }],
      assessments: [{ date: today, weight: 68, bodyFat: 23, waist: 74, muscleMass: 42, note: 'Boa evolução de constância.' }],
      nutrition: { enabled: true, diet: 'Plano alimentar equilibrado nos dias de treino.', supplements: 'Conforme orientação profissional.', professional: 'Nutricionista da academia' }
    },
    {
      id: 'student-demo-002', token: 'demo-bruno-lima', name: 'Bruno Lima', phone: '(48) 90000-0002', email: 'bruno@exemplo.com', birthDate: '22/09/1989', status: 'active', goal: 'Hipertrofia avançada', trainerId: 'trainer-lucas', monthlyGoal: 18, completedThisMonth: 11, xp: 1760, level: 9, streak: 6,
      workouts: cloneWorkoutPlan('abcd-hypertrophy'), bookings: [], family: [], assessments: [], nutrition: { enabled: false }
    },
    {
      id: 'student-demo-003', token: 'demo-carla-mendes', name: 'Carla Mendes', phone: '(48) 90000-0003', email: 'carla@exemplo.com', birthDate: '05/05/1992', status: 'active', goal: 'Condicionamento e mobilidade', trainerId: 'trainer-ana', monthlyGoal: 16, completedThisMonth: 9, xp: 940, level: 5, streak: 3,
      workouts: cloneWorkoutPlan('functional-conditioning'), bookings: [], family: [], assessments: [], nutrition: { enabled: false }
    },
    {
      id: 'student-demo-004', token: 'demo-diego-santos', name: 'Diego Santos', phone: '(48) 90000-0004', email: 'diego@exemplo.com', birthDate: '17/01/1986', status: 'active', goal: 'Resistência cardiovascular', trainerId: 'trainer-lucas', monthlyGoal: 14, completedThisMonth: 7, xp: 720, level: 4, streak: 2,
      workouts: cloneWorkoutPlan('cardio-endurance'), bookings: [], family: [], assessments: [], nutrition: { enabled: false }
    },
    {
      id: 'student-demo-005', token: 'demo-larissa-rocha', name: 'Larissa Rocha', phone: '(48) 90000-0005', email: 'larissa@exemplo.com', birthDate: '30/11/1996', status: 'active', goal: 'Força e definição', trainerId: 'trainer-ana', monthlyGoal: 20, completedThisMonth: 6, xp: 610, level: 3, streak: 2,
      workouts: createWorkoutVariation('abc-push-pull-legs', 'larissa', (item, workoutIndex, exerciseIndex) => ({
        sets: workoutIndex === 2 && exerciseIndex < 2 ? '5' : item.sets,
        reps: workoutIndex === 2 && exerciseIndex < 2 ? '6–8' : item.reps,
        load: workoutIndex === 2 && exerciseIndex < 2 ? 'Progressiva' : item.load
      })), bookings: [], family: [], assessments: [], nutrition: { enabled: false }
    },
    {
      id: 'student-demo-006', token: 'demo-beatriz-nunes', name: 'Beatriz Nunes', phone: '(48) 90000-0006', email: 'beatriz@exemplo.com', birthDate: '14/07/1998', status: 'active', goal: 'Condicionamento funcional e cardio', trainerId: 'trainer-lucas', monthlyGoal: 16, completedThisMonth: 10, xp: 1120, level: 6, streak: 5,
      workouts: createHybridWorkouts(), bookings: [], family: [], assessments: [], nutrition: { enabled: false }
    },
    {
      id: 'student-demo-007', token: 'demo-rafael-martins', name: 'Rafael Martins', phone: '(48) 90000-0007', email: 'rafael@exemplo.com', birthDate: '08/02/1991', status: 'active', goal: 'Adaptação ao treino ABCD', trainerId: 'trainer-ana', monthlyGoal: 16, completedThisMonth: 5, xp: 530, level: 3, streak: 2,
      workouts: createWorkoutVariation('abcd-hypertrophy', 'rafael', (item) => ({
        sets: Number.parseInt(item.sets, 10) > 3 ? '3' : item.sets,
        reps: item.reps.includes('8') ? '10–12' : item.reps,
        load: item.load === 'Progressiva' ? 'Moderada' : item.load
      })), bookings: [], family: [], assessments: [], nutrition: { enabled: false }
    }
  ].map((student) => ({ ...student, isDemo: true, readOnly: true }))
}

export function mergeIronFitStudents(currentStudents = [], today) {
  const defaults = createIronFitDemoStudents(today)
  const demoIds = new Set(defaults.map((student) => student.id))
  const demoTokens = new Set(defaults.map((student) => student.token))
  const mergedDemos = defaults.map((student) => {
    const current = currentStudents.find((item) => item.id === student.id || item.token === student.token)
    return current ? {
      ...current,
      ...student,
      bookings: Array.isArray(current.bookings) ? current.bookings : student.bookings
    } : student
  })
  const customStudents = currentStudents
    .filter((student) => !demoIds.has(student.id) && !demoTokens.has(student.token) && !isDemoStudent(student))
    .map((student, index) => ({
      ...student,
      workouts: Array.isArray(student.workouts) && student.workouts.length
        ? student.workouts
        : cloneWorkoutPlan(workoutPlans[index % workoutPlans.length].id)
    }))
  return [...mergedDemos, ...customStudents]
}
