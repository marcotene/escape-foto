/* ============================================================
   SHARED.JS
   Funzioni comuni per gestione mockup (front-end + setup)
   ============================================================ */

const MOCKUP_STORAGE_KEY = "escape_mockups_v1";

/**
 * Legge tutti i mockup salvati in localStorage.
 * Ritorna sempre un array (anche se vuoto).
 */
function loadAllMockups() {
    try {
        const raw = localStorage.getItem(MOCKUP_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed;
    } catch (e) {
        console.error("Errore lettura mockup:", e);
        return [];
    }
}

/**
 * Salva l'intera lista mockup in localStorage.
 * Accetta un array di mockup.
 */
function saveAllMockups(list) {
    try {
        if (!Array.isArray(list)) {
            console.error("saveAllMockups: lista non valida");
            return;
        }
        localStorage.setItem(MOCKUP_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
        console.error("Errore salvataggio mockup:", e);
    }
}
