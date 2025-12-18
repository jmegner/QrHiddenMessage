(() => {
  const form = document.getElementById("qr-form");
  const textInput = document.getElementById("qr-text");
  const eclSelect = document.getElementById("qr-ecl");
  const scaleInput = document.getElementById("qr-scale");
  const marginInput = document.getElementById("qr-margin");
  const canvas = document.getElementById("qr-canvas");
  const status = document.getElementById("qr-status");
  const versionField = document.getElementById("qr-version");
  const sizeField = document.getElementById("qr-size");
  const maskField = document.getElementById("qr-mask");

  const eclMap = {
    L: qrcodegen.QrCode.Ecc.LOW,
    M: qrcodegen.QrCode.Ecc.MEDIUM,
    Q: qrcodegen.QrCode.Ecc.QUARTILE,
    H: qrcodegen.QrCode.Ecc.HIGH,
  };

  const renderQr = () => {
    const message = textInput.value.trim();
    const scale = clamp(parseInt(scaleInput.value, 10) || 8, 2, 20);
    const margin = clamp(parseInt(marginInput.value, 10) || 4, 0, 10);

    if (!message) {
      status.textContent = "Enter text to generate a QR code.";
      clearCanvas(canvas);
      resetMeta();
      return;
    }

    const ecl = eclMap[eclSelect.value] ?? qrcodegen.QrCode.Ecc.LOW;

    try {
      const qr = qrcodegen.QrCode.encodeText(message, ecl);
      drawCanvas(qr, canvas, scale, margin);
      status.textContent = `QR code generated with ${eclSelect.selectedOptions[0].textContent}.`;
      setMeta(qr);
    } catch (error) {
      clearCanvas(canvas);
      status.textContent = `Unable to generate QR code: ${error.message}`;
      resetMeta();
    }
  };

  const drawCanvas = (qr, canvasEl, scale, margin) => {
    const ctx = canvasEl.getContext("2d");
    const size = (qr.size + margin * 2) * scale;
    canvasEl.width = size;
    canvasEl.height = size;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = "#111";
    for (let y = 0; y < qr.size; y += 1) {
      for (let x = 0; x < qr.size; x += 1) {
        if (qr.getModule(x, y)) {
          ctx.fillRect((margin + x) * scale, (margin + y) * scale, scale, scale);
        }
      }
    }
  };

  const setMeta = (qr) => {
    versionField.textContent = qr.version;
    sizeField.textContent = `${qr.size} × ${qr.size}`;
    maskField.textContent = qr.mask;
  };

  const resetMeta = () => {
    versionField.textContent = "–";
    sizeField.textContent = "–";
    maskField.textContent = "–";
  };

  const clearCanvas = (canvasEl) => {
    const ctx = canvasEl.getContext("2d");
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    renderQr();
  });

  ["input", "change"].forEach((eventName) => {
    textInput.addEventListener(eventName, renderQr);
    eclSelect.addEventListener(eventName, renderQr);
    scaleInput.addEventListener(eventName, renderQr);
    marginInput.addEventListener(eventName, renderQr);
  });

  renderQr();
})();
