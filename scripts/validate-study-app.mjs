import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";

const rootDir = resolve(import.meta.dirname, "..");
const files = [
  "docs/study-topics.js",
  "docs/quiz-questions.js",
  "docs/study-guide-content.js",
  "docs/data.js"
];

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function materializeQuestion(question) {
  const choices = shuffle([
    { label: question.correctAnswer, correct: true },
    ...question.distractors.map((choice) => ({ label: choice, correct: false }))
  ]);

  return choices.findIndex((choice) => choice.correct);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function loadContext() {
  const context = { window: {}, console };
  vm.createContext(context);

  for (const relativePath of files) {
    const absolutePath = resolve(rootDir, relativePath);
    const source = await readFile(absolutePath, "utf8");
    vm.runInContext(source, context, { filename: relativePath });
  }

  return context;
}

async function main() {
  const context = await loadContext();
  const data = context.window.STUDY_DATA;

  assert(data, "window.STUDY_DATA was not created.");

  const weekIds = new Set(data.weekModules.map((module) => module.id));
  const readingIds = new Set(data.readingDossiers.map((reading) => reading.id));
  const glossaryIds = new Set(data.glossaryIndex.map((entry) => entry.id));
  const guideSectionIds = new Set(data.guideSections.topLevelSections.map((section) => section.id));

  assert(data.weekModules.length === 12, "Expected 12 week modules including archive gaps.");
  assert(data.noLectureWeeks.includes("week-5"), "Week 5 archive note is missing.");
  assert(data.noLectureWeeks.includes("week-9"), "Week 9 archive note is missing.");

  data.weekModules.forEach((module) => {
    if (module.guideSectionId) {
      assert(guideSectionIds.has(module.guideSectionId), `Broken guide section link on ${module.id}.`);
    }
    (module.relatedReadingIds || []).forEach((readingId) => {
      assert(readingIds.has(readingId), `Broken reading link ${readingId} on ${module.id}.`);
    });
  });

  data.readingDossiers.forEach((reading) => {
    (reading.relatedWeekIds || []).forEach((weekId) => {
      assert(weekIds.has(weekId), `Broken week link ${weekId} on reading ${reading.id}.`);
    });
    assert(Array.isArray(reading.excerpts) && reading.excerpts.length >= 2, `Reading ${reading.id} needs excerpt coverage.`);
    assert(Array.isArray(reading.sections) && reading.sections.length >= 3, `Reading ${reading.id} needs section coverage.`);
    assert(Array.isArray(reading.sourceProvenance) && reading.sourceProvenance.length >= 1, `Reading ${reading.id} needs source provenance.`);

    const sectionIds = new Set();
    const passageIds = new Set();
    reading.sections.forEach((section) => {
      assert(section.id, `Reading ${reading.id} has a section without an id.`);
      assert(!sectionIds.has(section.id), `Reading ${reading.id} has duplicate section id ${section.id}.`);
      sectionIds.add(section.id);
      assert(Array.isArray(section.passages) && section.passages.length >= 1, `Reading ${reading.id} section ${section.id} needs mapped passages.`);

      section.passages.forEach((passage) => {
        assert(passage.id, `Reading ${reading.id} section ${section.id} has a passage without an id.`);
        assert(!passageIds.has(passage.id), `Reading ${reading.id} has duplicate passage id ${passage.id}.`);
        passageIds.add(passage.id);
      });
    });
  });

  data.glossaryIndex.forEach((entry) => {
    (entry.relatedWeekIds || []).forEach((weekId) => {
      assert(weekIds.has(weekId), `Broken glossary week link ${weekId} on ${entry.id}.`);
    });
    (entry.relatedReadingIds || []).forEach((readingId) => {
      assert(readingIds.has(readingId), `Broken glossary reading link ${readingId} on ${entry.id}.`);
    });
  });

  data.quizQuestions.forEach((question) => {
    assert(question.correctAnswer, `Question ${question.id} is missing correctAnswer.`);
    assert(Array.isArray(question.distractors) && question.distractors.length >= 1, `Question ${question.id} is missing distractors.`);
    assert(!question.distractors.includes(question.correctAnswer), `Question ${question.id} includes the correct answer in distractors.`);
    assert(new Set(question.distractors).size === question.distractors.length, `Question ${question.id} has duplicate distractors.`);

    if (question.studyRef?.type === "week") {
      assert(weekIds.has(question.studyRef.moduleId), `Question ${question.id} points to missing week ${question.studyRef.moduleId}.`);
      if (question.studyRef.readingId) {
        assert(readingIds.has(question.studyRef.readingId), `Question ${question.id} points to missing reading ${question.studyRef.readingId}.`);
      }
      if (question.studyRef.readingId && question.studyRef.readingSectionId) {
        const reading = data.readingDossiers.find((entry) => entry.id === question.studyRef.readingId);
        assert(
          reading?.sections?.some((section) => section.id === question.studyRef.readingSectionId),
          `Question ${question.id} points to missing reading section ${question.studyRef.readingSectionId}.`
        );
      }
      if (question.studyRef.readingId && question.studyRef.readingPassageId) {
        const reading = data.readingDossiers.find((entry) => entry.id === question.studyRef.readingId);
        assert(
          reading?.sections?.some((section) =>
            section.passages?.some((passage) => passage.id === question.studyRef.readingPassageId)
          ),
          `Question ${question.id} points to missing reading passage ${question.studyRef.readingPassageId}.`
        );
      }
    }

    if (question.studyRef?.type === "glossary") {
      assert(glossaryIds.has(question.studyRef.glossaryId), `Question ${question.id} points to missing glossary ${question.studyRef.glossaryId}.`);
    }
  });

  const answerCounts = [0, 0, 0, 0];
  for (let round = 0; round < 20; round += 1) {
    data.quizQuestions.slice(0, 200).forEach((question) => {
      const index = materializeQuestion(question);
      answerCounts[index] += 1;
    });
  }

  const total = answerCounts.reduce((sum, count) => sum + count, 0);
  answerCounts.forEach((count, index) => {
    const ratio = count / total;
    assert(ratio > 0.18 && ratio < 0.32, `Answer distribution skew detected at ${String.fromCharCode(65 + index)} (${(ratio * 100).toFixed(1)}%).`);
  });

  console.log(
    JSON.stringify(
      {
        weeks: data.weekModules.length,
        readings: data.readingDossiers.length,
        glossaryTerms: data.glossaryIndex.length,
        quizQuestions: data.quizQuestions.length,
        answerDistribution: {
          A: answerCounts[0],
          B: answerCounts[1],
          C: answerCounts[2],
          D: answerCounts[3]
        }
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
