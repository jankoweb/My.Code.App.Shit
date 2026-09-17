const STORAGE_KEY = "shit-app-entries";

const STOOL_LABELS = {
  1: "Tvrdé hrudky (zácpa)",
  2: "Hrudkovitá bulva",
  3: "Klobása s prasklinami",
  4: "Hladká klobása",
  5: "Měkké kapky",
  6: "Kašovitá, nesourodá",
  7: "Vodnatá (průjem)",
};

const TAGS = [
  { key: "cukr", emoji: "🍬", label: "Cukr" },
  { key: "tucne", emoji: "🍟", label: "Tučné" },
  { key: "kofein", emoji: "☕", label: "Kofein" },
  { key: "prejedeni", emoji: "🍽️", label: "Přejedení" },
  { key: "alkohol", emoji: "🍺", label: "Alkohol" },
  { key: "mlecne", emoji: "🥛", label: "Mléčné" },
  { key: "korenene", emoji: "🌶️", label: "Kořeněné" },
  { key: "lepek", emoji: "🌾", label: "Lepek" },
  { key: "neobvykle", emoji: "➕", label: "Neobvyklé" },
];

const MONTH_NAMES = [
  "Leden", "Únor", "Březen", "Duben", "Květen", "Červen",
  "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec",
];

const $ = (id) => document.getElementById(id);

function pad2(n) {
  return String(n).padStart(2, "0");
}

