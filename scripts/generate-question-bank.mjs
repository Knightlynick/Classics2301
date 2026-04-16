import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";

const rootDir = resolve(import.meta.dirname, "..");
const studyTopicsPath = resolve(rootDir, "docs", "study-topics.js");
const markdownSourcePath = resolve(rootDir, "study-docs", "final_exam_study_guide.md");
const outputPath = resolve(rootDir, "docs", "generated-core-questions.js");

const priorityWeight = {
  foundation: 2,
  high: 4,
  "roman-heavy": 6,
  reference: 1
};

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[`'".,:;!?()[\]{}]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean).map((value) => String(value).trim()))];
}

function sentence(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) {
    return "";
  }
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function normalizeAnswer(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseGuideSections(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const sections = [];
  let current = { title: "Guide Overview", markdown: [] };

  for (const line of lines) {
    const match = /^##\s+(.+)$/.exec(line);
    if (match) {
      if (current.markdown.length) {
        sections.push({ title: current.title, markdown: current.markdown.join("\n").trim() });
      }
      current = { title: match[1].trim(), markdown: [line] };
      continue;
    }
    current.markdown.push(line);
  }

  if (current.markdown.length) {
    sections.push({ title: current.title, markdown: current.markdown.join("\n").trim() });
  }

  return sections;
}

function firstParagraph(markdown) {
  return String(markdown || "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .split(/\n\s*\n/)
    .map((block) => block.replace(/^#+\s+/gm, "").replace(/[`*_]/g, "").replace(/\s+/g, " ").trim())
    .find(Boolean) || "";
}

function summarizeComparison(comparison) {
  return [sentence(comparison.ancient), sentence(comparison.modern), sentence(comparison.significance)]
    .filter(Boolean)
    .join(" ");
}

async function loadTopics() {
  const context = { window: {}, console };
  vm.createContext(context);
  const source = await readFile(studyTopicsPath, "utf8");
  vm.runInContext(source, context, { filename: "docs/study-topics.js" });
  return context.window.STUDY_TOPICS || [];
}

function buildStudyNote(topic, correctAnswer, extra = {}) {
  return {
    context: [topic.summary, topic.argument, topic.whyItMatters, extra.context].filter(Boolean).join(" "),
    whyCorrect: extra.whyCorrect || `${correctAnswer} is the answer that best matches ${topic.week}'s framing of ${topic.title}.`,
    howToSolve:
      extra.howToSolve ||
      `Anchor the question to ${topic.week} and ${topic.title}, then pick the option that matches the lecture's exact claim or institutional function instead of the one that only sounds generically modern.`,
    trap:
      extra.trap ||
      topic.pitfalls?.[0] ||
      "Do not pick the answer that sounds most familiar in modern legal language unless the course explicitly makes that comparison."
  };
}

function buildStudyQuestionResponse(topic, prompt) {
  const opening = prompt.toLowerCase().startsWith("how")
    ? `${topic.argument || topic.summary} ${topic.whyItMatters || ""}`
    : `${topic.summary} ${topic.argument || ""} ${topic.whyItMatters || ""}`;
  return sentence(opening);
}

function buildDistractors(correct, pool, seed = []) {
  return unique([...seed, ...pool]).filter((candidate) => normalizeAnswer(candidate) && normalizeAnswer(candidate) !== normalizeAnswer(correct)).slice(0, 3);
}

function questionBase(topic, config, guidePreview) {
  return {
    week: topic.week,
    topic: topic.title,
    priority: topic.priority,
    weight: priorityWeight[topic.priority] || 1,
    difficulty: config.difficulty,
    tags: unique([slugify(topic.week), slugify(topic.title), ...(config.tags || [])]),
    variantGroup: config.variantGroup,
    prompt: config.prompt,
    correctAnswer: normalizeAnswer(config.correctAnswer),
    distractors: buildDistractors(config.correctAnswer, config.pool, config.seed),
    explanation: sentence(config.explanation),
    sourceRef: config.sourceRef || `${topic.week} lecture synthesis`,
    studyNote: buildStudyNote(topic, config.correctAnswer, {
      context: guidePreview,
      whyCorrect: sentence(config.explanation),
      howToSolve: config.howToSolve,
      trap: config.trap
    })
  };
}

