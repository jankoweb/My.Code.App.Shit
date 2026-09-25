const STORAGE_KEY = "shit-app-entries";
const STOOL_LABELS_KEY = "shit-app-stool-labels";

const DEFAULT_STOOL_LABELS = {
  0: { name: "Doutník", desc: "pevný, tvrdý" },
  1: { name: "Kabel", desc: "měkčí, vcelku" },
  2: { name: "Kopeček", desc: "měkká, nedrží tvar" },
  3: { name: "Plaváček", desc: "pevné kusy" },
  4: { name: "Kaše", desc: "už blízko průjmu" },
  5: { name: "Průser", desc: "řídká, málo pevné" },
  6: { name: "Průjem", desc: "vodnatý" },
};

// Names/descriptions are user-editable in Nastavení; what's stored can be
// stale (fewer/more entries than today's 0-6 range) after an app update, so
// each index falls back to the built-in default independently.
function loadStoolLabels() {
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(STOOL_LABELS_KEY) || "null");
  } catch {
    raw = null;
  }
  const result = {};
  for (let i = 0; i <= 6; i++) {
    const entry = raw && raw[i];
    result[i] = entry && typeof entry.name === "string" && typeof entry.desc === "string" ? entry : DEFAULT_STOOL_LABELS[i];
  }
  return result;
}

function saveStoolLabels(labels) {
  localStorage.setItem(STOOL_LABELS_KEY, JSON.stringify(labels));
}

let STOOL_LABELS = loadStoolLabels();

// Shared by the food-tag and supplement lists below — same "editable list of
// a fixed length, falls back to defaults per-item" pattern as stool labels
// above, just with an extra icon field. The list's length/order/key/
// breakAfter are fixed (not user-editable, so TAG_COMPONENTS lookups and
// grid layout stay stable) — only emoji/label/desc can be customized.
function loadEditableItems(storageKey, defaults) {
  let raw = null;
  try {
    raw = JSON.parse(localStorage.getItem(storageKey) || "null");
  } catch {
    raw = null;
  }
  return defaults.map((def, i) => {
    const saved = raw && raw[i];
    const emoji = saved && typeof saved.emoji === "string" && saved.emoji.trim() ? saved.emoji : def.emoji;
    const label = saved && typeof saved.label === "string" && saved.label.trim() ? saved.label : def.label;
    const desc = saved && typeof saved.desc === "string" ? saved.desc : def.desc;
    return { ...def, emoji, label, desc };
  });
}

function saveEditableItems(storageKey, items) {
  localStorage.setItem(storageKey, JSON.stringify(items.map((it) => ({ emoji: it.emoji, label: it.label, desc: it.desc }))));
}

// Naléhavost/Nadýmání/Bolest/Stres share one scale, shown as bare numbers
// (no word labels) — see createChoiceState below. No button for 0: leaving
// the whole group untouched already means "0/not answered" (stored as
// null, see clampScale), so a 0 button would just be a second way to say
// the same thing.
const SCALE_LABELS = { 1: "1", 2: "2" };

// Tags on the entry screen are food items (fast to recognize & tap).
// Internally each maps to one or more underlying components, so charts and
// correlations can still group e.g. "fat" or "gas-inducing" across different
// foods instead of tracking every food item as an isolated bucket.
// breakAfter forces a row break in the grid regardless of available width —
// plain flex-wrap can't guarantee e.g. cibule/zelenina/ovoce land on the
// same row together, since that depends on how much space is left over from
// whatever wrapped before them.
const TAGS_KEY = "shit-app-tags";

const DEFAULT_TAGS = [
  { key: "syry", emoji: "🧀", label: "Sýry", desc: "" },
  { key: "mlecne", emoji: "🥛", label: "Mléčné výrobky", desc: "" },
  { key: "uzeniny", emoji: "🍖", label: "Uzeniny, šunky", desc: "" },
  { key: "tucne", emoji: "🧈", label: "Tučné", desc: "" },
  { key: "smazene", emoji: "🍟", label: "Smažené", desc: "" },
  { key: "palive", emoji: "🌶️", label: "Pálivé", desc: "", breakAfter: true },
  { key: "cibule", emoji: "🧅", label: "Cibule", desc: "" },
  { key: "zelenina", emoji: "🥦", label: "Zelenina", desc: "" },
  { key: "ovoce", emoji: "🍎", label: "Ovoce", desc: "", breakAfter: true },
  { key: "kofein", emoji: "☕", label: "Kofein", desc: "" },
  { key: "sladke", emoji: "🍫", label: "Sladké", desc: "" },
  { key: "prefabrikat", emoji: "🥫", label: "Prefabrikát", desc: "", breakAfter: true },
  { key: "nakladane", emoji: "🫙", label: "Nakládané", desc: "" },
  { key: "neobvykle", emoji: "➕", label: "Neobvyklé", desc: "" },
];

let TAGS = loadEditableItems(TAGS_KEY, DEFAULT_TAGS);

const TAG_COMPONENTS = {
  syry: ["tuk", "mlecne"],
  mlecne: ["mlecne"],
  uzeniny: ["tuk", "sul"],
  smazene: ["smazene", "tuk"],
  sladke: ["sladke"],
  palive: ["palive"],
  cibule: ["nadymave"],
  nakladane: ["sul", "nadymave"],
  kofein: ["kofein"],
  tucne: ["tuk"],
  prefabrikat: ["prefabrikat"],
  zelenina: ["zelenina"],
  ovoce: ["ovoce"],
  neobvykle: ["neobvykle"],
};

const COMPONENTS = [
  { key: "tuk", emoji: "🧈", label: "Tuk" },
  { key: "mlecne", emoji: "🥛", label: "Mléčné výrobky" },
  { key: "sul", emoji: "🧂", label: "Sůl" },
  { key: "smazene", emoji: "🍟", label: "Smažené" },
  { key: "sladke", emoji: "🍫", label: "Sladké" },
  { key: "palive", emoji: "🌶️", label: "Pálivé" },
  { key: "nadymave", emoji: "💨", label: "Nadýmavé" },
  { key: "kofein", emoji: "☕", label: "Kofein" },
  { key: "prefabrikat", emoji: "🥫", label: "Prefabrikát" },
  { key: "zelenina", emoji: "🥦", label: "Zelenina" },
  { key: "ovoce", emoji: "🍎", label: "Ovoce" },
  { key: "neobvykle", emoji: "➕", label: "Neobvyklé" },
];

