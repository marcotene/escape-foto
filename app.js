/* ============================================================
   FRONTEND APP
   MindTrap Escape Room
============================================================ */

let frontCanvas = document.getElementById("frontCanvas");
let frontCtx = frontCanvas.getContext("2d");

let frontVideo = document.getElementById("frontVideo");

let frontMockupSelect = document.getElementById("frontMockupSelect");
let frontTeamName = document.getElementById("frontTeamName");
let frontScore = document.getElementById("frontScore");
let frontDateField = document.getElementById("frontDateField");
let cameraFacing = document.getElementById("cameraFacing");

let frontBtnCamera = document.getElementById("frontBtnCamera");
let frontBtnResetPhoto = document.getElementById("frontBtnResetPhoto");
let frontBtnDownload = document.getElementById("frontBtnDownload");
let frontBtnPrint = document.getElementById("frontBtnPrint");

frontCanvas.width = 800;
frontCanvas.height = 1066;

let currentMockup = null;
let mockupImage = new Image();

let photo = {
    img: null,
    x: 0,
    y: 0,
    scale: 1
};

let drag = { active: false, x: 0, y: 0 };
let pinch = { active: false, startDist: 0, startScale: 1 };

/* ============================================================
   LOAD MOCKUPS
============================================================ */

function loadMockupListFrontend() {
    let list = loadMockupConfig();
    frontMockupSelect.innerHTML = "";

    Object.keys(list).forEach(key => {
        let opt = document.createElement("option");
        opt.value = key;
        opt.textContent = key;
        frontMockupSelect.appendChild(opt);
    });

    if (Object.keys(list).length > 0) {
        frontMockupSelect.value = Object.keys(list)[0];
        loadMockupFrontend(frontMockupSelect.value);
    }
}

function loadMockupFrontend(name) {
    let config = loadMockupConfig();
    currentMockup = config[name];

    if (!currentMockup) return;

    mockupImage.src = currentMockup.image;
    mockupImage.onload = () => renderFrontCanvas();
}

frontMockupSelect.addEventListener("change", () => {
    loadMockupFrontend(frontMockupSelect.value);
});

/* ============================================================
   CAMERA
============================================================ */

async function startCamera() {
    try {
        let stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: cameraFacing.value }
        });

        frontVideo.srcObject = stream;
        frontVideo.classList.remove("hidden");
    } catch (err) {
        alert("Errore fotocamera");
    }
}

frontBtnCamera.addEventListener("click", () => {
    if (frontVideo.classList.contains("hidden")) {
        startCamera();
        frontBtnCamera.textContent = "Scatta foto";
        return;
    }

    // Scatta foto
    let tempCanvas = document.createElement("canvas");
    tempCanvas.width = frontCanvas.width;
    tempCanvas.height = frontCanvas.height;
    let tctx = tempCanvas.getContext("2d");

    tctx.drawImage(frontVideo, 0, 0, tempCanvas.width, tempCanvas.height);

    photo.img = new Image();
    photo.img.src = tempCanvas.toDataURL();

    photo.img.onload = () => {
        frontVideo.classList.add("hidden");
        renderFrontCanvas();
    };
});

/* ============================================================
   RESET PHOTO
============================================================ */

frontBtnResetPhoto.addEventListener("click", () => {
    photo.img = null;
    renderFrontCanvas();
});

/* ============================================================
   DRAG & PINCH PHOTO
============================================================ */

frontCanvas.addEventListener("pointerdown", e => {
    drag.active = true;
    drag.x = e.offsetX;
    drag.y = e.offsetY;
});

frontCanvas.addEventListener("pointermove", e => {
    if (!drag.active || !photo.img) return;

    photo.x += e.offsetX - drag.x;
    photo.y += e.offsetY - drag.y;

    drag.x = e.offsetX;
    drag.y = e.offsetY;

    renderFrontCanvas();
});

frontCanvas.addEventListener("pointerup", () => drag.active = false);
frontCanvas.addEventListener("pointercancel", () => drag.active = false);

/* Touch pinch */
frontCanvas.addEventListener("touchstart", e => {
    if (e.touches.length === 2) {
        pinch.active = true;
        pinch.startDist = getTouchDistance(e);
        pinch.startScale = photo.scale;
    }
});

frontCanvas.addEventListener("touchmove", e => {
    if (!pinch.active || e.touches.length !== 2) return;

    let dist = getTouchDistance(e);
    let scale = dist / pinch.startDist;

    photo.scale = pinch.startScale * scale;
    renderFrontCanvas();
});

frontCanvas.addEventListener("touchend", () => pinch.active = false);

function getTouchDistance(e) {
    let dx = e.touches[0].clientX - e.touches[1].clientX;
    let dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/* ============================================================
   RENDER CANVAS
============================================================ */

function renderFrontCanvas() {
    frontCtx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);

    // Foto
    if (photo.img) {
        let w = photo.img.width * photo.scale;
        let h = photo.img.height * photo.scale;
        frontCtx.drawImage(photo.img, photo.x, photo.y, w, h);
    }

    // Mockup
    if (mockupImage.src) {
        frontCtx.drawImage(mockupImage, 0, 0, frontCanvas.width, frontCanvas.height);
    }

    // Testi
    if (currentMockup) {
        drawField("team", frontTeamName.value);
        drawField("score", frontScore.value);
        drawField("date", frontDateField.value);
    }
}

function drawField(key, value) {
    let f = currentMockup.fields[key];

    frontCtx.fillStyle = f.color;
    frontCtx.font =
        (f.bold ? "bold " : "") +
        (f.italic ? "italic " : "") +
        f.size + "px " + f.font;

    frontCtx.fillText(value, f.x, f.y);
}

/* ============================================================
   DOWNLOAD
============================================================ */

frontBtnDownload.addEventListener("click", () => {
    let link = document.createElement("a");
    link.download = "escape-photo.png";
    link.href = frontCanvas.toDataURL();
    link.click();
});

/* ============================================================
   PRINT
============================================================ */

frontBtnPrint.addEventListener("click", () => {
    let w = window.open("");
    w.document.write("<img src='" + frontCanvas.toDataURL() + "'>");
    w.print();
});

/* ============================================================
   INIT
============================================================ */

loadMockupListFrontend();
renderFrontCanvas();
