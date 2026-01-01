let mockups = loadMockupConfig();

const frontMockupSelect = document.getElementById("frontMockupSelect");
const frontTeamName = document.getElementById("frontTeamName");
const frontScore = document.getElementById("frontScore");
const frontDateField = document.getElementById("frontDateField");
const cameraFacingSelect = document.getElementById("cameraFacing");

const frontCanvas = document.getElementById("frontCanvas");
const frontCtx = frontCanvas.getContext("2d");
const frontVideo = document.getElementById("frontVideo");

const frontBtnCamera = document.getElementById("frontBtnCamera");
const frontBtnResetPhoto = document.getElementById("frontBtnResetPhoto");
const frontBtnDownload = document.getElementById("frontBtnDownload");
const frontBtnPrint = document.getElementById("frontBtnPrint");

let frontCurrentMockupId = "mockup1";
let frontMockupImage = new Image();
let frontPhotoImage = new Image();
let frontPhotoLoaded = false;
let frontPhotoScale = 1;
let frontPhotoOffsetX = 0;
let frontPhotoOffsetY = 0;

let frontVideoStream = null;
let isCameraActive = false;

// Touch gesture data
let touchState = {
    dragging: false,
    lastX: 0,
    lastY: 0,
    pinch: false,
    lastDist: 0
};

function resizeFrontCanvas() {
    const rect = frontCanvas.parentElement.getBoundingClientRect();
    frontCanvas.width = rect.width;
    frontCanvas.height = rect.height;
    frontDrawCanvas();
}

function frontLoadMockupList() {
    // Popola select dalla config
    frontMockupSelect.innerHTML = "";
    for (const key in mockups) {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = mockups[key].label;
        frontMockupSelect.appendChild(opt);
    }
    frontCurrentMockupId = frontMockupSelect.value;
    frontMockupImage.src = mockups[frontCurrentMockupId].image;
    frontMockupImage.onload = frontDrawCanvas;
}

function frontDrawCanvas() {
    const w = frontCanvas.width;
    const h = frontCanvas.height;
    frontCtx.clearRect(0, 0, w, h);
    frontCtx.fillStyle = "#000000";
    frontCtx.fillRect(0, 0, w, h);

    const cfg = mockups[frontCurrentMockupId];
    if (!cfg) return;

    // Disegna mockup
    if (frontMockupImage.complete && frontMockupImage.naturalWidth > 0) {
        const iw = frontMockupImage.naturalWidth;
        const ih = frontMockupImage.naturalHeight;
        const scale = Math.max(w / iw, h / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;
        frontCtx.drawImage(frontMockupImage, dx, dy, dw, dh);
    }

    // Disegna foto se presente
    if (frontPhotoLoaded && frontPhotoImage.complete && frontPhotoImage.naturalWidth > 0) {
        const iw = frontPhotoImage.naturalWidth;
        const ih = frontPhotoImage.naturalHeight;
        const baseScale = Math.max(w / iw, h / ih);
        const scale = baseScale * frontPhotoScale;
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (w - dw) / 2 + frontPhotoOffsetX;
        const dy = (h - dh) / 2 + frontPhotoOffsetY;
        frontCtx.drawImage(frontPhotoImage, dx, dy, dw, dh);
    }

    // Testi
    const team = frontTeamName.value || "";
    const score = frontScore.value || "";
    const date = frontDateField.value || "";

    const map = cfg.textStyles;

    function drawText(text, styleCfg) {
        if (!text) return;
        const x = styleCfg.x * w;
        const y = styleCfg.y * h;
        let fontParts = [];
        if (styleCfg.italic) fontParts.push("italic");
        if (styleCfg.bold) fontParts.push("bold");
        fontParts.push(styleCfg.size + "px");
        fontParts.push("Impact, system-ui, sans-serif");
        frontCtx.font = fontParts.join(" ");
        frontCtx.fillStyle = styleCfg.color;
        frontCtx.textAlign = styleCfg.align || "center";
        frontCtx.textBaseline = "middle";
        frontCtx.fillText(text, x, y);
    }

    drawText(team, map.team);
    drawText(score, map.score);
    drawText(date, map.date);
}

frontMockupSelect.addEventListener("change", () => {
    frontCurrentMockupId = frontMockupSelect.value;
    const cfg = mockups[frontCurrentMockupId];
    frontMockupImage.src = cfg.image;
    frontMockupImage.onload = frontDrawCanvas;
});

frontTeamName.addEventListener("input", frontDrawCanvas);
frontScore.addEventListener("input", frontDrawCanvas);
frontDateField.addEventListener("input", frontDrawCanvas);

// Camera
async function startCamera() {
    if (isCameraActive) return;
    const facing = cameraFacingSelect.value || "environment";
    try {
        frontVideoStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: facing }
        });
        frontVideo.srcObject = frontVideoStream;
        frontVideo.classList.remove("hidden");
        isCameraActive = true;
        frontBtnCamera.textContent = "Scatta e usa foto";
    } catch (err) {
        console.error("Errore camera:", err);
        alert("Impossibile accedere alla fotocamera.");
    }
}

