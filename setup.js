/* ============================================================
   SETUP.JS
   Editor mockup avanzato (backend)
   ============================================================ */

const setupCanvas = document.getElementById("setupCanvas");
const sctx = setupCanvas.getContext("2d");

const setupMockupSelect = document.getElementById("setupMockupSelect");
const setupBtnNew = document.getElementById("setupBtnNew");
const setupBtnDelete = document.getElementById("setupBtnDelete");
const setupMockupName = document.getElementById("setupMockupName");
const setupOverlayInput = document.getElementById("setupOverlayInput");

const setupTextType = document.getElementById("setupTextType");
const setupFontSize = document.getElementById("setupFontSize");
const setupFontColor = document.getElementById("setupFontColor");
const setupFontFamily = document.getElementById("setupFontFamily");
const setupBtnSave = document.getElementById("setupBtnSave");

const btnGoFront = document.getElementById("btnGoFront");

btnGoFront.addEventListener("click", () => {
    window.location.href = "index.html";
});

let setupOverlayImage = null;
let currentMockupIndex = null;

/* ============================================================
   OGGETTI TESTO DI DEFAULT
   ============================================================ */
let setupTextObjects = {
    team: { text: "Squadra", x: 540, y: 150, size: 64, color: "#ffffff", font: "Arial" },
    score: { text: "Punteggio", x: 540, y: 260, size: 64, color: "#ffffff", font: "Arial" },
    date: { text: "Data", x: 540, y: 370, size: 48, color: "#ffffff", font: "Arial" }
};

let setupDraggingKey = null;
let setupDragOffsetX = 0;
let setupDragOffsetY = 0;

/* ============================================================
   DISEGNO CANVAS
   ============================================================ */
function setupDrawCanvas() {
    sctx.clearRect(0, 0, setupCanvas.width, setupCanvas.height);
    sctx.fillStyle = "#000";
    sctx.fillRect(0, 0, setupCanvas.width, setupCanvas.height);

    if (setupOverlayImage) {
        sctx.drawImage(setupOverlayImage, 0, 0, setupCanvas.width, setupCanvas.height);
    }

    Object.values(setupTextObjects).forEach(obj => {
        sctx.font = `${obj.size}px ${obj.font}`;
        sctx.textAlign = "center";
        sctx.strokeStyle = "black";
        sctx.lineWidth = 4;
        sctx.fillStyle = obj.color;
        sctx.strokeText(obj.text, obj.x, obj.y);
        sctx.fillText(obj.text, obj.x, obj.y);
    });
}

/* ============================================================
   CARICA LISTA MOCKUP
   ============================================================ */
function setupLoadMockupList() {
    const list = loadAllMockups();
    setupMockupSelect.innerHTML = '<option value="">-- Nuovo o seleziona --</option>';

    list.forEach((m, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = m.name;
        setupMockupSelect.appendChild(opt);
    });
}

/* ============================================================
   SELEZIONE MOCKUP
   ============================================================ */
setupMockupSelect.addEventListener("change", () => {
    const list = loadAllMockups();
    const val = setupMockupSelect.value;

    if (val === "") {
        currentMockupIndex = null;
        setupMockupName.value = "";
        setupOverlayImage = null;
        setupTextObjects = {
            team: { text: "Squadra", x: 540, y: 150, size: 64, color: "#ffffff", font: "Arial" },
            score: { text: "Punteggio", x: 540, y: 260, size: 64, color: "#ffffff", font: "Arial" },
            date: { text: "Data", x: 540, y: 370, size: 48, color: "#ffffff", font: "Arial" }
        };
        setupDrawCanvas();
        return;
    }

    currentMockupIndex = parseInt(val, 10);
    const m = list[currentMockupIndex];

    setupMockupName.value = m.name || "";
    setupTextObjects = m.textStyles || setupTextObjects;

    if (m.overlayDataURL) {
        const img = new Image();
        img.onload = () => {
            setupOverlayImage = img;
            setupDrawCanvas();
        };
        img.src = m.overlayDataURL;
    } else {
        setupOverlayImage = null;
        setupDrawCanvas();
    }

    const key = setupTextType.value;
    const obj = setupTextObjects[key];
    setupFontSize.value = obj.size;
    setupFontColor.value = obj.color;
    setupFontFamily.value = obj.font;
});

/* ============================================================
   NUOVO MOCKUP
   ============================================================ */
setupBtnNew.addEventListener("click", () => {
    currentMockupIndex = null;
    setupMockupSelect.value = "";
    setupMockupName.value = "";
    setupOverlayImage = null;

    setupTextObjects = {
        team: { text: "Squadra", x: 540, y: 150, size: 64, color: "#ffffff", font: "Arial" },
        score: { text: "Punteggio", x: 540, y: 260, size: 64, color: "#ffffff", font: "Arial" },
        date: { text: "Data", x: 540, y: 370, size: 48, color: "#ffffff", font: "Arial" }
    };

    setupDrawCanvas();
});

