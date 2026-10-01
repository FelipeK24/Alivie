import { db } from "./firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Simplified Profile - Only name and theme
document.addEventListener('DOMContentLoaded', async () => {
  const displayNameInput = document.getElementById('display-name');
  const profileNameSpan = document.getElementById('profile-name');
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleLabel = document.getElementById('theme-toggle-label');
  const saveButton = document.getElementById('btn-save');
  const logoutButton = document.getElementById('btn-logout');
  
  // Name sync
  const updateProfileName = () => {
    if (!displayNameInput || !profileNameSpan) return;
    const name = displayNameInput.value.trim();
    profileNameSpan.textContent = name || 'Olá!';
  };
  
  if (displayNameInput) {
    displayNameInput.addEventListener('input', updateProfileName);
  }

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    const session = window.Auth?.getSession ? window.Auth.getSession() : null;
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem(session?.uid ? `alivie_theme_${session.uid}` : 'alivie_theme_guest', theme);
    themeToggle?.setAttribute('aria-pressed', String(isDark));
    if (themeToggleLabel) {
      themeToggleLabel.textContent = isDark ? 'Usar tema claro' : 'Ativar tema escuro';
    }
    const icon = themeToggle?.querySelector('i');
    if (icon) {
      icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
  };

  if (window.Auth?.fetchSession) {
    await window.Auth.fetchSession();
  }
  const currentSession = window.Auth?.getSession ? window.Auth.getSession() : null;
  if (logoutButton && !currentSession?.uid) logoutButton.hidden = true;
  if (currentSession?.uid) localStorage.setItem('alivie_active_uid', currentSession.uid);
  
  // Load user data
  const loadUserData = async () => {
    const session = window.Auth?.getSession ? window.Auth.getSession() : null;
    if (!session?.uid) {
      // Load from localStorage for guests
      const saved = localStorage.getItem('alivie_profile_guest');
      if (saved) {
        const data = JSON.parse(saved);
        if (displayNameInput && data.name) displayNameInput.value = data.name;
      }
      return;
    }
    
    try {
      const docRef = doc(db, "users", session.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (displayNameInput && data.name) displayNameInput.value = data.name;
        const savedTheme = localStorage.getItem(`alivie_theme_${session.uid}`) || data.theme || 'light';
        applyTheme(savedTheme === 'dark');
      } else {
        applyTheme(localStorage.getItem(`alivie_theme_${session.uid}`) === 'dark');
      }
    } catch (err) {
      console.error('Error loading user:', err);
    }

    if (!session?.uid) applyTheme(localStorage.getItem('alivie_theme_guest') === 'dark');
    updateProfileName();
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', async () => {
      const isDark = themeToggle.getAttribute('aria-pressed') !== 'true';
      applyTheme(isDark);
      const session = window.Auth?.getSession ? window.Auth.getSession() : null;
      if (session?.uid) {
        try {
          await setDoc(doc(db, 'users', session.uid), { theme: isDark ? 'dark' : 'light' }, { merge: true });
        } catch (err) {
          console.error('Error saving theme:', err);
        }
      }
    });
  }
  
  // Save
  if (saveButton) {
    saveButton.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const name = displayNameInput?.value.trim() || '';
      const session = window.Auth?.getSession ? window.Auth.getSession() : null;
      if (name) localStorage.setItem(session?.uid ? `alivie_profile_${session.uid}` : 'alivie_profile_guest', JSON.stringify({ name }));
      if (session?.uid) {
        try {
          const docRef = doc(db, "users", session.uid);
          await setDoc(docRef, { name }, { merge: true });
        } catch (err) {
          console.error('Error saving:', err);
        }
      }
      
      if (window.Auth?.renderHeader) {
        const navAuth = document.getElementById('nav-auth');
        if (navAuth) window.Auth.renderHeader(navAuth);
        const mobileNavAuth = document.getElementById('mobile-nav-auth');
        if (mobileNavAuth && window.Auth?.renderMobileAuth) window.Auth.renderMobileAuth();
      }
      
      showNotification('Salvo com sucesso!', 'success');
    });
  }
  
  // Logout
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      if (window.Auth?.logout) {
        await window.Auth.logout();
        window.location.href = './landing.html';
      }
    });
  }
  
  // Initialize
  loadUserData();
  updateProfileName();
});

// Notification
const showNotification = (message, type = 'info') => {
  if (window.Toast) {
    window.Toast.show({ message, type });
    return;
  }
  
  const notification = document.createElement('div');
  notification.textContent = message;
  Object.assign(notification.style, {
    position: 'fixed', top: '20px', right: '20px', padding: '1rem 1.5rem',
    borderRadius: '8px', color: 'white', fontWeight: '600', zIndex: '9999',
    transform: 'translateX(100%)', transition: 'transform 0.3s ease',
    background: type === 'success' ? '#48bb78' : type === 'error' ? '#e53e3e' : '#2c5282'
  });
  
  document.body.appendChild(notification);
  requestAnimationFrame(() => notification.style.transform = 'translateX(0)');
  
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};