function entryComponents(entry) {
  const set = new Set();
  (entry.tags || []).forEach((tagKey) => (TAG_COMPONENTS[tagKey] || []).forEach((c) => set.add(c)));
  return set;
}

const SUPPLEMENTS_KEY = "shit-app-supplements";

const DEFAULT_SUPPLEMENTS = [
  { key: "c", emoji: "🍊", label: "C", desc: "" },
  { key: "mg", emoji: "🥬", label: "Mg", desc: "" },
  { key: "zn", emoji: "🦪", label: "Zn", desc: "" },
  { key: "d", emoji: "☀️", label: "D", desc: "" },
  { key: "b", emoji: "🥚", label: "B", desc: "" },
  { key: "e", emoji: "🫒", label: "E", desc: "" },
  { key: "laktobacily", emoji: "🦠", label: "Lakto", desc: "" },
];

let SUPPLEMENTS = loadEditableItems(SUPPLEMENTS_KEY, DEFAULT_SUPPLEMENTS);

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

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
}

function formatHHMM(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// Native <input type="date"> / <input type="time"> always report their
// value as YYYY-MM-DD / HH:MM (or "" when empty) regardless of device
// locale or keyboard, so parsing here is just format validation — no
// free-text guessing like the old DD.MM.RRRR text fields needed.
function parseDateInputValue(text) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((text || "").trim());
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { day, month, year };
}

