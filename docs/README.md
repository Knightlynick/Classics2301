# CS2301 Study App

## What it includes

The app is a static study surface built from the same course data as the guide. It includes:

- a timeline-first study workspace with laws, crimes, punishments, and linked course moments
- week-by-week lecture modules with longer prose explanations and likely exam angles
- explicit bridge-week modules for Weeks 5 and 9
- reading dossiers with source provenance, section maps, and clickable passages
- glossary overlays tied back to readings and lecture weeks
- quiz review with a generated large-bank core set, stronger randomness, and explanation links back into the study materials
- the full guide rendered as a guided reader with chapter navigation instead of one long scroll

## Local use

### Simple

Open `index.html` directly in a browser.

### Better for testing and screenshots

Serve the `docs` folder as a static site:

```powershell
cd d:\Dev\School\Classics2301\docs
python -m http.server 8765
```

Then open:

```text
http://127.0.0.1:8765
```

## Data flow

- `study-docs/final_exam_study_guide.md` is the editorial source.
- `../scripts/generate-study-guide-content.mjs` regenerates `study-guide-content.js`.
- `../scripts/generate-question-bank.mjs` regenerates `generated-core-questions.js`.
- `data.js` assembles week modules, reading dossiers, glossary links, quiz references, and bridge-week metadata into `window.STUDY_DATA`.

## QA

From the repository root:

```powershell
npm run validate
npm test
```

## GitHub Pages

Publish the site from the repository `/docs` folder in GitHub Pages settings.
