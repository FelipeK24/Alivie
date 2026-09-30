import { auth, db } from "./firebase.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let sessionCache = null;
let sessionPromise = null;

function getLocalProfileName() {
  try {
    const saved = localStorage.getItem('alivie_profile');
    if (!saved) return null;
    const data = JSON.parse(saved);
    return data?.name ? String(data.name).trim() : null;
  } catch (err) {
    return null;
  }
}

async function getStoredProfileName(uid) {
  const localName = getLocalProfileName();
  if (localName) return localName;

  if (!uid) return null;
  try {
    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    );
    
    const docRef = doc(db, 'users', uid);
    const docPromise = getDoc(docRef);
    const docSnap = await Promise.race([docPromise, timeoutPromise]);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data?.name ? String(data.name).trim() : null;
    }
  } catch (err) {
    console.warn('Could not load profile name from Firestore:', err.message);
  }
  return null;
}

async function fetchSession() {
  if (sessionPromise) {
    return sessionPromise;
  }
  sessionPromise = (async () => {
    try {
      const user = await new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe();
          resolve(user);
        }, (error) => {
          unsubscribe();
          reject(error);
        });
      });

      if (user?.email) {
        const fallbackName = user.displayName || user.email.split('@')[0];
        sessionCache = {
          email: user.email,
          uid: user.uid,
          name: fallbackName
        };
        try {
          const profileName = await getStoredProfileName(user.uid);
          if (profileName) {
            sessionCache.name = profileName;
          }
        } catch (err) {
          console.warn('Could not load profile name, using fallback:', err);
          // Continue with fallback name
        }
      } else {
        sessionCache = null;
      }

      return sessionCache;
    } catch (error) {
      console.error('Auth state error:', error);
      sessionCache = null;
      return null;
    }
  })();
  return sessionPromise;
}

function getSession() {
  return sessionCache;
}

async function logout() {
  try {
    await signOut(auth);
    sessionCache = null;
    sessionPromise = null;
    if (window.Toast) {
      window.Toast.success('Você saiu da sua conta.');
    }
  } catch (error) {
    console.error('Logout error:', error);
    // Still clear session even if logout fails
    sessionCache = null;
    sessionPromise = null;
    if (window.Toast) {
      window.Toast.error('Erro ao sair. Por favor, recarregue a página.');
    }
  }
}

function renderHeader(container) {
  if (!container) return;
  const session = getSession();
  container.innerHTML = "";
  if (session?.email) {
    const displayName = getLocalProfileName() || session.name || session.email;
    const wrap = document.createElement("div");
    wrap.className = "nav-auth-logged";
    const span = document.createElement("span");
    span.className = "nav-user-email";
    span.textContent = displayName;
    span.setAttribute("title", "Logado como " + displayName);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-ghost";
    btn.textContent = "Sair";
    btn.addEventListener("click", async () => {
      await logout();
      window.location.reload();
    });
    wrap.appendChild(span);
    wrap.appendChild(btn);
    container.appendChild(wrap);
  } else {
    const guestWrap = document.createElement("div");
    guestWrap.className = "nav-auth-guest";
    const aSignup = document.createElement("a");
    aSignup.href = "signup.html";
    aSignup.className = "btn btn-ghost";
    aSignup.textContent = "Criar conta";
    const aLogin = document.createElement("a");
    aLogin.href = "login.html";
    aLogin.className = "btn btn-primary";
    aLogin.textContent = "Entrar";
    guestWrap.appendChild(aSignup);
    guestWrap.appendChild(aLogin);
    container.appendChild(guestWrap);
  }
}

function renderMobileAuth() {
  const container = document.getElementById("mobile-nav-auth");
  if (!container) return;
  const session = getSession();
  container.innerHTML = "";
  if (session?.email) {
    const displayName = getLocalProfileName() || session.name || session.email;
    const wrap = document.createElement("div");
    wrap.className = "nav-auth-logged";
    wrap.style.flexDirection = "column";
    wrap.style.alignItems = "flex-start";
    wrap.style.gap = "0.5rem";
    
    const span = document.createElement("span");
    span.className = "nav-user-email";
    span.textContent = displayName;
    span.style.fontSize = "0.875rem";
    
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-ghost";
    btn.textContent = "Sair";
    btn.addEventListener("click", async () => {
      await logout();
      window.location.reload();
    });
    
    wrap.appendChild(span);
    wrap.appendChild(btn);
    container.appendChild(wrap);
  } else {
    const guestWrap = document.createElement("div");
    guestWrap.className = "nav-auth-guest";
    guestWrap.style.flexDirection = "column";
    guestWrap.style.gap = "0.5rem";
    
    const aSignup = document.createElement("a");
    aSignup.href = "signup.html";
    aSignup.className = "btn btn-ghost";
    aSignup.textContent = "Criar conta";
    
    const aLogin = document.createElement("a");
    aLogin.href = "login.html";
    aLogin.className = "btn btn-primary";
    aLogin.textContent = "Entrar";
    
    guestWrap.appendChild(aSignup);
    guestWrap.appendChild(aLogin);
    container.appendChild(guestWrap);
  }
}