function dateKey(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function todayKey() {
  return dateKey(new Date());
}

function formatHHMM(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function liveColonFormat(e) {
  const el = e.target;
  const pos = el.selectionStart;
  const withColons = el.value.replace(/[,.]/g, ":");
  if (withColons !== el.value) {
    el.value = withColons;
    el.setSelectionRange(pos, pos);
  }
}

function parse24Time(text) {
  const m = /^(\d{1,2}):(\d{2})$/.exec((text || "").trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { h, m: min };
}

function formatCzechDate(d) {
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function parseCzechDate(text) {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec((text || "").trim());
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { day, month, year };
}

// --- storage ---

function loadEntries() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (e) => e && typeof e.id === "string" && typeof e.date === "string" && typeof e.at === "string" && typeof e.stoolType === "number"
    );
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// --- elements ---

const stoolSliderEl = $("stoolSlider");
const stoolValueEl = $("stoolValue");
const stoolDescEl = $("stoolDesc");
const timeInputEl = $("timeInput");
const tagsGridEl = $("tagsGrid");
const noteInputEl = $("noteInput");
const saveBtnEl = $("saveBtn");

const menuBtnEl = $("menuBtn");
const menuEl = $("menu");
const showStatsBtnEl = $("showStatsBtn");
const settingsBtnEl = $("settingsBtn");

const statsViewEl = $("statsView");
const settingsViewEl = $("settingsView");
const statsBackEl = $("statsBack");
const settingsBackEl = $("settingsBack");

const todayCountStatEl = $("todayCountStat");
const totalCountStatEl = $("totalCountStat");
const avgTypeStatEl = $("avgTypeStat");
const monthPrevEl = $("monthPrev");
const monthNextEl = $("monthNext");
const monthLabelEl = $("monthLabel");

const chartCountEl = $("chartCount");
const yAxisCountEl = $("yAxisCount");
const chartLabelsEl = $("chartLabels");

const chartTypeEl = $("chartType");
const yAxisTypeEl = $("yAxisType");
const typeChartLabelsEl = $("typeChartLabels");

const chartTagsEl = $("chartTags");
const yAxisTagsEl = $("yAxisTags");
const tagChartLabelsEl = $("tagChartLabels");

const correlationListEl = $("correlationList");
const historyTableEl = $("historyTable");

const editOverlayEl = $("editOverlay");
const editDateInputEl = $("editDateInput");
const editTimeInputEl = $("editTimeInput");
const editStoolSliderEl = $("editStoolSlider");
const editStoolValueEl = $("editStoolValue");
const editStoolDescEl = $("editStoolDesc");
const editTagsGridEl = $("editTagsGrid");
const editNoteInputEl = $("editNoteInput");
const editDeleteBtnEl = $("editDeleteBtn");
const editCancelBtnEl = $("editCancelBtn");
const editSaveBtnEl = $("editSaveBtn");

const exportBtnEl = $("exportBtn");
const importInputEl = $("importInput");
const clearAllBtnEl = $("clearAllBtn");

// --- form: tags ---

let formTags = new Set();
let editTags = new Set();
let editingId = null;

function buildTagButtons(container, tagSet, onChange) {
  container.innerHTML = "";
  TAGS.forEach((tag) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tag-btn";
    btn.textContent = `${tag.emoji} ${tag.label}`;
    if (tagSet.has(tag.key)) btn.classList.add("active");
    btn.addEventListener("click", () => {
      if (tagSet.has(tag.key)) {
        tagSet.delete(tag.key);
        btn.classList.remove("active");
      } else {
        tagSet.add(tag.key);
        btn.classList.add("active");
      }
      if (onChange) onChange();
    });
    container.appendChild(btn);
  });
}

function updateStoolDisplay(sliderEl, valueEl, descEl) {
  const v = Number(sliderEl.value);
  valueEl.textContent = String(v);
  descEl.textContent = STOOL_LABELS[v] || "";
}

stoolSliderEl.addEventListener("input", () => updateStoolDisplay(stoolSliderEl, stoolValueEl, stoolDescEl));
editStoolSliderEl.addEventListener("input", () => updateStoolDisplay(editStoolSliderEl, editStoolValueEl, editStoolDescEl));

timeInputEl.addEventListener("input", liveColonFormat);
editTimeInputEl.addEventListener("input", liveColonFormat);

function resetForm() {
  stoolSliderEl.value = "4";
  updateStoolDisplay(stoolSliderEl, stoolValueEl, stoolDescEl);
  timeInputEl.value = formatHHMM(new Date());
  formTags = new Set();
  buildTagButtons(tagsGridEl, formTags);
  noteInputEl.value = "";
}

function saveNewEntry() {
  const parsed = parse24Time(timeInputEl.value);
  if (!parsed) {
    alert("Neplatný čas, zadej ve tvaru HH:MM.");
    return;
  }
  const now = new Date();
  const at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parsed.h, parsed.m, 0);
  const entry = {
    id: `${at.toISOString()}-${Math.random().toString(36).slice(2, 7)}`,
    date: dateKey(at),
    at: at.toISOString(),
    stoolType: Number(stoolSliderEl.value),
    tags: Array.from(formTags),
    note: noteInputEl.value.trim(),
  };
  const entries = loadEntries();
  entries.push(entry);
  saveEntries(entries);
  resetForm();
}

saveBtnEl.addEventListener("click", saveNewEntry);

// --- menu ---

menuBtnEl.addEventListener("click", (e) => {
  e.stopPropagation();
  const willOpen = menuEl.hidden;
  menuEl.hidden = !willOpen;
  menuBtnEl.setAttribute("aria-expanded", String(willOpen));
});

document.addEventListener("click", (e) => {
  if (!menuEl.hidden && !menuEl.contains(e.target) && e.target !== menuBtnEl) {
    closeMenu();
  }
});

function closeMenu() {
  menuEl.hidden = true;
  menuBtnEl.setAttribute("aria-expanded", "false");
}

// --- overlay stack (views) ---

const OVERLAY_ELS = [statsViewEl, settingsViewEl];
let overlayStack = [];

function hideAllOverlays() {
  OVERLAY_ELS.forEach((el) => {
    el.hidden = true;
  });
}

function openOverlay(el) {
  hideAllOverlays();
  el.hidden = false;
  overlayStack.push(el);
  history.pushState({ shitOverlay: true }, "");
}

window.addEventListener("popstate", () => {
  overlayStack.pop();
  const previous = overlayStack[overlayStack.length - 1];
  hideAllOverlays();
  if (previous) previous.hidden = false;
});

function goBack() {
  if (history.state && history.state.shitOverlay) {
    history.back();
  } else {
    overlayStack = [];
    hideAllOverlays();
  }
}

statsBackEl.addEventListener("click", goBack);
settingsBackEl.addEventListener("click", goBack);

// --- stats view ---

let statsMonth = null; // {year, month} month = 0-indexed

function openStatsView() {
  const now = new Date();
  statsMonth = { year: now.getFullYear(), month: now.getMonth() };
  renderStats();
  openOverlay(statsViewEl);
  closeMenu();
}

function openSettingsView() {
  openOverlay(settingsViewEl);
  closeMenu();
}

showStatsBtnEl.addEventListener("click", openStatsView);
settingsBtnEl.addEventListener("click", openSettingsView);

monthPrevEl.addEventListener("click", () => {
  statsMonth.month -= 1;
  if (statsMonth.month < 0) {
    statsMonth.month = 11;
    statsMonth.year -= 1;
  }
  renderStats();
});

monthNextEl.addEventListener("click", () => {
  statsMonth.month += 1;
  if (statsMonth.month > 11) {
    statsMonth.month = 0;
    statsMonth.year += 1;
  }
  renderStats();
});

function renderBars(barsEl, yAxisEl, values, color) {
  barsEl.innerHTML = "";
  barsEl.style.setProperty("--bar-color", color);
  const max = Math.max(1, ...values);
  values.forEach((v) => {
    const wrap = document.createElement("div");
    wrap.className = "chart-bar-wrap";
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    const pct = v <= 0 ? 0 : Math.min(100, Math.max(4, Math.round((v / max) * 100)));
    bar.style.height = `${pct}%`;
    wrap.appendChild(bar);
    barsEl.appendChild(wrap);
  });
  yAxisEl.children[0].textContent = String(max);
  yAxisEl.children[1].textContent = "0";
}

function renderLabels(el, labels) {
  el.innerHTML = "";
  labels.forEach((text) => {
    const span = document.createElement("span");
    span.textContent = text;
    el.appendChild(span);
  });
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function renderStats() {
  const entries = loadEntries();
  const { year, month } = statsMonth;

  monthLabelEl.textContent = `${MONTH_NAMES[month]} ${year}`;

  const monthEntries = entries.filter((e) => {
    const d = new Date(e.at);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  todayCountStatEl.textContent = String(entries.filter((e) => e.date === todayKey()).length);
  totalCountStatEl.textContent = String(entries.length);
  avgTypeStatEl.textContent = monthEntries.length
    ? (monthEntries.reduce((sum, e) => sum + e.stoolType, 0) / monthEntries.length).toFixed(1)
    : "–";

  // count per day
  const dCount = daysInMonth(year, month);
  const dayValues = [];
  const dayLabels = [];
  for (let day = 1; day <= dCount; day++) {
    const key = `${year}-${pad2(month + 1)}-${pad2(day)}`;
    dayValues.push(monthEntries.filter((e) => e.date === key).length);
    dayLabels.push(String(day));
  }
  renderBars(chartCountEl, yAxisCountEl, dayValues, "#42a5f5");
  renderLabels(chartLabelsEl, dayLabels);

  // stool type distribution
  const typeValues = [1, 2, 3, 4, 5, 6, 7].map(
    (t) => monthEntries.filter((e) => e.stoolType === t).length
  );
  renderBars(chartTypeEl, yAxisTypeEl, typeValues, "#66bb6a");
  renderLabels(typeChartLabelsEl, ["1", "2", "3", "4", "5", "6", "7"]);

  // tag frequency
  const tagValues = TAGS.map((tag) => monthEntries.filter((e) => e.tags.includes(tag.key)).length);
  renderBars(chartTagsEl, yAxisTagsEl, tagValues, "#ffca28");
  renderLabels(tagChartLabelsEl, TAGS.map((t) => t.emoji));

  renderCorrelation(entries);
  renderHistoryTable(entries);
}

function renderCorrelation(entries) {
  correlationListEl.innerHTML = "";
  const rows = [];
  TAGS.forEach((tag) => {
    const withTag = entries.filter((e) => e.tags.includes(tag.key));
    const withoutTag = entries.filter((e) => !e.tags.includes(tag.key));
    if (withTag.length < 3 || withoutTag.length === 0) return;
    const avgWith = withTag.reduce((s, e) => s + e.stoolType, 0) / withTag.length;
    const avgWithout = withoutTag.reduce((s, e) => s + e.stoolType, 0) / withoutTag.length;
    rows.push({ tag, avgWith, avgWithout, count: withTag.length, diff: avgWith - avgWithout });
  });

  if (!rows.length) {
    const p = document.createElement("div");
    p.className = "correlation-empty";
    p.textContent = "Zatím málo dat pro souvislosti (potřeba aspoň 3× stejný tag).";
    correlationListEl.appendChild(p);
    return;
  }

  rows.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));
  rows.forEach((r) => {
    const item = document.createElement("div");
    item.className = "correlation-item";
    const diffClass = r.diff > 0 ? "diff-up" : r.diff < 0 ? "diff-down" : "";
    item.innerHTML = `${r.tag.emoji} ${r.tag.label}: Ø <strong>${r.avgWith.toFixed(1)}</strong> <span class="${diffClass}">(jinak Ø ${r.avgWithout.toFixed(1)})</span> · ${r.count}×`;
    correlationListEl.appendChild(item);
  });
}

function renderHistoryTable(entries) {
  historyTableEl.innerHTML = "";
  if (!entries.length) {
    const p = document.createElement("div");
    p.className = "history-empty";
    p.textContent = "Zatím žádné záznamy.";
    historyTableEl.appendChild(p);
    return;
  }
  const sorted = [...entries].sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 200);
  sorted.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "history-row";
    const d = new Date(entry.at);
    const tagsText = entry.tags.map((key) => TAGS.find((t) => t.key === key)?.emoji || "").join(" ");
    row.innerHTML = `
      <span class="history-datetime">${formatCzechDate(d)} ${formatHHMM(d)}</span>
      <span class="history-type">${entry.stoolType}</span>
      <span class="history-tags">${tagsText}${entry.note ? " · " + entry.note : ""}</span>
    `;
    row.addEventListener("click", () => openEdit(entry));
    historyTableEl.appendChild(row);
  });
}