function stopCamera() {
    if (frontVideoStream) {
        frontVideoStream.getTracks().forEach(t => t.stop());
        frontVideoStream = null;
    }
    frontVideo.classList.add("hidden");
    isCameraActive = false;
    frontBtnCamera.textContent = "Scatta foto";
}

function capturePhoto() {
    if (!frontVideoStream) return;
    const tmpCanvas = document.createElement("canvas");
    const vw = frontVideo.videoWidth;
    const vh = frontVideo.videoHeight;
    tmpCanvas.width = vw;
    tmpCanvas.height = vh;
    const tctx = tmpCanvas.getContext("2d");
    tctx.drawImage(frontVideo, 0, 0, vw, vh);
    const dataUrl = tmpCanvas.toDataURL("image/jpeg", 0.9);
    frontPhotoImage = new Image();
    frontPhotoImage.onload = () => {
        frontPhotoLoaded = true;
        frontPhotoScale = 1;
        frontPhotoOffsetX = 0;
        frontPhotoOffsetY = 0;
        frontDrawCanvas();
    };
    frontPhotoImage.src = dataUrl;
    stopCamera();
}

frontBtnCamera.addEventListener("click", () => {
    if (!isCameraActive) {
        startCamera();
    } else {
        capturePhoto();
    }
});

frontBtnResetPhoto.addEventListener("click", () => {
    frontPhotoLoaded = false;
    frontPhotoImage = new Image();
    frontPhotoScale = 1;
    frontPhotoOffsetX = 0;
    frontPhotoOffsetY = 0;
    frontDrawCanvas();
});

// Pinch + drag sulla foto
frontCanvas.addEventListener("touchstart", e => {
    if (e.touches.length === 1) {
        touchState.dragging = true;
        touchState.pinch = false;
        touchState.lastX = e.touches[0].clientX;
        touchState.lastY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        touchState.dragging = false;
        touchState.pinch = true;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchState.lastDist = Math.hypot(dx, dy);
    }
}, { passive: false });

frontCanvas.addEventListener("touchmove", e => {
    if (!frontPhotoLoaded) return;
    e.preventDefault();
    if (touchState.dragging && e.touches.length === 1) {
        const x = e.touches[0].clientX;
        const y = e.touches[0].clientY;
        const dx = x - touchState.lastX;
        const dy = y - touchState.lastY;
        touchState.lastX = x;
        touchState.lastY = y;
        frontPhotoOffsetX += dx;
        frontPhotoOffsetY += dy;
        frontDrawCanvas();
    } else if (touchState.pinch && e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const delta = dist - touchState.lastDist;
        touchState.lastDist = dist;
        const factor = 1 + delta / 300;
        frontPhotoScale *= factor;
        if (frontPhotoScale < 0.3) frontPhotoScale = 0.3;
        if (frontPhotoScale > 5) frontPhotoScale = 5;
        frontDrawCanvas();
    }
}, { passive: false });

frontCanvas.addEventListener("touchend", () => {
    if (event.touches && event.touches.length === 0) {
        touchState.dragging = false;
        touchState.pinch = false;
    }
});

// Download
frontBtnDownload.addEventListener("click", () => {
    const dataURL = frontCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "escape-photo.png";
    a.click();
});

// Stampa in singola pagina
frontBtnPrint.addEventListener("click", () => {
    const dataURL = frontCanvas.toDataURL("image/png");
    const win = window.open("", "_blank");
    win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Stampa Escape Photo</title>
            <style>
                @page { margin: 0; }
                body { margin: 0; }
                img.print-image { width: 100%; display: block; page-break-after: avoid; }
            </style>
        </head>
        <body onload="window.print(); window.onafterprint = () => window.close();">
            <img src="${dataURL}" class="print-image">
        </body>
        </html>
    `);
    win.document.close();
});

// Resize / rotazione: ridimensiona canvas
window.addEventListener("resize", resizeFrontCanvas);

// Init
(function initFront() {
    mockups = loadMockupConfig();
    resizeFrontCanvas();
    frontLoadMockupList();
    const today = new Date().toISOString().substring(0, 10);
    frontDateField.value = today;
    frontDrawCanvas();
})();

// PWA Service Worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}
