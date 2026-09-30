import { db } from "./firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Simplified Profile - Only name and theme
document.addEventListener('DOMContentLoaded', async () => {
  if (window.Auth?.fetchSession) {
    await window.Auth.fetchSession();
  }

  const displayNameInput = document.getElementById('display-name');
  const profileNameSpan = document.getElementById('profile-name');
  const themeToggle = document.getElementById('theme-toggle');
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
  
  // Load user data
  const loadUserData = async () => {
    const session = window.Auth?.getSession ? window.Auth.getSession() : null;
    if (!session?.uid) {
      // Load from localStorage for guests
      const saved = localStorage.getItem('alivie_profile');
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
      }
    } catch (err) {
      console.error('Error loading user:', err);
    }

    updateProfileName();
  };
  
  // Save
  if (saveButton) {
    saveButton.addEventListener('click', async (e) => {
      e.preventDefault();
      
      const name = displayNameInput?.value.trim() || '';
      const theme = themeToggle?.checked ? 'dark' : 'light';
      
      // Save theme locally
      localStorage.setItem('theme', theme);
      if (name) localStorage.setItem('alivie_profile', JSON.stringify({ name }));
      
      const session = window.Auth?.getSession ? window.Auth.getSession() : null;
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
    logoutButton.addEventListener('click', () => {
      if (window.Auth?.logout) {
        window.Auth.logout();
      }
    });
  }
  
  // Theme toggle
  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      themeToggle.checked = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    themeToggle.addEventListener('change', () => {
      if (themeToggle.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
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
