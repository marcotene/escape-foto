/* ============================================================
   SHARED STORAGE FOR MOCKUPS
   MindTrap Escape Room
============================================================ */

const STORAGE_KEY = "escape_mockups";

/* ============================================================
   LOAD CONFIG
============================================================ */

function loadMockupConfig() {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};

    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error("Errore parsing mockup config", e);
        return {};
    }
}

/* ============================================================
   SAVE CONFIG
============================================================ */

function saveMockupConfig(config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}