function parseTimeInputValue(text) {
  const m = /^(\d{2}):(\d{2})$/.exec((text || "").trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return { h, m: min };
}

function formatCzechDate(d) {
  return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function formatCzechDateShort(d) {
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}

// Native date/time inputs enforce their own minimum content width (day/
// month/year segments — or, even with the picker icon hidden, the time
// segments) that doesn't reliably shrink to a compact flex box on every
// device. Several rounds of patching the native rendering in place (hiding
// the picker icon, a transparent-input-plus-overlay trick, a fixed
// flex-basis) all still left it overflowing into the next field on a real
// device. So instead of sizing the native widget, it's taken out of layout
// entirely (visually hidden, see .dt-hidden-input) and a plain button —
// sized purely by our own CSS — shows the value and opens the native picker
// via showPicker(). The input can't overflow a row it no longer occupies.
function wireDateTimeButton(inputEl, kind, formatValue) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `edit-field-input dt-btn dt-btn--${kind}`;
  inputEl.classList.add("dt-hidden-input");
  inputEl.tabIndex = -1;
  inputEl.before(btn);
  btn.addEventListener("click", () => {
    try {
      if (inputEl.showPicker) inputEl.showPicker();
      else inputEl.focus();
    } catch {
      inputEl.focus();
    }
  });
  function update() {
    btn.textContent = formatValue(inputEl.value);
  }
  inputEl.addEventListener("input", update);
  update();
  return update;
}

function formatDateBtnText(value) {
  const parsed = parseDateInputValue(value);
  return parsed ? formatCzechDateShort(new Date(parsed.year, parsed.month - 1, parsed.day)) : "";
}

function formatTimeBtnText(value) {
  return parseTimeInputValue(value) ? value : "";
}

// Wires a date+time pair together and returns one update() that refreshes
// both buttons — same call-site shape as before (one update fn per row).
function wireDateTimeRow(dateEl, timeEl) {
  const updateDate = wireDateTimeButton(dateEl, "date", formatDateBtnText);
  const updateTime = wireDateTimeButton(timeEl, "time", formatTimeBtnText);
  return () => {
    updateDate();
    updateTime();
  };
}

function parseDateTime(dateText, timeText) {
  const d = parseDateInputValue(dateText);
  const t = parseTimeInputValue(timeText);
  if (!d || !t) return null;
  return new Date(d.year, d.month - 1, d.day, t.h, t.m, 0);
}

function formatDiffHuman(stoolDate, itemDate) {
  const diffMs = stoolDate - itemDate;
  const absMin = Math.round(Math.abs(diffMs) / 60000);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  const text = h > 0 ? `${h} h ${m} min` : `${m} min`;
  return diffMs < 0 ? { text: `⚠️ po ${text}`, warn: true } : { text: `před ${text}`, warn: false };
}

// Sleep reads more naturally the other way round from food: "2 h po spánku"
// (stool came 2h after sleep) rather than "před 2 h" (which suggests "2h
// ago"). The warn case (sleep logged as being AFTER the stool) still flags.
function formatSleepDiffHuman(stoolDate, sleepDate) {
  const diffMs = stoolDate - sleepDate;
  const absMin = Math.round(Math.abs(diffMs) / 60000);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  const text = h > 0 ? `${h} h ${m} min` : `${m} min`;
  return diffMs < 0 ? { text: `⚠️ ${text} před spánkem`, warn: true } : { text: `${text} po spánku`, warn: false };
}

function wireDiff(stoolDateEl, stoolTimeEl, itemDateEl, itemTimeEl, diffEl, formatFn) {
  const format = formatFn || formatDiffHuman;
  function update() {
    const stoolAt = parseDateTime(stoolDateEl.value, stoolTimeEl.value);
    const itemAt = itemTimeEl.value.trim() ? parseDateTime(itemDateEl.value, itemTimeEl.value) : null;
    if (!stoolAt || !itemAt) {
      diffEl.hidden = true;
      diffEl.textContent = "";
      diffEl.classList.remove("field-row-diff--warn");
      return;
    }
    const { text, warn } = format(stoolAt, itemAt);
    diffEl.textContent = text;
    diffEl.classList.toggle("field-row-diff--warn", warn);
    diffEl.hidden = false;
  }
  [stoolDateEl, stoolTimeEl, itemDateEl, itemTimeEl].forEach((el) => el.addEventListener("input", update));
  return update;
}

// Food/sleep date+time are optional; if only the time was given, treat the
// date as missing rather than silently guessing.
function parseOptionalDateTime(dateEl, timeEl) {
  if (!timeEl.value.trim()) return { at: null, error: false };
  const at = parseDateTime(dateEl.value, timeEl.value);
  return at ? { at, error: false } : { at: null, error: true };
}

// --- storage ---

// Optional now: untouched stays unsaved (null) rather than defaulting to a
// value, so it can't be mistaken for a real answer in the overview.
function clampScale(v, max) {
  return typeof v === "number" && v >= 0 && v <= max ? v : null;
}

function loadEntries() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter(
        (e) => e && typeof e.id === "string" && typeof e.date === "string" && typeof e.at === "string" && typeof e.stoolType === "number"
      )
      .map((e) => ({
        ...e,
        stoolType: Math.min(6, Math.max(0, e.stoolType)),
        urgency: clampScale(e.urgency, 2),
        bloating: clampScale(e.bloating, 2),
        pain: clampScale(e.pain, 2),
        stress: clampScale(e.stress, 2),
        tags: Array.isArray(e.tags) ? e.tags : [],
        supplements: Array.isArray(e.supplements) ? e.supplements : [],
      }));
  } catch {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Two entries saved in the same minute tie on `at` (seconds are always :00
// here); array order is chronological (newer pushed last), so that's the
// tiebreak — otherwise Array#sort's stability would leave the older one
// first, which reads as "most recent" wherever this is used.
function sortEntriesDesc(entries) {
  return entries
    .map((e, i) => [e, i])
    .sort(([ea, ia], [eb, ib]) => new Date(eb.at) - new Date(ea.at) || ib - ia)
    .map(([e]) => e);
}

// --- elements ---

const stoolSliderEl = $("stoolSlider");
const stoolDescEl = $("stoolDesc");
const stoolDateInputEl = $("stoolDateInput");
const stoolTimeInputEl = $("stoolTimeInput");
const stoolDateTimeWrapEl = $("stoolDateTimeWrap");
const lastEntrySummaryEl = $("lastEntrySummary");
const foodDateInputEl = $("foodDateInput");
const foodTimeInputEl = $("foodTimeInput");
const foodDiffEl = $("foodDiff");
const sleepDateInputEl = $("sleepDateInput");
const sleepTimeInputEl = $("sleepTimeInput");
const sleepDiffEl = $("sleepDiff");
const tagsGridEl = $("tagsGrid");
const supplementsGridEl = $("supplementsGrid");
const urgencyGroupEl = $("urgencyGroup");
const bloatingGroupEl = $("bloatingGroup");
const painGroupEl = $("painGroup");
const stressGroupEl = $("stressGroup");
const noteInputEl = $("noteInput");
const noteToggleBtnEl = $("noteToggleBtn");
const saveBtnEl = $("saveBtn");
const formErrorEl = $("formError");

const menuBtnEl = $("menuBtn");
const menuEl = $("menu");
const showStatsBtnEl = $("showStatsBtn");
const settingsBtnEl = $("settingsBtn");
const discardBtnEl = $("discardBtn");

const statsViewEl = $("statsView");
const settingsViewEl = $("settingsView");
const statsBackEl = $("statsBack");
const settingsBackEl = $("settingsBack");

const todayAvgStatEl = $("todayAvgStat");
const yesterdayAvgStatEl = $("yesterdayAvgStat");
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
const typeHintEl = $("typeHint");

const chartTagsEl = $("chartTags");
const yAxisTagsEl = $("yAxisTags");
const tagChartLabelsEl = $("tagChartLabels");

const chartSupplementsEl = $("chartSupplements");
const yAxisSupplementsEl = $("yAxisSupplements");
const supplementChartLabelsEl = $("supplementChartLabels");

const avgUrgencyStatEl = $("avgUrgencyStat");
const avgBloatingStatEl = $("avgBloatingStat");
const avgPainStatEl = $("avgPainStat");
const avgStressStatEl = $("avgStressStat");

const chartTooltipEl = $("chartTooltip");

const correlationListEl = $("correlationList");
const historyTableEl = $("historyTable");
const historyPrevEl = $("historyPrev");
const historyNextEl = $("historyNext");
const historyPageLabelEl = $("historyPageLabel");

const editOverlayEl = $("editOverlay");
const editDateInputEl = $("editDateInput");
const editTimeInputEl = $("editTimeInput");
const editStoolSliderEl = $("editStoolSlider");
const editStoolDescEl = $("editStoolDesc");
const editFoodDateInputEl = $("editFoodDateInput");
const editFoodTimeInputEl = $("editFoodTimeInput");
const editFoodDiffEl = $("editFoodDiff");
const editSleepDateInputEl = $("editSleepDateInput");
const editSleepTimeInputEl = $("editSleepTimeInput");
const editSleepDiffEl = $("editSleepDiff");
const editTagsGridEl = $("editTagsGrid");
const editSupplementsGridEl = $("editSupplementsGrid");
const editUrgencyGroupEl = $("editUrgencyGroup");
const editBloatingGroupEl = $("editBloatingGroup");
const editPainGroupEl = $("editPainGroup");
const editStressGroupEl = $("editStressGroup");
const editNoteInputEl = $("editNoteInput");
const editFormErrorEl = $("editFormError");
const editDeleteBtnEl = $("editDeleteBtn");
const editCancelBtnEl = $("editCancelBtn");
const editSaveBtnEl = $("editSaveBtn");

const exportBtnEl = $("exportBtn");
const importInputEl = $("importInput");
const stoolLabelsEditorEl = $("stoolLabelsEditor");
const stoolLabelsResetBtnEl = $("stoolLabelsResetBtn");
const tagsEditorEl = $("tagsEditor");
const tagsEditorResetBtnEl = $("tagsEditorResetBtn");
const supplementsEditorEl = $("supplementsEditor");
const supplementsEditorResetBtnEl = $("supplementsEditorResetBtn");

// --- form: tags ---

let formTags = new Set();
let editTags = new Set();
let formSupplements = new Set();
let editSupplements = new Set();
let editingId = null;

// stacked: icon above label instead of side by side — used for supplements
// so every button is the same height regardless of label length (a plain
// side-by-side layout let the one longer label wrap onto its own second
// line while the one-letter ones stayed single-line).
function buildTagButtons(container, items, tagSet, onChange, { stacked } = {}) {
  container.innerHTML = "";
  items.forEach((tag) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = stacked ? "tag-btn tag-btn--stacked" : "tag-btn";
    if (stacked) {
      btn.innerHTML = `<span class="tag-btn-icon">${tag.emoji}</span><span class="tag-btn-label">${tag.label}</span>`;
    } else {
      btn.textContent = `${tag.emoji} ${tag.label}`;
    }
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
    if (tag.breakAfter) {
      const breaker = document.createElement("div");
      breaker.className = "tags-grid-break";
      container.appendChild(breaker);
    }
  });
}

function updateStoolDisplay(sliderEl, descEl) {
  const value = Number(sliderEl.value);
  const label = STOOL_LABELS[value];
  descEl.innerHTML = label
    ? `<span class="stool-name">${label.name}</span> <span class="stool-hint">– ${label.desc} (${value})</span>`
    : "";
}

function createChoiceState(container, labels, initial, onChange) {
  let value = initial;
  function render() {
    container.innerHTML = "";
    Object.keys(labels).forEach((key) => {
      const num = Number(key);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag-btn";
      btn.textContent = labels[key];
      if (num === value) btn.classList.add("active");
      btn.addEventListener("click", () => {
        value = num;
        render();
        if (onChange) onChange();
      });
      container.appendChild(btn);
    });
  }
  render();
  return {
    get: () => value,
    set: (v) => {
      value = v;
      render();
    },
  };
}

// initial null: an untouched scale stays unselected (and unsaved) rather
// than defaulting to a value the user never actually chose.
const urgencyChoice = createChoiceState(urgencyGroupEl, SCALE_LABELS, null);
const bloatingChoice = createChoiceState(bloatingGroupEl, SCALE_LABELS, null);
const painChoice = createChoiceState(painGroupEl, SCALE_LABELS, null);
const stressChoice = createChoiceState(stressGroupEl, SCALE_LABELS, null);
const editUrgencyChoice = createChoiceState(editUrgencyGroupEl, SCALE_LABELS, null, () => updateEditSaveState());
const editBloatingChoice = createChoiceState(editBloatingGroupEl, SCALE_LABELS, null, () => updateEditSaveState());
const editPainChoice = createChoiceState(editPainGroupEl, SCALE_LABELS, null, () => updateEditSaveState());
const editStressChoice = createChoiceState(editStressGroupEl, SCALE_LABELS, null, () => updateEditSaveState());

stoolSliderEl.addEventListener("input", () => updateStoolDisplay(stoolSliderEl, stoolDescEl));
editStoolSliderEl.addEventListener("input", () => updateStoolDisplay(editStoolSliderEl, editStoolDescEl));

// --- edit overlay: track unsaved changes ---

let editSnapshot = null;

function getEditFormState() {
  return JSON.stringify({
    date: editDateInputEl.value,
    time: editTimeInputEl.value,
    stoolType: editStoolSliderEl.value,
    urgency: editUrgencyChoice.get(),
    bloating: editBloatingChoice.get(),
    pain: editPainChoice.get(),
    foodDate: editFoodDateInputEl.value,
    foodTime: editFoodTimeInputEl.value,
    sleepDate: editSleepDateInputEl.value,
    sleepTime: editSleepTimeInputEl.value,
    tags: Array.from(editTags).sort(),
    supplements: Array.from(editSupplements).sort(),
    stress: editStressChoice.get(),
    note: editNoteInputEl.value,
  });
}

function updateEditSaveState() {
  const changed = editSnapshot !== null && getEditFormState() !== editSnapshot;
  editSaveBtnEl.disabled = !changed;
}

[
  editDateInputEl,
  editTimeInputEl,
  editStoolSliderEl,
  editFoodDateInputEl,
  editFoodTimeInputEl,
  editSleepDateInputEl,
  editSleepTimeInputEl,
  editNoteInputEl,
].forEach((el) => el.addEventListener("input", updateEditSaveState));

const updateStoolShortDate = wireDateTimeRow(stoolDateInputEl, stoolTimeInputEl);
const updateFoodShortDate = wireDateTimeRow(foodDateInputEl, foodTimeInputEl);
const updateSleepShortDate = wireDateTimeRow(sleepDateInputEl, sleepTimeInputEl);
const updateEditShortDate = wireDateTimeRow(editDateInputEl, editTimeInputEl);
const updateEditFoodShortDate = wireDateTimeRow(editFoodDateInputEl, editFoodTimeInputEl);
const updateEditSleepShortDate = wireDateTimeRow(editSleepDateInputEl, editSleepTimeInputEl);

// Food/sleep date/time is optional and starts empty — a date sitting there
// with no time doesn't mean anything, so it's only worth defaulting once the
// time is actually set (to today, the common case). Wired before wireDiff
// below so the diff calculation below sees the auto-filled date on the same
// "input" event, not one event later. Setting .value doesn't dispatch
// "input" on its own, so the short-date overlay is refreshed explicitly too.
function fillDateOnTime(dateEl, timeEl, onDateSet) {
  timeEl.addEventListener("input", () => {
    if (timeEl.value && !dateEl.value) {
      dateEl.value = dateKey(new Date());
      if (onDateSet) onDateSet();
    }
  });
}

fillDateOnTime(foodDateInputEl, foodTimeInputEl, updateFoodShortDate);
fillDateOnTime(sleepDateInputEl, sleepTimeInputEl, updateSleepShortDate);
fillDateOnTime(editFoodDateInputEl, editFoodTimeInputEl, updateEditFoodShortDate);
fillDateOnTime(editSleepDateInputEl, editSleepTimeInputEl, updateEditSleepShortDate);

const updateFormFoodDiff = wireDiff(stoolDateInputEl, stoolTimeInputEl, foodDateInputEl, foodTimeInputEl, foodDiffEl);
const updateFormSleepDiff = wireDiff(stoolDateInputEl, stoolTimeInputEl, sleepDateInputEl, sleepTimeInputEl, sleepDiffEl, formatSleepDiffHuman);
const updateEditFoodDiff = wireDiff(editDateInputEl, editTimeInputEl, editFoodDateInputEl, editFoodTimeInputEl, editFoodDiffEl);
const updateEditSleepDiff = wireDiff(editDateInputEl, editTimeInputEl, editSleepDateInputEl, editSleepTimeInputEl, editSleepDiffEl, formatSleepDiffHuman);

// window.alert() is silently inert in an installed Android PWA (standalone
// display mode) — the call returns immediately and nothing appears, so a
// validation failure looked like the Uložit button "doing nothing". Errors
// have to be shown in the page itself instead.
function showFormError(el, message) {
  el.textContent = message;
  el.hidden = false;
}

function hideFormError(el) {
  el.hidden = true;
}

// Flat comma-separated list, one entry = one line (wraps only if it has to,
// never truncated): "datum, čas (N h zpátky), typ (číslo), ikony, Stres: X,
// čas spánku".
function entrySummaryLine(entry, hoursAgo) {
  const at = new Date(entry.at);
  const stoolLabel = STOOL_LABELS[entry.stoolType];
  const foodEmoji = entry.tags.map((k) => TAGS.find((t) => t.key === k)?.emoji || "").join("");
  const suppEmoji = entry.supplements.map((k) => SUPPLEMENTS.find((s) => s.key === k)?.emoji || "").join("");
  const icons = `${foodEmoji}${suppEmoji}`;
  const parts = [
    `${formatCzechDateShort(at)}, ${formatHHMM(at)} (${hoursAgo} h zpátky)`,
    stoolLabel ? `${stoolLabel.name} (${entry.stoolType})` : null,
    icons || null,
  ];
  if (entry.stress !== null && entry.stress !== undefined) parts.push(`Stres: ${entry.stress}`);
  if (entry.sleepAt) parts.push(`🌙 ${formatHHMM(new Date(entry.sleepAt))}`);
  return parts.filter(Boolean).join(", ");
}

function renderLastEntrySummary() {
  const entries = loadEntries();
  if (!entries.length) {
    lastEntrySummaryEl.hidden = true;
    return;
  }
  const now = new Date();
  const lines = sortEntriesDesc(entries)
    .slice(0, 2)
    .map((e) => entrySummaryLine(e, Math.round((now - new Date(e.at)) / 3600000)));
  lastEntrySummaryEl.innerHTML = lines.map((line) => `<div>${line}</div>`).join("");
  lastEntrySummaryEl.hidden = false;
}

function resetForm() {
  stoolSliderEl.value = "1";
  updateStoolDisplay(stoolSliderEl, stoolDescEl);
  urgencyChoice.set(null);
  bloatingChoice.set(null);
  painChoice.set(null);
  stressChoice.set(null);
  const now = new Date();
  stoolDateInputEl.value = dateKey(now);
  stoolTimeInputEl.value = formatHHMM(now);
  updateStoolShortDate();
  foodDateInputEl.value = "";
  foodTimeInputEl.value = "";
  updateFoodShortDate();
  updateFormFoodDiff();
  sleepDateInputEl.value = "";
  sleepTimeInputEl.value = "";
  updateSleepShortDate();
  updateFormSleepDiff();
  hideFormError(formErrorEl);
  formTags = new Set();
  buildTagButtons(tagsGridEl, TAGS, formTags);
  formSupplements = new Set();
  buildTagButtons(supplementsGridEl, SUPPLEMENTS, formSupplements, null, { stacked: true });
  noteInputEl.value = "";
  noteInputEl.hidden = true;
  noteToggleBtnEl.classList.remove("active");
  renderLastEntrySummary();
}

function saveNewEntry() {
  const at = parseDateTime(stoolDateInputEl.value, stoolTimeInputEl.value);
  if (!at) {
    showFormError(formErrorEl, "Chybí datum nebo čas stolice — doplň je nahoře vedle ikony appky.");
    return;
  }
  const food = parseOptionalDateTime(foodDateInputEl, foodTimeInputEl);
  if (food.error) {
    showFormError(formErrorEl, "Chybí datum jídla — čas jídla je vyplněný, ale datum ne.");
    return;
  }
  const sleep = parseOptionalDateTime(sleepDateInputEl, sleepTimeInputEl);
  if (sleep.error) {
    showFormError(formErrorEl, "Chybí datum spánku — čas spánku je vyplněný, ale datum ne.");
    return;
  }
  hideFormError(formErrorEl);
  const entry = {
    id: `${at.toISOString()}-${Math.random().toString(36).slice(2, 7)}`,
    date: dateKey(at),
    at: at.toISOString(),
    stoolType: Number(stoolSliderEl.value),
    urgency: urgencyChoice.get(),
    bloating: bloatingChoice.get(),
    pain: painChoice.get(),
    foodAt: food.at ? food.at.toISOString() : null,
    sleepAt: sleep.at ? sleep.at.toISOString() : null,
    tags: Array.from(formTags),
    supplements: Array.from(formSupplements),
    stress: stressChoice.get(),
    note: noteInputEl.value.trim(),
  };
  const entries = loadEntries();
  entries.push(entry);
  saveEntries(entries);
  resetForm();
  openStatsView();
}

saveBtnEl.addEventListener("click", saveNewEntry);

noteToggleBtnEl.addEventListener("click", () => {
  noteInputEl.hidden = !noteInputEl.hidden;
  noteToggleBtnEl.classList.toggle("active", !noteInputEl.hidden);
  if (!noteInputEl.hidden) noteInputEl.focus();
});

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

// "Zahodit záznam" only makes sense while the main form is the visible
// screen — resetting it from inside Přehled/Nastavení would be a no-op the
// user can't even see happen.
function updateDiscardVisibility() {
  discardBtnEl.hidden = overlayStack.length > 0;
}

function openOverlay(el) {
  hideAllOverlays();
  el.hidden = false;
  overlayStack.push(el);
  history.pushState({ shitOverlay: true }, "");
  updateDiscardVisibility();
}

window.addEventListener("popstate", () => {
  overlayStack.pop();
  const previous = overlayStack[overlayStack.length - 1];
  hideAllOverlays();
  if (previous) previous.hidden = false;
  updateDiscardVisibility();
});

function goBack() {
  if (history.state && history.state.shitOverlay) {
    history.back();
  } else {
    overlayStack = [];
    hideAllOverlays();
    updateDiscardVisibility();
  }
}

statsBackEl.addEventListener("click", goBack);
settingsBackEl.addEventListener("click", goBack);

// --- stats view ---

let statsMonth = null; // {year, month} month = 0-indexed
let statsStoolFilter = null; // 0-5 or null
let historyPage = 0;

function openStatsView() {
  const now = new Date();
  statsMonth = { year: now.getFullYear(), month: now.getMonth() };
  statsStoolFilter = null;
  historyPage = 0;
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

discardBtnEl.addEventListener("click", () => {
  resetForm();
  closeMenu();
});

document.querySelectorAll("#statsView .stat[data-hint]").forEach((el) => {
  el.addEventListener("click", () => showTooltip(el, el.dataset.hint));
});

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

function renderBars(barsEl, yAxisEl, values, color, opts) {
  const { onClick, activeIndex } = opts || {};
  barsEl.innerHTML = "";
  barsEl.style.setProperty("--bar-color", color);
  barsEl.classList.toggle("has-active", activeIndex != null);
  const max = Math.max(1, ...values);
  values.forEach((v, i) => {
    const wrap = document.createElement("div");
    wrap.className = "chart-bar-wrap";
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    if (activeIndex === i) bar.classList.add("chart-bar--active");
    const pct = v <= 0 ? 0 : Math.min(100, Math.max(4, Math.round((v / max) * 100)));
    bar.style.height = `${pct}%`;
    wrap.appendChild(bar);
    if (onClick) {
      wrap.classList.add("chart-bar-wrap--clickable");
      wrap.addEventListener("click", () => onClick(i, v, wrap));
    }
    barsEl.appendChild(wrap);
  });
  yAxisEl.children[0].textContent = String(max);
  yAxisEl.children[1].textContent = "0";
}

let tooltipTimeout = null;

function showTooltip(targetEl, text) {
  const rect = targetEl.getBoundingClientRect();
  chartTooltipEl.textContent = text;
  chartTooltipEl.style.left = `${Math.min(Math.max(rect.left + rect.width / 2, 70), window.innerWidth - 70)}px`;
  chartTooltipEl.style.top = `${rect.top - 8}px`;
  chartTooltipEl.hidden = false;
  clearTimeout(tooltipTimeout);
  tooltipTimeout = setTimeout(() => {
    chartTooltipEl.hidden = true;
  }, 2500);
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

// Naléhavost/Nadýmání/Bolest/Stres are optional now, so an average only
// counts entries where that particular field was actually answered.
function avgOfField(entries, field) {
  const withValue = entries.filter((e) => e[field] !== null && e[field] !== undefined);
  return withValue.length ? (withValue.reduce((sum, e) => sum + e[field], 0) / withValue.length).toFixed(1) : "–";
}

function renderStats() {
  const entries = loadEntries();
  const { year, month } = statsMonth;

  monthLabelEl.textContent = `${MONTH_NAMES[month]} ${year}`;

  const monthEntries = entries.filter((e) => {
    const d = new Date(e.at);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  // stoolType filter (set by clicking a bar in the consistency chart) scopes
  // everything below it: stat tiles, count/day chart, tag & supplement charts
  const filterActive = statsStoolFilter !== null;
  const filteredEntries = filterActive ? entries.filter((e) => e.stoolType === statsStoolFilter) : entries;
  const filteredMonthEntries = filterActive ? monthEntries.filter((e) => e.stoolType === statsStoolFilter) : monthEntries;

  const todayEntries = filteredEntries.filter((e) => e.date === todayKey());
  todayAvgStatEl.textContent = todayEntries.length
    ? (todayEntries.reduce((sum, e) => sum + e.stoolType, 0) / todayEntries.length).toFixed(1)
    : "–";
  const yesterdayEntries = filteredEntries.filter((e) => e.date === yesterdayKey());
  yesterdayAvgStatEl.textContent = yesterdayEntries.length
    ? (yesterdayEntries.reduce((sum, e) => sum + e.stoolType, 0) / yesterdayEntries.length).toFixed(1)
    : "–";
  avgTypeStatEl.textContent = filteredMonthEntries.length
    ? (filteredMonthEntries.reduce((sum, e) => sum + e.stoolType, 0) / filteredMonthEntries.length).toFixed(1)
    : "–";
  avgUrgencyStatEl.textContent = avgOfField(filteredMonthEntries, "urgency");
  avgBloatingStatEl.textContent = avgOfField(filteredMonthEntries, "bloating");
  avgPainStatEl.textContent = avgOfField(filteredMonthEntries, "pain");
  avgStressStatEl.textContent = avgOfField(filteredMonthEntries, "stress");

  // stool consistency distribution — always shows the full month (it's the
  // filter control itself); clicking a bar toggles the filter
  const typeValues = [0, 1, 2, 3, 4, 5, 6].map((t) => monthEntries.filter((e) => e.stoolType === t).length);
  renderBars(chartTypeEl, yAxisTypeEl, typeValues, "#66bb6a", {
    activeIndex: filterActive ? statsStoolFilter : null,
    onClick: (i, v) => {
      statsStoolFilter = statsStoolFilter === i ? null : i;
      renderStats();
    },
  });
  renderLabels(typeChartLabelsEl, ["0", "1", "2", "3", "4", "5", "6"]);
  if (filterActive) {
    const filterLabel = STOOL_LABELS[statsStoolFilter];
    typeHintEl.hidden = false;
    typeHintEl.textContent = `${statsStoolFilter} – ${filterLabel.name} (${filterLabel.desc}) · ${filteredMonthEntries.length}× tento měsíc (klikni znovu pro zrušení)`;
  } else {
    typeHintEl.hidden = true;
  }

  // count per day
  const dCount = daysInMonth(year, month);
  const dayValues = [];
  const dayLabels = [];
  for (let day = 1; day <= dCount; day++) {
    const key = `${year}-${pad2(month + 1)}-${pad2(day)}`;
    dayValues.push(filteredMonthEntries.filter((e) => e.date === key).length);
    dayLabels.push(String(day));
  }
  renderBars(chartCountEl, yAxisCountEl, dayValues, "#42a5f5", {
    onClick: (i, v, el) => showTooltip(el, `${dayLabels[i]}. ${MONTH_NAMES[month].toLowerCase()}: ${v} záznamů`),
  });
  renderLabels(chartLabelsEl, dayLabels);

  // component frequency (tags expanded to underlying components, e.g. Sýry -> Tuk, Mléčné)
  const tagValues = COMPONENTS.map((c) => filteredMonthEntries.filter((e) => entryComponents(e).has(c.key)).length);
  renderBars(chartTagsEl, yAxisTagsEl, tagValues, "#ffca28", {
    onClick: (i, v, el) => showTooltip(el, `${COMPONENTS[i].emoji} ${COMPONENTS[i].label}: ${v}×`),
  });
  renderLabels(tagChartLabelsEl, COMPONENTS.map((c) => c.emoji));

  // supplement frequency
  const supplementValues = SUPPLEMENTS.map((s) => filteredMonthEntries.filter((e) => e.supplements.includes(s.key)).length);
  renderBars(chartSupplementsEl, yAxisSupplementsEl, supplementValues, "#ab47bc", {
    onClick: (i, v, el) => showTooltip(el, `${SUPPLEMENTS[i].emoji} ${SUPPLEMENTS[i].label}: ${v}×`),
  });
  renderLabels(supplementChartLabelsEl, SUPPLEMENTS.map((s) => s.emoji));

  renderCorrelation(entries);
  renderHistoryTable(entries);
}

function renderCorrelation(entries) {
  correlationListEl.innerHTML = "";
  const rows = [];
  COMPONENTS.forEach((component) => {
    const withTag = entries.filter((e) => entryComponents(e).has(component.key));
    const withoutTag = entries.filter((e) => !entryComponents(e).has(component.key));
    if (withTag.length < 3 || withoutTag.length === 0) return;
    const avgWith = withTag.reduce((s, e) => s + e.stoolType, 0) / withTag.length;
    const avgWithout = withoutTag.reduce((s, e) => s + e.stoolType, 0) / withoutTag.length;
    rows.push({ tag: component, avgWith, avgWithout, count: withTag.length, diff: avgWith - avgWithout });
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

const HISTORY_PAGE_SIZE = 15;

function renderHistoryTable(entries) {
  historyTableEl.innerHTML = "";
  if (!entries.length) {
    const p = document.createElement("div");
    p.className = "history-empty";
    p.textContent = "Zatím žádné záznamy.";
    historyTableEl.appendChild(p);
    historyPageLabelEl.textContent = "";
    historyPrevEl.disabled = true;
    historyNextEl.disabled = true;
    return;
  }
  const sorted = sortEntriesDesc(entries);
  const totalPages = Math.max(1, Math.ceil(sorted.length / HISTORY_PAGE_SIZE));
  historyPage = Math.min(historyPage, totalPages - 1);
  const start = historyPage * HISTORY_PAGE_SIZE;
  const pageItems = sorted.slice(start, start + HISTORY_PAGE_SIZE);
  pageItems.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "history-row";
    const d = new Date(entry.at);
    const tagsText = entry.tags.map((key) => TAGS.find((t) => t.key === key)?.emoji || "").join(" ");
    const foodHint = entry.foodAt ? ` · 🍽️ ${formatDiffHuman(d, new Date(entry.foodAt)).text}` : "";
    const sleepHint = entry.sleepAt ? ` · 🌙 ${formatSleepDiffHuman(d, new Date(entry.sleepAt)).text}` : "";
    row.innerHTML = `
      <span class="history-datetime">${formatCzechDate(d)} ${formatHHMM(d)}</span>
      <span class="history-type">${entry.stoolType}</span>
      <span class="history-tags">${tagsText}${entry.note ? " · " + entry.note : ""}${foodHint}${sleepHint}</span>
    `;
    row.addEventListener("click", () => openEdit(entry));
    historyTableEl.appendChild(row);
  });
  historyPageLabelEl.textContent = `${historyPage + 1} / ${totalPages}`;
  historyPrevEl.disabled = historyPage === 0;
  historyNextEl.disabled = historyPage >= totalPages - 1;
}

historyPrevEl.addEventListener("click", () => {
  historyPage -= 1;
  renderHistoryTable(loadEntries());
});

historyNextEl.addEventListener("click", () => {
  historyPage += 1;
  renderHistoryTable(loadEntries());
});

// --- edit overlay ---

function openEdit(entry) {
  editingId = entry.id;
  const d = new Date(entry.at);
  editDateInputEl.value = dateKey(d);
  editTimeInputEl.value = formatHHMM(d);
  updateEditShortDate();
  editStoolSliderEl.value = String(entry.stoolType);
  updateStoolDisplay(editStoolSliderEl, editStoolDescEl);
  editUrgencyChoice.set(entry.urgency);
  editBloatingChoice.set(entry.bloating);
  editPainChoice.set(entry.pain);
  editStressChoice.set(entry.stress);
  if (entry.foodAt) {
    const fd = new Date(entry.foodAt);
    editFoodDateInputEl.value = dateKey(fd);
    editFoodTimeInputEl.value = formatHHMM(fd);
  } else {
    editFoodDateInputEl.value = "";
    editFoodTimeInputEl.value = "";
  }
  updateEditFoodShortDate();
  updateEditFoodDiff();
  if (entry.sleepAt) {
    const sd = new Date(entry.sleepAt);
    editSleepDateInputEl.value = dateKey(sd);
    editSleepTimeInputEl.value = formatHHMM(sd);
  } else {
    editSleepDateInputEl.value = "";
    editSleepTimeInputEl.value = "";
  }
  updateEditSleepShortDate();
  updateEditSleepDiff();
  editTags = new Set(entry.tags);
  buildTagButtons(editTagsGridEl, TAGS, editTags, updateEditSaveState);
  editSupplements = new Set(entry.supplements);
  buildTagButtons(editSupplementsGridEl, SUPPLEMENTS, editSupplements, updateEditSaveState, { stacked: true });
  editNoteInputEl.value = entry.note || "";
  editOverlayEl.hidden = false;
  editSnapshot = getEditFormState();
  updateEditSaveState();
  hideFormError(editFormErrorEl);
  resetDeleteArmed();
}

function closeEdit() {
  editOverlayEl.hidden = true;
  editingId = null;
  editSnapshot = null;
}

editCancelBtnEl.addEventListener("click", closeEdit);

editSaveBtnEl.addEventListener("click", () => {
  const dateParsed = parseDateInputValue(editDateInputEl.value);
  const timeParsed = parseTimeInputValue(editTimeInputEl.value);
  if (!dateParsed) {
    showFormError(editFormErrorEl, "Chybí datum stolice.");
    return;
  }
  if (!timeParsed) {
    showFormError(editFormErrorEl, "Chybí čas stolice.");
    return;
  }
  const at = new Date(dateParsed.year, dateParsed.month - 1, dateParsed.day, timeParsed.h, timeParsed.m, 0);
  const food = parseOptionalDateTime(editFoodDateInputEl, editFoodTimeInputEl);
  if (food.error) {
    showFormError(editFormErrorEl, "Chybí datum jídla — čas jídla je vyplněný, ale datum ne.");
    return;
  }
  const sleep = parseOptionalDateTime(editSleepDateInputEl, editSleepTimeInputEl);
  if (sleep.error) {
    showFormError(editFormErrorEl, "Chybí datum spánku — čas spánku je vyplněný, ale datum ne.");
    return;
  }
  hideFormError(editFormErrorEl);
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
    urgency: editUrgencyChoice.get(),
    bloating: editBloatingChoice.get(),
    pain: editPainChoice.get(),
    foodAt: food.at ? food.at.toISOString() : null,
    sleepAt: sleep.at ? sleep.at.toISOString() : null,
    tags: Array.from(editTags),
    supplements: Array.from(editSupplements),
    stress: editStressChoice.get(),
    note: editNoteInputEl.value.trim(),
  };
  saveEntries(entries);
  closeEdit();
  renderStats();
  renderLastEntrySummary();
});

// window.confirm() is silently inert in an installed Android PWA, same as
// alert() — a delete guarded only by confirm() could otherwise go through
// (or silently never trigger) with no visible prompt at all. Two taps here
// instead of a dialog works everywhere.
let deleteArmed = false;

function resetDeleteArmed() {
  deleteArmed = false;
  editDeleteBtnEl.textContent = "Smazat";
}

editDeleteBtnEl.addEventListener("click", () => {
  if (!deleteArmed) {
    deleteArmed = true;
    editDeleteBtnEl.textContent = "Opravdu smazat?";
    return;
  }
  const entries = loadEntries().filter((e) => e.id !== editingId);
  saveEntries(entries);
  closeEdit();
  renderStats();
  renderLastEntrySummary();
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

// Each row is one text input "Název; popis" — parsed on change so typing
// doesn't fight with re-rendering on every keystroke.
function refreshStoolDescs() {
  updateStoolDisplay(stoolSliderEl, stoolDescEl);
  updateStoolDisplay(editStoolSliderEl, editStoolDescEl);
}

function renderStoolLabelsEditor() {
  stoolLabelsEditorEl.innerHTML = "";
  for (let i = 0; i <= 6; i++) {
    const row = document.createElement("div");
    row.className = "stool-label-row";

    const num = document.createElement("span");
    num.className = "stool-label-num";
    num.textContent = String(i);

    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-field-input stool-label-input";
    input.value = `${STOOL_LABELS[i].name}; ${STOOL_LABELS[i].desc}`;
    input.addEventListener("change", () => {
      const [namePart, ...rest] = input.value.split(";");
      const name = namePart.trim() || DEFAULT_STOOL_LABELS[i].name;
      const desc = rest.join(";").trim();
      STOOL_LABELS[i] = { name, desc };
      saveStoolLabels(STOOL_LABELS);
      input.value = `${name}; ${desc}`;
      refreshStoolDescs();
    });

    row.appendChild(num);
    row.appendChild(input);
    stoolLabelsEditorEl.appendChild(row);
  }
}

stoolLabelsResetBtnEl.addEventListener("click", () => {
  STOOL_LABELS = { ...DEFAULT_STOOL_LABELS };
  localStorage.removeItem(STOOL_LABELS_KEY);
  renderStoolLabelsEditor();
  refreshStoolDescs();
});

renderStoolLabelsEditor();

// Re-renders the already-built grids (main form + edit overlay) after a
// food-tag/supplement edit — buildTagButtons() is normally only called once
// at reset/open time, so without this an edit wouldn't show up until then.
function refreshTagButtons() {
  buildTagButtons(tagsGridEl, TAGS, formTags);
  buildTagButtons(supplementsGridEl, SUPPLEMENTS, formSupplements, null, { stacked: true });
  buildTagButtons(editTagsGridEl, TAGS, editTags, updateEditSaveState);
  buildTagButtons(editSupplementsGridEl, SUPPLEMENTS, editSupplements, updateEditSaveState, { stacked: true });
}

// One input per item, "ikona; název; popis" — same one-line-per-item pattern
// as the stool-consistency editor above, with an extra leading icon field.
// key/breakAfter aren't editable here (see loadEditableItems), so tag
// identity and grid row grouping stay stable regardless of what's typed.
function renderItemsEditor(containerEl, items, storageKey, defaults) {
  containerEl.innerHTML = "";
  items.forEach((item, i) => {
    const row = document.createElement("div");
    row.className = "stool-label-row";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "edit-field-input stool-label-input";
    input.value = `${item.emoji}; ${item.label}; ${item.desc}`;
    input.addEventListener("change", () => {
      const [emojiPart, namePart, ...rest] = input.value.split(";");
      const emoji = (emojiPart || "").trim() || defaults[i].emoji;
      const label = (namePart || "").trim() || defaults[i].label;
      const desc = rest.join(";").trim();
      items[i] = { ...items[i], emoji, label, desc };
      saveEditableItems(storageKey, items);
      input.value = `${emoji}; ${label}; ${desc}`;
      refreshTagButtons();
    });

    row.appendChild(input);
    containerEl.appendChild(row);
  });
}

function renderTagsEditor() {
  renderItemsEditor(tagsEditorEl, TAGS, TAGS_KEY, DEFAULT_TAGS);
}

function renderSupplementsEditor() {
  renderItemsEditor(supplementsEditorEl, SUPPLEMENTS, SUPPLEMENTS_KEY, DEFAULT_SUPPLEMENTS);
}

tagsEditorResetBtnEl.addEventListener("click", () => {
  TAGS = DEFAULT_TAGS.map((t) => ({ ...t }));
  localStorage.removeItem(TAGS_KEY);
  renderTagsEditor();
  refreshTagButtons();
});

supplementsEditorResetBtnEl.addEventListener("click", () => {
  SUPPLEMENTS = DEFAULT_SUPPLEMENTS.map((s) => ({ ...s }));
  localStorage.removeItem(SUPPLEMENTS_KEY);
  renderSupplementsEditor();
  refreshTagButtons();
});

renderTagsEditor();
renderSupplementsEditor();

// --- init ---

resetForm();

const menuVersionInfoEl = $("menuVersionInfo");
if (menuVersionInfoEl && window.BUILD_INFO) {
  const { sha, time } = window.BUILD_INFO;
  const timeText = time ? new Date(time).toLocaleString("cs-CZ") : "lokální vývoj";
  menuVersionInfoEl.textContent = `verze ${sha} · build ${timeText}`;
}
