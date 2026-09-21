const STORAGE_KEY = "shit-app-entries";

const STOOL_LABELS = {
  1: "Tvarovaná – pevná, normální",
  2: "Měkká – drží tvar",
  3: "Kašovitá – nedrží tvar",
  4: "Řídká – málo pevné složky",
  5: "Vodnatá – jen tekutina",
};

const URGENCY_LABELS = { 1: "Normální", 2: "Naléhavá", 3: "Velmi naléhavá" };
const BLOATING_LABELS = { 1: "Žádné", 2: "Mírné", 3: "Výrazné" };
const PAIN_LABELS = { 1: "Žádné", 2: "Mírné", 3: "Výrazné" };
const STRESS_LABELS = { 1: "Žádný", 2: "Mírný", 3: "Střední", 4: "Vysoký", 5: "Velmi vysoký" };

// Tags on the entry screen are food items (fast to recognize & tap).
// Internally each maps to one or more underlying components, so charts and
// correlations can still group e.g. "fat" or "gas-inducing" across different
// foods instead of tracking every food item as an isolated bucket.
const TAGS = [
  { key: "syry", emoji: "🧀", label: "Sýry" },
  { key: "mlecne", emoji: "🥛", label: "Mléčné" },
  { key: "uzeniny", emoji: "🍖", label: "Uzeniny" },
  { key: "smazene", emoji: "🍟", label: "Smažené" },
  { key: "sladke", emoji: "🍫", label: "Sladké" },
  { key: "palive", emoji: "🌶️", label: "Pálivé" },
  { key: "cibule", emoji: "🧅", label: "Cibule" },
  { key: "nakladane", emoji: "🫙", label: "Nakládané" },
  { key: "kofein", emoji: "☕", label: "Kofein" },
  { key: "neobvykle", emoji: "➕", label: "Neobvyklé" },
];

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
  neobvykle: ["neobvykle"],
};

const COMPONENTS = [
  { key: "tuk", emoji: "🧈", label: "Tuk" },
  { key: "mlecne", emoji: "🥛", label: "Mléčné" },
  { key: "sul", emoji: "🧂", label: "Sůl" },
  { key: "smazene", emoji: "🍟", label: "Smažené" },
  { key: "sladke", emoji: "🍫", label: "Sladké" },
  { key: "palive", emoji: "🌶️", label: "Pálivé" },
  { key: "nadymave", emoji: "💨", label: "Nadýmavé" },
  { key: "kofein", emoji: "☕", label: "Kofein" },
  { key: "neobvykle", emoji: "➕", label: "Neobvyklé" },
];

function entryComponents(entry) {
  const set = new Set();
  (entry.tags || []).forEach((tagKey) => TAG_COMPONENTS[tagKey].forEach((c) => set.add(c)));
  return set;
}

