let setupMockups = loadMockupConfig();

const setupMockupSelect = document.getElementById("setupMockupSelect");
const setupUploadMockup = document.getElementById("setupUploadMockup");
const setupBtnEditMockup = document.getElementById("setupBtnEditMockup");
const setupBtnDeleteMockup = document.getElementById("setupBtnDeleteMockup");
const setupBtnSave = document.getElementById("setupBtnSave");

const menu = document.getElementById("sideMenu");
const menuColor = document.getElementById("menuColor");
const menuFont = document.getElementById("menuFont");
const menuBold = document.getElementById("menuBold");
const menuItalic = document.getElementById("menuItalic");
const menuClose = document.getElementById("menuClose");

const setupCanvas = document.getElementById("setupCanvas");
const setupCtx = setupCanvas.getContext("2d");

let setupCurrentMockupId = "mockup1";
let setupMockupImage = new Image();

let currentField = null; // team, score, date

// Touch state
let touchState = {
    dragging: false,
    pinch: false,
    lastX: 0,
    lastY: 0,
    lastDist: 0,
    longPressTimer: null
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
    setupCtx.fillStyle = "#000";
    setupCtx.fillRect(0, 0, w, h);

    const cfg = setupMockups[setupCurrentMockupId];
    if (!cfg) return;

    // Draw mockup
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

    // Draw texts
    const map = cfg.textStyles;

    function drawField(label, key, style) {
        const x = style.x * w;
        const y = style.y * h;

        let fontParts = [];
        if (style.italic) fontParts.push("italic");
        if (style.bold) fontParts.push("bold");
        fontParts.push(style.size + "px");
        fontParts.push(style.font || "Impact");
        setupCtx.font = fontParts.join(" ");
        setupCtx.fillStyle = style.color;
        setupCtx.textAlign = "center";
        setupCtx.textBaseline = "middle";

        const text = label;
        setupCtx.fillText(text, x, y);

        // Highlight selected
        if (currentField === key) {
            setupCtx.strokeStyle = "#ff4444";
            setupCtx.lineWidth = 2;
            const metrics = setupCtx.measureText(text);
            const width = metrics.width;
            const height = style.size;
            setupCtx.strokeRect(x - width / 2 - 4, y - height / 2 - 4, width + 8, height + 8);
        }
    }

    drawField("Nome squadra", "team", map.team);
    drawField("Punteggio/tempo", "score", map.score);
    drawField("Data", "date", map.date);
}

// Hit detection
function detectFieldTouch(x, y) {
    const cfg = setupMockups[setupCurrentMockupId].textStyles;
    const w = setupCanvas.width;
    const h = setupCanvas.height;

    for (const key of ["team", "score", "date"]) {
        const style = cfg[key];
        const tx = style.x * w;
        const ty = style.y * h;

        setupCtx.font = `${style.bold ? "bold " : ""}${style.italic ? "italic " : ""}${style.size}px ${style.font || "Impact"}`;
        const metrics = setupCtx.measureText(key);
        const width = metrics.width;
        const height = style.size;

        if (
            x >= tx - width / 2 - 10 &&
            x <= tx + width / 2 + 10 &&
            y >= ty - height / 2 - 10 &&
            y <= ty + height / 2 + 10
        ) {
            return key;
        }
    }
    return null;
}

// Touch events
setupCanvas.addEventListener("touchstart", e => {
    const rect = setupCanvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;

    const hit = detectFieldTouch(x, y);
    if (hit) {
        currentField = hit;
        setupDrawCanvas();

        // Long press → open menu
        touchState.longPressTimer = setTimeout(() => {
            openMenu();
        }, 500);
    }

    if (e.touches.length === 1) {
        touchState.dragging = true;
        touchState.lastX = x;
        touchState.lastY = y;
    } else if (e.touches.length === 2) {
        touchState.pinch = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchState.lastDist = Math.hypot(dx, dy);
    }
}, { passive: false });

setupCanvas.addEventListener("touchmove", e => {
    if (!currentField) return;
    e.preventDefault();

    clearTimeout(touchState.longPressTimer);

    const cfg = setupMockups[setupCurrentMockupId].textStyles[currentField];
    const rect = setupCanvas.getBoundingClientRect();
    const w = setupCanvas.width;
    const h = setupCanvas.height;

    if (touchState.dragging && e.touches.length === 1) {
        const x = e.touches[0].clientX - rect.left;
        const y = e.touches[0].clientY - rect.top;

        const dx = x - touchState.lastX;
        const dy = y - touchState.lastY;

        touchState.lastX = x;
        touchState.lastY = y;

        cfg.x += dx / w;
        cfg.y += dy / h;

        cfg.x = Math.max(0, Math.min(1, cfg.x));
        cfg.y = Math.max(0, Math.min(1, cfg.y));

        setupDrawCanvas();
    }

    if (touchState.pinch && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = dist - touchState.lastDist;
        touchState.lastDist = dist;

        cfg.size += delta * 0.2;
        cfg.size = Math.max(10, Math.min(150, cfg.size));

        setupDrawCanvas();
    }
}, { passive: false });

setupCanvas.addEventListener("touchend", () => {
    clearTimeout(touchState.longPressTimer);
    touchState.dragging = false;
    touchState.pinch = false;
});

// MENU LATERALE
function openMenu() {
    if (!currentField) return;
    const cfg = setupMockups[setupCurrentMockupId].textStyles[currentField];

    menuColor.value = cfg.color;
    menuFont.value = cfg.font || "Impact";

    menu.classList.add("open");
}

menuClose.addEventListener("click", () => {
    menu.classList.remove("open");
});

menuColor.addEventListener("input", () => {
    const cfg = setupMockups[setupCurrentMockupId].textStyles[currentField];
    cfg.color = menuColor.value;
    setupDrawCanvas();
});

menuFont.addEventListener("change", () => {
    const cfg = setupMockups[setupCurrentMockupId].textStyles[currentField];
    cfg.font = menuFont.value;
    setupDrawCanvas();
});

menuBold.addEventListener("click", () => {
    const cfg = setupMockups[setupCurrentMockupId].textStyles[currentField];
    cfg.bold = !cfg.bold;
    setupDrawCanvas();
});

menuItalic.addEventListener("click", () => {
    const cfg = setupMockups[setupCurrentMockupId].textStyles[currentField];
    cfg.italic = !cfg.italic;
    setupDrawCanvas();
});

// MOCKUP MANAGEMENT
setupUploadMockup.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        setupMockups[setupCurrentMockupId].image = reader.result;
        setupMockupImage.src = reader.result;
        setupDrawCanvas();
    };
    reader.readAsDataURL(file);
});

setupBtnEditMockup.addEventListener("click", () => {
    const newName = prompt("Nuovo nome mockup:", setupMockups[setupCurrentMockupId].label);
    if (!newName) return;
    setupMockups[setupCurrentMockupId].label = newName;
    setupLoadMockupList();
});

setupBtnDeleteMockup.addEventListener("click", () => {
    if (!confirm("Eliminare questo mockup?")) return;
    delete setupMockups[setupCurrentMockupId];
    saveMockupConfig(setupMockups);
    location.reload();
});

setupBtnSave.addEventListener("click", () => {
    saveMockupConfig(setupMockups);
    alert("Configurazione salvata.");
});

// INIT
window.addEventListener("resize", resizeSetupCanvas);

(function init() {
    setupMockups = loadMockupConfig();
    resizeSetupCanvas();
    setupLoadMockupList();
    setupDrawCanvas();
})();
