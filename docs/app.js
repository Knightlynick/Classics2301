(() => {
const STORAGE_KEY = "cs2301-study-state-v4";
const {
  guideSections,
  glossaryIndex,
  noLectureWeeks,
  priorityDeck,
  quizQuestions,
  readingDossiers,
  studyPath,
  timeline,
  weekModules
} = window.STUDY_DATA;

const weekById = new Map(weekModules.map((module) => [module.id, module]));
const readingById = new Map(readingDossiers.map((reading) => [reading.id, reading]));
const glossaryById = new Map(glossaryIndex.map((entry) => [entry.id, entry]));
const glossaryLabelMap = buildGlossaryLabelMap(glossaryIndex);

const appState = loadState();
const runtime = {
  currentQuiz: null,
  lastQuizResult: null,
  pendingScrollTarget: null,
  coarsePointer: window.matchMedia("(hover: none), (pointer: coarse)").matches
};

const elements = {
  heroStats: document.querySelector("#heroStats"),
  recentAttempts: document.querySelector("#recentAttempts"),
  studyPath: document.querySelector("#studyPath"),
  priorityDeck: document.querySelector("#priorityDeck"),
  coreThemes: document.querySelector("#coreThemes"),
  archiveNotes: document.querySelector("#archiveNotes"),
  bookmarkList: document.querySelector("#bookmarkList"),
  timelineRail: document.querySelector("#timelineRail"),
  views: [...document.querySelectorAll(".view-panel")],
  navButtons: [...document.querySelectorAll(".nav-btn")],
  weekFilterSelect: document.querySelector("#weekFilterSelect"),
  weekPrioritySelect: document.querySelector("#weekPrioritySelect"),
  weekModules: document.querySelector("#weekModules"),
  readingFilterSelect: document.querySelector("#readingFilterSelect"),
  readingIndex: document.querySelector("#readingIndex"),
  readingDetail: document.querySelector("#readingDetail"),
  glossarySearchInput: document.querySelector("#glossarySearchInput"),
  glossaryFamilySelect: document.querySelector("#glossaryFamilySelect"),
  glossaryList: document.querySelector("#glossaryList"),
  glossaryInspector: document.querySelector("#glossaryInspector"),
  modeSelect: document.querySelector("#modeSelect"),
  weekField: document.querySelector("#weekField"),
  weekSelect: document.querySelector("#weekSelect"),
  glossaryScopeField: document.querySelector("#glossaryScopeField"),
  glossaryScopeSelect: document.querySelector("#glossaryScopeSelect"),
  countSelect: document.querySelector("#countSelect"),
  startQuizBtn: document.querySelector("#startQuizBtn"),
  quizStats: document.querySelector("#quizStats"),
  quizContent: document.querySelector("#quizContent"),
  guideSearchInput: document.querySelector("#guideSearchInput"),
  guideSearchResults: document.querySelector("#guideSearchResults"),
  guideOutline: document.querySelector("#guideOutline"),
  guideContent: document.querySelector("#guideContent"),
  glossaryHoverCard: document.querySelector("#glossaryHoverCard")
};

init();

function init() {
  populateControls();
  bindEvents();
  renderHeroStats();
  renderStartView();
  renderWeeksView();
  renderReadingsView();
  renderGlossaryView();
  renderQuizStats();
  renderQuizView();
  renderGuideView();
  toggleQuizFields();
  switchView(appState.settings.view, false);
  registerServiceWorker();
}

function loadState() {
  const fallback = {
    version: 4,
    history: [],
    bookmarks: [],
    reviewed: [],
    settings: {
      view: "startView",
      weekFilter: "all",
      weekPriority: "all",
      readingFamily: "all",
      selectedReadingId: readingDossiers[0]?.id || "",
      selectedReadingSectionId: readingDossiers[0]?.sections?.[0]?.id || "",
      selectedReadingPassageId: readingDossiers[0]?.sections?.[0]?.passages?.[0]?.id || "",
      glossarySearch: "",
      glossaryFamily: "all",
      selectedGlossaryId: glossaryIndex[0]?.id || "",
      guideSearch: "",
      mode: "final_mix",
      week: "Week 10",
      glossaryScope: "mixed",
      count: 20
    }
  };

  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!parsed) {
      return fallback;
    }

    return {
      version: 4,
      history: Array.isArray(parsed.history) ? parsed.history : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      reviewed: Array.isArray(parsed.reviewed) ? parsed.reviewed : [],
      settings: {
        ...fallback.settings,
        ...(parsed.settings || {})
      }
    };
  } catch (error) {
    console.warn("Could not load saved study state.", error);
    return fallback;
  }
}

function getReadingSection(reading, sectionId) {
  return (reading?.sections || []).find((section) => section.id === sectionId) || null;
}

function getReadingPassage(section, passageId) {
  return (section?.passages || []).find((passage) => passage.id === passageId) || null;
}

function syncReadingSelection(reading, sectionId, passageId) {
  const sections = reading?.sections || [];
  const selectedSection = getReadingSection(reading, sectionId) || sections[0] || null;
  const selectedPassage =
    getReadingPassage(selectedSection, passageId) || selectedSection?.passages?.[0] || null;

  appState.settings.selectedReadingSectionId = selectedSection?.id || "";
  appState.settings.selectedReadingPassageId = selectedPassage?.id || "";

  return {
    section: selectedSection,
    passage: selectedPassage
  };
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (error) {
    console.warn("Could not save study state.", error);
  }
}

function populateControls() {
  elements.weekSelect.innerHTML = weekModules
    .filter((module) => module.hasLectureContent)
    .map((module) => `<option value="${module.week}">${module.week}</option>`)
    .join("");

  elements.weekFilterSelect.innerHTML = [
    ["all", "All weeks"],
    ["bridge", "Bridge / theory"],
    ["greek", "Greek weeks"],
    ["roman", "Roman weeks"]
  ]
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");

  elements.weekPrioritySelect.innerHTML = [
    ["all", "All priorities"],
    ["foundation", "Foundation"],
    ["high", "High"],
    ["roman-heavy", "Roman-heavy"],
    ["reference", "Reference gaps"]
  ]
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");

  elements.readingFilterSelect.innerHTML = [
    ["all", "All readings"],
    ["greek", "Greek readings"],
    ["roman", "Roman readings"]
  ]
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");

  elements.glossaryFamilySelect.innerHTML = [
    ["all", "All terms"],
    ["greek", "Greek terms"],
    ["roman", "Roman terms"]
  ]
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");

  elements.modeSelect.value = appState.settings.mode;
  elements.weekSelect.value = appState.settings.week;
  elements.glossaryScopeSelect.value = appState.settings.glossaryScope;
  elements.countSelect.value = String(appState.settings.count);
  elements.weekFilterSelect.value = appState.settings.weekFilter;
  elements.weekPrioritySelect.value = appState.settings.weekPriority;
  elements.readingFilterSelect.value = appState.settings.readingFamily;
  elements.glossarySearchInput.value = appState.settings.glossarySearch;
  elements.glossaryFamilySelect.value = appState.settings.glossaryFamily;
  elements.guideSearchInput.value = appState.settings.guideSearch;
}