const SUPPLEMENTS = [
  { key: "c", emoji: "🍊", label: "C" },
  { key: "mg", emoji: "🥜", label: "Mg" },
  { key: "zn", emoji: "🦪", label: "Zn" },
  { key: "d", emoji: "☀️", label: "D" },
  { key: "b", emoji: "⚡", label: "B" },
  { key: "e", emoji: "🫒", label: "E" },
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

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dateKey(d);
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

function parseDateTime(dateText, timeText) {
  const d = parseCzechDate(dateText);
  const t = parse24Time(timeText);
  if (!d || !t) return null;
  return new Date(d.year, d.month - 1, d.day, t.h, t.m, 0);
}

function formatDiffHuman(stoolDate, foodDate) {
  const diffMs = stoolDate - foodDate;
  const absMin = Math.round(Math.abs(diffMs) / 60000);
  const h = Math.floor(absMin / 60);
  const m = absMin % 60;
  const text = h > 0 ? `${h} h ${m} min` : `${m} min`;
  return diffMs < 0 ? { text: `⚠️ jídlo je ${text} PO stolici`, warn: true } : { text: `jedl jsi ${text} před stolicí`, warn: false };
}

function wireFoodDiff(stoolDateEl, stoolTimeEl, foodDateEl, foodTimeEl, diffEl) {
  function update() {
    const stoolAt = parseDateTime(stoolDateEl.value, stoolTimeEl.value);
    const foodAt = foodTimeEl.value.trim() ? parseDateTime(foodDateEl.value, foodTimeEl.value) : null;
    if (!stoolAt || !foodAt) {
      diffEl.hidden = true;
      diffEl.textContent = "";
      diffEl.classList.remove("food-diff--warn");
      return;
    }
    const { text, warn } = formatDiffHuman(stoolAt, foodAt);
    diffEl.textContent = text;
    diffEl.classList.toggle("food-diff--warn", warn);
    diffEl.hidden = false;
  }
  [stoolDateEl, stoolTimeEl, foodDateEl, foodTimeEl].forEach((el) => el.addEventListener("input", update));
  return update;
}

// --- storage ---

function clampScale(v, max) {
  return v >= 1 && v <= max ? v : 1;
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
        stoolType: Math.min(5, Math.max(1, e.stoolType)),
        urgency: clampScale(e.urgency, 3),
        bloating: clampScale(e.bloating, 3),
        pain: clampScale(e.pain, 3),
        stress: clampScale(e.stress, 5),
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

// --- elements ---

const stoolSliderEl = $("stoolSlider");
const stoolDescEl = $("stoolDesc");
const stoolDateInputEl = $("stoolDateInput");
const stoolTimeInputEl = $("stoolTimeInput");
const foodDateInputEl = $("foodDateInput");
const foodTimeInputEl = $("foodTimeInput");
const foodDiffEl = $("foodDiff");
const tagsGridEl = $("tagsGrid");
const supplementsGridEl = $("supplementsGrid");
const urgencyGroupEl = $("urgencyGroup");
const bloatingGroupEl = $("bloatingGroup");
const painGroupEl = $("painGroup");
const stressSliderEl = $("stressSlider");
const stressDescEl = $("stressDesc");
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
const editTagsGridEl = $("editTagsGrid");
const editSupplementsGridEl = $("editSupplementsGrid");
const editUrgencyGroupEl = $("editUrgencyGroup");
const editBloatingGroupEl = $("editBloatingGroup");
const editPainGroupEl = $("editPainGroup");
const editStressSliderEl = $("editStressSlider");
const editStressDescEl = $("editStressDesc");
const editNoteInputEl = $("editNoteInput");
const editDeleteBtnEl = $("editDeleteBtn");
const editCancelBtnEl = $("editCancelBtn");
const editSaveBtnEl = $("editSaveBtn");

const exportBtnEl = $("exportBtn");
const importInputEl = $("importInput");

// --- form: tags ---

let formTags = new Set();
let editTags = new Set();
let formSupplements = new Set();
let editSupplements = new Set();
let editingId = null;

function buildTagButtons(container, items, tagSet, onChange) {
  container.innerHTML = "";
  items.forEach((tag) => {
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

function updateStoolDisplay(sliderEl, descEl) {
  descEl.textContent = STOOL_LABELS[Number(sliderEl.value)] || "";
}

function updateScaleDesc(sliderEl, descEl, labels) {
  descEl.textContent = labels[Number(sliderEl.value)] || "";
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

const urgencyChoice = createChoiceState(urgencyGroupEl, URGENCY_LABELS, 1);
const bloatingChoice = createChoiceState(bloatingGroupEl, BLOATING_LABELS, 1);
const painChoice = createChoiceState(painGroupEl, PAIN_LABELS, 1);
const editUrgencyChoice = createChoiceState(editUrgencyGroupEl, URGENCY_LABELS, 1, () => updateEditSaveState());
const editBloatingChoice = createChoiceState(editBloatingGroupEl, BLOATING_LABELS, 1, () => updateEditSaveState());
const editPainChoice = createChoiceState(editPainGroupEl, PAIN_LABELS, 1, () => updateEditSaveState());

stoolSliderEl.addEventListener("input", () => updateStoolDisplay(stoolSliderEl, stoolDescEl));
editStoolSliderEl.addEventListener("input", () => updateStoolDisplay(editStoolSliderEl, editStoolDescEl));

stressSliderEl.addEventListener("input", () => updateScaleDesc(stressSliderEl, stressDescEl, STRESS_LABELS));
editStressSliderEl.addEventListener("input", () => updateScaleDesc(editStressSliderEl, editStressDescEl, STRESS_LABELS));

stoolTimeInputEl.addEventListener("input", liveColonFormat);
foodTimeInputEl.addEventListener("input", liveColonFormat);
editTimeInputEl.addEventListener("input", liveColonFormat);
editFoodTimeInputEl.addEventListener("input", liveColonFormat);

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
    tags: Array.from(editTags).sort(),
    supplements: Array.from(editSupplements).sort(),
    stress: editStressSliderEl.value,
    note: editNoteInputEl.value,
  });
}

function updateEditSaveState() {
  const changed = editSnapshot !== null && getEditFormState() !== editSnapshot;
  editSaveBtnEl.disabled = !changed;
}

[editDateInputEl, editTimeInputEl, editStoolSliderEl, editFoodDateInputEl, editFoodTimeInputEl, editStressSliderEl, editNoteInputEl].forEach((el) =>
  el.addEventListener("input", updateEditSaveState)
);

const updateFormFoodDiff = wireFoodDiff(stoolDateInputEl, stoolTimeInputEl, foodDateInputEl, foodTimeInputEl, foodDiffEl);
const updateEditFoodDiff = wireFoodDiff(editDateInputEl, editTimeInputEl, editFoodDateInputEl, editFoodTimeInputEl, editFoodDiffEl);

function resetForm() {
  stoolSliderEl.value = "1";
  updateStoolDisplay(stoolSliderEl, stoolDescEl);
  urgencyChoice.set(1);
  bloatingChoice.set(1);
  painChoice.set(1);
  stressSliderEl.value = "1";
  updateScaleDesc(stressSliderEl, stressDescEl, STRESS_LABELS);
  const now = new Date();
  stoolDateInputEl.value = formatCzechDate(now);
  stoolTimeInputEl.value = formatHHMM(now);
  foodDateInputEl.value = formatCzechDate(now);
  foodTimeInputEl.value = "";
  updateFormFoodDiff();
  formTags = new Set();
  buildTagButtons(tagsGridEl, TAGS, formTags);
  formSupplements = new Set();
  buildTagButtons(supplementsGridEl, SUPPLEMENTS, formSupplements);
  noteInputEl.value = "";
}

function saveNewEntry() {
  const at = parseDateTime(stoolDateInputEl.value, stoolTimeInputEl.value);
  if (!at) {
    alert("Neplatné datum nebo čas stolice.");
    return;
  }
  let foodAt = null;
  if (foodTimeInputEl.value.trim()) {
    foodAt = parseDateTime(foodDateInputEl.value, foodTimeInputEl.value);
    if (!foodAt) {
      alert("Neplatné datum nebo čas jídla.");
      return;
    }
  }
  const entry = {
    id: `${at.toISOString()}-${Math.random().toString(36).slice(2, 7)}`,
    date: dateKey(at),
    at: at.toISOString(),
    stoolType: Number(stoolSliderEl.value),
    urgency: urgencyChoice.get(),
    bloating: bloatingChoice.get(),
    pain: painChoice.get(),
    foodAt: foodAt ? foodAt.toISOString() : null,
    tags: Array.from(formTags),
    supplements: Array.from(formSupplements),
    stress: Number(stressSliderEl.value),
    note: noteInputEl.value.trim(),
  };
  const entries = loadEntries();
  entries.push(entry);
  saveEntries(entries);
  resetForm();
  openStatsView();
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
let statsStoolFilter = null; // 1-5 or null
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
  avgUrgencyStatEl.textContent = filteredMonthEntries.length
    ? (filteredMonthEntries.reduce((sum, e) => sum + e.urgency, 0) / filteredMonthEntries.length).toFixed(1)
    : "–";
  avgBloatingStatEl.textContent = filteredMonthEntries.length
    ? (filteredMonthEntries.reduce((sum, e) => sum + e.bloating, 0) / filteredMonthEntries.length).toFixed(1)
    : "–";
  avgPainStatEl.textContent = filteredMonthEntries.length
    ? (filteredMonthEntries.reduce((sum, e) => sum + e.pain, 0) / filteredMonthEntries.length).toFixed(1)
    : "–";
  avgStressStatEl.textContent = filteredMonthEntries.length
    ? (filteredMonthEntries.reduce((sum, e) => sum + e.stress, 0) / filteredMonthEntries.length).toFixed(1)
    : "–";

  // stool consistency distribution — always shows the full month (it's the
  // filter control itself); clicking a bar toggles the filter
  const typeValues = [1, 2, 3, 4, 5].map((t) => monthEntries.filter((e) => e.stoolType === t).length);
  renderBars(chartTypeEl, yAxisTypeEl, typeValues, "#66bb6a", {
    activeIndex: filterActive ? statsStoolFilter - 1 : null,
    onClick: (i, v) => {
      const clicked = i + 1;
      statsStoolFilter = statsStoolFilter === clicked ? null : clicked;
      renderStats();
    },
  });
  renderLabels(typeChartLabelsEl, ["1", "2", "3", "4", "5"]);
  if (filterActive) {
    typeHintEl.hidden = false;
    typeHintEl.textContent = `${statsStoolFilter} – ${STOOL_LABELS[statsStoolFilter]} · ${filteredMonthEntries.length}× tento měsíc (klikni znovu pro zrušení)`;
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
  renderLabels(supplementChartLabelsEl, SUPPLEMENTS.map((s) => s.label));

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
  const sorted = [...entries].sort((a, b) => new Date(b.at) - new Date(a.at));
  const totalPages = Math.max(1, Math.ceil(sorted.length / HISTORY_PAGE_SIZE));
  historyPage = Math.min(historyPage, totalPages - 1);
  const start = historyPage * HISTORY_PAGE_SIZE;
  const pageItems = sorted.slice(start, start + HISTORY_PAGE_SIZE);
  pageItems.forEach((entry) => {
    const row = document.createElement("div");
    row.className = "history-row";
    const d = new Date(entry.at);
    const tagsText = entry.tags.map((key) => TAGS.find((t) => t.key === key)?.emoji || "").join(" ");
    const foodHint = entry.foodAt ? ` · ${formatDiffHuman(d, new Date(entry.foodAt)).text}` : "";
    row.innerHTML = `
      <span class="history-datetime">${formatCzechDate(d)} ${formatHHMM(d)}</span>
      <span class="history-type">${entry.stoolType}</span>
      <span class="history-tags">${tagsText}${entry.note ? " · " + entry.note : ""}${foodHint}</span>
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
  editDateInputEl.value = formatCzechDate(d);
  editTimeInputEl.value = formatHHMM(d);
  editStoolSliderEl.value = String(entry.stoolType);
  updateStoolDisplay(editStoolSliderEl, editStoolDescEl);
  editUrgencyChoice.set(entry.urgency);
  editBloatingChoice.set(entry.bloating);
  editPainChoice.set(entry.pain);
  editStressSliderEl.value = String(entry.stress);
  updateScaleDesc(editStressSliderEl, editStressDescEl, STRESS_LABELS);
  if (entry.foodAt) {
    const fd = new Date(entry.foodAt);
    editFoodDateInputEl.value = formatCzechDate(fd);
    editFoodTimeInputEl.value = formatHHMM(fd);
  } else {
    editFoodDateInputEl.value = "";
    editFoodTimeInputEl.value = "";
  }
  updateEditFoodDiff();
  editTags = new Set(entry.tags);
  buildTagButtons(editTagsGridEl, TAGS, editTags, updateEditSaveState);
  editSupplements = new Set(entry.supplements);
  buildTagButtons(editSupplementsGridEl, SUPPLEMENTS, editSupplements, updateEditSaveState);
  editNoteInputEl.value = entry.note || "";
  editOverlayEl.hidden = false;
  editSnapshot = getEditFormState();
  updateEditSaveState();
}

function closeEdit() {
  editOverlayEl.hidden = true;
  editingId = null;
  editSnapshot = null;
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
  let foodAt = null;
  if (editFoodTimeInputEl.value.trim()) {
    foodAt = parseDateTime(editFoodDateInputEl.value, editFoodTimeInputEl.value);
    if (!foodAt) {
      alert("Neplatné datum nebo čas jídla.");
      return;
    }
  }
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
    foodAt: foodAt ? foodAt.toISOString() : null,
    tags: Array.from(editTags),
    supplements: Array.from(editSupplements),
    stress: Number(editStressSliderEl.value),
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

// --- init ---

resetForm();

const buildFooterEl = $("buildFooter");
if (buildFooterEl && window.BUILD_INFO) {
  const { sha, time } = window.BUILD_INFO;
  const timeText = time ? new Date(time).toLocaleString("cs-CZ") : "lokální vývoj";
  buildFooterEl.textContent = `verze ${sha} · build ${timeText}`;
}
