/**
 * Practice Player
 * Gerencia o fluxo: Vibe Picker → Practice Selection → Timer → Check-in
 */

import { getPracticesByCategory, getRandomPractice, getPracticeById, CATEGORIES } from "./practices.js";
import { recordPractice, appReady } from "./app.js";

// State
let currentPractice = null;
let currentStep = 0;
let timerInterval = null;
let isPaused = false;
let remainingTime = 0;
let totalTime = 0;

// DOM Elements (lazy loaded)
function getElements() {
  return {
    vibePicker: document.getElementById('vibe-picker'),
    practiceSelection: document.getElementById('practice-selection'),
    practicePlayer: document.getElementById('practice-player'),
    practiceCheckin: document.getElementById('practice-checkin'),
    
    vibeButtons: document.querySelectorAll('.vibe-btn'),
    btnSurprise: document.getElementById('btn-surprise'),
    btnBackVibe: document.getElementById('btn-back-vibe'),
    btnBackPractice: document.getElementById('btn-back-practice'),
    
    practiceList: document.getElementById('practice-list'),
    practiceVibeTitle: document.getElementById('practice-vibe-title'),
    
    timerDisplay: document.getElementById('timer-display'),
    timerStep: document.getElementById('timer-step'),
    timerCircle: document.getElementById('timer-circle'),
    stepText: document.getElementById('step-text'),
    stepCard: document.getElementById('step-card'),
    stepDots: document.getElementById('step-dots'),
    
    btnPause: document.getElementById('btn-pause'),
    btnStop: document.getElementById('btn-stop'),
    btnSound: document.getElementById('btn-sound'),
    
    moodButtons: document.querySelectorAll('.mood-btn'),
    practiceNote: document.getElementById('practice-note'),
    btnComplete: document.getElementById('btn-complete')
  };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  const els = getElements();
  if (!els.vibePicker) return; // Not on practice page
  
  initEventListeners();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  stopPractice();
});

function initEventListeners() {
  const els = getElements();
  
  // Vibe buttons
  els.vibeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const vibe = btn.dataset.vibe;
      showPracticeSelection(vibe);
    });
  });
  
  // Surprise button
  els.btnSurprise?.addEventListener('click', () => {
    const vibes = ['calm', 'rest', 'energy', 'focus'];
    const randomVibe = vibes[Math.floor(Math.random() * vibes.length)];
    showPracticeSelection(randomVibe);
  });
  
  // Back buttons
  els.btnBackVibe?.addEventListener('click', showVibePicker);
  els.btnBackPractice?.addEventListener('click', () => {
    stopPractice();
    if (currentPractice) {
      showPracticeSelection(currentPractice.category);
    } else {
      showVibePicker();
    }
  });
  
  // Player controls
  els.btnPause?.addEventListener('click', togglePause);
  els.btnStop?.addEventListener('click', () => {
    if (confirm('Deseja realmente parar? O progresso será perdido.')) {
      stopPractice();
      showVibePicker();
    }
  });
  els.btnSound?.addEventListener('click', toggleSound);
  
  // Mood selection
  els.moodButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      els.moodButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });
  
  // Complete practice
  els.btnComplete?.addEventListener('click', completePractice);
}

// Navigation
function showVibePicker() {
  const els = getElements();
  hideAll();
  els.vibePicker.hidden = false;
  document.body.className = 'practice-page';
}

function showPracticeSelection(vibe) {
  const els = getElements();
  const practices = getPracticesByCategory(vibe);
  const category = CATEGORIES[vibe];
  
  els.practiceVibeTitle.textContent = `Práticas para se sentir ${category.name.toLowerCase()}`;
  
  els.practiceList.innerHTML = practices.map(p => `
    <div class="practice-card" data-practice-id="${p.id}">
      <div class="practice-card__icon">${p.icon}</div>
      <div class="practice-card__content">
        <h3 class="practice-card__title">${p.name}</h3>
        <p class="practice-card__desc">${p.description}</p>
        <div class="practice-card__meta">
          <span class="practice-card__duration">${Math.floor(p.duration / 60)} min</span>
          <span class="practice-card__effect">${p.effect}</span>
        </div>
      </div>
      <button class="btn btn-primary practice-card__btn">
        <i class="fas fa-play"></i>
      </button>
    </div>
  `).join('');
  
  // Add click handlers
  els.practiceList.querySelectorAll('.practice-card').forEach(card => {
    card.addEventListener('click', () => {
      const practiceId = card.dataset.practiceId;
      startPractice(practiceId);
    });
  });
  
  hideAll();
  els.practiceSelection.hidden = false;
  document.body.className = 'practice-page selection';
}

function startPractice(practiceId) {
  const practice = getPracticeById(practiceId);
  if (!practice || !practice.steps?.length) return;
  
  currentPractice = practice;
  currentStep = 0;
  isPaused = false;
  
  const els = getElements();
  
  // Setup timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  totalTime = practice.steps.reduce((acc, step) => acc + step.duration, 0);
  remainingTime = totalTime;
  
  // Setup step dots
  els.stepDots.innerHTML = practice.steps.map((_, i) => 
    `<span class="step-dot ${i === 0 ? 'active' : ''}"></span>`
  ).join('');
  
  // Start first step
  showStep(0);
  
  hideAll();
  els.practicePlayer.hidden = false;
  document.body.className = 'practice-page playing';
  
  // Start timer
  startTimer();
}

