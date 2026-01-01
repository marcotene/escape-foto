/* ============================================================
   APP.JS
   Front-end foto (operatore)
   ============================================================ */

const frontCanvas = document.getElementById("frontCanvas");
const fctx = frontCanvas.getContext("2d");

const frontMockupSelect = document.getElementById("frontMockupSelect");
const frontTeamName = document.getElementById("frontTeamName");
const frontScore = document.getElementById("frontScore");
const frontDateField = document.getElementById("frontDateField");

// Aggiornamento in tempo reale dell’anteprima
frontTeamName.addEventListener("input", frontDrawCanvas);
frontScore.addEventListener("input", frontDrawCanvas);
frontDateField.addEventListener("input", frontDrawCanvas);


const frontBtnCamera = document.getElementById("frontBtnCamera");
const frontBtnLoadPhoto = document.getElementById("frontBtnLoadPhoto");
const frontBtnClearPhoto = document.getElementById("frontBtnClearPhoto");
const frontPhotoInput = document.getElementById("frontPhotoInput");

const frontPhotoZoom = document.getElementById("frontPhotoZoom");
const frontBtnPrint = document.getElementById("frontBtnPrint");
const frontBtnSave = document.getElementById("frontBtnSave");
const frontBtnShare = document.getElementById("frontBtnShare");

const frontCameraStream = document.getElementById("frontCameraStream");
const btnGoSetup = document.getElementById("btnGoSetup");

btnGoSetup.addEventListener("click", () => {
    window.location.href = "setup.html";
});

/* ============================================================
   VARIABILI FOTO
   ============================================================ */

let frontBaseImage = null;
let frontOverlayImage = null;

let frontPhotoScale = 1;
let frontPhotoOffsetX = 0;
let frontPhotoOffsetY = 0;

let frontIsCameraOn = false;
let frontStream = null;

let frontTextStyles = {
    team: { x: 540, y: 150, size: 64, color: "#ffffff", font: "Arial" },
    score: { x: 540, y: 260, size: 64, color: "#ffffff", font: "Arial" },
    date: { x: 540, y: 370, size: 48, color: "#ffffff", font: "Arial" }
};

/* ============================================================
   DATA PREDEFINITA
   ============================================================ */
(function frontSetToday() {
    const today = new Date().toISOString().split("T")[0];
    frontDateField.value = today;
})();

/* ============================================================
   DISEGNO CANVAS
   ============================================================ */
function frontDrawCanvas() {
    fctx.clearRect(0, 0, frontCanvas.width, frontCanvas.height);
    fctx.fillStyle = "#000";
    fctx.fillRect(0, 0, frontCanvas.width, frontCanvas.height);

    // FOTO BASE
    if (frontBaseImage) {
        const iw = frontBaseImage.width;
        const ih = frontBaseImage.height;

        const scale = frontPhotoScale * Math.min(
            frontCanvas.width / iw,
            frontCanvas.height / ih
        );

        const dw = iw * scale;
        const dh = ih * scale;

        const dx = (frontCanvas.width - dw) / 2 + frontPhotoOffsetX;
        const dy = (frontCanvas.height - dh) / 2 + frontPhotoOffsetY;

        fctx.drawImage(frontBaseImage, dx, dy, dw, dh);
    }

    // OVERLAY
    if (frontOverlayImage) {
        fctx.drawImage(frontOverlayImage, 0, 0, frontCanvas.width, frontCanvas.height);
    }

    // TESTI
    const texts = {
        team: frontTeamName.value || "Squadra",
        score: frontScore.value || "Punteggio",
        date: frontDateField.value || ""
    };

    for (const key of Object.keys(frontTextStyles)) {
        const style = frontTextStyles[key];
        const text = texts[key];

        fctx.font = `${style.size}px ${style.font}`;
        fctx.textAlign = "center";
        fctx.strokeStyle = "black";
        fctx.lineWidth = 4;
        fctx.fillStyle = style.color;

        fctx.strokeText(text, style.x, style.y);
        fctx.fillText(text, style.x, style.y);
    }
}

