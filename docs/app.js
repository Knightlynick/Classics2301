const STORAGE_KEY = "roman-crime-study-state-v1";
const { studyTopics, quizQuestions } = window.STUDY_DATA;

const appState = loadState();
const runtime = {
  currentQuiz: null
};

const elements = {
  modeSelect: document.querySelector("#modeSelect"),
  weekSelect: document.querySelector("#weekSelect"),
  countSelect: document.querySelector("#countSelect"),
  startQuizBtn: document.querySelector("#startQuizBtn"),
  topicFilter: document.querySelector("#topicFilter"),
  weekField: document.querySelector("#weekField"),
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
  toggleWeekField();
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
    toggleWeekField();
    saveState();
  });

  elements.weekSelect.addEventListener("change", () => {
    appState.settings.week = elements.weekSelect.value;
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
  elements.countSelect.value = String(appState.settings.count);
  elements.topicFilter.value = appState.settings.topicFilter;
}

function toggleWeekField() {
  const isWeekPractice = elements.modeSelect.value === "week_practice";
  elements.weekField.style.display = isWeekPractice ? "grid" : "none";
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
  const eventsMarkup = topic.events.length
    ? `<div class="subpanel"><h4>Chronology</h4><ul>${topic.events.map((item) => `<li>${item}</li>`).join("")}</ul></div>`
    : "";

  const questionsMarkup = topic.studyQuestions.length
    ? `<div class="subpanel"><h4>Study Questions</h4><ul>${topic.studyQuestions.map((item) => `<li>${item}</li>`).join("")}</ul></div>`
    : "";

  const passagesMarkup = topic.passages.length
    ? topic.passages
        .map(
          (passage) => `
            <div class="passage-card">
              <strong>${passage.citation}</strong>
              <p>${passage.excerpt}</p>
              <p class="muted">${passage.note}</p>
            </div>
          `
        )
        .join("")
    : "";

  return `
    <article class="topic-card">
      <div class="topic-head">
        <div>
          <p class="section-kicker">${topic.week}</p>
          <h3>${topic.title}</h3>
          <p class="topic-summary">${topic.summary}</p>
        </div>
        <span class="priority-pill ${topic.priority}">${topic.priority}</span>
      </div>

      <div class="chip-row">
        ${topic.terms.map((term) => `<span class="term-chip">${term}</span>`).join("")}
      </div>

      <div class="split-grid">
        ${eventsMarkup}
        ${questionsMarkup}
      </div>

      ${passagesMarkup}
    </article>
  `;
}

function startQuiz() {
  appState.settings.mode = elements.modeSelect.value;
  appState.settings.week = elements.weekSelect.value;
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
    pool = quizQuestions.filter((question) => question.week === settings.week);
    return shuffle(pool).slice(0, Math.min(settings.count, pool.length));
  }

  if (settings.mode === "cumulative") {
    pool = [...quizQuestions];
    return shuffle(pool).slice(0, Math.min(settings.count, pool.length));
  }

  pool = [...quizQuestions];
  return weightedSelection(pool, Math.min(settings.count, pool.length));
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
  elements.questionMeta.textContent = `${question.week} · ${question.topic} · ${question.sourceRef}`;
  elements.questionPrompt.textContent = question.prompt;

  elements.answerList.innerHTML = question.choices
    .map(
      (choice, index) => `
        <button class="answer-btn" data-answer-index="${index}">
          <strong>${String.fromCharCode(65 + index)}.</strong> ${choice}
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
    <p>${question.explanation}</p>
    <p><strong>Correct answer:</strong> ${question.choices[question.correctIndex]}</p>
    <p class="muted">${question.sourceRef}</p>
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
