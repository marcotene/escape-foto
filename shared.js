// Config base mockup: qui definisci immagini e testi
const MOCKUPS = {
    mockup1: {
        id: "mockup1",
        label: "Mockup 1",
        image: "mockup1.jpg", // sostituisci con il tuo file reale
        textStyles: {
            team: { x: 0.5, y: 0.2, size: 40, align: "center", color: "#ffffff", bold: true, italic: false },
            score: { x: 0.5, y: 0.3, size: 32, align: "center", color: "#ffcc00", bold: true, italic: false },
            date: { x: 0.5, y: 0.4, size: 24, align: "center", color: "#ffffff", bold: false, italic: false }
        }
    },
    mockup2: {
        id: "mockup2",
        label: "Mockup 2",
        image: "mockup2.jpg",
        textStyles: {
            team: { x: 0.5, y: 0.75, size: 40, align: "center", color: "#ffffff", bold: true, italic: false },
            score: { x: 0.5, y: 0.83, size: 32, align: "center", color: "#ff4444", bold: true, italic: false },
            date: { x: 0.5, y: 0.9, size: 24, align: "center", color: "#ffffff", bold: false, italic: false }
        }
    }
};

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Carica configurazione mockup da localStorage se esiste
function loadMockupConfig() {
    const saved = localStorage.getItem("escapePhotoMockups");
    if (!saved) return deepClone(MOCKUPS);
    try {
        const parsed = JSON.parse(saved);
        return parsed;
    } catch {
        return deepClone(MOCKUPS);
    }
}

// Salva configurazione mockup
function saveMockupConfig(config) {
    localStorage.setItem("escapePhotoMockups", JSON.stringify(config));
}
