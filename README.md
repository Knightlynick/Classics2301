# CS2301 Final Study System

This repository packages the course guide and static study app as one exam-prep system for `Classics 2301: Crime and Punishment in Ancient Greece and Rome`.

## What is here

- `study-docs/`: the editorial Markdown guide, generated LaTeX source, compiled PDF, and supporting notes
- `course-materials/`: the local course archive used to build the guide and app data
- `docs/`: the static web app for GitHub Pages, desktop browsers, and phones, now centered on a timeline workspace, guided reader, and expanded quiz engine
- `scripts/`: content generation, validation, smoke testing, and PR screenshot tooling

## Study workflow

- Read the main guide in [`study-docs/final_exam_study_guide.md`](study-docs/final_exam_study_guide.md) for the paragraph-first source copy.
- Use [`study-docs/final_exam_study_guide.pdf`](study-docs/final_exam_study_guide.pdf) for the print-ready version.
- Open [`docs/index.html`](docs/index.html) for the app with week modules, bridge weeks, readings, glossary, quiz review, and full-guide search.
- Treat Weeks 5 and 9 as bridge weeks: they are intentional review and transition modules, not fabricated lecture weeks.

## Build and test

Install the dev tooling once:

```powershell
npm install
```

Regenerate the app guide data, guided-reader content, LaTeX output, and generated core question bank from the Markdown source:

```powershell
npm run generate:guide
```

Validate the app data graph:

```powershell
npm run validate
```

Run the Playwright smoke test:

```powershell
npm test
```

Build the PDF guide:

```powershell
powershell -ExecutionPolicy Bypass -File study-docs/build-guide.ps1
```

Refresh PR screenshots:

```powershell
npm run screenshots
```

## Publishing note

`docs/` and `study-docs/` are publishable. `course-materials/` remains the local authoring archive and stays out of git unless you explicitly change that policy.

## GitHub Pages setup

After pushing the repo to GitHub:

1. Open `Settings > Pages`.
2. Under `Build and deployment`, choose `Deploy from a branch`.
3. Select the publishing branch and the `/docs` folder.
4. Save and wait for the site to publish.

The published app URL will then be:

- `https://<your-github-username>.github.io/<repo-name>/`
