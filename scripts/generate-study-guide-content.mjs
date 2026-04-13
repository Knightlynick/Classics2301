import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const sourcePath = resolve(rootDir, "study-docs", "final_exam_study_guide.md");
const targetPath = resolve(rootDir, "docs", "study-guide-content.js");

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[`'".,:;!?()[\]{}]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

function buildOutline(markdown) {
  const seen = new Map();
  const outline = [];

  for (const line of markdown.split(/\r?\n/)) {
    const match = /^(#{1,4})\s+(.+)$/.exec(line.trim());
    if (!match) {
      continue;
    }

    const level = match[1].length;
    const title = match[2].trim();
    const baseId = slugify(title) || `section-${outline.length + 1}`;
    const count = (seen.get(baseId) || 0) + 1;
    seen.set(baseId, count);

    outline.push({
      id: count > 1 ? `${baseId}-${count}` : baseId,
      level,
      title
    });
  }

  return outline;
}

function buildSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const sections = [];
  let current = {
    title: "Guide Overview",
    id: "guide-overview",
    markdown: []
  };

  for (const line of lines) {
    const match = /^##\s+(.+)$/.exec(line);
    if (match) {
      if (current.markdown.length) {
        sections.push({
          ...current,
          markdown: current.markdown.join("\n").trim()
        });
      }

      current = {
        title: match[1].trim(),
        id: slugify(match[1]) || `section-${sections.length + 1}`,
        markdown: [line]
      };
      continue;
    }

    current.markdown.push(line);
  }

  if (current.markdown.length) {
    sections.push({
      ...current,
      markdown: current.markdown.join("\n").trim()
    });
  }

  return sections.filter((section) => section.markdown);
}

async function main() {
  const markdown = await readFile(sourcePath, "utf8");
  const payload = {
    generatedFrom: "study-docs/final_exam_study_guide.md",
    generatedOn: new Date().toISOString(),
    markdown,
    outline: buildOutline(markdown),
    sections: buildSections(markdown)
  };

  const output = `window.STUDY_GUIDE_CONTENT = Object.freeze(${JSON.stringify(payload, null, 2)});\n`;
  await writeFile(targetPath, output, "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