// --- edit overlay ---

function openEdit(entry) {
  editingId = entry.id;
  const d = new Date(entry.at);
  editDateInputEl.value = formatCzechDate(d);
  editTimeInputEl.value = formatHHMM(d);
  editStoolSliderEl.value = String(entry.stoolType);
  updateStoolDisplay(editStoolSliderEl, editStoolValueEl, editStoolDescEl);
  editTags = new Set(entry.tags);
  buildTagButtons(editTagsGridEl, editTags);
  editNoteInputEl.value = entry.note || "";
  editOverlayEl.hidden = false;
}

function closeEdit() {
  editOverlayEl.hidden = true;
  editingId = null;
}

editCancelBtnEl.addEventListener("click", closeEdit);

editSaveBtnEl.addEventListener("click", () => {
  const dateParsed = parseCzechDate(editDateInputEl.value);
  const timeParsed = parse24Time(editTimeInputEl.value);
  if (!dateParsed) {
    alert("Neplatné datum, zadej ve tvaru DD.MM.RRRR.");
    return;
  }
  if (!timeParsed) {
    alert("Neplatný čas, zadej ve tvaru HH:MM.");
    return;
  }
  const at = new Date(dateParsed.year, dateParsed.month - 1, dateParsed.day, timeParsed.h, timeParsed.m, 0);
  const entries = loadEntries();
  const idx = entries.findIndex((e) => e.id === editingId);
  if (idx === -1) {
    closeEdit();
    return;
  }
  entries[idx] = {
    ...entries[idx],
    date: dateKey(at),
    at: at.toISOString(),
    stoolType: Number(editStoolSliderEl.value),
    tags: Array.from(editTags),
    note: editNoteInputEl.value.trim(),
  };
  saveEntries(entries);
  closeEdit();
  renderStats();
});

