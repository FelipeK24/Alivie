/**
 * DEPRECATED: Backend API Server
 * 
 * ⚠️  This backend is NOT in use by the current Alivie frontend.
 * The application uses Firebase for all data persistence and authentication.
 * 
 * These API endpoints exist only for reference/backup and are never called.
 * Frontend uses: Firebase Auth + Firestore
 * 
 * To use this backend instead of Firebase:
 * 1. Update frontend to call these API endpoints instead of Firebase
 * 2. Remove Firebase integration from frontend
 * 3. Deploy and run this server alongside the frontend
 */

const path = require("path");
const fs = require("fs");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 3000;
const JWT_SECRET =
  process.env.JWT_SECRET || (() => {
    console.warn('⚠️  WARNING: JWT_SECRET not set. Using weak default for development only.');
    console.warn('⚠️  In production, set JWT_SECRET environment variable to a strong random string.');
    return "altere-isso-em-producao-use-uma-string-longa-e-aleatoria";
  })();
const JWT_COOKIE = "token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const FORMULARIOS_FILE = path.join(DATA_DIR, "formularios.json");
const PROFILES_FILE = path.join(DATA_DIR, "profiles.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadUsers() {
  ensureDataDir();
  if (!fs.existsSync(USERS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

function loadFormularios() {
  ensureDataDir();
  if (!fs.existsSync(FORMULARIOS_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(FORMULARIOS_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveFormularios(map) {
  ensureDataDir();
  fs.writeFileSync(FORMULARIOS_FILE, JSON.stringify(map, null, 2), "utf8");
}

function loadProfiles() {
  ensureDataDir();
  if (!fs.existsSync(PROFILES_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(PROFILES_FILE, "utf8"));
  } catch {
    return {};
  }
}

function saveProfiles(map) {
  try {
    ensureDataDir();
    fs.writeFileSync(PROFILES_FILE, JSON.stringify(map, null, 2), "utf8");
    console.log("Profiles saved successfully to", PROFILES_FILE);
  } catch (err) {
    console.error("Error saving profiles:", err);
    throw err;
  }
}

function getUserIdFromToken(req) {
  const token = req.cookies[JWT_COOKIE];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.sub || null;
  } catch {
    return null;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const app = express();
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser());

app.post("/api/signup", (req, res) => {
  const email = req.body && req.body.email;
  const password = req.body && req.body.password;
  const norm = String(email || "")
    .trim()
    .toLowerCase();

  if (!norm || !isValidEmail(norm)) {
    return res.status(400).json({ error: "E-mail inválido." });
  }
  if (!password || String(password).length < 6) {
    return res
      .status(400)
      .json({ error: "A senha deve ter pelo menos 6 caracteres." });
  }

  const users = loadUsers();
  if (users.some((u) => u.email === norm)) {
    return res.status(409).json({ error: "Este e-mail já está cadastrado." });
  }

  const passwordHash = bcrypt.hashSync(String(password), 10);
  users.push({
    id:
      Date.now().toString(36) + Math.random().toString(36).slice(2, 10),
    email: norm,
    passwordHash,
  });
  saveUsers(users);

  res.status(201).json({ ok: true });
});

app.post("/api/login", (req, res) => {
  const email = req.body && req.body.email;
  const password = req.body && req.body.password;
  const norm = String(email || "")
    .trim()
    .toLowerCase();

  if (!norm || !password) {
    return res.status(400).json({ error: "Informe e-mail e senha." });
  }

  const users = loadUsers();
  const user = users.find((u) => u.email === norm);
  if (!user || !bcrypt.compareSync(String(password), user.passwordHash)) {
    return res.status(401).json({ error: "E-mail ou senha incorretos." });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.cookie(JWT_COOKIE, token, COOKIE_OPTIONS);
  res.json({ ok: true, user: { email: user.email } });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie(JWT_COOKIE, { ...COOKIE_OPTIONS, maxAge: 0 });
  res.json({ ok: true });
});

app.get("/api/me", (req, res) => {
  const token = req.cookies[JWT_COOKIE];
  if (!token) {
    return res.json({ user: null });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    res.json({ user: { email: payload.email } });
  } catch {
    res.clearCookie(JWT_COOKIE, { ...COOKIE_OPTIONS, maxAge: 0 });
    res.json({ user: null });
  }
});

const FORM_KEYS = [
  "rotina_diaria",
  "horas_sono",
  "carga_trabalho",
  "foco_melhorar",
  "cuidados_mente",
  "observacoes",
];

function condensarPrompt(f) {
  const ni = "(não informado)";
  const line = (label, val) => {
    const t =
      val != null && String(val).trim() !== "" ? String(val).trim() : ni;
    return "• " + label + ": " + t;
  };
  const parts = [
    "Contexto do usuário (Alivie — questionário de rotina e bem-estar):",
    "",
    line("Rotina semanal (trabalho, estudos, família)", f.rotina_diaria),
    line("Sono em média", f.horas_sono),
    line("Carga de trabalho ou responsabilidades no dia a dia", f.carga_trabalho),
    line("O que priorizar para melhorar agora", f.foco_melhorar),
    line("Saúde mental, humor e descanso mental", f.cuidados_mente),
    line("Observações adicionais", f.observacoes),
    "",
    "Instrução: com base nas informações acima, sugira hábitos e pausas realistas, linguagem acolhedora e sem julgamento, adequados à rotina descrita.",
  ];
  return parts.join("\n").slice(0, 12000);
}

app.get("/api/formulario", (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({ error: "Não autorizado." });
  }
  const map = loadFormularios();
  const saved = map[userId] || {};
  const formulario = {};
  FORM_KEYS.forEach(function (k) {
    formulario[k] =
      saved[k] != null && typeof saved[k] === "string" ? saved[k] : "";
  });
  let promptCondensado =
    saved.promptCondensado != null &&
    typeof saved.promptCondensado === "string" &&
    saved.promptCondensado.trim() !== ""
      ? saved.promptCondensado
      : "";
  if (!promptCondensado) {
    promptCondensado = condensarPrompt(formulario);
  }
  res.json({ formulario, promptCondensado });
});

app.put("/api/formulario", (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({ error: "Não autorizado." });
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const formulario = {};
  FORM_KEYS.forEach(function (k) {
    const v = body[k];
    formulario[k] =
      v != null && typeof v === "string" ? String(v).slice(0, 8000) : "";
  });
  const promptCondensado = condensarPrompt(formulario);
  const map = loadFormularios();
  map[userId] = Object.assign({}, formulario, {
    promptCondensado,
    atualizadoEm: new Date().toISOString(),
  });
  saveFormularios(map);
  res.json({
    ok: true,
    formulario,
    promptCondensado,
    atualizadoEm: map[userId].atualizadoEm,
  });
});

// Profile endpoints - stored by user ID, linked to email
const PROFILE_KEYS = ["fullName", "username", "routineFocus", "theme"];

app.get("/api/profile", (req, res) => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).json({ error: "Não autorizado." });
  }
  const map = loadProfiles();
  const saved = map[userId] || {};
  const profile = {};
  PROFILE_KEYS.forEach(function (k) {
    profile[k] =
      saved[k] != null && typeof saved[k] === "string" ? saved[k] : "";
  });
  res.json({ profile, atualizadoEm: saved.atualizadoEm || null });
});

app.post("/api/profile", (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    console.log("POST /api/profile - userId:", userId);
    if (!userId) {
      console.log("POST /api/profile - Unauthorized: no userId");
      return res.status(401).json({ error: "Não autorizado." });
    }
    const body = req.body && typeof req.body === "object" ? req.body : {};
    console.log("POST /api/profile - body:", body);
    const profile = {};
    PROFILE_KEYS.forEach(function (k) {
      const v = body[k];
      profile[k] =
        v != null && typeof v === "string" ? String(v).slice(0, 4000) : "";
    });
    console.log("POST /api/profile - profile:", profile);
    const map = loadProfiles();
    map[userId] = Object.assign({}, profile, {
      atualizadoEm: new Date().toISOString(),
    });
    saveProfiles(map);
    console.log("POST /api/profile - saved successfully");
    res.json({
      ok: true,
      profile,
      atualizadoEm: map[userId].atualizadoEm,
    });
  } catch (err) {
    console.error("POST /api/profile - Error:", err);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log("Servidor em http://localhost:" + PORT);
});