function showStep(index) {
  const els = getElements();
  if (!currentPractice || !currentPractice.steps[index]) return;
  
  const step = currentPractice.steps[index];
  
  els.stepText.textContent = step.text;
  els.timerStep.textContent = `Passo ${index + 1} de ${currentPractice.steps.length}`;
  
  // Update dots
  els.stepDots.querySelectorAll('.step-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === index);
    dot.classList.toggle('completed', i < index);
  });
  
  // Animate card
  els.stepCard.classList.remove('fade-in');
  void els.stepCard.offsetWidth; // Trigger reflow
  els.stepCard.classList.add('fade-in');
}

function startTimer() {
  const els = getElements();
  
  // Ensure any existing interval is cleared
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  timerInterval = setInterval(() => {
    if (!currentPractice || isPaused) return;
    
    remainingTime--;

    if (remainingTime <= 0) {
      remainingTime = 0;
      els.timerDisplay.textContent = '0:00';
      const circumference = 2 * Math.PI * 45;
      els.timerCircle.style.strokeDashoffset = circumference;
      finishPractice();
      return;
    }

    // Update display
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    els.timerDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Update progress circle
    const progress = remainingTime / totalTime;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference * (1 - progress);
    els.timerCircle.style.strokeDashoffset = offset;
    
    // Check step transitions
    if (!currentPractice) return;
    let accumulatedTime = 0;
    for (let i = 0; i < currentPractice.steps.length; i++) {
      accumulatedTime += currentPractice.steps[i].duration;
      if (remainingTime <= totalTime - accumulatedTime && currentStep < i) {
        currentStep = i;
        showStep(currentStep);
      }
    }
  }, 1000);
}

function togglePause() {
  const els = getElements();
  isPaused = !isPaused;
  
  els.btnPause.innerHTML = isPaused 
    ? '<i class="fas fa-play"></i>' 
    : '<i class="fas fa-pause"></i>';
  els.btnPause.title = isPaused ? "Continuar" : "Pausar";
  
  if (isPaused) {
    els.stepText.textContent = "Pausado...";
  } else {
    showStep(currentStep);
  }
}

function stopPractice() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  currentPractice = null;
  currentStep = 0;
  isPaused = false;
  remainingTime = 0;
  totalTime = 0;
}

function finishPractice() {
  stopPractice();
  
  const els = getElements();
  hideAll();
  if (els.practiceCheckin) {
    els.practiceCheckin.hidden = false;
  }
  document.body.className = 'practice-page checkin';
}

function toggleSound() {
  const els = getElements();
  els.btnSound.classList.toggle('muted');
  els.btnSound.innerHTML = els.btnSound.classList.contains('muted')
    ? '<i class="fas fa-volume-mute"></i>'
    : '<i class="fas fa-volume-up"></i>';
  // TODO: Implement actual audio
}

async function completePractice() {
  await appReady;
  const els = getElements();
  
  if (!currentPractice) {
    window.location.href = './jardim.html';
    return;
  }
  
  // Get selected mood
  const selectedMood = document.querySelector('.mood-btn.selected')?.dataset.mood || 'okay';
  const note = els.practiceNote?.value || '';
  
  // Record
  const result = await recordPractice(currentPractice, selectedMood, note);
  
  // Show celebration
  showCelebration(result);
  
  // Redirect to garden after delay
  setTimeout(() => {
    window.location.href = './jardim.html';
  }, 3000);
}

function showCelebration(result) {
  // Create celebration overlay
  const overlay = document.createElement('div');
  overlay.className = 'celebration-overlay';
  
  let message = '🎉 Momento completo!';
  let details = [`🪨 +1 pedra no jardim`];
  
  if (result.newFlower) {
    details.push('🌸 Nova flor desabrochou!');
  }
  if (result.newTree) {
    details.push('🌳 Nova árvore cresceu!');
  }
  if (result.newLantern) {
    details.push('🏮 Uma lanterna iluminou seu jardim!');
  }
  if (result.streak > 1) {
    details.push(`🔥 ${result.streak} dias seguidos!`);
  }
  
  overlay.innerHTML = `
    <div class="celebration-content">
      <h2>${message}</h2>
      ${details.map(d => `<p class="celebration-detail">${d}</p>`).join('')}
      <p class="celebration-hint">Redirecionando para seu jardim...</p>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Add confetti effect (CSS animation)
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.backgroundColor = ['#4A90E2', '#7B68EE', '#F5A623', '#50C878'][Math.floor(Math.random() * 4)];
    overlay.appendChild(confetti);
  }
}

function hideAll() {
  const els = getElements();
  if (els.vibePicker) els.vibePicker.hidden = true;
  if (els.practiceSelection) els.practiceSelection.hidden = true;
  if (els.practicePlayer) els.practicePlayer.hidden = true;
  if (els.practiceCheckin) els.practiceCheckin.hidden = true;
}