/* ============================================================
   CANCELLA MOCKUP
   ============================================================ */
setupBtnDelete.addEventListener("click", () => {
    if (currentMockupIndex === null) {
        alert("Seleziona un mockup da cancellare.");
        return;
    }

    const list = loadAllMockups();
    if (!list[currentMockupIndex]) return;

    if (!confirm(`Cancellare il mockup "${list[currentMockupIndex].name}"?`)) return;

    list.splice(currentMockupIndex, 1);
    saveAllMockups(list);

    currentMockupIndex = null;
    setupLoadMockupList();
    setupBtnNew.click();
});

/* ============================================================
   CARICA OVERLAY
   ============================================================ */
setupOverlayInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const dataURL = reader.result;
        const img = new Image();
        img.onload = () => {
            setupOverlayImage = img;
            setupDrawCanvas();
        };
        img.src = dataURL;

        setupOverlayInput.dataset.dataurl = dataURL;
    };
    reader.readAsDataURL(file);
});

/* ============================================================
   CAMBIO TIPO TESTO
   ============================================================ */
setupTextType.addEventListener("change", () => {
    const key = setupTextType.value;
    const obj = setupTextObjects[key];

    setupFontSize.value = obj.size;
    setupFontColor.value = obj.color;
    setupFontFamily.value = obj.font;

    setupDrawCanvas();
});

/* ============================================================
   MODIFICA STILI TESTO
   ============================================================ */
setupFontSize.addEventListener("input", () => {
    const key = setupTextType.value;
    setupTextObjects[key].size = parseInt(setupFontSize.value, 10);
    setupDrawCanvas();
});

setupFontColor.addEventListener("input", () => {
    const key = setupTextType.value;
    setupTextObjects[key].color = setupFontColor.value;
    setupDrawCanvas();
});

setupFontFamily.addEventListener("change", () => {
    const key = setupTextType.value;
    setupTextObjects[key].font = setupFontFamily.value;
    setupDrawCanvas();
});

/* ============================================================
   DRAG & DROP TESTI
   ============================================================ */
function setupGetMousePos(evt) {
    const rect = setupCanvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) * (setupCanvas.width / rect.width),
        y: (evt.clientY - rect.top) * (setupCanvas.height / rect.height)
    };
}

function setupHitTestText(x, y) {
    for (const key of Object.keys(setupTextObjects)) {
        const obj = setupTextObjects[key];
        sctx.font = `${obj.size}px ${obj.font}`;
        sctx.textAlign = "center";

        const width = sctx.measureText(obj.text).width;
        const height = obj.size;

        const left = obj.x - width / 2;
        const right = obj.x + width / 2;
        const top = obj.y - height;
        const bottom = obj.y;

        if (x >= left && x <= right && y >= top && y <= bottom) return key;
    }
    return null;
}

setupCanvas.addEventListener("mousedown", e => {
    const pos = setupGetMousePos(e);
    const key = setupHitTestText(pos.x, pos.y);

    if (key) {
        setupDraggingKey = key;
        setupDragOffsetX = pos.x - setupTextObjects[key].x;
        setupDragOffsetY = pos.y - setupTextObjects[key].y;
    }
});

setupCanvas.addEventListener("mousemove", e => {
    if (!setupDraggingKey) return;

    const pos = setupGetMousePos(e);
    setupTextObjects[setupDraggingKey].x = pos.x - setupDragOffsetX;
    setupTextObjects[setupDraggingKey].y = pos.y - setupDragOffsetY;

    setupDrawCanvas();
});

setupCanvas.addEventListener("mouseup", () => {
    setupDraggingKey = null;
});

setupCanvas.addEventListener("mouseleave", () => {
    setupDraggingKey = null;
});

/* ============================================================
   SALVA MOCKUP
   ============================================================ */
setupBtnSave.addEventListener("click", () => {
    const name = setupMockupName.value.trim();
    if (!name) {
        alert("Inserisci un nome mockup.");
        return;
    }

    let overlayDataURL = null;

    if (setupOverlayInput.dataset.dataurl) {
        overlayDataURL = setupOverlayInput.dataset.dataurl;
    } else if (currentMockupIndex !== null) {
        const listOld = loadAllMockups();
        overlayDataURL = listOld[currentMockupIndex]?.overlayDataURL || null;
    }

    const newMockup = {
        name,
        overlayDataURL,
        textStyles: setupTextObjects
    };

    const list = loadAllMockups();

    if (currentMockupIndex === null) {
        list.push(newMockup);
        currentMockupIndex = list.length - 1;
    } else {
        list[currentMockupIndex] = newMockup;
    }

    saveAllMockups(list);
    setupLoadMockupList();
    setupMockupSelect.value = currentMockupIndex.toString();

    alert("Mockup salvato.");
});

/* ============================================================
   INIT
   ============================================================ */
setupLoadMockupList();
setupDrawCanvas();
