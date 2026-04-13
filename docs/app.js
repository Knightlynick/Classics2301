const STORAGE_KEY = "roman-crime-study-state-v2";
const { studyTopics, quizQuestions } = window.STUDY_DATA;

const appState = loadState();
const runtime = {
  currentQuiz: null
};

const elements = {
  modeSelect: document.querySelector("#modeSelect"),
  weekSelect: document.querySelector("#weekSelect"),
  glossaryScopeSelect: document.querySelector("#glossaryScopeSelect"),
  countSelect: document.querySelector("#countSelect"),
  startQuizBtn: document.querySelector("#startQuizBtn"),
  topicFilter: document.querySelector("#topicFilter"),
  weekField: document.querySelector("#weekField"),
  glossaryScopeField: document.querySelector("#glossaryScopeField"),
  statsGrid: document.querySelector("#statsGrid"),
  weekStats: document.querySelector("#weekStats"),
  recentAttempts: document.querySelector("#recentAttempts"),
  romanFocusList: document.querySelector("#romanFocusList"),
  topicsContainer: document.querySelector("#topicsContainer"),
  navButtons: [...document.querySelectorAll(".nav-btn")],
  views: [...document.querySelectorAll(".view")],
  quizEmptyState: document.querySelector("#quizEmptyState"),
  quizActiveState: document.querySelector("#quizActiveState"),
  quizModeLabel: document.querySelector("#quizModeLabel"),
  quizTitle: document.querySelector("#quizTitle"),
  scoreChip: document.querySelector("#scoreChip"),
  progressBar: document.querySelector("#progressBar"),
  questionMeta: document.querySelector("#questionMeta"),
  questionPrompt: document.querySelector("#questionPrompt"),
  answerList: document.querySelector("#answerList"),
  feedbackBox: document.querySelector("#feedbackBox"),
  nextBtn: document.querySelector("#nextBtn"),
  endBtn: document.querySelector("#endBtn")
};

init();

function init() {
  populateWeekOptions();
  bindEvents();
  syncControlsFromState();
  toggleQuizFields();
  renderDashboard();
  renderTopics();
  renderQuizState();
  switchView("dashboardView");
  registerServiceWorker();
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      history: Array.isArray(parsed?.history) ? parsed.history : [],
      settings: {
        mode: parsed?.settings?.mode || "final_mix",
        week: parsed?.settings?.week || "Week 10",
        glossaryScope: parsed?.settings?.glossaryScope || "mixed",
        count: parsed?.settings?.count || 10,
        topicFilter: parsed?.settings?.topicFilter || "All weeks"
      }
    };
  } catch (error) {
    return {
      history: [],
      settings: {
        mode: "final_mix",
        week: "Week 10",
        glossaryScope: "mixed",
        count: 10,
        topicFilter: "All weeks"
      }
    };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (error) {
    console.warn("Could not save study state.", error);
  }
}

function bindEvents() {
  elements.navButtons.forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.viewTarget));
  });

  elements.modeSelect.addEventListener("change", () => {
    appState.settings.mode = elements.modeSelect.value;
    toggleQuizFields();
    saveState();
  });

  elements.weekSelect.addEventListener("change", () => {
    appState.settings.week = elements.weekSelect.value;
    saveState();
  });

  elements.glossaryScopeSelect.addEventListener("change", () => {
    appState.settings.glossaryScope = elements.glossaryScopeSelect.value;
    saveState();
  });

  elements.countSelect.addEventListener("change", () => {
    appState.settings.count = Number(elements.countSelect.value);
    saveState();
  });

  elements.topicFilter.addEventListener("change", () => {
    appState.settings.topicFilter = elements.topicFilter.value;
    renderTopics();
    saveState();
  });

  elements.startQuizBtn.addEventListener("click", startQuiz);
  elements.nextBtn.addEventListener("click", nextQuestion);
  elements.endBtn.addEventListener("click", endQuizEarly);
}

function populateWeekOptions() {
  const weeks = getWeekList();

  elements.weekSelect.innerHTML = weeks
    .map((week) => `<option value="${week}">${week}</option>`)
    .join("");

  elements.topicFilter.innerHTML = [
    `<option value="All weeks">All weeks</option>`,
    ...weeks.map((week) => `<option value="${week}">${week}</option>`)
  ].join("");
}