function initMobileMenu() {
  const menuBtn = document.getElementById("mobile-menu-btn");
  const menuClose = document.getElementById("mobile-menu-close");
  const menuOverlay = document.getElementById("mobile-menu-overlay");
  const menu = document.getElementById("mobile-menu");
  
  if (!menuBtn || !menuClose || !menuOverlay || !menu) return;
  
  function openMenu() {
    menu.classList.add("active");
    menuOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  
  function closeMenu() {
    menu.classList.remove("active");
    menuOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }
  
  menuBtn.addEventListener("click", openMenu);
  menuClose.addEventListener("click", closeMenu);
  menuOverlay.addEventListener("click", closeMenu);
  
  // Close menu on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("active")) {
      closeMenu();
    }
  });
  
  // Close menu when clicking a link
  const menuLinks = menu.querySelectorAll("a");
  menuLinks.forEach(link => {
    link.addEventListener("click", closeMenu);
  });
}

function updateProfileLinkVisibility() {
  const session = getSession();
  const profileLinks = document.querySelectorAll('a[href="perfil.html"], a[href="./perfil.html"]');
  
  profileLinks.forEach(link => {
    if (session?.email) {
      link.style.display = "";
      link.removeAttribute("hidden");
    } else {
      link.style.display = "none";
      link.setAttribute("hidden", "true");
    }
  });
}

function updateWelcomeBanner() {
  const el = document.getElementById("auth-welcome");
  if (!el) return;
  const session = getSession();
  if (session?.email) {
    el.textContent = "Você está logado como " + session.email + ".";
    el.hidden = false;
  }
}

function updateComeceGuestPanel() {
  const panel = document.getElementById("comece-panel-guest");
  if (!panel) return;
  const session = getSession();
  panel.hidden = !!session?.email;
}

function initLoginPage() {
  const form = document.getElementById("login-form");
  const errEl = document.getElementById("login-error");
  if (!form) return;

  if (getSession()) {
    window.location.href = "minha-rotina.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = "";
    }
    const email = form.querySelector('[name="email"]');
    const password = form.querySelector('[name="password"]');
    const submitBtn = form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email?.value || "", password?.value || "");
      sessionCache = { email: userCredential.user.email, uid: userCredential.user.uid };
      if (window.Toast) {
        window.Toast.success('Login realizado com sucesso!');
        setTimeout(() => {
          window.location.href = "minha-rotina.html";
        }, 1000);
      } else {
        window.location.href = "minha-rotina.html";
      }
    } catch (error) {
      const errorMsg = getAuthErrorMessage(error.code) || "Não foi possível entrar.";
      if (errEl) {
        errEl.textContent = errorMsg;
        errEl.hidden = false;
      }
      if (window.Toast) {
        window.Toast.error(errorMsg);
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function initSignupPage() {
  const form = document.getElementById("signup-form");
  const errEl = document.getElementById("signup-error");
  if (!form) return;

  if (getSession()) {
    window.location.href = "minha-rotina.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = "";
    }
    const email = form.querySelector('[name="email"]');
    const password = form.querySelector('[name="password"]');
    const confirm = form.querySelector('[name="confirm"]');
    const submitBtn = form.querySelector('[type="submit"]');

    if (password && confirm && password.value !== confirm.value) {
      const errorMsg = "As senhas não coincidem.";
      if (errEl) {
        errEl.textContent = errorMsg;
        errEl.hidden = false;
      }
      if (window.Toast) {
        window.Toast.warning(errorMsg);
      }
      return;
    }

    if (submitBtn) submitBtn.disabled = true;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email?.value || "", password?.value || "");
      sessionCache = { email: userCredential.user.email, uid: userCredential.user.uid };
      if (window.Toast) {
        window.Toast.success('Conta criada com sucesso! Redirecionando...');
      }
      setTimeout(() => {
        window.location.href = "minha-rotina.html";
      }, 1500);
    } catch (error) {
      const errorMsg = getAuthErrorMessage(error.code) || "Não foi possível cadastrar.";
      if (errEl) {
        errEl.textContent = errorMsg;
        errEl.hidden = false;
      }
      if (window.Toast) {
        window.Toast.error(errorMsg);
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function getAuthErrorMessage(code) {
  const errorMessages = {
    'auth/invalid-email': 'E-mail inválido.',
    'auth/user-disabled': 'Esta conta foi desabilitada.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'auth/email-already-in-use': 'Este e-mail já está em uso.',
    'auth/weak-password': 'A senha é muito fraca. Use pelo menos 6 caracteres.',
    'auth/invalid-credential': 'Credenciais inválidas.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  };
  return errorMessages[code] || 'Erro de autenticação. Tente novamente.';
}

// Mock api function for compatibility (no longer used)
async function api(path, options = {}) {
  console.warn('API function called but backend is disabled:', path);
  return { ok: false, status: 404, body: { error: 'Backend API disabled. Using Firebase instead.' } };
}

window.Auth = {
  api,
  fetchSession,
  getSession,
  logout,
  renderHeader,
  renderMobileAuth,
  auth,
};

document.addEventListener("DOMContentLoaded", async () => {
  await fetchSession();
  const navAuth = document.getElementById("nav-auth");
  if (navAuth) {
    renderHeader(navAuth);
  }
  renderMobileAuth();
  initMobileMenu();
  updateWelcomeBanner();
  updateComeceGuestPanel();
  updateProfileLinkVisibility();
  initLoginPage();
  initSignupPage();
  // Call initFormulario from formulario.js if it's been loaded
  if (typeof window.initFormulario === "function") {
    window.initFormulario();
  }

  const loginNotice = document.getElementById("login-notice");
  if (loginNotice && window.location.search.includes("cadastro=ok")) {
    loginNotice.hidden = false;
  }
});