/* ============================================================
   CARICA LISTA MOCKUP
   ============================================================ */
function frontLoadMockupList() {
    const list = loadAllMockups();
    frontMockupSelect.innerHTML = '<option value="">-- Seleziona mockup --</option>';

    list.forEach((m, index) => {
        const opt = document.createElement("option");
        opt.value = index;
        opt.textContent = m.name;
        frontMockupSelect.appendChild(opt);
    });
}

/* ============================================================
   SELEZIONE MOCKUP
   ============================================================ */
frontMockupSelect.addEventListener("change", () => {
    const list = loadAllMockups();
    const val = frontMockupSelect.value;

    if (val === "") {
        frontOverlayImage = null;
        frontTextStyles = {
            team: { x: 540, y: 150, size: 64, color: "#ffffff", font: "Arial" },
            score: { x: 540, y: 260, size: 64, color: "#ffffff", font: "Arial" },
            date: { x: 540, y: 370, size: 48, color: "#ffffff", font: "Arial" }
        };
        frontDrawCanvas();
        return;
    }

    const idx = parseInt(val, 10);
    const m = list[idx];

    frontTextStyles = m.textStyles || frontTextStyles;

    if (m.overlayDataURL) {
        const img = new Image();
        img.onload = () => {
            frontOverlayImage = img;
            frontDrawCanvas();
        };
        img.src = m.overlayDataURL;
    } else {
        frontOverlayImage = null;
        frontDrawCanvas();
    }
});

/* ============================================================
   CARICA FOTO
   ============================================================ */
frontBtnLoadPhoto.addEventListener("click", () => {
    frontPhotoInput.click();
});

frontPhotoInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
        frontBaseImage = img;
        frontPhotoScale = 1;
        frontPhotoOffsetX = 0;
        frontPhotoOffsetY = 0;
        frontDrawCanvas();
    };
    img.src = URL.createObjectURL(file);
});

/* ============================================================
   CANCELLA FOTO
   ============================================================ */
frontBtnClearPhoto.addEventListener("click", () => {
    frontBaseImage = null;
    frontPhotoScale = 1;
    frontPhotoOffsetX = 0;
    frontPhotoOffsetY = 0;
    frontDrawCanvas();
});

/* ============================================================
   FOTOCAMERA
   ============================================================ */
frontBtnCamera.addEventListener("click", async () => {
    try {
        if (!frontIsCameraOn) {
            frontStream = await navigator.mediaDevices.getUserMedia({ video: true });
            frontCameraStream.srcObject = frontStream;
            frontIsCameraOn = true;
            frontBtnCamera.textContent = "Scatta e usa foto";
            frontCameraStream.style.display = "block";
        } else {
            const tempCanvas = document.createElement("canvas");
            tempCanvas.width = frontCameraStream.videoWidth;
            tempCanvas.height = frontCameraStream.videoHeight;

            const tctx = tempCanvas.getContext("2d");
            tctx.drawImage(frontCameraStream, 0, 0);

            const img = new Image();
            img.onload = () => {
                frontBaseImage = img;
                frontPhotoScale = 1;
                frontPhotoOffsetX = 0;
                frontPhotoOffsetY = 0;
                frontDrawCanvas();
            };
            img.src = tempCanvas.toDataURL("image/png");

            frontStream.getTracks().forEach(t => t.stop());
            frontCameraStream.style.display = "none";
            frontIsCameraOn = false;
            frontBtnCamera.textContent = "Scatta foto";
        }
    } catch (e) {
        alert("Errore fotocamera.");
    }
});

/* ============================================================
   ZOOM FOTO
   ============================================================ */
frontPhotoZoom.addEventListener("input", () => {
    frontPhotoScale = parseFloat(frontPhotoZoom.value);
    frontDrawCanvas();
});

/* ============================================================
   DRAG FOTO (mouse + touch)
   ============================================================ */
let frontIsDraggingPhoto = false;
let frontLastPos = { x: 0, y: 0 };

