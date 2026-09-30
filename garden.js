/**
 * Garden Visualization
 * Renderiza o jardim zen com elementos acumulados
 */

import { getGarden, getStreak, getHistory, appReady } from "./app.js";

// DOM Elements
function getElements() {
  return {
    streakBanner: document.getElementById('streak-banner'),
    streakCount: document.getElementById('streak-count'),
    streakLongest: document.getElementById('streak-longest'),
    
    gardenSandbox: document.getElementById('garden-sandbox'),
    
    statStones: document.getElementById('stat-stones'),
    statFlowers: document.getElementById('stat-flowers'),
    statTrees: document.getElementById('stat-trees'),
    statLanterns: document.getElementById('stat-lanterns'),
    
    streakCalendar: document.getElementById('streak-calendar'),
    historyList: document.getElementById('history-list')
  };
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  const els = getElements();
  if (!els.gardenSandbox) return; // Not on garden page
  
  await appReady;
  renderGarden();
  renderStreak();
  renderCalendar();
  renderHistory();
});

function renderGarden() {
  const garden = getGarden();
  const els = getElements();
  
  // Update stats - Proteção contra nulos
  if (els.statStones) els.statStones.textContent = garden.stones;
  if (els.statFlowers) els.statFlowers.textContent = garden.flowers;
  if (els.statTrees) els.statTrees.textContent = garden.trees;
  if (els.statLanterns) els.statLanterns.textContent = garden.lanterns;
  
  // Generate garden scene
  if (garden.stones === 0 && garden.flowers === 0 && garden.trees === 0 && garden.lanterns === 0) {
    // Empty state
    els.gardenSandbox.classList.remove('has-elements');
    els.gardenSandbox.innerHTML = `
      <div class="garden-empty">
        <p>Seu jardim está começando...</p>
        <p class="garden-hint">Complete uma prática para adicionar seu primeiro elemento</p>
        <a href="./pratica.html" class="btn btn-primary">Começar agora</a>
      </div>
    `;
    return;
  }
  
  // Build garden elements
  let elementsHTML = '';
  
  // Stones (random positions)
  for (let i = 0; i < garden.stones && i < 30; i++) {
    const x = 10 + (i * 3) % 80;
    const y = 20 + Math.floor(i / 10) * 15;
    const size = 20 + (i % 3) * 10;
    const color = ['#8B7355', '#A0826D', '#6B5B45'][i % 3];
    
    elementsHTML += `
      <div class="garden-stone" style="
        left: ${x}%;
        top: ${y}%;
        width: ${size}px;
        height: ${size * 0.8}px;
        background: ${color};
        animation-delay: ${i * 0.1}s;
      "></div>
    `;
  }
  
  // Flowers (limited to keep it clean)
  const flowerCount = Math.min(garden.flowers, 10);
  for (let i = 0; i < flowerCount; i++) {
    const x = 20 + (i * 7) % 70;
    const y = 30 + (i % 3) * 20;
    const colors = ['#FF6B9D', '#C44569', '#F8B500', '#4ECDC4'];
    const color = colors[i % colors.length];
    
    elementsHTML += `
      <div class="garden-flower" style="
        left: ${x}%;
        top: ${y}%;
        --flower-color: ${color};
        animation-delay: ${i * 0.2}s;
      ">
        <div class="flower-petals"></div>
        <div class="flower-center"></div>
        <div class="flower-stem"></div>
      </div>
    `;
  }
  
  // Trees (limited)
  const treeCount = Math.min(garden.trees, 5);
  for (let i = 0; i < treeCount; i++) {
    const x = 15 + i * 18;
    const y = 10;
    
    elementsHTML += `
      <div class="garden-tree" style="
        left: ${x}%;
        top: ${y}%;
        animation-delay: ${i * 0.3}s;
      ">
        <div class="tree-foliage"></div>
        <div class="tree-trunk"></div>
      </div>
    `;
  }
  
  // Lanterns (special elements)
  const lanternCount = Math.min(garden.lanterns, 3);
  for (let i = 0; i < lanternCount; i++) {
    const x = 80 - i * 15;
    const y = 50 + i * 10;
    
    elementsHTML += `
      <div class="garden-lantern" style="
        left: ${x}%;
        top: ${y}%;
        animation-delay: ${i * 0.4}s;
      ">
        <div class="lantern-light"></div>
        <div class="lantern-body"></div>
      </div>
    `;
  }
  
  // Add ground/sand base
  elementsHTML = `
    <div class="garden-ground"></div>
    <div class="garden-rake-pattern"></div>
    ${elementsHTML}
  `;
  
  els.gardenSandbox.innerHTML = elementsHTML;
  els.gardenSandbox.classList.add('has-elements');
}

