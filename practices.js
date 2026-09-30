/**
 * Alivie Practices Database
 * Práticas guiadas hardcoded - 2 a 5 minutos cada
 */

export const PRACTICES = {
  // CALMO - Para reduzir ansiedade e acalmar
  "breathing-478": {
    id: "breathing-478",
    name: "Respiração 4-7-8",
    category: "calm",
    duration: 180, // 3 minutos
    difficulty: "easy",
    effect: "Reduz ansiedade rapidamente",
    icon: "🌊",
    description: "Uma técnica de respiração que acalma o sistema nervoso em minutos",
    steps: [
      { text: "Sente-se confortavelmente e relaxe os ombros", duration: 15 },
      { text: "Inspire pelo nariz contando até 4...", duration: 4 },
      { text: "Segure a respiração... 2... 3... 4... 5... 6... 7", duration: 7 },
      { text: "Expire pela boca... 2... 3... 4... 5... 6... 7... 8", duration: 8 },
      { text: "Repita: Inspire... 2... 3... 4", duration: 4 },
      { text: "Segure... 2... 3... 4... 5... 6... 7", duration: 7 },
      { text: "Expire... 2... 3... 4... 5... 6... 7... 8", duration: 8 },
      { text: "Mais uma vez... Inspire calmamente", duration: 4 },
      { text: "Segure com tranquilidade", duration: 7 },
      { text: "Expire todo o ar... solte a tensão", duration: 8 },
      { text: "Sinta como seu corpo está mais calmo agora", duration: 20 }
    ]
  },
  
  "body-scan-short": {
    id: "body-scan-short",
    name: "Body Scan Rápido",
    category: "calm",
    duration: 240, // 4 minutos
    difficulty: "easy",
    effect: "Conecta corpo e mente",
    icon: "🧘",
    description: "Uma varredura rápida pelas sensações do corpo",
    steps: [
      { text: "Feche os olhos suavemente", duration: 10 },
      { text: "Traga atenção para os pés... sinta o contato com o chão", duration: 30 },
      { text: "Suba para as pernas... percebendo qualquer tensão", duration: 30 },
      { text: "Observe a barriga subindo e descendo com a respiração", duration: 30 },
      { text: "Sinta o peito... o coração batendo calmamente", duration: 30 },
      { text: "Relaxe os ombros... solte o peso do dia", duration: 30 },
      { text: "Suavize o rosto... testa... olhos... maxilar", duration: 30 },
      { text: "Sinta seu corpo inteiro em repouso", duration: 20 },
      { text: "Quando estiver pronto, abra os olhos devagar", duration: 10 }
    ]
  },
  
  "grounding-54321": {
    id: "grounding-54321",
    name: "Técnica 5-4-3-2-1",
    category: "calm",
    duration: 180, // 3 minutos
    difficulty: "easy",
    effect: "Ancoragem no presente",
    icon: "🌿",
    description: "Use seus sentidos para sair da mente e voltar ao aqui e agora",
    steps: [
      { text: "Olhe ao redor e identifique 5 coisas que você pode ver", duration: 30 },
      { text: "Agora 4 coisas que você pode ouvir", duration: 25 },
      { text: "Toche 3 coisas próximas a você (textura, temperatura)", duration: 25 },
      { text: "Identifique 2 cheiros no ambiente", duration: 25 },
      { text: "Finalmente, 1 gosto na sua boca", duration: 20 },
      { text: "Sinta como você está presente neste momento", duration: 15 }
    ]
  },

  // DESCANSADO - Para preparar para sono
  "bedtime-relax": {
    id: "bedtime-relax",
    name: "Relaxamento Noturno",
    category: "rest",
    duration: 300, // 5 minutos
    difficulty: "easy",
    effect: "Prepara para sono profundo",
    icon: "🌙",
    description: "Solte o dia e prepare corpo e mente para descansar",
    steps: [
      { text: "Deite-se confortavelmente na cama", duration: 15 },
      { text: "Faça 3 respirações profundas... solte o ar lentamente", duration: 45 },
      { text: "Relembre 3 coisas boas que aconteceram hoje", duration: 45 },
      { text: "Perdoe-se por qualquer coisa que não saiu como planejado", duration: 30 },
      { text: "Visualize um lugar tranquilo... praia, floresta, montanha", duration: 60 },
      { text: "Sinta cada músculo relaxando... pesando", duration: 45 },
      { text: "Agradeça pelo dia que passou", duration: 20 }
    ]
  },
  
  "progressive-relax": {
    id: "progressive-relax",
    name: "Relaxamento Muscular",
    category: "rest",
    duration: 240, // 4 minutos
    difficulty: "medium",
    effect: "Alivia tensão física",
    icon: "💆",
    description: "Contrai e relaxa grupos musculares progressivamente",
    steps: [
      { text: "Comece com os pés... contraia por 5 segundos", duration: 8 },
      { text: "Solte... sinta o relaxamento", duration: 12 },
      { text: "Suba para as pernas... contraia", duration: 8 },
      { text: "Solte completamente", duration: 12 },
      { text: "Barriga e peito... contraia", duration: 8 },
      { text: "Relaxa profundamente", duration: 12 },
      { text: "Ombros e braços... contraia", duration: 8 },
      { text: "Deixe o peso ir embora", duration: 12 },
      { text: "Rosto... contraia todos os músculos", duration: 8 },
      { text: "Solte com um suspiro", duration: 12 },
      { text: "Sinta seu corpo inteiro pesado e relaxado", duration: 20 }
    ]
  },

  // ENERGIZADO - Para despertar vitalidade
  "energizing-breath": {
    id: "energizing-breath",
    name: "Respiração Energizante",
    category: "energy",
    duration: 120, // 2 minutos
    difficulty: "easy",
    effect: "Aumenta oxigenação e alerta",
    icon: "⚡",
    description: "Respiração rápida e profunda para despertar o corpo",
    steps: [
      { text: "Sente-se ereto ou fique em pé", duration: 10 },
      { text: "Inspire profundamente pelo nariz... 2... 3... 4", duration: 4 },
      { text: "Expire ativamente pela boca... 2", duration: 2 },
      { text: "De novo! Inspire profundo... 2... 3... 4", duration: 4 },
      { text: "Expire com força... 2", duration: 2 },
      { text: "Continue este ritmo... inspirações profundas, expirações curtas", duration: 30 },
      { text: "Agora respire normalmente... sinta a energia", duration: 20 },
      { text: "Sorria! Seu corpo está despertando", duration: 10 }
    ]
  },
  
  "morning-awake": {
    id: "morning-awake",
    name: "Despertar da Manhã",
    category: "energy",
    duration: 180, // 3 minutos
    difficulty: "easy",
    effect: "Começa o dia com vitalidade",
    icon: "☀️",
    description: "Alongamentos e respiração para acordar com disposição",
    steps: [
      { text: "Estique os braços para cima... alongue o corpo inteiro", duration: 15 },
      { text: "Gire os ombros para trás... 5 vezes", duration: 15 },
      { text: "Gire para frente... 5 vezes", duration: 15 },
      { text: "Incline a cabeça para um lado... segure", duration: 10 },
      { text: "Outro lado... segure", duration: 10 },
      { text: "Respire profundamente 3 vezes... imagine energia entrando", duration: 25 },
      { text: "Agradeça por mais um dia", duration: 15 },
      { text: "Sorria! Hoje será um ótimo dia", duration: 10 }
    ]
  },

  // CENTRADO - Para focar a mente
  "focused-attention": {
    id: "focused-attention",
    name: "Atenção Focada",
    category: "focus",
    duration: 180, // 3 minutos
    difficulty: "medium",
    effect: "Melhora concentração",
    icon: "🎯",
    description: "Escolha um objeto e observe-o com atenção plena",
    steps: [
      { text: "Escolha um objeto próximo a você", duration: 10 },
      { text: "Observe sua forma... cores... textura", duration: 30 },
      { text: "Se a mente divagar, gentilmente volte ao objeto", duration: 30 },
      { text: "Perceba detalhes que você nunca notou antes", duration: 30 },
      { text: "Sinta a simplicidade de estar presente", duration: 20 },
      { text: "A respiração continua naturalmente", duration: 30 },
      { text: "Mantenha a atenção no objeto", duration: 30 }
    ]
  },
  
  "box-breathing": {
    id: "box-breathing",
    name: "Respiração em Caixa",
    category: "focus",
    duration: 240, // 4 minutos
    difficulty: "medium",
    effect: "Aumenta clareza mental",
    icon: "📦",
    description: "Padrão quadrado: inspira-segura-expira-segura",
    steps: [
      { text: "Visualize um quadrado", duration: 10 },
      { text: "Inspire subindo pelo lado direito... 2... 3... 4", duration: 4 },
      { text: "Segure no topo... 2... 3... 4", duration: 4 },
      { text: "Expire descendo... 2... 3... 4", duration: 4 },
      { text: "Segure na base... 2... 3... 4", duration: 4 },
      { text: "Repita: Inspire... segure... expire... segure", duration: 48 },
      { text: "Sinta a mente ficando mais clara e focada", duration: 20 },
      { text: "Você está no controle do seu ritmo", duration: 10 }
    ]
  }
};

// Get practices by category
export function getPracticesByCategory(category) {
  return Object.values(PRACTICES).filter(p => p.category === category);
}

// Get random practice from category
export function getRandomPractice(category) {
  const practices = getPracticesByCategory(category);
  return practices[Math.floor(Math.random() * practices.length)];
}

// Get practice by ID
export function getPracticeById(id) {
  return PRACTICES[id] || null;
}

// Get all categories with metadata
export const CATEGORIES = {
  calm: {
    name: "Calmo",
    icon: "🌊",
    color: "#4A90E2",
    description: "Reduzir ansiedade e acalmar a mente"
  },
  rest: {
    name: "Descansado",
    icon: "💤",
    color: "#7B68EE",
    description: "Preparar para um sono tranquilo"
  },
  energy: {
    name: "Energizado",
    icon: "⚡",
    color: "#F5A623",
    description: "Despertar vitalidade e disposição"
  },
  focus: {
    name: "Centrado",
    icon: "🎯",
    color: "#50C878",
    description: "Focar a mente e aumentar clareza"
  }
};