function frontGetPos(evt) {
    const rect = frontCanvas.getBoundingClientRect();
    let x, y;

    if (evt.touches) {
        x = evt.touches[0].clientX;
        y = evt.touches[0].clientY;
    } else {
        x = evt.clientX;
        y = evt.clientY;
    }

    return {
        x: x - rect.left,
        y: y - rect.top
    };
}

frontCanvas.addEventListener("mousedown", e => {
    frontIsDraggingPhoto = true;
    frontLastPos = frontGetPos(e);
});

frontCanvas.addEventListener("mousemove", e => {
    if (!frontIsDraggingPhoto) return;

    const pos = frontGetPos(e);
    frontPhotoOffsetX += pos.x - frontLastPos.x;
    frontPhotoOffsetY += pos.y - frontLastPos.y;
    frontLastPos = pos;

    frontDrawCanvas();
});

frontCanvas.addEventListener("mouseup", () => {
    frontIsDraggingPhoto = false;
});

frontCanvas.addEventListener("mouseleave", () => {
    frontIsDraggingPhoto = false;
});

frontCanvas.addEventListener("touchstart", e => {
    frontIsDraggingPhoto = true;
    frontLastPos = frontGetPos(e);
});

frontCanvas.addEventListener("touchmove", e => {
    if (!frontIsDraggingPhoto) return;

    const pos = frontGetPos(e);
    frontPhotoOffsetX += pos.x - frontLastPos.x;
    frontPhotoOffsetY += pos.y - frontLastPos.y;
    frontLastPos = pos;

    frontDrawCanvas();
    e.preventDefault();
}, { passive: false });

frontCanvas.addEventListener("touchend", () => {
    frontIsDraggingPhoto = false;
});

/* ============================================================
   SALVA IMMAGINE
   ============================================================ */
frontBtnSave.addEventListener("click", () => {
    const url = frontCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "escape_result.png";
    a.click();
});

/* ============================================================
   STAMPA A4 / A5
   ============================================================ */
frontBtnPrint.addEventListener("click", () => {
    const format = document.getElementById("frontPrintFormat").value;

    const sizes = {
        a4: { w: 2480, h: 3508 },
        a5: { w: 1748, h: 2480 }
    };

    const { w, h } = sizes[format];

    const printCanvas = document.createElement("canvas");
    printCanvas.width = w;
    printCanvas.height = h;

    const pctx = printCanvas.getContext("2d");

    pctx.fillStyle = "#ffffff";
    pctx.fillRect(0, 0, w, h);

    const img = new Image();
    img.onload = () => {
        const scale = Math.min(w / img.width, h / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (w - dw) / 2;
        const dy = (h - dh) / 2;

        pctx.drawImage(img, dx, dy, dw, dh);

        const dataURL = printCanvas.toDataURL("image/png");

        const win = window.open("", "_blank");
        win.document.write(`
            <html>
            <head>
                <style>
                    @page { size: ${format.toUpperCase()}; margin: 0; }
                    body { margin: 0; }
                    img { width: 100%; height: auto; }
                </style>
            </head>
            <body>
                <img src="${dataURL}">
                <script>
                    window.onload = () => window.print();
                </script>
            </body>
            </html>
        `);
        win.document.close();
    };

    img.src = frontCanvas.toDataURL("image/png");
});

/* ============================================================
   CONDIVIDI (con fallback)
   ============================================================ */
frontBtnShare.addEventListener("click", async () => {
    const dataURL = frontCanvas.toDataURL("image/png");
    const res = await fetch(dataURL);
    const blob = await res.blob();
    const file = new File([blob], "escape_photo.png", { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            await navigator.share({
                title: "Escape Room Photo",
                text: "Foto Escape Room",
                files: [file]
            });
            return;
        } catch (e) {
            console.error("Share error:", e);
        }
    }

    // FALLBACK
    const a = document.createElement("a");
    a.href = dataURL;
    a.download = "escape_photo.png";
    a.click();

    alert("Condivisione nativa non supportata. L'immagine è stata salvata.");
});

/* ============================================================
   INIT
   ============================================================ */
(function initFront() {
    frontLoadMockupList();
    frontDrawCanvas();
})();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}