function renderStreak() {
  const streak = getStreak();
  const els = getElements();
  
  if (!els.streakCount || !els.streakLongest || !els.streakBanner) return;
  
  els.streakCount.textContent = streak.days;
  els.streakLongest.textContent = `Recorde: ${streak.longest}`;
  
  // Animate if active
  if (streak.days > 0) {
    els.streakBanner.classList.add('active');
  } else {
    els.streakBanner.classList.remove('active');
  }
}

function renderCalendar() {
  const history = getHistory();
  const els = getElements();
  
  if (!els.streakCalendar) return;
  
  function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Get last 30 days
  const days = [];
  const today = new Date();
  
  const historyByDate = history.reduce((map, item) => {
    if (item && item.date) {
      map[item.date] = item;
    }
    return map;
  }, {});

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = getLocalDateString(date);
    const practice = historyByDate[dateStr];
    
    days.push({
      date,
      dateStr,
      category: practice?.category || null
    });
  }
  
  // Build calendar HTML
  const categoryColors = {
    calm: '#4A90E2',
    rest: '#7B68EE',
    energy: '#F5A623',
    focus: '#50C878'
  };
  
  els.streakCalendar.innerHTML = days.map(day => {
    const color = day.category ? categoryColors[day.category] : '#e0e0e0';
    const hasPractice = day.category !== null;
    const isToday = day.dateStr === getLocalDateString(today);
    
    return `
      <div class="calendar-day ${hasPractice ? 'has-practice' : ''} ${isToday ? 'today' : ''}"
           style="--day-color: ${color}"
           title="${day.date.toLocaleDateString('pt-BR')}${hasPractice ? ' ✓' : ''}">
        ${day.date.getDate()}
      </div>
    `;
  }).join('');
}

function renderHistory() {
  const history = getHistory();
  const els = getElements();
  
  if (!els.historyList) return;
  
  if (history.length === 0) {
    els.historyList.innerHTML = `
      <div class="history-empty">
        <p>Nenhuma prática ainda</p>
        <a href="./pratica.html" class="btn btn-primary">Começar</a>
      </div>
    `;
    return;
  }
  
  // Show last 5 practices
  const recent = [...history].reverse().slice(0, 5);
  
  const categoryEmojis = {
    calm: '🌊',
    rest: '💤',
    energy: '⚡',
    focus: '🎯'
  };
  
  els.historyList.innerHTML = recent.map(h => {
    // CORREÇÃO AQUI: Troca hífens por barras para evitar bug de Timezone UTC
    const date = new Date(h.date.replace(/-/g, '\/')); 
    const dateStr = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    const moodEmojis = { terrible: '😢', bad: '😕', okay: '😐', good: '🙂', great: '😄' };
    const mood = moodEmojis[h.mood] || '😐';
    
    return `
      <div class="history-item">
        <div class="history-icon">${categoryEmojis[h.category] || '🌸'}</div>
        <div class="history-info">
          <h4>${h.practiceName}</h4>
          <span class="history-date">${dateStr}</span>
          ${h.note ? `<p class="history-note">"${h.note}"</p>` : ''}
        </div>
        <div class="history-mood">${mood}</div>
      </div>
    `;
  }).join('');
}

// Make available globally
window.renderGarden = renderGarden;