function buildGeneratedQuestions(topics, guideSections) {
  const argumentsPool = unique(topics.map((topic) => topic.argument));
  const whyPool = unique(topics.map((topic) => topic.whyItMatters));
  const termClusters = unique(topics.filter((topic) => (topic.terms || []).length >= 3).map((topic) => topic.terms.slice(0, 4).join(", ")));
  const eventPool = unique(topics.flatMap((topic) => topic.events || []));
  const comparisonPool = unique(topics.flatMap((topic) => (topic.comparisons || []).map(summarizeComparison)));
  const pitfallPool = unique(topics.flatMap((topic) => topic.pitfalls || []));
  const conceptPool = topics.flatMap((topic) => (topic.concepts || []).map((concept) => ({ ...concept, topic })));
  const conceptMeaningPool = unique(conceptPool.map((concept) => concept.meaning));
  const conceptFunctionPool = unique(conceptPool.map((concept) => concept.significance || concept.function));
  const passagePool = topics.flatMap((topic) => (topic.passages || []).map((passage) => ({ ...passage, topic })));
  const passageAnalysisPool = unique(passagePool.map((passage) => passage.analysis || passage.note));
  const studyResponsePool = unique(topics.flatMap((topic) => (topic.studyQuestions || []).map((prompt) => buildStudyQuestionResponse(topic, prompt))));
  const guidePreviewByWeek = new Map(
    guideSections
      .filter((section) => /^Week \d+/.test(section.title))
      .map((section) => [(/^Week \d+/.exec(section.title) || [section.title])[0], firstParagraph(section.markdown)])
  );

  const questions = [];
  let idCounter = 0;
  const push = (topic, config) => {
    idCounter += 1;
    questions.push({
      id: `auto-${String(idCounter).padStart(4, "0")}`,
      bank: "core",
      ...questionBase(topic, config, guidePreviewByWeek.get(topic.week) || "")
    });
  };

  topics.forEach((topic) => {
    const concepts = topic.concepts || [];
    const comparisons = topic.comparisons || [];
    const events = topic.events || [];
    const passages = topic.passages || [];
    const studyQuestions = topic.studyQuestions || [];
    const topTerms = (topic.terms || []).slice(0, 4);

    if (topic.argument) {
      push(topic, {
        difficulty: "medium",
        tags: ["thesis"],
        variantGroup: `${topic.id}:thesis`,
        prompt: `Which statement best captures the core lecture claim in "${topic.title}"?`,
        correctAnswer: topic.argument,
        pool: argumentsPool,
        explanation: topic.argument,
        trap: topic.pitfalls?.[0]
      });
    }

    if (topic.whyItMatters) {
      push(topic, {
        difficulty: "medium",
        tags: ["exam-angle"],
        variantGroup: `${topic.id}:importance`,
        prompt: `Why does "${topic.title}" matter so much for final-exam answers?`,
        correctAnswer: topic.whyItMatters,
        pool: whyPool,
        explanation: topic.whyItMatters,
        trap: topic.pitfalls?.[0]
      });
    }

    if (topTerms.length >= 3) {
      const cluster = topTerms.join(", ");
      push(topic, {
        difficulty: "easy",
        tags: ["key-terms"],
        variantGroup: `${topic.id}:terms`,
        prompt: `Which key-term cluster belongs most directly to "${topic.title}"?`,
        correctAnswer: cluster,
        pool: termClusters,
        explanation: `${cluster} is the cluster the app keeps tying back to ${topic.week}'s treatment of ${topic.title}.`,
        howToSolve: `Match the option to the lecture's exact institutional vocabulary for ${topic.title}, not to a neighboring week that covers a similar theme.`
      });
    }

    if (events.length) {
      push(topic, {
        difficulty: "easy",
        tags: ["chronology"],
        variantGroup: `${topic.id}:event`,
        prompt: `Which event is one of the anchor chronology points for "${topic.title}"?`,
        correctAnswer: events[0],
        pool: eventPool,
        explanation: `${events[0]} is one of the explicit timeline anchors tied to ${topic.title}.`,
        sourceRef: `${topic.week} chronology`
      });
    }

    if (events.length >= 2) {
      const correctSequence = events.slice(0, 3).join(" -> ");
      const mixed = buildDistractors(correctSequence, [
        [...events.slice(0, 3)].reverse().join(" -> "),
        [...events.slice(1, 3), events[0]].join(" -> "),
        `${events.at(-1)} -> ${events[0]}`
      ]);
      push(topic, {
        difficulty: "hard",
        tags: ["chronology", "ordering"],
        variantGroup: `${topic.id}:event-order`,
        prompt: `Which sequence best preserves the way the course orders the key moments in "${topic.title}"?`,
        correctAnswer: correctSequence,
        pool: mixed,
        explanation: `${correctSequence} is the sequence the course uses when it narrates ${topic.title}.`,
        sourceRef: `${topic.week} chronology`,
        howToSolve: `Read the question as a lecture-order problem. Start from the earliest anchor the course emphasizes and preserve the sequence used in class, not the one that merely feels narratively tidy.`
      });
    }

    concepts.forEach((concept) => {
      const groupId = `${topic.id}:concept:${slugify(concept.term)}`;
      push(topic, {
        difficulty: "easy",
        tags: ["concept", slugify(concept.term), "definition"],
        variantGroup: groupId,
        prompt: `In ${topic.week}, what does "${concept.term}" most nearly mean?`,
        correctAnswer: concept.meaning,
        pool: conceptMeaningPool,
        explanation: `${concept.term} in this course means ${concept.meaning}`,
        sourceRef: `${topic.week} concept review`,
        howToSolve: `Ignore whether the term sounds familiar from another class. Match it to the specific meaning the lecture assigns inside ${topic.title}.`
      });
      push(topic, {
        difficulty: "medium",
        tags: ["concept", slugify(concept.term), "function"],
        variantGroup: groupId,
        prompt: `Why is "${concept.term}" important in the course's treatment of "${topic.title}"?`,
        correctAnswer: concept.significance || concept.function,
        pool: conceptFunctionPool,
        explanation: `${concept.term} matters here because ${concept.significance || concept.function}`,
        sourceRef: `${topic.week} concept review`,
        howToSolve: `Choose the answer that explains the concept's work in the argument, not merely a looser historical association.`
      });
    });

    if (comparisons.length) {
      const correct = summarizeComparison(comparisons[0]);
      push(topic, {
        difficulty: "medium",
        tags: ["comparison"],
        variantGroup: `${topic.id}:comparison`,
        prompt: `Which ancient/modern comparison best matches "${topic.title}"?`,
        correctAnswer: correct,
        pool: comparisonPool,
        explanation: comparisons[0].significance || correct,
        sourceRef: `${topic.week} comparative frame`,
        howToSolve: `Look for the comparison that matches the lecture's function-level parallel, not the option that claims the ancient institution was simply the same as a modern one.`
      });
    }

    if (topic.pitfalls?.length) {
      push(topic, {
        difficulty: "medium",
        tags: ["exam-trap"],
        variantGroup: `${topic.id}:pitfall`,
        prompt: `Which interpretation would the lecture treat as the main exam trap in "${topic.title}"?`,
        correctAnswer: topic.pitfalls[0],
        pool: pitfallPool,
        explanation: `The lecture flags this as the mistake to avoid when answering on ${topic.title}.`,
        sourceRef: `${topic.week} lecture warnings`,
        howToSolve: `Pick the answer the lecture explicitly warns against, not the one that merely sounds debatable.`
      });
    }

    studyQuestions.forEach((prompt, index) => {
      const correct = buildStudyQuestionResponse(topic, prompt);
      push(topic, {
        difficulty: "hard",
        tags: ["study-question", `sq-${index + 1}`],
        variantGroup: `${topic.id}:study-question:${index + 1}`,
        prompt: `Which answer best responds to the study question "${prompt}"?`,
        correctAnswer: correct,
        pool: studyResponsePool,
        explanation: correct,
        sourceRef: `${topic.week} study-question synthesis`,
        howToSolve: `The right option should sound like a compact exam paragraph: it should name the lecture's claim, explain what work the material does, and avoid turning the topic into a generic historical fact list.`
      });
    });

    passages.forEach((passage, index) => {
      const significance = passage.analysis || passage.note || topic.whyItMatters || topic.summary;
      push(topic, {
        difficulty: "hard",
        tags: ["passage", `passage-${index + 1}`],
        variantGroup: `${topic.id}:passage:${slugify(passage.citation || String(index + 1))}`,
        prompt: `Why does the course keep returning to the passage ${passage.citation}?`,
        correctAnswer: significance,
        pool: passageAnalysisPool,
        explanation: significance,
        sourceRef: passage.citation || `${topic.week} cited passage`,
        howToSolve: `Treat the passage as evidence. The best answer explains what argument the passage proves for the course, not just what happens in the quoted line.`
      });
    });
  });

  const topicsByWeek = topics.reduce((accumulator, topic) => {
    accumulator[topic.week] = accumulator[topic.week] || [];
    accumulator[topic.week].push(topic);
    return accumulator;
  }, {});

  Object.entries(topicsByWeek).forEach(([week, weekTopics], index) => {
    const titles = weekTopics.map((topic) => topic.title).join("; ");
    const summary = sentence(`${titles}. ${weekTopics.map((topic) => topic.argument || topic.summary).filter(Boolean).join(" ")}`);
    questions.push({
      id: `week-synth-${String(index + 1).padStart(3, "0")}`,
      bank: "core",
      week,
      topic: `${week} synthesis`,
      priority: week === "Week 10" || week === "Week 11" || week === "Week 12" ? "roman-heavy" : week === "Week 1" || week === "Week 2" ? "foundation" : "high",
      weight: week === "Week 10" || week === "Week 11" || week === "Week 12" ? 6 : 3,
      difficulty: "hard",
      tags: [slugify(week), "week-synthesis"],
      variantGroup: `${slugify(week)}:synthesis`,
      prompt: `Which statement best synthesizes the course's treatment of ${week}?`,
      correctAnswer: summary,
      distractors: buildDistractors(summary, unique(Object.values(topicsByWeek).map((items) => sentence(`${items.map((topic) => topic.title).join("; ")}. ${items.map((topic) => topic.argument || topic.summary).filter(Boolean).join(" ")}`)))),
      explanation: summary,
      sourceRef: `${week} synthesis`,
      studyNote: {
        context: `This synthesis question compresses the major topics the app groups under ${week}.`,
        whyCorrect: summary,
        howToSolve: `Look for the option that combines the week's main texts, institutions, and interpretive claim rather than isolating only one detail.`,
        trap: "Do not choose the option that belongs to a neighboring week with similar themes."
      }
    });
  });

  return questions.filter((question) => question.distractors.length >= 3);
}

async function main() {
  const [topics, guideMarkdown] = await Promise.all([loadTopics(), readFile(markdownSourcePath, "utf8")]);
  const bank = buildGeneratedQuestions(topics, parseGuideSections(guideMarkdown));
  const output = `window.GENERATED_CORE_QUESTIONS = Object.freeze(${JSON.stringify(bank, null, 2)});\n`;
  await writeFile(outputPath, output, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