function syncControlsFromState() {
  elements.modeSelect.value = appState.settings.mode;
  elements.weekSelect.value = appState.settings.week;
  elements.glossaryScopeSelect.value = appState.settings.glossaryScope;
  elements.countSelect.value = String(appState.settings.count);
  elements.topicFilter.value = appState.settings.topicFilter;
}

function toggleQuizFields() {
  const isWeekPractice = elements.modeSelect.value === "week_practice";
  const isGlossaryDrill = elements.modeSelect.value === "glossary_drill";
  elements.weekField.style.display = isWeekPractice ? "grid" : "none";
  elements.glossaryScopeField.style.display = isGlossaryDrill ? "grid" : "none";
}

function getWeekList() {
  const weeks = [...new Set(studyTopics.map((topic) => topic.week))];
  return weeks.sort((a, b) => weekNumber(a) - weekNumber(b));
}

function weekNumber(label) {
  return Number(label.replace(/\D/g, "")) || 0;
}

function switchView(viewId) {
  elements.views.forEach((view) => {
    view.classList.toggle("is-hidden", view.id !== viewId);
  });

  elements.navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.viewTarget === viewId);
  });
}

function renderDashboard() {
  renderStatsGrid();
  renderWeekStats();
  renderRecentAttempts();
  renderRomanFocus();
}

function renderStatsGrid() {
  const totals = appState.history.reduce(
    (acc, entry) => {
      acc.correct += entry.correct;
      acc.total += entry.total;
      acc.attempts += 1;
      return acc;
    },
    { correct: 0, total: 0, attempts: 0 }
  );

  const accuracy = totals.total ? `${Math.round((totals.correct / totals.total) * 100)}%` : "0%";
  const best = appState.history.length
    ? `${Math.max(...appState.history.map((entry) => Math.round((entry.correct / entry.total) * 100)))}%`
    : "0%";

  const cards = [
    { label: "Attempts", value: String(totals.attempts) },
    { label: "Accuracy", value: accuracy },
    { label: "Best set", value: best }
  ];

  elements.statsGrid.innerHTML = cards
    .map(
      (card) => `
        <div class="stat-card">
          <div class="label">${card.label}</div>
          <div class="value">${card.value}</div>
        </div>
      `
    )
    .join("");
}

function renderWeekStats() {
  const rollup = {};

  appState.history.forEach((entry) => {
    Object.entries(entry.breakdown || {}).forEach(([week, stats]) => {
      if (!rollup[week]) {
        rollup[week] = { correct: 0, total: 0 };
      }
      rollup[week].correct += stats.correct;
      rollup[week].total += stats.total;
    });
  });

  const rows = Object.entries(rollup)
    .sort((a, b) => weekNumber(a[0]) - weekNumber(b[0]))
    .map(([week, stats]) => {
      const accuracy = stats.total ? `${Math.round((stats.correct / stats.total) * 100)}%` : "0%";
      return `
        <div class="week-row">
          <div>
            <strong>${week}</strong>
            <div class="muted">${stats.correct} correct out of ${stats.total}</div>
          </div>
          <strong>${accuracy}</strong>
        </div>
      `;
    });

  elements.weekStats.innerHTML = rows.length
    ? rows.join("")
    : `<p class="empty-note">No week-level data yet. Finish a quiz set to start tracking.</p>`;
}

function renderRecentAttempts() {
  const latest = appState.history.slice(0, 6);

  elements.recentAttempts.innerHTML = latest.length
    ? latest
        .map((entry) => {
          const date = new Date(entry.date).toLocaleString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit"
          });
          return `
            <div class="attempt-row">
              <strong>${entry.label}</strong>
              <div class="muted">${entry.correct} / ${entry.total} correct</div>
              <div class="muted">${date}</div>
            </div>
          `;
        })
        .join("")
    : `<p class="empty-note">No quiz attempts yet. Start with the Roman-heavy final mix.</p>`;
}

function renderRomanFocus() {
  const romanTopics = studyTopics
    .filter((topic) => topic.priority === "roman-heavy")
    .sort((a, b) => weekNumber(a.week) - weekNumber(b.week));

  elements.romanFocusList.innerHTML = romanTopics
    .map(
      (topic) => `
        <div class="focus-item">
          <strong>${topic.week}: ${topic.title}</strong>
          <div class="muted">${topic.summary}</div>
        </div>
      `
    )
    .join("");
}

