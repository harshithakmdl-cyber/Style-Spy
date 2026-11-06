(() => {
  if (window.__styleSpyLoaded) return;
  window.__styleSpyLoaded = true;

  const normalizeColor = value => {
    if (!value || value === "transparent" || value === "rgba(0, 0, 0, 0)") return null;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000";
    ctx.fillStyle = value;
    return ctx.fillStyle;
  };

  function collectKit() {
    const colorCounts = new Map();
    const fontCounts = new Map();
    const nodes = Array.from(document.querySelectorAll("body *")).slice(0, 2500);

    nodes.forEach(el => {
      if (!(el instanceof HTMLElement)) return;
      const style = getComputedStyle(el);
      if (el.getClientRects().length === 0) return;

      [style.color, style.backgroundColor, style.borderTopColor, style.borderRightColor,
       style.borderBottomColor, style.borderLeftColor].forEach(raw => {
        const color = normalizeColor(raw);
        if (color) colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      });

      const family = style.fontFamily.split(",")[0].replace(/["']/g, "").trim();
      const key = `${family}|${style.fontWeight}|${style.fontSize}`;
      const previous = fontCounts.get(key) || { family, weight: style.fontWeight, size: style.fontSize, count: 0 };
      previous.count++;
      fontCounts.set(key, previous);
    });

    const colors = Array.from(colorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([color, count]) => ({ color, count }));

    const fonts = Array.from(fontCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      title: document.title || location.hostname,
      url: location.href,
      colors,
      fonts,
      capturedAt: Date.now()
    };
  }

  let pickerActive = false;
  let oldOutline = null;
  let oldCursor = "";

  function stopPicker() {
    pickerActive = false;
    document.removeEventListener("mouseover", onHover, true);
    document.removeEventListener("click", onClick, true);
    document.removeEventListener("keydown", onKey, true);
    document.documentElement.style.cursor = oldCursor;
    if (oldOutline) {
      oldOutline.el.style.outline = oldOutline.outline;
      oldOutline.el.style.outlineOffset = oldOutline.offset;
      oldOutline = null;
    }
  }

  function onHover(event) {
    const el = event.target;
    if (!(el instanceof HTMLElement)) return;
    if (oldOutline) {
      oldOutline.el.style.outline = oldOutline.outline;
      oldOutline.el.style.outlineOffset = oldOutline.offset;
    }
    oldOutline = {
      el,
      outline: el.style.outline,
      offset: el.style.outlineOffset
    };
    el.style.outline = "2px solid #6750c8";
    el.style.outlineOffset = "2px";
  }

  function onClick(event) {
    if (!pickerActive) return;
    event.preventDefault();
    event.stopPropagation();
    const el = event.target;
    if (!(el instanceof HTMLElement)) return;
    const style = getComputedStyle(el);
    const info = {
      tag: el.tagName.toLowerCase(),
      text: (el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 120),
      color: style.color,
      background: style.backgroundColor,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      fontSize: style.fontSize
    };
    stopPicker();
    const text = `/* ${info.tag}${info.text ? " — " + info.text : ""} */\\ncolor: ${info.color};\\nbackground-color: ${info.background};\\nfont-family: ${info.fontFamily};\\nfont-weight: ${info.fontWeight};\\nfont-size: ${info.fontSize};`;
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); } catch {}
    area.remove();
    alert("Style copied:\\n" + text);
  }

  function onKey(event) {
    if (event.key === "Escape") stopPicker();
  }

  function startPicker() {
    if (pickerActive) return;
    pickerActive = true;
    oldCursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = "crosshair";
    document.addEventListener("mouseover", onHover, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("keydown", onKey, true);
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === "GET_STYLE_KIT") {
      sendResponse(collectKit());
      return true;
    }
    if (message?.type === "START_PICKER") {
      startPicker();
      sendResponse({ ok: true });
      return true;
    }
  });
})();