editDeleteBtnEl.addEventListener("click", () => {
  if (!confirm("Smazat tenhle záznam?")) return;
  const entries = loadEntries().filter((e) => e.id !== editingId);
  saveEntries(entries);
  closeEdit();
  renderStats();
});

// --- settings ---

function exportData() {
  const entries = loadEntries();
  const blob = new Blob([JSON.stringify({ entries }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shit-app-export-${todayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

exportBtnEl.addEventListener("click", exportData);

importInputEl.addEventListener("change", async () => {
  const file = importInputEl.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data.entries)) throw new Error("bad format");
    if (!confirm("Import přepíše všechna aktuální data. Pokračovat?")) {
      importInputEl.value = "";
      return;
    }
    saveEntries(data.entries);
    window.location.reload();
  } catch {
    alert("Soubor se nepodařilo načíst.");
  } finally {
    importInputEl.value = "";
  }
});

clearAllBtnEl.addEventListener("click", () => {
  if (!confirm("Opravdu smazat úplně všechna data? Tohle nejde vrátit zpět.")) return;
  localStorage.removeItem(STORAGE_KEY);
  window.location.reload();
});

// --- init ---

buildTagButtons(tagsGridEl, formTags);
updateStoolDisplay(stoolSliderEl, stoolValueEl, stoolDescEl);
timeInputEl.value = formatHHMM(new Date());
