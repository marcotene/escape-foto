let setupMockups = loadMockupConfig();

const setupMockupSelect = document.getElementById("setupMockupSelect");
const setupTextFieldSelect = document.getElementById("setupTextFieldSelect");
const setupBold = document.getElementById("setupBold");
const setupItalic = document.getElementById("setupItalic");
const setupColor = document.getElementById("setupColor");
const setupBtnSave = document.getElementById("setupBtnSave");

const setupCanvas = document.getElementById("setupCanvas");
const setupCtx = setupCanvas.getContext("2d");

let setupCurrentMockupId = "mockup1";
let setupMockupImage = new Image();

let currentField = "team";
let touchStateSetup = {
    dragging: false,
    lastX: 0,
    lastY: 0,
    pinch: false,
    lastDist: 0
};

function resizeSetupCanvas() {
    const rect = setupCanvas.parentElement.getBoundingClientRect();
    setupCanvas.width = rect.width;
    setupCanvas.height = rect.height;
    setupDrawCanvas();
}

function setupLoadMockupList() {
    setupMockupSelect.innerHTML = "";
    for (const key in setupMockups) {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = setupMockups[key].label;
        setupMockupSelect.appendChild(opt);
    }
    setupCurrentMockupId = setupMockupSelect.value;
    setupMockupImage.src = setupMockups[setupCurrentMockupId].image;
    setupMockupImage.onload = setupDrawCanvas;
}

function setupDrawCanvas() {
    const w = setupCanvas.width;
    const h = setupCanvas.height;
    setupCtx.clearRect(0, 0, w, h);
    setupCtx.fillStyle = "#000000";
    setupCtx.fillRect(0, 0, w, h);

    const cfg = setupMockups[setupCurrentMockupId];
    if (!cfg) return;

    if (setupMockupImage.complete && setupMockupImage.naturalWidth > 0) {
        const iw = setupMockupImage.naturalWidth;
        const ih = setupMockupImage.naturalHeight;
        const scale = Math.max(w / iw, h / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        setupCtx.drawImage(setupMockupImage, dx, dy, dw, dh);
    }

    const map = cfg.textStyles;

    function drawText(label, key, styleCfg) {
        const x = styleCfg.x * w;
        const y = styleCfg.y * h;
        let fontParts = [];
        if (styleCfg.italic) fontParts.push("italic");
        if (styleCfg.bold) fontParts.push("bold");
        fontParts.push(styleCfg.size + "px");
        fontParts.push("Impact, system-ui, sans-serif");
        setupCtx.font = fontParts.join(" ");
        setupCtx.fillStyle = styleCfg.color;
        setupCtx.textAlign = styleCfg.align || "center";
        setupCtx.textBaseline = "middle";
        const text = label + " (" + key + ")";
        setupCtx.fillText(text, x, y);
        if (key === currentField) {
            setupCtx.strokeStyle = "#ff4444";
            setupCtx.lineWidth = 2;
            const metrics = setupCtx.measureText(text);
            const width = metrics.width;
            const height = styleCfg.size;
            setupCtx.strokeRect(x - width / 2 - 4, y - height / 2 - 4, width + 8, height + 8);
        }
    }

    drawText("Nome squadra", "team", map.team);
    drawText("Punteggio/tempo", "score", map.score);
    drawText("Data", "date", map.date);
}

setupMockupSelect.addEventListener("change", () => {
    setupCurrentMockupId = setupMockupSelect.value;
    setupMockupImage.src = setupMockups[setupCurrentMockupId].image;
    setupMockupImage.onload = setupDrawCanvas;
});

setupTextFieldSelect.addEventListener("change", () => {
    currentField = setupTextFieldSelect.value;
    syncControlsFromConfig();
    setupDrawCanvas();
});

setupBold.addEventListener("change", () => {
    const cfg = setupMockups[setupCurrentMockupId].textStyles[currentField];
    cfg.bold = setupBold.checked;
    setupDrawCanvas();
});

setupItalic.addEventListener("change", () => {
    const cfg = setupMockups[setupCurrentMockupId].textStyles[currentField];
    cfg.italic = setupItalic.checked;
    setupDrawCanvas();
});

setupColor.addEventListener("change", () => {
    const cfg = setupMockups[setupCurrentMockupId].textStyles[currentField];
    cfg.color = setupColor.value;
    setupDrawCanvas();
});

setupBtnSave.addEventListener("click", () => {
    saveMockupConfig(setupMockups);
    alert("Configurazione mockup salvata.");
});

// Touch logica: drag posizione + pinch size
setupCanvas.addEventListener("touchstart", e => {
    if (e.touches.length === 1) {
        touchStateSetup.dragging = true;
        touchStateSetup.pinch = false;
        touchStateSetup.lastX = e.touches[0].clientX;
        touchStateSetup.lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        touchStateSetup.dragging = false;
        touchStateSetup.pinch = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStateSetup.lastDist = Math.hypot(dx, dy);
    }
}, { passive: false });

setupCanvas.addEventListener("touchmove", e => {
    const cfg = setupMockups[setupCurrentMockupId].textStyles[currentField];
    const w = setupCanvas.width;
    const h = setupCanvas.height;
    e.preventDefault();
    if (touchStateSetup.dragging && e.touches.length === 1) {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const dx = x - touchStateSetup.lastX;
        const dy = y - touchStateSetup.lastY;
        touchStateSetup.lastX = x;
        touchStateSetup.lastY = y;
        cfg.x += dx / w;
        cfg.y += dy / h;
        if (cfg.x < 0) cfg.x = 0;
        if (cfg.x > 1) cfg.x = 1;
        if (cfg.y < 0) cfg.y = 0;
        if (cfg.y > 1) cfg.y = 1;
        setupDrawCanvas();
    } else if (touchStateSetup.pinch && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = dist - touchStateSetup.lastDist;
        touchStateSetup.lastDist = dist;
        const factor = 1 + delta / 300;
        cfg.size *= factor;
        if (cfg.size < 10) cfg.size = 10;
        if (cfg.size > 120) cfg.size = 120;
        setupDrawCanvas();
    }
}, { passive: false });

setupCanvas.addEventListener("touchend", () => {
    if (event.touches && event.touches.length === 0) {
        touchStateSetup.dragging = false;
        touchStateSetup.pinch = false;
    }
});

function syncControlsFromConfig() {
    const cfg = setupMockups[setupCurrentMockupId].textStyles[currentField];
    setupBold.checked = !!cfg.bold;
    setupItalic.checked = !!cfg.italic;
    setupColor.value = cfg.color || "#ffffff";
}

// Resize / rotazione
window.addEventListener("resize", resizeSetupCanvas);

// Init
(function initSetup() {
    setupMockups = loadMockupConfig();
    resizeSetupCanvas();
    setupLoadMockupList();
    currentField = setupTextFieldSelect.value;
    syncControlsFromConfig();
    setupDrawCanvas();
})();
