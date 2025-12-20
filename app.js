(() => {
  const textInput = document.getElementById("qr-text");
  const hiddenInput = document.getElementById("qr-hidden");
  const qrImage = document.getElementById("qr-image");
  const eclSelect = document.getElementById("qr-ecl");
  const scaleInput = document.getElementById("qr-scale");
  const marginInput = document.getElementById("qr-margin");
  const canvas = document.getElementById("qr-canvas");
  const status = document.getElementById("qr-status");
  const versionField = document.getElementById("qr-version");
  const sizeField = document.getElementById("qr-size");
  const eclField = document.getElementById("qr-ecl-display");
  const maskField = document.getElementById("qr-mask");

  const eclMap = {
    L: qrcodegen.QrCode.Ecc.LOW,
    M: qrcodegen.QrCode.Ecc.MEDIUM,
    Q: qrcodegen.QrCode.Ecc.QUARTILE,
    H: qrcodegen.QrCode.Ecc.HIGH,
  };

  const eclDisplay = new Map([
    [qrcodegen.QrCode.Ecc.LOW, "Low (7% tolerance)"],
    [qrcodegen.QrCode.Ecc.MEDIUM, "Medium (15% tolerance)"],
    [qrcodegen.QrCode.Ecc.QUARTILE, "Quartile (25% tolerance)"],
    [qrcodegen.QrCode.Ecc.HIGH, "High (30% tolerance)"],
  ]);

  const renderQr = () => {
    const message = textInput.value.trim();
    const hiddenMessage = hiddenInput.value;
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
      const qr = qrcodegen.QrCode.encodeText(message, ecl, hiddenMessage);
      drawCanvas(qr, canvas, scale, margin);
      status.textContent = `QR code generated at ${formatTimestamp(new Date())}.`;
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

    const dataUrl = canvasEl.toDataURL("image/png");
    qrImage.src = dataUrl;
    qrImage.width = size;
    qrImage.height = size;
    qrImage.alt = "QR code preview. Long-press to save or open in a new tab.";
  };

  const setMeta = (qr) => {
    versionField.textContent = qr.version;
    sizeField.textContent = `${qr.size} × ${qr.size}`;
    eclField.textContent = eclDisplay.get(qr.errorCorrectionLevel) ?? "Unknown";
    maskField.textContent = qr.mask;
  };

  const resetMeta = () => {
    versionField.textContent = "–";
    sizeField.textContent = "–";
    eclField.textContent = "–";
    maskField.textContent = "–";
  };

  const clearCanvas = (canvasEl) => {
    const ctx = canvasEl.getContext("2d");
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    qrImage.removeAttribute("src");
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const formatTimestamp = (date) => {
    const pad = (value) => String(value).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    const offsetMinutes = date.getTimezoneOffset();
    const totalMinutes = -offsetMinutes;
    const sign = totalMinutes >= 0 ? "+" : "-";
    const absoluteMinutes = Math.abs(totalMinutes);
    const offsetHours = Math.floor(absoluteMinutes / 60);
    const offsetRemainingMinutes = absoluteMinutes % 60;
    const formattedOffset =
      offsetRemainingMinutes === 0
        ? `${sign}${offsetHours}`
        : `${sign}${offsetHours}:${pad(offsetRemainingMinutes)}`;

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} UTC${formattedOffset}`;
  };

  ["input", "change"].forEach((eventName) => {
    textInput.addEventListener(eventName, renderQr);
    hiddenInput.addEventListener(eventName, renderQr);
    eclSelect.addEventListener(eventName, renderQr);
    scaleInput.addEventListener(eventName, renderQr);
    marginInput.addEventListener(eventName, renderQr);
  });

  renderQr();
})();
