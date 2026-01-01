/* ============================================================
   SETUP MOCKUP EDITOR
   MindTrap Escape Room
============================================================ */

let setupCanvas = document.getElementById("setupCanvas");
let setupCtx = setupCanvas.getContext("2d");

let setupMockupSelect = document.getElementById("setupMockupSelect");
let setupMockupUpload = document.getElementById("setupMockupUpload");

let setupFieldSelect = document.getElementById("setupFieldSelect");
let setupFontSelect = document.getElementById("setupFontSelect");
let setupColor = document.getElementById("setupColor");
let setupBold = document.getElementById("setupBold");
let setupItalic = document.getElementById("setupItalic");

let setupBtnSave = document.getElementById("setupBtnSave");
let setupBtnEditMockup = document.getElementById("setupBtnEditMockup");
let setupBtnDeleteMockup = document.getElementById("setupBtnDeleteMockup");

let mockupImage = new Image();
let currentMockup = null;
let currentField = "team";

let drag = { active: false, x: 0, y: 0 };
let pinch = { active: false, startDist: 0, startSize: 0 };

setupCanvas.width = 800;
setupCanvas.height = 1066;

/* ============================================================
   LOAD MOCKUPS
============================================================ */

function loadMockupList() {
    let list = loadMockupConfig();
    setupMockupSelect.innerHTML = "";

    Object.keys(list).forEach(key => {
        let opt = document.createElement("option");
        opt.value = key;
        opt.textContent = key;
        setupMockupSelect.appendChild(opt);
    });

    if (Object.keys(list).length > 0) {
        setupMockupSelect.value = Object.keys(list)[0];
        loadMockup(setupMockupSelect.value);
    }
}

function loadMockup(name) {
    let config = loadMockupConfig();
    currentMockup = config[name];

    if (!currentMockup) return;

    mockupImage.src = currentMockup.image;
    mockupImage.onload = () => renderSetupCanvas();
}

/* ============================================================
   UPLOAD MOCKUP IMAGE
============================================================ */

setupMockupUpload.addEventListener("change", e => {
    let file = e.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = () => {
        let name = "Mockup " + (Object.keys(loadMockupConfig()).length + 1);
        let config = loadMockupConfig();

        config[name] = {
            image: reader.result,
            fields: {
                team: { x: 100, y: 100, size: 40, color: "#ffffff", font: "Impact", bold: false, italic: false },
                score: { x: 100, y: 200, size: 40, color: "#ffffff", font: "Impact", bold: false, italic: false },
                date: { x: 100, y: 300, size: 40, color: "#ffffff", font: "Impact", bold: false, italic: false }
            }
        };

        saveMockupConfig(config);
        loadMockupList();
        setupMockupSelect.value = name;
        loadMockup(name);
    };

    reader.readAsDataURL(file);
});

/* ============================================================
   FIELD SELECTION
============================================================ */

setupFieldSelect.addEventListener("change", () => {
    currentField = setupFieldSelect.value;
    updateStyleControls();
});

/* ============================================================
   STYLE CONTROLS
============================================================ */

function updateStyleControls() {
    if (!currentMockup) return;

    let f = currentMockup.fields[currentField];
    setupFontSelect.value = f.font;
    setupColor.value = f.color;
    setupBold.checked = f.bold;
    setupItalic.checked = f.italic;
}

setupFontSelect.addEventListener("change", () => {
    currentMockup.fields[currentField].font = setupFontSelect.value;
    renderSetupCanvas();
});

setupColor.addEventListener("input", () => {
    currentMockup.fields[currentField].color = setupColor.value;
    renderSetupCanvas();
});

setupBold.addEventListener("change", () => {
    currentMockup.fields[currentField].bold = setupBold.checked;
    renderSetupCanvas();
});

setupItalic.addEventListener("change", () => {
    currentMockup.fields[currentField].italic = setupItalic.checked;
    renderSetupCanvas();
});

/* ============================================================
   DRAG & PINCH
============================================================ */

setupCanvas.addEventListener("pointerdown", e => {
    drag.active = true;
    drag.x = e.offsetX;
    drag.y = e.offsetY;
});

setupCanvas.addEventListener("pointermove", e => {
    if (!drag.active) return;

    let f = currentMockup.fields[currentField];
    f.x += e.offsetX - drag.x;
    f.y += e.offsetY - drag.y;

    drag.x = e.offsetX;
    drag.y = e.offsetY;

    renderSetupCanvas();
});

setupCanvas.addEventListener("pointerup", () => drag.active = false);
setupCanvas.addEventListener("pointercancel", () => drag.active = false);

/* Touch pinch */
setupCanvas.addEventListener("touchstart", e => {
    if (e.touches.length === 2) {
        pinch.active = true;
        pinch.startDist = getTouchDistance(e);
        pinch.startSize = currentMockup.fields[currentField].size;
    }
});

setupCanvas.addEventListener("touchmove", e => {
    if (!pinch.active || e.touches.length !== 2) return;

    let dist = getTouchDistance(e);
    let scale = dist / pinch.startDist;

    currentMockup.fields[currentField].size = pinch.startSize * scale;
    renderSetupCanvas();
});

setupCanvas.addEventListener("touchend", () => pinch.active = false);

function getTouchDistance(e) {
    let dx = e.touches[0].clientX - e.touches[1].clientX;
    let dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/* ============================================================
   RENDER CANVAS
============================================================ */

function renderSetupCanvas() {
    setupCtx.clearRect(0, 0, setupCanvas.width, setupCanvas.height);

    if (mockupImage.src) {
        setupCtx.drawImage(mockupImage, 0, 0, setupCanvas.width, setupCanvas.height);
    }

    Object.keys(currentMockup.fields).forEach(key => {
        let f = currentMockup.fields[key];

        setupCtx.fillStyle = f.color;
        setupCtx.font =
            (f.bold ? "bold " : "") +
            (f.italic ? "italic " : "") +
            f.size + "px " + f.font;

        setupCtx.fillText(key.toUpperCase(), f.x, f.y);
    });
}

/* ============================================================
   SAVE CONFIGURATION
============================================================ */

setupBtnSave.addEventListener("click", () => {
    let config = loadMockupConfig();
    config[setupMockupSelect.value] = currentMockup;
    saveMockupConfig(config);
    alert("Configurazione salvata");
});

/* ============================================================
   DELETE MOCKUP
============================================================ */

setupBtnDeleteMockup.addEventListener("click", () => {
    if (!confirm("Eliminare questo mockup?")) return;

    let config = loadMockupConfig();
    delete config[setupMockupSelect.value];
    saveMockupConfig(config);

    loadMockupList();
});

/* ============================================================
   INIT
============================================================ */

loadMockupList();
updateStyleControls();
