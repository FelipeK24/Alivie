import { db, auth } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// Tasks Dashboard - Minha Rotina
(function () {
  'use strict';

  // Base de atividades por período
  const activitiesDB = {
    manha: [
      { id: 'm1', title: 'Alongamento suave', duration: '5 min', type: 'movimento', energy: 'low', icon: 'fa-child', description: 'Estique os braços e pernas ainda com calma.' },
      { id: 'm2', title: 'Hidratação matinal', duration: '2 min', type: 'saude', energy: 'low', icon: 'fa-glass-water', description: 'Beba um copo de água para acordar o corpo.' },
      { id: 'm3', title: 'Respiração consciente', duration: '3 min', type: 'mental', energy: 'low', icon: 'fa-wind', description: 'Respire fundo por alguns ciclos para começar o dia com presença.' },
      { id: 'm4', title: 'Café da manhã tranquilo', duration: '15 min', type: 'saude', energy: 'low', icon: 'fa-mug-hot', description: 'Coma sem pressa, com atenção ao momento.' },
      { id: 'm5', title: 'Pausa para café', duration: '10 min', type: 'pausa', energy: 'low', icon: 'fa-coffee', description: 'Um momento de calma antes de iniciar as tarefas.' },
      { id: 'm6', title: 'Caminhada leve', duration: '15 min', type: 'movimento', energy: 'medium', icon: 'fa-walking', description: 'Uma volta curta para ativar o corpo.' },
      { id: 'm7', title: 'Yoga matinal', duration: '10 min', type: 'movimento', energy: 'medium', icon: 'fa-spa', description: 'Posturas simples para acordar com leveza.' },
      { id: 'm8', title: 'Meditação guiada', duration: '10 min', type: 'mental', energy: 'medium', icon: 'fa-om', description: 'Um momento de silêncio para organizar a mente.' },
      { id: 'm9', title: 'Preparação organizada', duration: '10 min', type: 'disciplina', energy: 'medium', icon: 'fa-clipboard-check', description: 'Defina a ordem do dia antes de começar.' },
      { id: 'm10', title: 'Exercício rápido', duration: '20 min', type: 'movimento', energy: 'high', icon: 'fa-running', description: 'Movimentos curtos para elevar a disposição.' },
      { id: 'm11', title: 'Planejamento do dia', duration: '10 min', type: 'disciplina', energy: 'high', icon: 'fa-list-check', description: 'Escolha as 3 prioridades principais do dia.' },
      { id: 'm12', title: 'Exposição ao sol', duration: '10 min', type: 'saude', energy: 'medium', icon: 'fa-sun', description: 'Luz natural ajuda o corpo a despertar.' }
    ],
    tarde: [
      { id: 't1', title: 'Pausa para água', duration: '2 min', type: 'saude', energy: 'low', icon: 'fa-glass-water', description: 'Mais um copo de água para manter o ritmo.' },
      { id: 't2', title: 'Respiração no trabalho', duration: '3 min', type: 'mental', energy: 'low', icon: 'fa-wind', description: 'Desconecte por alguns instantes e respire fundo.' },
      { id: 't3', title: 'Pausa para o lanche', duration: '10 min', type: 'saude', energy: 'low', icon: 'fa-apple-alt', description: 'Escolha algo leve para manter o foco.' },
      { id: 't4', title: 'Alongamento na cadeira', duration: '5 min', type: 'movimento', energy: 'low', icon: 'fa-chair', description: 'Solte ombros, pescoço e mãos.' },
      { id: 't5', title: 'Pausa visual', duration: '5 min', type: 'saude', energy: 'low', icon: 'fa-eye', description: 'Olhe para longe por alguns segundos.' },
      { id: 't6', title: 'Caminhada no almoço', duration: '15 min', type: 'movimento', energy: 'medium', icon: 'fa-walking', description: 'Uma volta curta ajuda a reduzir a fadiga.' },
      { id: 't7', title: 'Meditação de meio-dia', duration: '10 min', type: 'mental', energy: 'medium', icon: 'fa-om', description: 'Momento breve para recarregar a atenção.' },
      { id: 't8', title: 'Organização da tarde', duration: '5 min', type: 'disciplina', energy: 'medium', icon: 'fa-tasks', description: 'Revise o que falta e reordene prioridades.' },
      { id: 't9', title: 'Lanche saudável', duration: '10 min', type: 'saude', energy: 'medium', icon: 'fa-carrot', description: 'Alimente-se de forma equilibrada.' },
      { id: 't10', title: 'Exercício ao ar livre', duration: '20 min', type: 'movimento', energy: 'high', icon: 'fa-bicycle', description: 'Aproveite a tarde para se movimentar mais.' },
      { id: 't11', title: 'Revisão de metas', duration: '10 min', type: 'disciplina', energy: 'high', icon: 'fa-bullseye', description: 'Veja o que já avançou e o que ainda falta.' },
      { id: 't12', title: 'Pausa de recuperação', duration: '8 min', type: 'pausa', energy: 'low', icon: 'fa-umbrella-beach', description: 'Descanse sem culpa por alguns minutos.' }
    ],
    noite: [
      { id: 'n1', title: 'Redução de telas', duration: 'Ongoing', type: 'sono', energy: 'low', icon: 'fa-mobile-alt', description: 'Diminuir telas ajuda o corpo a desacelerar.' },
      { id: 'n2', title: 'Jantar leve', duration: '30 min', type: 'saude', energy: 'low', icon: 'fa-utensils', description: 'Uma refeição leve favorece o descanso.' },
      { id: 'n3', title: 'Chá relaxante', duration: '10 min', type: 'saude', energy: 'low', icon: 'fa-mug-hot', description: 'Escolha algo suave, como camomila ou cidreira.' },
      { id: 'n4', title: 'Leitura tranquila', duration: '15 min', type: 'mental', energy: 'low', icon: 'fa-book', description: 'Leia algo leve para desacelerar a mente.' },
      { id: 'n5', title: 'Respiração para sono', duration: '5 min', type: 'sono', energy: 'low', icon: 'fa-wind', description: 'Respire fundo e solte o dia aos poucos.' },
      { id: 'n6', title: 'Banho morno', duration: '15 min', type: 'saude', energy: 'low', icon: 'fa-shower', description: 'Água morna ajuda o corpo a relaxar.' },
      { id: 'n7', title: 'Alongamento noturno', duration: '5 min', type: 'movimento', energy: 'low', icon: 'fa-bed', description: 'Alongue de forma suave antes de deitar.' },
      { id: 'n8', title: 'Preparação para dormir', duration: '10 min', type: 'sono', energy: 'low', icon: 'fa-moon', description: 'Deixe o ambiente pronto para o descanso.' },
      { id: 'n9', title: 'Gratidão diária', duration: '3 min', type: 'mental', energy: 'low', icon: 'fa-heart', description: 'Pense em 3 coisas boas do seu dia.' },
      { id: 'n10', title: 'Journaling leve', duration: '10 min', type: 'mental', energy: 'medium', icon: 'fa-pen', description: 'Escreva o que sentiu hoje, sem julgamento.' },
      { id: 'n11', title: 'Organização da manhã seguinte', duration: '5 min', type: 'disciplina', energy: 'low', icon: 'fa-calendar-check', description: 'Deixe o próximo dia mais simples.' }
    ]
  };

  const objectiveDescriptions = {
    'relaxamento': 'Uma rotina suave e acolhedora, pensada para trazer mais calma e tranquilidade ao seu dia.',
    'produtividade': 'Uma rotina equilibrada que combina foco e pausas, para você render sem se esgotar.',
    'bem-estar-fisico': 'Uma rotina com movimentos leves e cuidados com o corpo, respeitando seu ritmo.',
    'sono-melhorado': 'Uma rotina focada em preparar seu corpo e mente para uma noite de descanso.',
    'reducao-ansiedade': 'Uma rotina com práticas de respiração e grounding para momentos de acalmação.',
    'autoconhecimento': 'Uma rotina com momentos de reflexão e conexão consigo mesmo.',
    'energia-vitalidade': 'Uma rotina gradual para despertar sua energia ao longo do dia.',
    'equilibrio-emocional': 'Uma rotina harmoniosa, equilibrando atividade e descanso emocional.'
  };

  const generalTips = [
    'Pequenas ações consistentes criam grandes mudanças.',
    'Faça no seu ritmo, sem pressa desnecessária.',
    'Se um dia não sair como esperado, recomece no próximo.',
    'Mantenha água por perto ao longo do dia.',
    'Pausas também fazem parte da produtividade.',
    'Seu descanso influencia diretamente sua energia.',
    'Movimento pode ser leve e prazeroso.',
    'Cuidar de você é parte da rotina, não exceção.',
    'Celebre as pequenas conquistas do dia.',
    'Equilíbrio vale mais do que perfeição.'
  ];

  const tipsByFocus = {
    'relaxamento': [
      'Reduza estímulos no fim do dia.',
      'Prefira tarefas leves nos horários de maior cansaço.',
      'Reserve alguns minutos para respirar sem pressa.'
    ],
    'produtividade': [
      'Comece pelo que é mais importante.',
      'Agrupe tarefas parecidas para economizar energia mental.',
      'Use pausas curtas para manter consistência.'
    ],
    'bem-estar-fisico': [
      'Inclua movimento leve em mais de um período do dia.',
      'Não ignore sinais de cansaço do corpo.',
      'Alongar antes de dormir pode ajudar bastante.'
    ],
    'sono-melhorado': [
      'Evite telas perto do horário de dormir.',
      'Mantenha a noite com atividades calmas.',
      'Deixe o ambiente pronto para o descanso antes de deitar.'
    ],
    'reducao-ansiedade': [
      'Respiração lenta ajuda a regular o ritmo interno.',
      'Evite sobrecarregar a agenda com muitas tarefas seguidas.',
      'Momentos curtos de pausa podem mudar o resto do dia.'
    ],
    'autoconhecimento': [
      'Observe como cada atividade afeta seu humor.',
      'Escrever o que sente ajuda a organizar pensamentos.',
      'Reserve um momento diário para refletir com calma.'
    ],
    'energia-vitalidade': [
      'Comece o dia com ações simples e progressivas.',
      'Luz natural e movimento ajudam a despertar.',
      'Prefira tarefas mais ativas quando a energia estiver melhor.'
    ],
    'equilibrio-emocional': [
      'Misture ação, pausa e reflexão ao longo do dia.',
      'Nem tudo precisa ser resolvido de uma vez.',
      'Manter constância é mais importante que intensidade.'
    ]
  };

  const loadingEl = document.getElementById('rotina-loading');
  const emptyEl = document.getElementById('rotina-empty');
  const contentEl = document.getElementById('rotina-content');
  const manhaCardsEl = document.getElementById('manha-cards');
  const tardeCardsEl = document.getElementById('tarde-cards');
  const noiteCardsEl = document.getElementById('noite-cards');
  const descriptionEl = document.getElementById('rotina-description');
  const tipsEl = document.getElementById('rotina-tips');
  const userNameEl = document.getElementById('user-name');
  const btnRegenerate = document.getElementById('btn-regenerate');

  let currentRoutine = null;
  let userProfile = null;
  let formData = null;

  document.addEventListener('DOMContentLoaded', async function () {
    if (window.Auth?.fetchSession) {
      await window.Auth.fetchSession();
    }
    await loadUserData();

    if (btnRegenerate) {
      btnRegenerate.addEventListener('click', generateNewRoutine);
    }

    // Initialize dashboard
    initDashboard();

    // Setup activity tracking
    setupActivityTracking();
  });

  function loadUserData() {
    showLoading();

    Promise.all([fetchProfile(), fetchFormulario()])
      .then(function (results) {
        const [profileResult, formularioResult] = results;

        if (profileResult && profileResult.ok) {
          userProfile = profileResult.body && profileResult.body.profile ? profileResult.body.profile : {};
        }

        if (formularioResult && formularioResult.ok) {
          formData = formularioResult.body && formularioResult.body.formulario ? formularioResult.body.formulario : null;
        }

        if (formData && hasValidData(formData)) {
          generateRoutine();
          showContent();
        } else {
          showEmpty();
        }
      })
      .catch(function (err) {
        console.error('Error loading user data:', err);
        showEmpty();
      });
  }

  async function fetchProfile() {
    const session = window.Auth.getSession();
    if (!session?.uid) {
      return Promise.resolve({ ok: false });
    }
    try {
      const docRef = doc(db, "profiles", session.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ok: true, body: { profile: docSnap.data() } };
      }
      return { ok: false };
    } catch (err) {
      console.error('Error fetching profile from Firestore:', err);
      return { ok: false };
    }
  }

  async function fetchFormulario() {
    const session = window.Auth.getSession();
    if (!session?.uid) {
      return Promise.resolve({ ok: false });
    }
    try {
      const docRef = doc(db, "forms", session.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ok: true, body: { formulario: docSnap.data() } };
      }
      return { ok: false };
    } catch (err) {
      console.error('Error fetching form from Firestore:', err);
      return { ok: false };
    }
  }

  function hasValidData(form) {
    return !!(form && (
      form.rotina_diaria ||
      form.horas_sono ||
      form.carga_trabalho ||
      form.foco_melhorar ||
      form.cuidados_mente
    ));
  }

  function showLoading() {
    if (loadingEl) loadingEl.hidden = false;
    if (emptyEl) emptyEl.hidden = true;
    if (contentEl) contentEl.hidden = true;
  }

  function showEmpty() {
    if (loadingEl) loadingEl.hidden = true;
    if (emptyEl) emptyEl.hidden = false;
    if (contentEl) contentEl.hidden = true;
  }

  function showContent() {
    if (loadingEl) loadingEl.hidden = true;
    if (emptyEl) emptyEl.hidden = true;
    if (contentEl) contentEl.hidden = false;
  }

  function generateRoutine() {
    const routineFocus = normalizeFocus(userProfile && userProfile.routineFocus ? userProfile.routineFocus : 'relaxamento');
    const fullName = userProfile && userProfile.fullName ? String(userProfile.fullName) : 'Visitante';

    if (userNameEl) {
      userNameEl.textContent = getFirstName(fullName);
    }

    if (descriptionEl) {
      descriptionEl.textContent = objectiveDescriptions[routineFocus] || objectiveDescriptions.relaxamento;
    }

    const energyLevel = determineEnergyLevel(formData);

    renderPeriodCards('manha', manhaCardsEl, energyLevel, routineFocus);
    renderPeriodCards('tarde', tardeCardsEl, energyLevel, routineFocus);
    renderPeriodCards('noite', noiteCardsEl, 'low', routineFocus);

    generateTips(routineFocus, energyLevel);

    currentRoutine = {
      focus: routineFocus,
      energy: energyLevel,
      generatedAt: new Date().toISOString()
    };
  }

  function generateNewRoutine() {
    showLoading();
    window.setTimeout(function () {
      generateRoutine();
      showContent();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 250);
  }

  function determineEnergyLevel(form) {
    if (!form) return 'low';

    const carga = normalizeText(form.carga_trabalho || '');
    const horasSono = normalizeText(form.horas_sono || '');

    const sleepValue = getSleepScore(horasSono);
    const workloadValue = getWorkloadScore(carga);

    if (sleepValue <= 1 || workloadValue >= 3) return 'low';
    if (sleepValue >= 3 && workloadValue <= 1) return 'high';
    return 'medium';
  }

  function getSleepScore(value) {
    if (value.includes('menos de 5')) return 0;
    if (value.includes('5') || value.includes('6')) return 1;
    if (value.includes('7') || value.includes('8') || value.includes('9')) return 3;
    if (value.includes('mais de 9')) return 2;
    return 2;
  }

  function getWorkloadScore(value) {
    if (value.includes('muito pesada')) return 4;
    if (value.includes('pesada')) return 3;
    if (value.includes('moderada')) return 2;
    if (value.includes('leve')) return 1;
    return 2;
  }

  function renderPeriodCards(period, container, energyLevel, focus) {
    if (!container) return;

    const activities = activitiesDB[period] || [];
    const count = getTargetCount(period, energyLevel);

    const filtered = activities
      .filter(function (activity) {
        return isEnergyAllowed(activity.energy, energyLevel, period);
      })
      .map(function (activity) {
        return {
          activity: activity,
          score: scoreActivity(activity, period, energyLevel, focus)
        };
      })
      .sort(function (a, b) {
        if (b.score !== a.score) return b.score - a.score;
        if (a.activity.title !== b.activity.title) return a.activity.title.localeCompare(b.activity.title, 'pt-BR');
        return a.activity.id.localeCompare(b.activity.id);
      })
      .slice(0, count)
      .map(function (item) {
        return item.activity;
      });

    container.innerHTML = filtered.map(function (activity) {
      return createCardHTML(activity);
    }).join('');
  }

  function getTargetCount(period, energyLevel) {
    if (period === 'noite') return 4;
    if (energyLevel === 'high') return 4;
    if (energyLevel === 'medium') return 3;
    return 3;
  }

  function isEnergyAllowed(activityEnergy, userEnergy, period) {
    if (period === 'noite') return activityEnergy === 'low';

    if (userEnergy === 'low') {
      return activityEnergy === 'low' || activityEnergy === 'medium';
    }
    if (userEnergy === 'medium') {
      return activityEnergy === 'low' || activityEnergy === 'medium';
    }
    return activityEnergy === 'medium' || activityEnergy === 'high';
  }

  function scoreActivity(activity, period, energyLevel, focus) {
    const priorityTypes = getPriorityTypes(focus);
    const typeIndex = priorityTypes.indexOf(activity.type);
    const typeScore = typeIndex === -1 ? 0 : Math.max(0, 60 - typeIndex * 10);

    const energyScore = getEnergyFitScore(activity.energy, energyLevel, period);
    const periodScore = getPeriodScore(activity.type, period);
    const durationScore = getDurationScore(activity.duration, energyLevel);
    const focusScore = getFocusSpecificBonus(activity, focus);

    return typeScore + energyScore + periodScore + durationScore + focusScore;
  }

  function getEnergyFitScore(activityEnergy, userEnergy, period) {
    if (period === 'noite') return activityEnergy === 'low' ? 50 : 0;

    if (activityEnergy === userEnergy) return 45;
    if (userEnergy === 'high' && activityEnergy === 'medium') return 25;
    if (userEnergy === 'medium' && activityEnergy === 'low') return 20;
    if (userEnergy === 'low' && activityEnergy === 'medium') return 15;
    return 0;
  }

  function getPeriodScore(type, period) {
    const periodMap = {
      manha: ['movimento', 'saude', 'mental', 'disciplina'],
      tarde: ['disciplina', 'movimento', 'saude', 'mental', 'pausa'],
      noite: ['sono', 'mental', 'saude', 'pausa']
    };

    const order = periodMap[period] || [];
    const index = order.indexOf(type);

    if (index === -1) return 0;
    return Math.max(0, 25 - index * 5);
  }

  function getDurationScore(duration, energyLevel) {
    const minutes = parseDuration(duration);

    if (energyLevel === 'low') {
      if (minutes <= 5) return 15;
      if (minutes <= 10) return 10;
      return 0;
    }

    if (energyLevel === 'medium') {
      if (minutes <= 10) return 15;
      if (minutes <= 20) return 10;
      return 5;
    }

    if (minutes <= 20) return 15;
    return 8;
  }

  function getFocusSpecificBonus(activity, focus) {
    const focusMap = {
      'relaxamento': ['mental', 'pausa', 'sono'],
      'produtividade': ['disciplina', 'mental'],
      'bem-estar-fisico': ['movimento', 'saude'],
      'sono-melhorado': ['sono', 'saude'],
      'reducao-ansiedade': ['mental', 'pausa', 'sono'],
      'autoconhecimento': ['mental', 'pausa'],
      'energia-vitalidade': ['movimento', 'saude', 'disciplina'],
      'equilibrio-emocional': ['mental', 'saude', 'pausa']
    };

    const allowed = focusMap[focus] || focusMap.relaxamento;
    return allowed.indexOf(activity.type) !== -1 ? 20 : 0;
  }

  function getPriorityTypes(focus) {
    const typeMap = {
      'relaxamento': ['mental', 'pausa', 'saude', 'movimento', 'sono', 'disciplina'],
      'produtividade': ['disciplina', 'mental', 'pausa', 'saude', 'movimento', 'sono'],
      'bem-estar-fisico': ['movimento', 'saude', 'sono', 'mental', 'pausa', 'disciplina'],
      'sono-melhorado': ['sono', 'saude', 'mental', 'movimento', 'pausa', 'disciplina'],
      'reducao-ansiedade': ['mental', 'pausa', 'saude', 'sono', 'movimento', 'disciplina'],
      'autoconhecimento': ['mental', 'pausa', 'saude', 'movimento', 'sono', 'disciplina'],
      'energia-vitalidade': ['movimento', 'saude', 'mental', 'pausa', 'sono', 'disciplina'],
      'equilibrio-emocional': ['mental', 'saude', 'movimento', 'pausa', 'sono', 'disciplina']
    };
    return typeMap[focus] || typeMap.relaxamento;
  }

  function createCardHTML(activity) {
    return (
      '<div class="rotina-card" data-activity-id="' + escapeHtml(activity.id) + '">' +
        '<div class="rotina-card__icon">' +
          '<i class="fas ' + escapeHtml(activity.icon) + '"></i>' +
        '</div>' +
        '<div class="rotina-card__content">' +
          '<h4 class="rotina-card__title">' + escapeHtml(activity.title) + '</h4>' +
          '<span class="rotina-card__duration">' + escapeHtml(activity.duration) + '</span>' +
          '<p class="rotina-card__description">' + escapeHtml(activity.description) + '</p>' +
        '</div>' +
        '<button class="rotina-card__complete-btn" data-activity-id="' + escapeHtml(activity.id) + '" title="Marcar como concluída">' +
          '<i class="fas fa-check"></i>' +
        '</button>' +
      '</div>'
    );
  }

  function generateTips(focus, energyLevel) {
    if (!tipsEl) return;

    const ordered = [];

    const focusTips = tipsByFocus[focus] || tipsByFocus.relaxamento;
    for (let i = 0; i < focusTips.length; i++) ordered.push(focusTips[i]);

    if (energyLevel === 'low') {
      ordered.push('Prefira uma rotina menor e consistente.');
      ordered.push('Respeite os sinais do corpo e reduza a exigência.');
    } else if (energyLevel === 'medium') {
      ordered.push('Intercale tarefas com pausas curtas.');
      ordered.push('Mantenha o ritmo sem tentar acelerar demais.');
    } else {
      ordered.push('Aproveite o bom momento para concluir prioridades.');
      ordered.push('Use sua energia alta nas tarefas mais importantes.');
    }

    ordered.push(generalTips[0], generalTips[3], generalTips[8]);

    const selected = dedupeArray(ordered).slice(0, 3);

    tipsEl.innerHTML = selected.map(function (tip) {
      return (
        '<div class="rotina-tip">' +
          '<i class="fas fa-check-circle"></i>' +
          '<span>' + escapeHtml(tip) + '</span>' +
        '</div>'
      );
    }).join('');
  }

  function parseDuration(duration) {
    const text = normalizeText(duration || '');
    const numbers = text.match(/\d+/g);
    
    if (!numbers || numbers.length === 0) return 0;
    
    // If multiple numbers (like "5 e 7"), return average
    const numArray = numbers.map(Number);
    if (numArray.length > 1) {
      return Math.round(numArray.reduce((a, b) => a + b) / numArray.length);
    }
    
    // Single number
    return numArray[0];
  }

  function normalizeFocus(value) {
    const text = normalizeText(value);
    const map = {
      'relaxamento': 'relaxamento',
      'produtividade': 'produtividade',
      'bem estar fisico': 'bem-estar-fisico',
      'bem-estar-fisico': 'bem-estar-fisico',
      'sono melhorado': 'sono-melhorado',
      'sono-melhorado': 'sono-melhorado',
      'reducao ansiedade': 'reducao-ansiedade',
      'redução ansiedade': 'reducao-ansiedade',
      'redução de ansiedade': 'reducao-ansiedade',
      'reducao-ansiedade': 'reducao-ansiedade',
      'autoconhecimento': 'autoconhecimento',
      'energia vitalidade': 'energia-vitalidade',
      'energia-vitalidade': 'energia-vitalidade',
      'equilibrio emocional': 'equilibrio-emocional',
      'equilíbrio emocional': 'equilibrio-emocional',
      'equilibrio-emocional': 'equilibrio-emocional'
    };

    return map[text] || 'relaxamento';
  }

  function normalizeText(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ');
  }

  function getFirstName(fullName) {
    const cleaned = String(fullName || '').trim();
    if (!cleaned) return 'Visitante';
    return cleaned.split(/\s+/)[0];
  }

  function dedupeArray(arr) {
    const seen = new Set();
    return arr.filter(function (item) {
      const key = normalizeText(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Initialize Dashboard
  function initDashboard() {
    const session = window.Auth?.getSession ? window.Auth.getSession() : null;
    if (session?.uid && typeof window.initDashboard === 'function') {
      window.initDashboard('dashboard-container', session.uid);
    }
  }

  // Setup Activity Completion Tracking
  function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function setupActivityTracking() {
    const today = getLocalDateString();
    const storageKey = 'completedActivities_' + today;

    // Load today's completed activities from localStorage
    const completedToday = JSON.parse(localStorage.getItem(storageKey) || '[]');

    // Mark completed activities in the UI
    completedToday.forEach(function(activityId) {
      markActivityComplete(activityId, false);
    });

    // Add event listeners to complete buttons
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.rotina-card__complete-btn');
      if (!btn) return;

      const card = btn.closest('.rotina-card');
      const activityId = btn.dataset.activityId;

      if (btn.classList.contains('completed')) {
        // Unmark as complete
        btn.classList.remove('completed');
        card?.classList.remove('completed');
        btn.title = 'Marcar como concluída';
        removeCompletedActivity(activityId);
      } else {
        // Mark as complete
        btn.classList.add('completing');
        setTimeout(function() {
          btn.classList.remove('completing');
          btn.classList.add('completed');
          card?.classList.add('completed');
          btn.title = 'Desmarcar';
        }, 300);

        // Save to localStorage
        saveCompletedActivity(activityId);

        // Track in Stats
        const session = window.Auth?.getSession ? window.Auth.getSession() : null;
        if (session?.uid && typeof window.Stats?.recordActivity === 'function') {
          window.Stats.recordActivity(session.uid, activityId);
        }

        // Show toast
        if (window.Toast) {
          window.Toast.success('Atividade concluída! 🎉');
        }
      }
    });
  }

  function markActivityComplete(activityId, animate) {
    const btn = document.querySelector('.rotina-card__complete-btn[data-activity-id="' + activityId + '"]');
    if (!btn) return;

    const card = btn.closest('.rotina-card');
    btn.classList.add('completed');
    card?.classList.add('completed');
    btn.title = 'Desmarcar';
  }

  function saveCompletedActivity(activityId) {
    const today = getLocalDateString();
    const storageKey = 'completedActivities_' + today;
    const completed = JSON.parse(localStorage.getItem(storageKey) || '[]');

    if (!completed.includes(activityId)) {
      completed.push(activityId);
      localStorage.setItem(storageKey, JSON.stringify(completed));
    }
  }

  function removeCompletedActivity(activityId) {
    const today = getLocalDateString();
    const storageKey = 'completedActivities_' + today;
    const completed = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const index = completed.indexOf(activityId);
    if (index > -1) {
      completed.splice(index, 1);
      localStorage.setItem(storageKey, JSON.stringify(completed));
    }
  }

  // New Dashboard Initialization
  document.addEventListener('DOMContentLoaded', async function() {
    // Wait for auth to be ready
    if (window.Auth?.fetchSession) {
      await window.Auth.fetchSession();
    }

    const session = window.Auth?.getSession ? window.Auth.getSession() : null;

    // If not logged in, redirect to landing
    if (!session?.email) {
      window.location.href = './landing.html';
      return;
    }

    // Initialize dashboard
    await initNewDashboard(session);

    // Show onboarding if first login
    if (!localStorage.getItem('alivie_dashboard_seen')) {
      showOnboarding();
      localStorage.setItem('alivie_dashboard_seen', 'true');
    }
  });

  async function initNewDashboard(session) {
    try {
      // Load user data from Firestore
      const userRef = doc(db, 'users', session.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data() || {};

      // Update welcome name
      const nameParts = (userData.name || session.name || session.email).split(' ');
      const welcomeName = document.getElementById('welcome-name');
      if (welcomeName) {
        welcomeName.textContent = `Olá, ${nameParts[0]}!`;
      }

      // Get stats
      const streakDays = userData.streakDays || 0;
      const longestStreak = userData.longestStreak || 0;
      const garden = userData.garden || { stones: 0, flowers: 0, trees: 0, lanterns: 0 };
      const gardenTotal = (garden.stones || 0) + (garden.flowers || 0) + (garden.trees || 0) + (garden.lanterns || 0);

      // Update stats display
      const streakEl = document.getElementById('streak-count');
      if (streakEl) streakEl.textContent = streakDays;

      const gardenEl = document.getElementById('garden-count');
      if (gardenEl) gardenEl.textContent = gardenTotal;

      // Load today's completed tasks
      const today = getLocalDateString();
      const completedToday = JSON.parse(localStorage.getItem(`completedActivities_${today}`) || '[]');

      // Render tasks for each period
      renderTaskPeriod('manha', 'morning-tasks', 'morning-progress', completedToday);
      renderTaskPeriod('tarde', 'afternoon-tasks', 'afternoon-progress', completedToday);
      renderTaskPeriod('noite', 'evening-tasks', 'evening-progress', completedToday);

      // Update "Today" stat
      const totalTasks = 3 + 3 + 3; // 3 per period for now
      const todayEl = document.getElementById('today-count');
      if (todayEl) todayEl.textContent = `${completedToday.length}/${totalTasks}`;

    } catch (error) {
      console.error('Error initializing dashboard:', error);
    }
  }

  function renderTaskPeriod(periodKey, containerId, progressId, completedToday) {
    const container = document.getElementById(containerId);
    const progressEl = document.getElementById(progressId);
    if (!container) return;

    const activities = activitiesDB[periodKey] || [];
    const selected = activities.slice(0, 3); // Show 3 tasks per period

    let completed = 0;
    const html = selected.map(activity => {
      const isCompleted = completedToday.includes(activity.id);
      if (isCompleted) completed++;

      return `
        <div class="task-card ${isCompleted ? 'completed' : ''}" data-activity-id="${activity.id}">
          <div class="task-icon">
            <i class="fas ${activity.icon}"></i>
          </div>
          <div class="task-content">
            <h3 class="task-title">${activity.title}</h3>
            <span class="task-duration">${activity.duration}</span>
            <p class="task-description">${activity.description}</p>
          </div>
          <button class="task-complete-btn ${isCompleted ? 'completed' : ''}" data-activity-id="${activity.id}" title="${isCompleted ? 'Desmarcar' : 'Marcar como concluída'}">
            <i class="fas fa-check"></i>
          </button>
        </div>
      `;
    }).join('');

    container.innerHTML = html;

    // Update progress
    if (progressEl) {
      progressEl.textContent = `${completed}/${selected.length}`;
    }

    // Add event listeners
    container.querySelectorAll('.task-complete-btn').forEach(btn => {
      btn.addEventListener('click', handleTaskComplete);
    });
  }

  function handleTaskComplete(e) {
    const btn = e.currentTarget;
    const activityId = btn.dataset.activityId;
    const card = btn.closest('.task-card');
    const today = getLocalDateString();
    const storageKey = `completedActivities_${today}`;
    const completed = JSON.parse(localStorage.getItem(storageKey) || '[]');

    if (btn.classList.contains('completed')) {
      // Unmark
      btn.classList.remove('completed');
      card?.classList.remove('completed');
      const index = completed.indexOf(activityId);
      if (index > -1) completed.splice(index, 1);
    } else {
      // Mark as complete
      btn.classList.add('completed');
      card?.classList.add('completed');
      if (!completed.includes(activityId)) completed.push(activityId);
      
      if (window.Toast) {
        window.Toast.success('Atividade concluída! 🎉');
      }
    }

    localStorage.setItem(storageKey, JSON.stringify(completed));

    // Update today count
    const totalTasks = 9; // 3 per period
    const todayEl = document.getElementById('today-count');
    if (todayEl) todayEl.textContent = `${completed.length}/${totalTasks}`;
  }

  function showOnboarding() {
    const modal = document.getElementById('onboarding-modal');
    if (modal) {
      modal.style.display = 'flex';
      
      const closeBtn = document.getElementById('close-onboarding');
      const closeActionBtn = document.getElementById('close-onboarding-btn');

      const close = () => {
        modal.style.display = 'none';
      };

      if (closeBtn) closeBtn.addEventListener('click', close);
      if (closeActionBtn) closeActionBtn.addEventListener('click', close);
    }
  }
})();
