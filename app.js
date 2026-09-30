/**
 * Alivie App - Core Application
 * Gerencia estado, navegação e inicialização
 */

import { db } from "./firebase.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// App State
const App = {
  user: null,
  currentPractice: null,
  garden: {
    stones: 0,
    flowers: 0,
    trees: 0,
    lanterns: 0
  },
  streak: {
    days: 0,
    longest: 0,
    lastPractice: null
  },
  history: []
};

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initialize App
export const appReady = new Promise((resolve) => {
  const init = async () => {
    await initApp();
    resolve();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
});

async function initApp() {
  // Wait for auth
  if (window.Auth?.fetchSession) {
    await window.Auth.fetchSession();
  }
  
  const session = window.Auth?.getSession ? window.Auth.getSession() : null;
  
  // If user is logged in and on index page, redirect to dashboard
  if (session?.uid && (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('Alivie/'))) {
    window.location.href = './minha-rotina.html';
    return;
  }
  
  if (session?.uid) {
    App.user = {
      uid: session.uid,
      email: session.email,
      name: session.displayName || session.email.split('@')[0]
    };
    
    // Load user data
    await loadUserData(session.uid);
  } else {
    // Guest mode - use localStorage
    loadGuestData();
  }
  
  // Update UI based on auth state
  updateAuthUI();
  
  // Check if we're on landing and should redirect
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    updateLandingButtons();
  }
}

async function loadUserData(uid) {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      App.garden = data.garden || { stones: 0, flowers: 0, trees: 0, lanterns: 0 };
      App.streak = {
        days: data.streakDays || 0,
        longest: data.longestStreak || 0,
        lastPractice: data.lastPracticeDate || data.streak?.lastPractice || null
      };
      App.history = data.history || [];
    } else {
      // Initialize new user
      await setDoc(docRef, {
        name: App.user.name,
        createdAt: new Date().toISOString(),
        garden: { stones: 0, flowers: 0, trees: 0, lanterns: 0 },
        streakDays: 0,
        longestStreak: 0,
        lastPracticeDate: null,
        history: []
      });
    }
  } catch (error) {
    console.error("Error loading user data:", error);
    // Fall back to localStorage
    loadGuestData();
  }
}

function loadGuestData() {
  const saved = localStorage.getItem('alivie_guest');
  if (!saved) return;

  try {
    const data = JSON.parse(saved);
    App.garden = data.garden || { stones: 0, flowers: 0, trees: 0, lanterns: 0 };
    App.streak = data.streak || { days: 0, longest: 0, lastPractice: null };
    App.history = data.history || [];
  } catch (error) {
    console.warn('Guest data corrupt, resetting state:', error);
    localStorage.removeItem('alivie_guest');
  }
}

function saveGuestData() {
  const data = {
    garden: App.garden,
    streak: App.streak,
    history: App.history.slice(-30) // Keep last 30
  };
  localStorage.setItem('alivie_guest', JSON.stringify(data));
}

function updateAuthUI() {
  const navAuth = document.getElementById('nav-auth');
  if (!navAuth) return;
  
  if (App.user) {
    navAuth.innerHTML = `
      <span class="user-name">${App.user.name}</span>
      <a href="./perfil.html" class="btn btn-ghost btn-small">Perfil</a>
    `;
  } else {
    navAuth.innerHTML = `
      <a href="./login.html" class="btn btn-ghost btn-small">Entrar</a>
      <a href="./signup.html" class="btn btn-primary btn-small">Criar conta</a>
    `;
  }
}

function updateLandingButtons() {
  const btnStart = document.getElementById('btn-start');
  const btnGarden = document.getElementById('btn-garden');
  
  // If user has history, show "Continuar"
  if (App.history.length > 0 && btnStart) {
    btnStart.innerHTML = `<i class="fas fa-play"></i> Continuar`;
  }
  
  // If garden is empty, disable garden button
  if (App.garden.stones === 0 && btnGarden) {
    btnGarden.style.opacity = '0.5';
    btnGarden.style.pointerEvents = 'none';
    btnGarden.title = "Complete uma prática primeiro";
  }
}

// Record completed practice
export async function recordPractice(practice, mood, note) {
  const today = getLocalDateString();
  
  // Update garden
  App.garden.stones++;
  
  // Check for milestones
  if (App.garden.stones > 0 && App.garden.stones % 7 === 0) {
    App.garden.flowers++;
  }
  if (App.garden.stones > 0 && App.garden.stones % 30 === 0) {
    App.garden.trees++;
  }
  if (App.garden.stones > 0 && App.garden.stones % 50 === 0) {
    App.garden.lanterns++;
  }
  
  // Update streak
  const lastDate = App.streak.lastPractice;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);
  
  if (lastDate === today) {
    // Already practiced today, no streak change
  } else if (lastDate === yesterdayStr) {
    // Continued streak
    App.streak.days++;
    if (App.streak.days > App.streak.longest) {
      App.streak.longest = App.streak.days;
    }
  } else {
    // New streak
    App.streak.days = 1;
  }
  
  App.streak.lastPractice = today;
  
  // Add to history
  App.history.push({
    date: today,
    practiceId: practice.id,
    practiceName: practice.name,
    category: practice.category,
    duration: practice.duration,
    mood: mood,
    note: note,
    timestamp: new Date().toISOString()
  });
  
  // Save
  if (App.user?.uid) {
    try {
      const docRef = doc(db, "users", App.user.uid);
      await updateDoc(docRef, {
        garden: App.garden,
        streakDays: App.streak.days,
        longestStreak: App.streak.longest,
        lastPracticeDate: today,
        history: App.history.slice(-30)
      });
    } catch (error) {
      console.error("Error saving practice:", error);
      saveGuestData();
    }
  } else {
    saveGuestData();
  }
  
  return {
    newStone: true,
    newFlower: App.garden.stones > 0 && App.garden.stones % 7 === 0,
    newTree: App.garden.stones > 0 && App.garden.stones % 30 === 0,
    newLantern: App.garden.stones > 0 && App.garden.stones % 50 === 0,
    streak: App.streak.days
  };
}

// Getters
export function getAppState() {
  return { ...App };
}

export function getGarden() {
  return { ...App.garden };
}

export function getStreak() {
  return { ...App.streak };
}

export function getHistory() {
  return [...App.history];
}

export function getUser() {
  return App.user ? { ...App.user } : null;
}

// Make available globally for debugging
window.AlivieApp = App;
window.recordPractice = recordPractice;
