import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootDir = resolve(import.meta.dirname, "..");
const sourcePath = resolve(rootDir, "study-docs", "final_exam_study_guide.md");
const jsTargetPath = resolve(rootDir, "docs", "study-guide-content.js");
const texTargetPath = resolve(rootDir, "study-docs", "final_exam_study_guide.tex");

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

function escapeLatex(text) {
  return String(text || "")
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([{}$&#_%])/g, "\\$1")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}");
}

function renderInlineLatex(markdown) {
  const placeholders = [];
  const stash = (value) => {
    const token = `ZZZTOKEN${placeholders.length}ZZZ`;
    placeholders.push(value);
    return token;
  };

  let text = String(markdown || "");

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) =>
    stash(`\\href{${escapeLatex(href)}}{${renderInlineLatex(label)}}`)
  );
  text = text.replace(/`([^`]+)`/g, (_, code) => stash(`\\texttt{${escapeLatex(code)}}`));
  text = text.replace(/\*\*([^*]+)\*\*/g, (_, bold) => stash(`\\textbf{${renderInlineLatex(bold)}}`));
  text = text.replace(/\*([^*]+)\*/g, (_, italic) => stash(`\\emph{${renderInlineLatex(italic)}}`));

  text = escapeLatex(text);

  placeholders.forEach((value, index) => {
    text = text.replace(`ZZZTOKEN${index}ZZZ`, value);
  });

  return text;
}

function cleanMarkdown(markdown) {
  return String(markdown || "").replace(/<!--[\s\S]*?-->/g, "");
}

function renderLatexList(items, ordered) {
  const environment = ordered ? "enumerate" : "itemize";
  return [
    `\\begin{${environment}}`,
    ...items.map((item) => `\\item ${renderInlineLatex(item)}`),
    `\\end{${environment}}`,
    ""
  ].join("\n");
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

function renderLatexTable(tableLines) {
  const rows = tableLines
    .map((line) =>
      line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim())
    )
    .filter((row) => row.length);

  const [header, separator, ...body] = rows;
  void separator;
  const columnCount = header.length;
  const spec = `|${Array.from({ length: columnCount }, () => "X|").join("")}`;

  return [
    "\\begin{center}",
    `\\begin{tabularx}{\\textwidth}{${spec}}`,
    "\\hline",
    `${header.map((cell) => `\\textbf{${renderInlineLatex(cell)}}`).join(" & ")} \\\\`,
    "\\hline",
    ...body.map((row) => `${row.map((cell) => renderInlineLatex(cell)).join(" & ")} \\\\ \\hline`),
    "\\end{tabularx}",
    "\\end{center}",
    ""
  ].join("\n");
}

function markdownToLatex(markdown) {
  const lines = cleanMarkdown(markdown).split(/\r?\n/);
  const output = [];
  let index = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const line = rawLine.trim();

    if (!line) {
      output.push("");
      index += 1;
      continue;
    }

    if (/^#\s+/.test(line)) {
      index += 1;
      continue;
    }

    const headingMatch = /^(#{2,6})\s+(.+)$/.exec(line);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = renderInlineLatex(headingMatch[2].trim());

      if (level === 2) {
        output.push(`\\section{${title}}`);
      } else if (level === 3) {
        output.push(`\\subsection{${title}}`);
      } else {
        output.push(`\\paragraph{${title}}`);
      }

      output.push("");
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
      output.push(renderLatexTable(tableLines));
      continue;
    }

    if (/^[-*+]\s+/.test(line)) {
      const { items, nextIndex } = collectListItems(lines, index, false);
      output.push(renderLatexList(items, false));
      index = nextIndex;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const { items, nextIndex } = collectListItems(lines, index, true);
      output.push(renderLatexList(items, true));
      index = nextIndex;
      continue;
    }

    if (line.startsWith(">")) {
      const quoteLines = [];
      while (index < lines.length && lines[index].trim().startsWith(">")) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ""));
        index += 1;
      }
      output.push("\\begin{quotebox}");
      output.push(renderInlineLatex(quoteLines.join(" ")));
      output.push("\\end{quotebox}");
      output.push("");
      continue;
    }

    const paragraphLines = [line];
    index += 1;
    while (index < lines.length) {
      const nextLine = lines[index].trim();
      if (
        !nextLine ||
        /^#{1,6}\s+/.test(nextLine) ||
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
    output.push(renderInlineLatex(paragraphLines.join(" ")));
    output.push("");
  }

  return output.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildTexDocument(markdown) {
  const body = markdownToLatex(markdown);

  return `\\documentclass[11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{lmodern}
\\usepackage[margin=1in]{geometry}
\\usepackage[dvipsnames]{xcolor}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{array}
\\usepackage{booktabs}
\\usepackage{tabularx}
\\usepackage{titlesec}
\\usepackage{parskip}
\\usepackage[most]{tcolorbox}
\\usepackage{fancyhdr}
\\hypersetup{
  colorlinks=true,
  linkcolor=BrickRed,
  urlcolor=BrickRed,
  pdftitle={CS2301 Final Exam Study Guide},
  pdfauthor={OpenAI Codex},
  pdfsubject={Classics 2301 final exam review}
}
\\setlength{\\parskip}{0.45em}
\\setlength{\\parindent}{0pt}
\\setlength{\\headheight}{14pt}
\\setlist[itemize]{leftmargin=1.5em, itemsep=0.2em, topsep=0.35em}
\\setlist[enumerate]{leftmargin=1.8em, itemsep=0.25em, topsep=0.35em}
\\definecolor{RomanRed}{HTML}{8A3B22}
\\definecolor{Parchment}{HTML}{F6F0E5}
\\definecolor{BorderTan}{HTML}{D8C7A4}
\\titleformat{\\section}{\\Large\\bfseries\\color{RomanRed}}{}{0em}{}
\\titleformat{\\subsection}{\\large\\bfseries\\color{black}}{}{0em}{}
\\newtcolorbox{quotebox}{colback=Parchment,colframe=BorderTan,boxrule=0.6pt,arc=2pt,left=7pt,right=7pt,top=6pt,bottom=6pt}
\\pagestyle{fancy}
\\fancyhf{}
\\fancyhead[L]{CS2301 Final Guide}
\\fancyhead[R]{\\thepage}
\\begin{document}
\\begin{titlepage}
\\centering
{\\Huge\\bfseries CS2301 Final Exam Study Guide\\par}
\\vspace{1em}
{\\Large Crime and Punishment in Ancient Greece and Rome\\par}
\\vspace{1.5em}
{\\large Markdown source: \\texttt{${escapeLatex("study-docs/final_exam_study_guide.md")}}\\par}
\\vfill
{\\large \\today\\par}
\\end{titlepage}
\\tableofcontents
\\newpage
${body}
\\end{document}
`;
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
  await writeFile(jsTargetPath, output, "utf8");
  await writeFile(texTargetPath, buildTexDocument(markdown), "utf8");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
