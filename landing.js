import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// If user is already logged in, redirect to dashboard
document.addEventListener('DOMContentLoaded', () => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user?.email) {
      // User is logged in, redirect to tasks dashboard
      window.location.href = './minha-rotina.html';
    }
    unsubscribe();
  });

  // Render header nav for non-logged users
  const navAuth = document.getElementById('nav-auth');
  if (navAuth) {
    const wrap = document.createElement('div');
    wrap.className = 'nav-auth-guest';
    
    const aSignup = document.createElement('a');
    aSignup.href = 'signup.html';
    aSignup.className = 'btn btn-ghost';
    aSignup.textContent = 'Criar conta';
    
    const aLogin = document.createElement('a');
    aLogin.href = 'login.html';
    aLogin.className = 'btn btn-primary';
    aLogin.textContent = 'Entrar';
    
    wrap.appendChild(aSignup);
    wrap.appendChild(aLogin);
    navAuth.appendChild(wrap);
  }
});