function renderTopics() {
  const filter = appState.settings.topicFilter;
  const topics = studyTopics
    .filter((topic) => filter === "All weeks" || topic.week === filter)
    .sort((a, b) => weekNumber(a.week) - weekNumber(b.week));

  elements.topicsContainer.innerHTML = topics.map(renderTopicCard).join("");
}

function renderTopicCard(topic) {
  const argumentMarkup = topic.argument
    ? `<div class="subpanel"><h4>What This Topic Is Arguing</h4><p>${escapeHtml(topic.argument)}</p></div>`
    : "";

  const whyMattersMarkup = topic.whyItMatters
    ? `<div class="subpanel"><h4>Why It Matters</h4><p>${escapeHtml(topic.whyItMatters)}</p></div>`
    : "";

  const eventsMarkup = topic.events.length
    ? `<div class="subpanel"><h4>Chronology</h4><ul>${topic.events.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>`
    : "";

  const questionsMarkup = topic.studyQuestions.length
    ? `<div class="subpanel"><h4>Study Questions</h4><ul>${topic.studyQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>`
    : "";

  return `
    <article class="topic-card">
      <div class="topic-head">
        <div>
          <p class="section-kicker">${escapeHtml(topic.week)}</p>
          <h3>${escapeHtml(topic.title)}</h3>
          <p class="topic-summary">${escapeHtml(topic.summary)}</p>
        </div>
        <span class="priority-pill ${topic.priority}">${escapeHtml(topic.priority)}</span>
      </div>

      <div class="chip-row">
        ${topic.terms.map((term) => `<span class="term-chip">${escapeHtml(term)}</span>`).join("")}
      </div>

      <div class="split-grid">
        ${argumentMarkup}
        ${whyMattersMarkup}
        ${eventsMarkup}
        ${questionsMarkup}
      </div>

      ${renderConceptsSection(topic.concepts || [])}
      ${renderComparisonsSection(topic.comparisons || [])}
      ${renderPassagesSection(topic.passages || [])}
      ${renderPitfallsSection(topic.pitfalls || [])}
    </article>
  `;
}

