/**
 * Simple Stats Manager
 * Apenas streak e dados do jardim
 */

import { db } from "./firebase.js";
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export async function getUserStats(uid) {
  if (!uid) return getGuestStats();
  
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return getDefaultStats();
  } catch (error) {
    console.error("Error loading stats:", error);
    return getGuestStats();
  }
}

export function getGuestStats() {
  const saved = localStorage.getItem('alivie_guest');
  return saved ? JSON.parse(saved) : getDefaultStats();
}

export function getDefaultStats() {
  return {
    garden: { stones: 0, flowers: 0, trees: 0, lanterns: 0 },
    streakDays: 0,
    longestStreak: 0,
    lastPracticeDate: null,
    history: []
  };
}

export async function saveUserStats(uid, stats) {
  if (!uid) {
    localStorage.setItem('alivie_guest', JSON.stringify(stats));
    return;
  }
  
  try {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, stats, { merge: true });
  } catch (error) {
    console.error("Error saving stats:", error);
    localStorage.setItem('alivie_guest', JSON.stringify(stats));
  }
}