function bindEvents() {
  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("change", handleDocumentChange);
  document.addEventListener("input", handleDocumentInput);
  elements.startQuizBtn.addEventListener("click", startQuiz);
  document.addEventListener("mouseover", handleGlossaryPointerIn);
  document.addEventListener("mouseout", handleGlossaryPointerOut);
  document.addEventListener("focusin", handleGlossaryFocusIn);
  document.addEventListener("focusout", handleGlossaryFocusOut);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      hideGlossaryHoverCard();
    }
  });
  window.addEventListener("resize", hideGlossaryHoverCard);
  window.addEventListener("scroll", () => {
    if (!elements.glossaryHoverCard.classList.contains("is-pinned")) {
      hideGlossaryHoverCard();
    }
  });
}

function buildGlossaryLabelMap(entries) {
  const map = new Map();

  entries.forEach((entry) => {
    [entry.term, ...(entry.aliases || [])].forEach((label) => {
      const normalized = String(label || "").toLowerCase().trim();
      if (normalized && !map.has(normalized)) {
        map.set(normalized, entry.id);
      }
    });
  });

  return map;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dedupeStrings(values) {
  return [...new Set((values || []).filter(Boolean).map((value) => String(value).trim()))];
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function weightedSelection(items, count) {
  return [...items]
    .map((item) => ({
      item,
      key: Math.pow(Math.random(), 1 / (item.weight || 1))
    }))
    .sort((left, right) => right.key - left.key)
    .slice(0, count)
    .map((entry) => entry.item);
}

function materializeQuizQuestion(question) {
  const choices = shuffle([
    { label: question.correctAnswer, correct: true },
    ...question.distractors.map((choice) => ({ label: choice, correct: false }))
  ]);

  return {
    ...question,
    choices: choices.map((choice) => choice.label),
    correctIndex: choices.findIndex((choice) => choice.correct)
  };
}

function modeLabel(settings) {
  if (settings.mode === "week_practice") {
    return `${settings.week} practice`;
  }
  if (settings.mode === "glossary_drill") {
    return settings.glossaryScope === "mixed"
      ? "Mixed glossary drill"
      : `${settings.glossaryScope[0].toUpperCase()}${settings.glossaryScope.slice(1)} glossary drill`;
  }
  if (settings.mode === "cumulative") {
    return "Cumulative review";
  }
  return "Final Exam Mix";
}

function parseStructuredCards(markdown) {
  if (!markdown) {
    return [];
  }

  const lines = cleanSectionHeading(markdown).split(/\r?\n/);
  const cards = [];
  let current = null;

  for (const line of lines) {
    const headingMatch = /^###\s+(.+)$/.exec(line.trim());
    if (headingMatch) {
      if (current) {
        current.body = current.body.trim();
        cards.push(current);
      }
      current = {
        title: headingMatch[1].replace(/^\d+\.\s*/, "").trim(),
        body: ""
      };
      continue;
    }

    if (current) {
      current.body += `${line}\n`;
    }
  }

  if (current) {
    current.body = current.body.trim();
    cards.push(current);
  }

  return cards;
}

function renderInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function renderTable(lines) {
  const rows = lines
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) =>
      line
        .split("|")
        .map((cell) => cell.trim())
        .filter(Boolean)
    );

  const header = rows[0] || [];
  const body = rows.slice(2);

  return `
    <div class="table-wrap" data-glossary-scope>
      <table>
        <thead>
          <tr>${header.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${body
            .map(
              (row) => `
                <tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join("")}</tr>
              `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderList(items, ordered) {
  const tag = ordered ? "ol" : "ul";
  return `
    <${tag} data-glossary-scope>
      ${items
        .map((item) => `<li>${renderInlineMarkdown(item).replace(/\n/g, "<br>")}</li>`)
        .join("")}
    </${tag}>
  `;
}

function collectListItems(lines, startIndex, ordered) {
  const pattern = ordered ? /^\d+\.\s+/ : /^[-*+]\s+/;
  const items = [];
  let index = startIndex;
  let current = "";

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) {
        current += "\n";
      }
      index += 1;
      continue;
    }

    if (pattern.test(trimmed)) {
      if (current) {
        items.push(current.trim());
      }
      current = trimmed.replace(pattern, "");
      index += 1;
      continue;
    }

    if (/^\s{2,}/.test(line) || /^\t+/.test(line)) {
      current += ` ${trimmed}`;
      index += 1;
      continue;
    }

    break;
  }

  if (current) {
    items.push(current.trim());
  }

  return { items, nextIndex: index };
}

function markdownToHtml(markdown) {
  const lines = String(markdown || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .split(/\r?\n/);
  const html = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      index += 1;
      continue;
    }

    const headingMatch = /^(#{2,6})\s+(.+)$/.exec(line);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length + 1, 6);
      const title = headingMatch[2].trim();
      const id = slugify(title);
      html.push(`<h${level} id="${id}">${renderInlineMarkdown(title)}</h${level}>`);
      index += 1;
      continue;
    }

    if (line.startsWith("|") && lines[index + 1]?.includes("---")) {
      const tableLines = [rawLine, lines[index + 1]];
      index += 2;
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index]);
        index += 1;
      }
      html.push(renderTable(tableLines));
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const { items, nextIndex } = collectListItems(lines, index, false);
      html.push(renderList(items, false));
      index = nextIndex;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const { items, nextIndex } = collectListItems(lines, index, true);
      html.push(renderList(items, true));
      index = nextIndex;
      continue;
    }

    if (line.startsWith(">")) {
      const quoteLines = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      html.push(`<blockquote data-glossary-scope><p>${renderInlineMarkdown(quoteLines.join(" "))}</p></blockquote>`);
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length) {
      const nextLine = lines[index].trim();
      if (
        !nextLine ||
        /^#{2,6}\s+/.test(nextLine) ||
        /^[-*+]\s+/.test(nextLine) ||
        /^\d+\.\s+/.test(nextLine) ||
        nextLine.startsWith(">") ||
        (nextLine.startsWith("|") && lines[index + 1]?.includes("---"))
      ) {
        break;
      }
      paragraphLines.push(nextLine);
      index += 1;
    }
    html.push(`<p data-glossary-scope>${renderInlineMarkdown(paragraphLines.join(" "))}</p>`);
  }

  return html.join("");
}

function getProgressSummary() {
  const totals = appState.history.reduce(
    (accumulator, entry) => {
      accumulator.correct += entry.correct;
      accumulator.total += entry.total;
      return accumulator;
    },
    { correct: 0, total: 0 }
  );

  return {
    attempts: appState.history.length,
    accuracy: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0,
    reviewed: appState.reviewed.length,
    bookmarks: appState.bookmarks.length
  };
}

function switchView(viewId, persist = true) {
  appState.settings.view = viewId;
  elements.views.forEach((view) => {
    view.classList.toggle("is-hidden", view.id !== viewId);
  });
  elements.navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.target === viewId);
  });
  if (persist) {
    saveState();
  }
  if (runtime.pendingScrollTarget) {
    requestAnimationFrame(() => {
      document.getElementById(runtime.pendingScrollTarget)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
      runtime.pendingScrollTarget = null;
    });
  }
}

function toggleKey(list, key) {
  const index = list.indexOf(key);
  if (index >= 0) {
    list.splice(index, 1);
  } else {
    list.push(key);
  }
}

function isBookmarked(key) {
  return appState.bookmarks.includes(key);
}

function isReviewed(key) {
  return appState.reviewed.includes(key);
}

function targetToAction(target) {
  if (!target) {
    return "";
  }

  if (target.type === "view") {
    return `data-action="switch-view" data-target="${target.id}"`;
  }

  if (target.type === "week") {
    return `data-action="open-week" data-id="${target.id}"`;
  }

  if (target.type === "reading") {
    return `data-action="open-reading" data-id="${target.id}"`;
  }

  if (target.type === "glossary") {
    return `data-action="open-glossary" data-id="${target.id}"`;
  }

  if (target.type === "guide") {
    return `data-action="open-guide-section" data-id="${target.id}"`;
  }

  return "";
}

function renderTargetButtons(targets) {
  return targets
    .map((targetId) => {
      const module = weekById.get(targetId);
      if (!module) {
        return "";
      }
      return `<button class="chip-button" type="button" data-action="open-week" data-id="${module.id}">${escapeHtml(
        module.week
      )}</button>`;
    })
    .join("");
}

function renderBookmarkButton(key) {
  return `
    <button
      class="icon-btn ${isBookmarked(key) ? "is-active" : ""}"
      type="button"
      aria-label="${isBookmarked(key) ? "Remove bookmark" : "Add bookmark"}"
      data-action="toggle-bookmark"
      data-key="${key}"
    >
      ${isBookmarked(key) ? "Saved" : "Save"}
    </button>
  `;
}

function renderReviewedButton(key) {
  return `
    <button
      class="icon-btn ${isReviewed(key) ? "is-active" : ""}"
      type="button"
      aria-label="${isReviewed(key) ? "Mark as not reviewed" : "Mark reviewed"}"
      data-action="toggle-reviewed"
      data-key="${key}"
    >
      ${isReviewed(key) ? "Reviewed" : "Mark Reviewed"}
    </button>
  `;
}

function renderHeroStats() {
  const summary = getProgressSummary();
  elements.heroStats.innerHTML = `
    <div class="stat-chip"><strong>${summary.attempts}</strong><span>quiz attempts</span></div>
    <div class="stat-chip"><strong>${summary.accuracy}%</strong><span>accuracy</span></div>
    <div class="stat-chip"><strong>${summary.reviewed}</strong><span>review marks</span></div>
    <div class="stat-chip"><strong>${summary.bookmarks}</strong><span>bookmarks</span></div>
  `;
}

function renderStartView() {
  const coreThemeCards = parseStructuredCards(
    guideSections.overviewSections.find((section) => section.title === "Core Themes You Should See Everywhere")?.markdown || ""
  );

  elements.studyPath.innerHTML = studyPath
    .map(
      (step) => `
        <article class="stack-card">
          <h3>${escapeHtml(step.title)}</h3>
          <p>${escapeHtml(step.description)}</p>
          <button class="ghost-btn" type="button" ${targetToAction(step.target)}>Open</button>
        </article>
      `
    )
    .join("");

  elements.priorityDeck.innerHTML = priorityDeck
    .map(
      (item) => `
        <article class="stack-card">
          <div class="surface-header">
            <h3>${escapeHtml(item.label)}</h3>
          </div>
          <p>${escapeHtml(item.description)}</p>
          <div class="chip-row">${renderTargetButtons(item.targets)}</div>
        </article>
      `
    )
    .join("");

  elements.coreThemes.innerHTML = coreThemeCards
    .map(
      (card) => `
        <article class="theme-card" data-glossary-scope>
          <h3>${escapeHtml(card.title)}</h3>
          <div>${markdownToHtml(card.body)}</div>
        </article>
      `
    )
    .join("");

  elements.archiveNotes.innerHTML = noLectureWeeks
    .map((weekId) => {
      const module = weekById.get(weekId);
      return `
        <article class="stack-card">
          <h3>${escapeHtml(module.week)}</h3>
          <p>${escapeHtml(module.summary)}</p>
          <button class="ghost-btn" type="button" data-action="open-week" data-id="${module.id}">See Note</button>
        </article>
      `;
    })
    .join("");

  elements.timelineRail.innerHTML = timeline
    .map(
      (entry) => `
        <button class="timeline-card ${entry.era}" type="button" ${targetToAction(entry.target)}>
          <span class="timeline-era">${escapeHtml(entry.era)}</span>
          <strong>${escapeHtml(entry.label)}</strong>
          <span>${escapeHtml(entry.detail)}</span>
        </button>
      `
    )
    .join("");

  elements.bookmarkList.innerHTML = renderBookmarkList();
  elements.recentAttempts.innerHTML = renderRecentAttempts();

  annotateGlossary(elements.coreThemes);
}

function renderBookmarkList() {
  if (!appState.bookmarks.length) {
    return `<p class="empty-note">Bookmark weeks, readings, glossary terms, or guide sections to build a custom cram list.</p>`;
  }

  return appState.bookmarks
    .map((key) => {
      const [kind, id] = key.split(":");
      if (kind === "week") {
        const module = weekById.get(id);
        return module
          ? `<article class="stack-card"><h3>${escapeHtml(module.week)}</h3><p>${escapeHtml(
              module.shortTitle
            )}</p><button class="ghost-btn" type="button" data-action="open-week" data-id="${module.id}">Open</button></article>`
          : "";
      }

      if (kind === "reading") {
        const reading = readingById.get(id);
        return reading
          ? `<article class="stack-card"><h3>${escapeHtml(reading.shortTitle)}</h3><p>${escapeHtml(
              reading.summary
            )}</p><button class="ghost-btn" type="button" data-action="open-reading" data-id="${reading.id}">Open</button></article>`
          : "";
      }

      if (kind === "glossary") {
        const term = glossaryById.get(id);
        return term
          ? `<article class="stack-card"><h3>${escapeHtml(term.term)}</h3><p>${escapeHtml(
              term.definition
            )}</p><button class="ghost-btn" type="button" data-action="open-glossary" data-id="${term.id}">Open</button></article>`
          : "";
      }

      if (kind === "guide") {
        const section = guideSections.topLevelSections.find((entry) => entry.id === id);
        return section
          ? `<article class="stack-card"><h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(
              section.preview
            )}</p><button class="ghost-btn" type="button" data-action="open-guide-section" data-id="${section.id}">Open</button></article>`
          : "";
      }

      return "";
    })
    .join("");
}

function renderRecentAttempts() {
  const latest = appState.history.slice(0, 6);
  if (!latest.length) {
    return `<p class="empty-note">No quiz attempts yet. Start with the final mix or a Roman-heavy week module.</p>`;
  }

  return latest
    .map((entry) => {
      const timestamp = new Date(entry.date).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });

      return `
        <article class="stack-card">
          <h3>${escapeHtml(entry.label)}</h3>
          <p>${escapeHtml(`${entry.correct} / ${entry.total} correct`)} · ${timestamp}</p>
        </article>
      `;
    })
    .join("");
}

function renderWeeksView() {
  const modules = weekModules.filter((module) => {
    const familyMatch = appState.settings.weekFilter === "all" || module.family === appState.settings.weekFilter;
    const priorityMatch =
      appState.settings.weekPriority === "all" || module.priority === appState.settings.weekPriority;
    return familyMatch && priorityMatch;
  });

  elements.weekModules.innerHTML = modules
    .map((module) => renderWeekModule(module))
    .join("");

  annotateGlossary(elements.weekModules);
}

function renderWeekModule(module) {
  const bookmarkKey = `week:${module.id}`;
  const reviewedKey = `week:${module.id}`;
  const badgeClass = slugify(module.priority);
  const bridgeMarkup = module.isBridgeWeek
    ? `
      <div class="bridge-banner" data-glossary-scope>
        <strong>Bridge Week</strong>
        <p>${escapeHtml(
          module.bridgeSummary ||
            "No standalone lecture script survives in the local archive for this week, so the guide uses it as a structured synthesis and transition module."
        )}</p>
      </div>
    `
    : "";
  const conceptsMarkup = module.concepts.length
    ? `
      <details class="detail-panel">
        <summary>Concept Bubbles</summary>
        <div class="mini-grid" data-glossary-scope>
          ${module.concepts
            .map(
              (concept) => `
                <article class="mini-card">
                  <h4>${escapeHtml(concept.term)}</h4>
                  <p><strong>Meaning:</strong> ${escapeHtml(concept.meaning)}</p>
                  <p><strong>Why it matters:</strong> ${escapeHtml(concept.significance)}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </details>
    `
    : "";

  const topicMarkup = module.topics?.length
    ? `
      <details class="detail-panel">
        <summary>Topic Breakdown</summary>
        <div class="stack-list">
          ${module.topics
            .map(
              (topic) => `
                <article class="stack-card" data-glossary-scope>
                  <h4>${escapeHtml(topic.title)}</h4>
                  <p>${escapeHtml(topic.summary)}</p>
                  <div class="chip-row">${(topic.terms || [])
                    .slice(0, 6)
                    .map((term) => `<span class="term-chip">${escapeHtml(term)}</span>`)
                    .join("")}</div>
                </article>
              `
            )
            .join("")}
        </div>
      </details>
    `
    : "";

  const passageMarkup = module.passages.length
    ? `
      <details class="detail-panel">
        <summary>Passages</summary>
        <div class="stack-list">
          ${module.passages
            .map(
              (passage) => `
                <article class="quote-card" data-glossary-scope>
                  <strong>${escapeHtml(passage.citation)}</strong>
                  <p>${escapeHtml(passage.excerpt || passage.quote || "")}</p>
                  <p class="muted">${escapeHtml(passage.note || passage.analysis || "")}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </details>
    `
    : "";

  const comparisonMarkup = (module.comparisonTakeaways || module.comparisons || []).length
    ? `
      <details class="detail-panel">
        <summary>Comparison Lens</summary>
        <div class="stack-list">
          ${(module.comparisonTakeaways || module.comparisons || [])
            .map(
              (comparison) => `
                <article class="stack-card" data-glossary-scope>
                  <h4>${escapeHtml(comparison.term || comparison.ancient || "Comparison")}</h4>
                  <p>${escapeHtml(comparison.meaning || comparison.ancient || "")}</p>
                  ${
                    comparison.modern
                      ? `<p><strong>Modern parallel:</strong> ${escapeHtml(comparison.modern)}</p>`
                      : ""
                  }
                  <p class="muted">${escapeHtml(comparison.significance || "")}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </details>
    `
    : module.comparisonLens
      ? `
        <details class="detail-panel">
          <summary>Comparison Lens</summary>
          <div class="stack-card" data-glossary-scope>
            <p>${escapeHtml(module.comparisonLens)}</p>
          </div>
        </details>
      `
      : "";

  const examAdviceMarkup = module.examAdvice
    ? `
      <details class="detail-panel">
        <summary>${module.isBridgeWeek ? "Bridge Checklist" : "Study Questions in Prose"}</summary>
        <div class="stack-card" data-glossary-scope>
          <p>${escapeHtml(module.examAdvice)}</p>
        </div>
      </details>
    `
    : "";

  return `
    <article class="surface module-card" id="${module.id}">
      <div class="surface-header">
        <div>
          <p class="section-kicker">${escapeHtml(module.week)}</p>
          <h3>${escapeHtml(module.shortTitle)}</h3>
        </div>
        <div class="button-row">
          <span class="priority-badge ${badgeClass}">${escapeHtml(module.priority)}</span>
          ${renderBookmarkButton(bookmarkKey)}
          ${renderReviewedButton(reviewedKey)}
        </div>
      </div>
      <p class="module-headline">${escapeHtml(module.headline || module.summary)}</p>
      <div class="chip-row">${(module.themes || [])
        .map((theme) => `<span class="term-chip">${escapeHtml(theme)}</span>`)
        .join("")}</div>
      ${bridgeMarkup}
      <div class="module-grid">
        <div class="panel-card" data-glossary-scope>
          <h4>${module.isBridgeWeek ? "Bridge Thesis" : "Lecture Thesis"}</h4>
          <p>${escapeHtml(module.lectureThesis)}</p>
        </div>
        <div class="panel-card" data-glossary-scope>
          <h4>Why It Matters</h4>
          <p>${escapeHtml(module.whyItMatters)}</p>
        </div>
        ${
          module.historicalContext
            ? `
              <div class="panel-card" data-glossary-scope>
                <h4>${module.isBridgeWeek ? "Review Frame" : "Historical Context"}</h4>
                <p>${escapeHtml(module.historicalContext)}</p>
              </div>
            `
            : `
              <div class="panel-card" data-glossary-scope>
                <h4>Chronology</h4>
                <ul>${module.chronology.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
              </div>
            `
        }
        <div class="panel-card" data-glossary-scope>
          <h4>${module.sourceFrame ? "Source Frame" : "Exam Trap"}</h4>
          <p>${escapeHtml(module.sourceFrame || module.examTrap)}</p>
        </div>
        <div class="panel-card" data-glossary-scope>
          <h4>${module.isBridgeWeek ? "Exam Trap" : "Exam Trap"}</h4>
          <p>${escapeHtml(module.examTrap)}</p>
        </div>
      </div>
      <div class="surface-subgrid">
        <div class="panel-card" data-glossary-scope>
          <h4>Key Terms</h4>
          <div class="chip-row">${module.keyTerms
            .map((term) => {
              const glossaryId = glossaryById.has(slugify(term)) ? slugify(term) : "";
              return glossaryId
                ? `<button class="term-chip interactive" type="button" data-action="open-glossary" data-id="${glossaryId}">${escapeHtml(term)}</button>`
                : `<span class="term-chip">${escapeHtml(term)}</span>`;
            })
            .join("")}</div>
        </div>
        <div class="panel-card">
          <h4>Self-Check</h4>
          <ul data-glossary-scope>${module.selfCheck.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>
      </div>
      <div class="button-row">
        ${module.relatedReadings
          .map(
            (reading) => `<button class="ghost-btn" type="button" data-action="open-reading" data-id="${reading.id}">Open ${escapeHtml(reading.shortTitle)}</button>`
          )
          .join("")}
        ${module.guideSectionId
          ? `<button class="ghost-btn" type="button" data-action="open-guide-section" data-id="${module.guideSectionId}">Open Guide Section</button>`
          : ""}
      </div>
      ${conceptsMarkup}
      ${comparisonMarkup}
      ${examAdviceMarkup}
      ${topicMarkup}
      ${passageMarkup}
    </article>
  `;
}

function renderReadingSourceCards(reading) {
  return (reading.sourceProvenance || [])
    .map(
      (source) => `
        <article class="stack-card reading-source-card">
          <h4>${escapeHtml(source.label)}</h4>
          <p>${escapeHtml(source.note || "")}</p>
          ${
            source.url
              ? `<a class="ghost-btn" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Open Source</a>`
              : ""
          }
        </article>
      `
    )
    .join("");
}

function renderReadingsView() {
  const filteredReadings = readingDossiers.filter(
    (reading) => appState.settings.readingFamily === "all" || reading.family === appState.settings.readingFamily
  );

  if (!filteredReadings.some((reading) => reading.id === appState.settings.selectedReadingId)) {
    appState.settings.selectedReadingId = filteredReadings[0]?.id || "";
  }

  elements.readingIndex.innerHTML = filteredReadings
    .map(
      (reading) => `
        <button
          class="index-card ${reading.id === appState.settings.selectedReadingId ? "is-active" : ""}"
          type="button"
          data-action="open-reading"
          data-id="${reading.id}"
        >
          <span class="timeline-era">${escapeHtml(reading.family)}</span>
          <strong>${escapeHtml(reading.shortTitle)}</strong>
          <span>${escapeHtml(reading.summary)}</span>
          <span class="reading-index-meta">${escapeHtml(
            reading.fullTextAvailable ? "Public-domain text available" : "Commentary and guided excerpts"
          )}</span>
        </button>
      `
    )
    .join("");

  const reading = readingById.get(appState.settings.selectedReadingId) || filteredReadings[0];
  if (!reading) {
    elements.readingDetail.innerHTML = `<p class="empty-note">No reading dossier matches the current filter.</p>`;
    return;
  }

  const { section, passage } = syncReadingSelection(
    reading,
    appState.settings.selectedReadingSectionId,
    appState.settings.selectedReadingPassageId
  );

  const bookmarkKey = `reading:${reading.id}`;
  const reviewedKey = `reading:${reading.id}`;
  const sectionButtons = (reading.sections || [])
    .map(
      (entry) => `
        <button
          class="chip-button ${entry.id === section?.id ? "is-active" : ""}"
          type="button"
          data-action="open-reading-section"
          data-id="${reading.id}"
          data-section-id="${entry.id}"
        >
          ${escapeHtml(entry.label)}
        </button>
      `
    )
    .join("");

  const relatedTermButtons = dedupeStrings(section?.relatedTerms || reading.relatedTerms || [])
    .map((term) => {
      const glossaryId = glossaryById.has(slugify(term)) ? slugify(term) : "";
      return glossaryId
        ? `<button class="chip-button" type="button" data-action="open-glossary" data-id="${glossaryId}">${escapeHtml(
            term
          )}</button>`
        : `<span class="term-chip">${escapeHtml(term)}</span>`;
    })
    .join("");

  const passageButtons = (section?.passages || [])
    .map(
      (entry) => `
        <button
          class="index-card ${entry.id === passage?.id ? "is-active" : ""}"
          type="button"
          data-action="open-reading-passage"
          data-id="${reading.id}"
          data-section-id="${section?.id || ""}"
          data-passage-id="${entry.id}"
        >
          <strong>${escapeHtml(entry.citation)}</strong>
          <span>${escapeHtml(entry.context || entry.analysis || "")}</span>
        </button>
      `
    )
    .join("");

  elements.readingDetail.innerHTML = `
    <div class="surface-header">
      <div>
        <p class="section-kicker">${escapeHtml(reading.week)}</p>
        <h3>${escapeHtml(reading.title)}</h3>
      </div>
      <div class="button-row">
        <span class="priority-badge ${reading.fullTextAvailable ? "foundation" : "reference"}">${
          reading.fullTextAvailable ? "public-domain text" : "guided commentary"
        }</span>
        ${renderBookmarkButton(bookmarkKey)}
        ${renderReviewedButton(reviewedKey)}
      </div>
    </div>
    <p class="module-headline">${escapeHtml(reading.summary)}</p>
    <div class="chip-row">${reading.themes
      .map((theme) => `<span class="term-chip">${escapeHtml(theme)}</span>`)
      .join("")}</div>
    <div class="reading-meta">
      <div><strong>Author</strong><span>${escapeHtml(reading.author)}</span></div>
      <div><strong>Date</strong><span>${escapeHtml(reading.date)}</span></div>
      <div><strong>Location</strong><span>${escapeHtml(reading.location)}</span></div>
      <div><strong>Language</strong><span>${escapeHtml(reading.language)}</span></div>
    </div>
    <div class="module-grid">
      <div class="panel-card" data-glossary-scope>
        <h4>Why This Reading Matters</h4>
        <p>${escapeHtml(reading.whyItMatters)}</p>
      </div>
      <div class="panel-card" data-glossary-scope>
        <h4>Reader Note</h4>
        <p>${escapeHtml(reading.readerNote || reading.courseRole || "")}</p>
      </div>
      <div class="panel-card">
        <h4>Key Questions</h4>
        <ul data-glossary-scope>${reading.keyQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
      <div class="panel-card" data-glossary-scope>
        <h4>Course Role</h4>
        <p>${escapeHtml(reading.courseRole)}</p>
      </div>
    </div>
    <div class="surface-header reading-subhead">
      <h4>Source Provenance</h4>
    </div>
    <div class="stack-list reading-source-list">
      ${renderReadingSourceCards(reading)}
    </div>
    <div class="surface-header reading-subhead">
      <h4>Section Map</h4>
    </div>
    <div class="chip-row reading-section-map">
      ${sectionButtons || `<p class="empty-note">No section map available for this reading yet.</p>`}
    </div>
    ${
      section
        ? `
          <div class="reading-section-layout">
            <article class="panel-card reading-section-card" data-glossary-scope>
              <p class="section-kicker">${escapeHtml(section.span || "Reading movement")}</p>
              <h4>${escapeHtml(section.label)}</h4>
              <p>${escapeHtml(section.summary)}</p>
              <p><strong>Study note:</strong> ${escapeHtml(section.note || "")}</p>
              <p><strong>Why it matters:</strong> ${escapeHtml(section.whyItMatters || "")}</p>
              ${relatedTermButtons ? `<div class="chip-row">${relatedTermButtons}</div>` : ""}
            </article>
            <div class="reading-passage-column">
              <div class="surface-header reading-subhead">
                <h4>Passage Map</h4>
              </div>
              <div class="stack-list reading-passage-list">
                ${passageButtons || `<p class="empty-note">No passages are mapped for this section yet.</p>`}
              </div>
              ${
                passage
                  ? `
                    <article class="quote-card reading-passage-detail" data-glossary-scope>
                      <strong>${escapeHtml(passage.citation)}</strong>
                      <p>${escapeHtml(passage.quote || "")}</p>
                      <p><strong>Context:</strong> ${escapeHtml(passage.context || "")}</p>
                      <p><strong>Analysis:</strong> ${escapeHtml(passage.analysis || "")}</p>
                    </article>
                  `
                  : ""
              }
            </div>
          </div>
        `
        : `
          <div class="stack-list">
            ${reading.excerpts
              .map(
                (excerpt) => `
                  <article class="quote-card" data-glossary-scope>
                    <strong>${escapeHtml(excerpt.citation)}</strong>
                    <p>${escapeHtml(excerpt.quote)}</p>
                    <p><strong>Context:</strong> ${escapeHtml(excerpt.context)}</p>
                    <p><strong>Analysis:</strong> ${escapeHtml(excerpt.analysis)}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        `
    }
    <div class="button-row">
      ${reading.relatedWeekIds
        .map((weekId) => {
          const module = weekById.get(weekId);
          return module
            ? `<button class="ghost-btn" type="button" data-action="open-week" data-id="${module.id}">Open ${escapeHtml(
                module.week
              )}</button>`
            : "";
        })
        .join("")}
      ${(reading.sourceProvenance || [])
        .filter((source) => source.url)
        .map(
          (source) =>
            `<a class="ghost-btn" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">Open ${escapeHtml(
              source.label
            )}</a>`
        )
        .join("")}
    </div>
  `;

  annotateGlossary(elements.readingDetail);
}

function renderGlossaryView() {
  const query = appState.settings.glossarySearch.trim().toLowerCase();
  const filteredTerms = glossaryIndex.filter((entry) => {
    const familyMatch = appState.settings.glossaryFamily === "all" || entry.family === appState.settings.glossaryFamily;
    const searchMatch = !query || entry.searchText.toLowerCase().includes(query);
    return familyMatch && searchMatch;
  });

  if (!filteredTerms.some((entry) => entry.id === appState.settings.selectedGlossaryId)) {
    appState.settings.selectedGlossaryId = filteredTerms[0]?.id || "";
  }

  elements.glossaryList.innerHTML = filteredTerms.length
    ? filteredTerms
        .map(
          (entry) => `
            <button
              class="glossary-row ${entry.id === appState.settings.selectedGlossaryId ? "is-active" : ""}"
              type="button"
              data-action="open-glossary"
              data-id="${entry.id}"
            >
              <strong>${escapeHtml(entry.term)}</strong>
              <span>${escapeHtml(entry.definition)}</span>
            </button>
          `
        )
        .join("")
    : `<p class="empty-note">No terms match the current filter.</p>`;

  const term = glossaryById.get(appState.settings.selectedGlossaryId) || filteredTerms[0];
  if (!term) {
    elements.glossaryInspector.innerHTML = `<p class="empty-note">Choose a term to inspect it.</p>`;
    return;
  }

  const bookmarkKey = `glossary:${term.id}`;
  elements.glossaryInspector.innerHTML = `
    <div class="surface-header">
      <div>
        <p class="section-kicker">${escapeHtml(term.family)}</p>
        <h3>${escapeHtml(term.term)}</h3>
      </div>
      <div class="button-row">${renderBookmarkButton(bookmarkKey)}</div>
    </div>
    <p data-glossary-scope>${escapeHtml(term.definition)}</p>
    ${term.aliases.length ? `<p class="muted"><strong>Aliases:</strong> ${escapeHtml(term.aliases.join(", "))}</p>` : ""}
    <p class="muted"><strong>Source:</strong> ${escapeHtml(term.sourceRef)}</p>
    <div class="panel-card">
      <h4>Related Weeks</h4>
      <div class="chip-row">${term.relatedWeekIds
        .map((weekId) => {
          const module = weekById.get(weekId);
          return module
            ? `<button class="chip-button" type="button" data-action="open-week" data-id="${module.id}">${escapeHtml(
                module.week
              )}</button>`
            : "";
        })
        .join("")}</div>
    </div>
    <div class="panel-card">
      <h4>Related Readings</h4>
      <div class="chip-row">${term.relatedReadingIds
        .map((readingId) => {
          const reading = readingById.get(readingId);
          return reading
            ? `<button class="chip-button" type="button" data-action="open-reading" data-id="${reading.id}">${escapeHtml(
                reading.shortTitle
              )}</button>`
            : "";
        })
        .join("")}</div>
    </div>
  `;
}

function renderGuideView() {
  const query = appState.settings.guideSearch.trim().toLowerCase();
  const results = guideSections.searchIndex.filter((section) => {
    if (!query) {
      return true;
    }
    return (
      section.title.toLowerCase().includes(query) ||
      section.preview.toLowerCase().includes(query) ||
      section.text.toLowerCase().includes(query)
    );
  });

  elements.guideSearchResults.innerHTML = results
    .slice(0, 14)
    .map(
      (result) => `
        <button class="index-card" type="button" data-action="open-guide-section" data-id="${result.id}">
          <strong>${escapeHtml(result.title)}</strong>
          <span>${escapeHtml(result.preview)}</span>
        </button>
      `
    )
    .join("");

  elements.guideOutline.innerHTML = guideSections.topLevelSections
    .map(
      (section) => `
        <button class="outline-link" type="button" data-action="open-guide-section" data-id="${section.id}">
          ${escapeHtml(section.title)}
        </button>
      `
    )
    .join("");

  elements.guideContent.innerHTML = guideSections.topLevelSections
    .map(
      (section) => `
        <section class="guide-section" id="${section.id}">
          <div class="surface-header">
            <h3>${escapeHtml(section.title)}</h3>
            <div class="button-row">
              ${renderBookmarkButton(`guide:${section.id}`)}
            </div>
          </div>
          <div class="guide-copy">${markdownToHtml(cleanSectionHeading(section.markdown))}</div>
        </section>
      `
    )
    .join("");

  annotateGlossary(elements.guideContent);
}

function renderQuizStats() {
  const summary = getProgressSummary();
  elements.quizStats.innerHTML = `
    <div class="stat-chip"><strong>${summary.attempts}</strong><span>sets</span></div>
    <div class="stat-chip"><strong>${summary.accuracy}%</strong><span>overall</span></div>
  `;
}

function renderQuizView() {
  const quiz = runtime.currentQuiz;

  if (!quiz && !runtime.lastQuizResult) {
    elements.quizContent.innerHTML = `
      <div class="quiz-empty">
        <p class="section-kicker">Ready when you are</p>
        <h3>No quiz running</h3>
        <p>Build a set on the left, then use the feedback box to jump back into the related week, reading, or glossary review.</p>
      </div>
    `;
    return;
  }

  if (!quiz && runtime.lastQuizResult) {
    const result = runtime.lastQuizResult;
    elements.quizContent.innerHTML = `
      <div class="quiz-empty">
        <p class="section-kicker">${escapeHtml(result.label)}</p>
        <h3>${escapeHtml(`${result.correct} / ${result.total} correct`)}</h3>
        <div class="stack-list">
          ${result.wrongAnswers.length
            ? result.wrongAnswers
                .map(
                  (entry) => `
                    <article class="stack-card">
                      <strong>${escapeHtml(entry.prompt)}</strong>
                      <p>${escapeHtml(`Correct answer: ${entry.correctAnswer}`)}</p>
                      <div class="button-row">${renderStudyLinks(entry.studyRef)}</div>
                    </article>
                  `
                )
                .join("")
            : `<p class="empty-note">No misses in the last set.</p>`}
        </div>
      </div>
    `;
    return;
  }

  const question = quiz.questions[quiz.index];
  const progress = Math.round(((quiz.index + (quiz.answered ? 1 : 0)) / quiz.questions.length) * 100);

  elements.quizContent.innerHTML = `
    <div class="quiz-active">
      <div class="surface-header">
        <div>
          <p class="section-kicker">${escapeHtml(modeLabel(quiz.settings))}</p>
          <h3>${escapeHtml(`Question ${quiz.index + 1} of ${quiz.questions.length}`)}</h3>
        </div>
        <div class="score-chip">${escapeHtml(`${quiz.score} correct`)}</div>
      </div>
      <div class="progress-rail"><div class="progress-bar" style="width:${progress}%"></div></div>
      <p class="muted">${escapeHtml(`${question.week} · ${question.topic} · ${question.sourceRef}`)}</p>
      <h4 class="question-title">${escapeHtml(question.prompt)}</h4>
      <div class="answer-list">
        ${question.choices
          .map(
            (choice, index) => `
              <button
                class="answer-btn ${quiz.answered && index === question.correctIndex ? "is-correct" : ""} ${
                  quiz.answered && quiz.selectedIndex === index && index !== question.correctIndex ? "is-wrong" : ""
                }"
                type="button"
                data-action="answer-question"
                data-index="${index}"
                ${quiz.answered ? "disabled" : ""}
              >
                <strong>${String.fromCharCode(65 + index)}.</strong> ${escapeHtml(choice)}
              </button>
            `
          )
          .join("")}
      </div>
      ${
        quiz.answered
          ? `
            <div class="feedback-box ${quiz.selectedIndex === question.correctIndex ? "correct" : "wrong"}" data-glossary-scope>
              <strong>${quiz.selectedIndex === question.correctIndex ? "Correct." : "Not quite."}</strong>
              <p>${escapeHtml(question.explanation)}</p>
              <p><strong>Correct answer:</strong> ${escapeHtml(question.correctAnswer)}</p>
              ${renderStudyNote(question.studyNote)}
              <div class="button-row">${renderStudyLinks(question.studyRef)}</div>
            </div>
          `
          : ""
      }
      <div class="button-row">
        <button class="primary-btn" type="button" data-action="next-question" ${quiz.answered ? "" : "disabled"}>
          ${quiz.index === quiz.questions.length - 1 ? "Finish Set" : "Next Question"}
        </button>
        <button class="secondary-btn" type="button" data-action="end-quiz">End Set</button>
      </div>
    </div>
  `;

  annotateGlossary(elements.quizContent);
}

function renderStudyNote(studyNote) {
  if (!studyNote) {
    return "";
  }

  const sections = [
    ["Context", studyNote.context],
    ["Why This Is Right", studyNote.whyCorrect],
    ["How To Solve It", studyNote.howToSolve],
    ["Common Trap", studyNote.trap]
  ].filter(([, value]) => value);

  return `
    <div class="study-note-card">
      ${sections
        .map(
          ([label, value]) => `
            <div class="panel-card">
              <strong>${escapeHtml(label)}</strong>
              <p>${escapeHtml(value)}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderStudyLinks(studyRef) {
  if (!studyRef) {
    return "";
  }

  if (studyRef.type === "glossary") {
    return `<button class="ghost-btn" type="button" data-action="open-glossary" data-id="${studyRef.glossaryId}">Open Term</button>`;
  }

  const buttons = [];
  if (studyRef.moduleId) {
    buttons.push(
      `<button class="ghost-btn" type="button" data-action="open-week" data-id="${studyRef.moduleId}">Review Week</button>`
    );
  }
  if (studyRef.readingId) {
    buttons.push(
      `<button class="ghost-btn" type="button" data-action="open-reading" data-id="${studyRef.readingId}" ${
        studyRef.readingSectionId ? `data-section-id="${studyRef.readingSectionId}"` : ""
      } ${studyRef.readingPassageId ? `data-passage-id="${studyRef.readingPassageId}"` : ""}>Open Reading</button>`
    );
  }
  return buttons.join("");
}

function buildQuiz(settings) {
  if (settings.mode === "week_practice") {
    return shuffle(
      quizQuestions.filter((question) => question.bank === "core" && question.week === settings.week)
    )
      .slice(0, settings.count)
      .map(materializeQuizQuestion);
  }

  if (settings.mode === "glossary_drill") {
    return shuffle(
      quizQuestions.filter((question) => {
        if (question.bank !== "glossary") {
          return false;
        }
        return settings.glossaryScope === "mixed" || question.family === settings.glossaryScope;
      })
    )
      .slice(0, settings.count)
      .map(materializeQuizQuestion);
  }

  if (settings.mode === "cumulative") {
    return shuffle(quizQuestions.filter((question) => question.bank === "core"))
      .slice(0, settings.count)
      .map(materializeQuizQuestion);
  }

  return weightedSelection(
    quizQuestions.filter((question) => question.bank === "core"),
    settings.count
  ).map(materializeQuizQuestion);
}

function startQuiz() {
  appState.settings.mode = elements.modeSelect.value;
  appState.settings.week = elements.weekSelect.value;
  appState.settings.glossaryScope = elements.glossaryScopeSelect.value;
  appState.settings.count = Number(elements.countSelect.value);
  saveState();

  runtime.lastQuizResult = null;
  runtime.currentQuiz = {
    settings: {
      mode: appState.settings.mode,
      week: appState.settings.week,
      glossaryScope: appState.settings.glossaryScope,
      count: appState.settings.count
    },
    questions: buildQuiz(appState.settings),
    index: 0,
    score: 0,
    answered: false,
    selectedIndex: null,
    answers: []
  };

  renderQuizView();
  switchView("quizView");
}

function answerQuestion(selectedIndex) {
  const quiz = runtime.currentQuiz;
  if (!quiz || quiz.answered) {
    return;
  }

  const question = quiz.questions[quiz.index];
  const isCorrect = selectedIndex === question.correctIndex;
  quiz.answered = true;
  quiz.selectedIndex = selectedIndex;
  if (isCorrect) {
    quiz.score += 1;
  }

  quiz.answers.push({
    id: question.id,
    prompt: question.prompt,
    week: question.week,
    correct: isCorrect,
    correctAnswer: question.correctAnswer,
    studyRef: question.studyRef
  });

  renderQuizView();
}

function nextQuestion() {
  const quiz = runtime.currentQuiz;
  if (!quiz || !quiz.answered) {
    return;
  }

  if (quiz.index >= quiz.questions.length - 1) {
    finishQuiz(false);
    return;
  }

  quiz.index += 1;
  quiz.answered = false;
  quiz.selectedIndex = null;
  renderQuizView();
}

function finishQuiz(endedEarly) {
  const quiz = runtime.currentQuiz;
  if (!quiz) {
    return;
  }

  const recordedTotal = endedEarly ? quiz.answers.length : quiz.questions.length;
  if (!recordedTotal) {
    runtime.currentQuiz = null;
    renderQuizView();
    return;
  }

  const breakdown = {};
  quiz.answers.forEach((answer) => {
    if (!breakdown[answer.week]) {
      breakdown[answer.week] = { correct: 0, total: 0 };
    }
    breakdown[answer.week].total += 1;
    if (answer.correct) {
      breakdown[answer.week].correct += 1;
    }
  });

  const historyEntry = {
    date: new Date().toISOString(),
    label: endedEarly ? `${modeLabel(quiz.settings)} (ended early)` : modeLabel(quiz.settings),
    mode: quiz.settings.mode,
    week: quiz.settings.week,
    correct: quiz.score,
    total: recordedTotal,
    breakdown
  };

  appState.history.unshift(historyEntry);
  appState.history = appState.history.slice(0, 20);
  saveState();

  runtime.lastQuizResult = {
    ...historyEntry,
    wrongAnswers: quiz.answers.filter((entry) => !entry.correct)
  };
  runtime.currentQuiz = null;
  renderHeroStats();
  renderStartView();
  renderQuizStats();
  renderQuizView();
}

function endQuiz() {
  finishQuiz(true);
}

function handleDocumentClick(event) {
  const trigger = event.target.closest("[data-action]");
  const clickedGlossaryTerm = event.target.closest(".glossary-term");

  if (!trigger) {
    if (clickedGlossaryTerm) {
      openGlossaryCard(clickedGlossaryTerm.dataset.glossaryId, clickedGlossaryTerm, true);
      return;
    }
    if (!clickedGlossaryTerm && !event.target.closest("#glossaryHoverCard")) {
      hideGlossaryHoverCard();
    }
    return;
  }

  const { action, target, id, key, index, sectionId, passageId } = trigger.dataset;

  switch (action) {
    case "switch-view":
      switchView(target);
      return;
    case "open-week":
      runtime.pendingScrollTarget = id;
      switchView("weeksView");
      return;
    case "open-reading":
      appState.settings.selectedReadingId = id;
      if (sectionId) {
        appState.settings.selectedReadingSectionId = sectionId;
      }
      if (passageId) {
        appState.settings.selectedReadingPassageId = passageId;
      }
      renderReadingsView();
      switchView("readingsView");
      saveState();
      return;
    case "open-reading-section":
      appState.settings.selectedReadingId = id;
      appState.settings.selectedReadingSectionId = sectionId || "";
      appState.settings.selectedReadingPassageId = "";
      renderReadingsView();
      saveState();
      return;
    case "open-reading-passage":
      appState.settings.selectedReadingId = id;
      appState.settings.selectedReadingSectionId = sectionId || "";
      appState.settings.selectedReadingPassageId = passageId || "";
      renderReadingsView();
      saveState();
      return;
    case "open-glossary":
      appState.settings.selectedGlossaryId = id;
      renderGlossaryView();
      switchView("glossaryView");
      saveState();
      return;
    case "open-guide-section":
      runtime.pendingScrollTarget = id;
      switchView("guideView");
      return;
    case "toggle-bookmark":
      toggleKey(appState.bookmarks, key);
      saveState();
      renderHeroStats();
      renderStartView();
      renderWeeksView();
      renderReadingsView();
      renderGlossaryView();
      renderGuideView();
      return;
    case "toggle-reviewed":
      toggleKey(appState.reviewed, key);
      saveState();
      renderHeroStats();
      renderWeeksView();
      renderReadingsView();
      return;
    case "answer-question":
      answerQuestion(Number(index));
      return;
    case "next-question":
      nextQuestion();
      return;
    case "end-quiz":
      endQuiz();
      return;
    default:
      break;
  }

  if (clickedGlossaryTerm) {
    openGlossaryCard(clickedGlossaryTerm.dataset.glossaryId, clickedGlossaryTerm, true);
  }
}

function handleDocumentChange(event) {
  if (event.target === elements.weekFilterSelect) {
    appState.settings.weekFilter = event.target.value;
    renderWeeksView();
  } else if (event.target === elements.weekPrioritySelect) {
    appState.settings.weekPriority = event.target.value;
    renderWeeksView();
  } else if (event.target === elements.readingFilterSelect) {
    appState.settings.readingFamily = event.target.value;
    renderReadingsView();
  } else if (event.target === elements.glossaryFamilySelect) {
    appState.settings.glossaryFamily = event.target.value;
    renderGlossaryView();
  } else if (event.target === elements.modeSelect) {
    appState.settings.mode = event.target.value;
    toggleQuizFields();
  } else if (event.target === elements.weekSelect) {
    appState.settings.week = event.target.value;
  } else if (event.target === elements.glossaryScopeSelect) {
    appState.settings.glossaryScope = event.target.value;
  } else if (event.target === elements.countSelect) {
    appState.settings.count = Number(event.target.value);
  }

  saveState();
}

function handleDocumentInput(event) {
  if (event.target === elements.glossarySearchInput) {
    appState.settings.glossarySearch = event.target.value;
    renderGlossaryView();
  } else if (event.target === elements.guideSearchInput) {
    appState.settings.guideSearch = event.target.value;
    renderGuideView();
  }

  saveState();
}

function annotateGlossary(root) {
  if (!root) {
    return;
  }

  const labels = [...glossaryLabelMap.keys()].sort((left, right) => right.length - left.length);
  if (!labels.length) {
    return;
  }

  const pattern = new RegExp(`(?<![\\w])(${labels.map(escapeRegExp).join("|")})(?![\\w])`, "gi");
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue?.trim()) {
        return NodeFilter.FILTER_REJECT;
      }

      const parent = node.parentElement;
      if (!parent || parent.closest("button, a, code, pre, script, style, textarea, input, select, .glossary-term")) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) {
    nodes.push(walker.currentNode);
  }

  nodes.forEach((node) => {
    const text = node.nodeValue;
    pattern.lastIndex = 0;
    if (!pattern.test(text)) {
      return;
    }

    const fragment = document.createDocumentFragment();
    let cursor = 0;
    pattern.lastIndex = 0;
    let match = pattern.exec(text);

    while (match) {
      const [matchedLabel] = match;
      const start = match.index;
      const entryId = glossaryLabelMap.get(matchedLabel.toLowerCase());

      if (start > cursor) {
        fragment.append(document.createTextNode(text.slice(cursor, start)));
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "glossary-term";
      button.dataset.glossaryId = entryId;
      button.textContent = matchedLabel;
      fragment.append(button);

      cursor = start + matchedLabel.length;
      match = pattern.exec(text);
    }

    if (cursor < text.length) {
      fragment.append(document.createTextNode(text.slice(cursor)));
    }

    node.parentNode.replaceChild(fragment, node);
  });
}

function openGlossaryCard(glossaryId, anchor, pinned) {
  const term = glossaryById.get(glossaryId);
  if (!term) {
    return;
  }

  elements.glossaryHoverCard.innerHTML = `
    <div class="hover-card-body">
      <p class="section-kicker">${escapeHtml(term.family)}</p>
      <h3>${escapeHtml(term.term)}</h3>
      <p>${escapeHtml(term.definition)}</p>
      <div class="button-row">
        <button class="ghost-btn" type="button" data-action="open-glossary" data-id="${term.id}">Open Glossary</button>
        ${term.relatedWeekIds[0] ? `<button class="ghost-btn" type="button" data-action="open-week" data-id="${term.relatedWeekIds[0]}">Review Week</button>` : ""}
      </div>
    </div>
  `;
  elements.glossaryHoverCard.classList.remove("is-hidden");
  elements.glossaryHoverCard.classList.toggle("is-pinned", pinned || runtime.coarsePointer);

  if (elements.glossaryHoverCard.classList.contains("is-pinned")) {
    return;
  }

  const rect = anchor.getBoundingClientRect();
  const cardRect = elements.glossaryHoverCard.getBoundingClientRect();
  const left = Math.max(12, Math.min(window.innerWidth - cardRect.width - 12, rect.left + window.scrollX));
  const top = rect.bottom + window.scrollY + 10;
  elements.glossaryHoverCard.style.left = `${left}px`;
  elements.glossaryHoverCard.style.top = `${top}px`;
}

function hideGlossaryHoverCard() {
  elements.glossaryHoverCard.classList.add("is-hidden");
  elements.glossaryHoverCard.classList.remove("is-pinned");
  elements.glossaryHoverCard.style.left = "";
  elements.glossaryHoverCard.style.top = "";
}

function handleGlossaryPointerIn(event) {
  const target = event.target.closest(".glossary-term");
  if (!target || runtime.coarsePointer) {
    return;
  }
  openGlossaryCard(target.dataset.glossaryId, target, false);
}

function handleGlossaryPointerOut(event) {
  if (!event.target.closest(".glossary-term")) {
    return;
  }
  if (!elements.glossaryHoverCard.matches(":hover")) {
    hideGlossaryHoverCard();
  }
}

function handleGlossaryFocusIn(event) {
  const target = event.target.closest(".glossary-term");
  if (!target) {
    return;
  }
  openGlossaryCard(target.dataset.glossaryId, target, runtime.coarsePointer);
}

function handleGlossaryFocusOut() {
  if (!elements.glossaryHoverCard.matches(":hover")) {
    hideGlossaryHoverCard();
  }
}

function toggleQuizFields() {
  const isWeekPractice = appState.settings.mode === "week_practice";
  const isGlossaryDrill = appState.settings.mode === "glossary_drill";
  elements.weekField.hidden = !isWeekPractice;
  elements.glossaryScopeField.hidden = !isGlossaryDrill;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !window.location.protocol.startsWith("http")) {
    return;
  }

  navigator.serviceWorker.register("./service-worker.js").catch((error) => {
    console.warn("Service worker registration failed.", error);
  });
}

})();