function renderConceptsSection(concepts) {
  if (!concepts.length) {
    return "";
  }

  return `
    <details class="detail-panel" open>
      <summary>Concept Bubbles</summary>
      <div class="detail-body mini-grid">
        ${concepts
          .map(
            (concept) => `
              <article class="mini-card">
                <h4>${escapeHtml(concept.term)}</h4>
                <p><strong>Meaning:</strong> ${escapeHtml(concept.meaning)}</p>
                <p><strong>What it does:</strong> ${escapeHtml(concept.function)}</p>
                <p><strong>Why it matters:</strong> ${escapeHtml(concept.significance)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </details>
  `;
}

function renderComparisonsSection(comparisons) {
  if (!comparisons.length) {
    return "";
  }

  return `
    <details class="detail-panel">
      <summary>Ancient vs Modern</summary>
      <div class="detail-body comparison-grid">
        ${comparisons
          .map(
            (comparison) => `
              <article class="comparison-card">
                <p><strong>Ancient frame:</strong> ${escapeHtml(comparison.ancient)}</p>
                <p><strong>Modern frame:</strong> ${escapeHtml(comparison.modern)}</p>
                <p><strong>Why the difference matters:</strong> ${escapeHtml(comparison.significance)}</p>
              </article>
            `
          )
          .join("")}
      </div>
    </details>
  `;
}

function renderPassagesSection(passages) {
  if (!passages.length) {
    return "";
  }

  return `
    <details class="detail-panel" open>
      <summary>Passage Context</summary>
      <div class="detail-body">
        ${passages.map(renderPassageCard).join("")}
      </div>
    </details>
  `;
}

function renderPassageCard(passage) {
  const quote = passage.quote || passage.excerpt || "";
  const analysis = passage.analysis || passage.note || "";
  const meta = [
    passage.speaker ? `<span><strong>Speaker:</strong> ${escapeHtml(passage.speaker)}</span>` : "",
    passage.audience ? `<span><strong>Audience:</strong> ${escapeHtml(passage.audience)}</span>` : "",
    passage.setting ? `<span><strong>Setting:</strong> ${escapeHtml(passage.setting)}</span>` : ""
  ]
    .filter(Boolean)
    .join("");

  return `
    <article class="passage-card">
      <strong>${escapeHtml(passage.citation)}</strong>
      ${meta ? `<div class="passage-meta">${meta}</div>` : ""}
      ${quote ? `<p>${escapeHtml(quote)}</p>` : ""}
      ${passage.context ? `<p><strong>Context:</strong> ${escapeHtml(passage.context)}</p>` : ""}
      ${analysis ? `<p><strong>Analysis:</strong> ${escapeHtml(analysis)}</p>` : ""}
      ${passage.modernParallel ? `<p><strong>Modern parallel:</strong> ${escapeHtml(passage.modernParallel)}</p>` : ""}
    </article>
  `;
}

function renderPitfallsSection(pitfalls) {
  if (!pitfalls.length) {
    return "";
  }

  return `
    <details class="detail-panel">
      <summary>Exam Traps</summary>
      <div class="detail-body">
        <ul class="pitfall-list">${pitfalls.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
      </div>
    </details>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function startQuiz() {
  appState.settings.mode = elements.modeSelect.value;
  appState.settings.week = elements.weekSelect.value;
  appState.settings.glossaryScope = elements.glossaryScopeSelect.value;
  appState.settings.count = Number(elements.countSelect.value);
  saveState();

  const settings = { ...appState.settings };
  const questions = buildQuiz(settings);

  runtime.currentQuiz = {
    settings,
    questions,
    index: 0,
    score: 0,
    answered: false,
    answers: []
  };

  renderQuizState();
  switchView("quizView");
}

function buildQuiz(settings) {
  let pool = [];

  if (settings.mode === "week_practice") {
    pool = quizQuestions.filter((question) => question.bank === "core" && question.week === settings.week);
    return shuffle(pool)
      .slice(0, Math.min(settings.count, pool.length))
      .map(prepareQuestion);
  }

  if (settings.mode === "glossary_drill") {
    pool = quizQuestions.filter((question) => {
      if (question.bank !== "glossary") {
        return false;
      }
      if (settings.glossaryScope === "mixed") {
        return true;
      }
      return question.family === settings.glossaryScope;
    });

    return shuffle(pool)
      .slice(0, Math.min(settings.count, pool.length))
      .map(prepareQuestion);
  }

  if (settings.mode === "cumulative") {
    pool = quizQuestions.filter((question) => question.bank === "core");
    return shuffle(pool)
      .slice(0, Math.min(settings.count, pool.length))
      .map(prepareQuestion);
  }

  pool = quizQuestions.filter((question) => question.bank === "core");
  return weightedSelection(pool, Math.min(settings.count, pool.length)).map(prepareQuestion);
}

function weightedSelection(items, count) {
  return [...items]
    .map((item) => ({
      item,
      key: Math.pow(Math.random(), 1 / (item.weight || 1))
    }))
    .sort((a, b) => b.key - a.key)
    .slice(0, count)
    .map((entry) => entry.item);
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function prepareQuestion(question) {
  const choices = question.choices.map((choice, index) => ({
    choice,
    isCorrect: index === question.correctIndex
  }));
  const shuffled = shuffle(choices);

  return {
    ...question,
    choices: shuffled.map((entry) => entry.choice),
    correctIndex: shuffled.findIndex((entry) => entry.isCorrect)
  };
}

function renderQuizState() {
  const quiz = runtime.currentQuiz;

  if (!quiz) {
    elements.quizEmptyState.classList.remove("is-hidden");
    elements.quizActiveState.classList.add("is-hidden");
    return;
  }

  elements.quizEmptyState.classList.add("is-hidden");
  elements.quizActiveState.classList.remove("is-hidden");

  const question = quiz.questions[quiz.index];
  const progress = ((quiz.index + (quiz.answered ? 1 : 0)) / quiz.questions.length) * 100;

  elements.quizModeLabel.textContent = modeLabel(quiz.settings);
  elements.quizTitle.textContent = `Question ${quiz.index + 1} of ${quiz.questions.length}`;
  elements.scoreChip.textContent = `${quiz.score} correct`;
  elements.progressBar.style.width = `${Math.max(progress, 4)}%`;
  elements.questionMeta.textContent = `${question.week} - ${question.topic} - ${question.sourceRef}`;
  elements.questionPrompt.textContent = question.prompt;

  elements.answerList.innerHTML = question.choices
    .map(
      (choice, index) => `
        <button class="answer-btn" data-answer-index="${index}">
          <strong>${String.fromCharCode(65 + index)}.</strong> ${escapeHtml(choice)}
        </button>
      `
    )
    .join("");

  [...elements.answerList.querySelectorAll(".answer-btn")].forEach((button) => {
    button.addEventListener("click", () => answerQuestion(Number(button.dataset.answerIndex)));
  });

  elements.feedbackBox.className = "feedback-box is-hidden";
  elements.feedbackBox.innerHTML = "";
  elements.nextBtn.disabled = true;
  elements.nextBtn.textContent = quiz.index === quiz.questions.length - 1 ? "Finish set" : "Next question";
}

function answerQuestion(selectedIndex) {
  const quiz = runtime.currentQuiz;
  if (!quiz || quiz.answered) {
    return;
  }

  const question = quiz.questions[quiz.index];
  const isCorrect = selectedIndex === question.correctIndex;

  quiz.answered = true;
  if (isCorrect) {
    quiz.score += 1;
  }

  quiz.answers.push({
    id: question.id,
    week: question.week,
    correct: isCorrect
  });

  const buttons = [...elements.answerList.querySelectorAll(".answer-btn")];
  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === question.correctIndex) {
      button.classList.add("is-correct");
    } else if (index === selectedIndex) {
      button.classList.add("is-wrong");
    }
  });

  elements.scoreChip.textContent = `${quiz.score} correct`;
  elements.feedbackBox.className = `feedback-box ${isCorrect ? "correct" : "wrong"}`;
  elements.feedbackBox.innerHTML = `
    <strong>${isCorrect ? "Correct." : "Not quite."}</strong>
    <p>${escapeHtml(question.explanation)}</p>
    <p><strong>Correct answer:</strong> ${escapeHtml(question.choices[question.correctIndex])}</p>
    <p class="muted">${escapeHtml(question.sourceRef)}</p>
  `;
  elements.nextBtn.disabled = false;
}

function nextQuestion() {
  const quiz = runtime.currentQuiz;
  if (!quiz || !quiz.answered) {
    return;
  }

  if (quiz.index >= quiz.questions.length - 1) {
    finishQuiz();
    return;
  }

  quiz.index += 1;
  quiz.answered = false;
  renderQuizState();
}

function endQuizEarly() {
  if (!runtime.currentQuiz) {
    return;
  }
  finishQuiz(true);
}

function finishQuiz(endedEarly = false) {
  const quiz = runtime.currentQuiz;
  if (!quiz) {
    return;
  }

  if (endedEarly && quiz.answers.length === 0) {
    runtime.currentQuiz = null;
    renderQuizState();
    switchView("dashboardView");
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

  const recordedTotal = endedEarly ? quiz.answers.length : quiz.questions.length;

  appState.history.unshift({
    date: new Date().toISOString(),
    label: endedEarly ? `${modeLabel(quiz.settings)} (ended early)` : modeLabel(quiz.settings),
    mode: quiz.settings.mode,
    week: quiz.settings.week,
    correct: quiz.score,
    total: recordedTotal,
    breakdown
  });

  appState.history = appState.history.slice(0, 20);
  saveState();

  runtime.currentQuiz = null;
  renderDashboard();
  renderQuizState();
  switchView("dashboardView");
}

function modeLabel(settings) {
  if (settings.mode === "week_practice") {
    return `${settings.week} practice`;
  }
  if (settings.mode === "glossary_drill") {
    if (settings.glossaryScope === "greek") {
      return "Greek glossary drill";
    }
    if (settings.glossaryScope === "roman") {
      return "Roman glossary drill";
    }
    return "Mixed glossary drill";
  }
  if (settings.mode === "cumulative") {
    return "Cumulative review";
  }
  return "Final Exam Mix";
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  if (!window.location.protocol.startsWith("http")) {
    return;
  }

  navigator.serviceWorker.register("./service-worker.js").catch((error) => {
    console.warn("Service worker registration failed.", error);
  });
}
