const colorsEl = document.getElementById("colors");
const fontsEl = document.getElementById("fonts");
const statusEl = document.getElementById("status");
let currentKit = null;

function say(message) {
  statusEl.textContent = message;
}

function activeTab() {
  return new Promise(resolve => chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs[0])));
}

async function sendToPage(message) {
  const tab = await activeTab();
  if (!tab || !tab.id || !tab.url || tab.url.startsWith("chrome://")) {
    throw new Error("Open a normal webpage first.");
  }
  return chrome.tabs.sendMessage(tab.id, message);
}

function renderKit(kit) {
  currentKit = kit;
  colorsEl.innerHTML = "";
  (kit.colors || []).slice(0, 12).forEach(item => {
    const color = typeof item === "string" ? item : item.color;
    const swatch = document.createElement("button");
    swatch.className = "swatch";
    swatch.style.background = color;
    swatch.title = color;
    swatch.dataset.color = color;
    swatch.addEventListener("click", () => copyText(color));
    colorsEl.appendChild(swatch);
  });
  if (!colorsEl.children.length) colorsEl.innerHTML = '<span class="muted">No colours detected</span>';

  fontsEl.innerHTML = "";
  (kit.fonts || []).slice(0, 8).forEach(font => {
    const row = document.createElement("div");
    row.className = "font-item";
    const name = document.createElement("span");
    name.textContent = font.family;
    name.style.fontFamily = font.family;
    const detail = document.createElement("small");
    detail.textContent = `${font.weight} · ${font.size}`;
    row.append(name, detail);
    row.addEventListener("click", () => copyText(`font-family: ${font.family}; font-weight: ${font.weight}; font-size: ${font.size};`));
    fontsEl.appendChild(row);
  });
  if (!fontsEl.children.length) fontsEl.innerHTML = '<span class="muted">No fonts detected</span>';
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    say("Copied to clipboard.");
  } catch {
    say("Copy failed. Try selecting the text manually.");
  }
}

function kitCss(kit) {
  const colors = (kit.colors || []).slice(0, 10);
  const fonts = kit.fonts || [];
  let css = ":root {\\n";
  colors.forEach((c, i) => {
    const value = typeof c === "string" ? c : c.color;
    css += `  --style-spy-color-${i + 1}: ${value};\\n`;
  });
  if (fonts[0]) css += `  --style-spy-heading-font: "${fonts[0].family}";\\n`;
  if (fonts[1] || fonts[0]) css += `  --style-spy-body-font: "${(fonts[1] || fonts[0]).family}";\\n`;
  css += "}\\n";
  return css;
}

async function loadSaved() {
  const data = await chrome.storage.local.get({ kits: [] });
  const container = document.getElementById("savedKits");
  container.innerHTML = "";
  data.kits.forEach((kit, index) => {
    const row = document.createElement("div");
    row.className = "kit";
    const name = document.createElement("span");
    name.className = "kit-name";
    name.textContent = kit.name;
    const actions = document.createElement("div");
    actions.className = "kit-actions";
    const load = document.createElement("button");
    load.textContent = "Load";
    load.onclick = () => { renderKit(kit); say(`Loaded ${kit.name}`); };
    const css = document.createElement("button");
    css.textContent = "CSS";
    css.onclick = () => copyText(kitCss(kit));
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.onclick = async () => {
      const latest = await chrome.storage.local.get({ kits: [] });
      latest.kits.splice(index, 1);
      await chrome.storage.local.set({ kits: latest.kits });
      loadSaved();
      say("Kit deleted.");
    };
    actions.append(load, css, del);
    row.append(name, actions);
    container.appendChild(row);
  });
}

async function init() {
  try {
    const kit = await sendToPage({ type: "GET_STYLE_KIT" });
    renderKit(kit);
  } catch (e) {
    colorsEl.innerHTML = '<span class="muted">Open a regular webpage and reload.</span>';
    fontsEl.innerHTML = "";
    say(e.message);
  }
  loadSaved();
}

document.getElementById("copyCss").addEventListener("click", () => {
  if (currentKit) copyText(kitCss(currentKit));
});
document.getElementById("saveKit").addEventListener("click", async () => {
  if (!currentKit) return say("No style kit to save.");
  const name = document.getElementById("kitName").value.trim();
  if (!name) return say("Enter a kit name.");
  const data = await chrome.storage.local.get({ kits: [] });
  data.kits.unshift({ ...currentKit, name, savedAt: Date.now() });
  await chrome.storage.local.set({ kits: data.kits });
  document.getElementById("kitName").value = "";
  loadSaved();
  say(`Saved "${name}".`);
});
document.getElementById("pick").addEventListener("click", async () => {
  try {
    await sendToPage({ type: "START_PICKER" });
    say("Click an element on the page. Press Esc to stop.");
    window.close();
  } catch (e) {
    say(e.message);
  }
});

init();
