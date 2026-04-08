# Roman Crime Final Study Package

This repository is organized so the study materials are easy to find and the quiz app is ready for GitHub Pages.

## Folder layout

- `study-docs/`: written study materials, including the reference Markdown guide plus the final LaTeX source and compiled PDF guide
- `course-materials/`: local-only archive of lecture scripts, slide extracts, readings, PowerPoints, and study questions used to build the guide and app
- `docs/`: the static quiz app for desktop, phone, and GitHub Pages

## Start here

- Main guide PDF: `study-docs/final_exam_study_guide.pdf`
- Main guide source: `study-docs/final_exam_study_guide.tex`
- Main guide reference copy: `study-docs/final_exam_study_guide.md`
- Quiz app: `docs/index.html`
- Rebuild the PDF: `powershell -ExecutionPolicy Bypass -File study-docs/build-guide.ps1`

## Publishing note

This repo is set up so `docs/` and `study-docs/` can be published without exposing the raw course archive. `course-materials/` is restored locally for authoring and study use, but it is ignored by git and will not be included in future pushes unless you explicitly change that.

## GitHub Pages setup

After this folder is pushed to a GitHub repository:

1. Open the repository on GitHub.
2. Go to `Settings > Pages`.
3. Under `Build and deployment`, choose `Deploy from a branch`.
4. Select the `main` branch and the `/docs` folder.
5. Save and wait for GitHub Pages to publish the site.

Your phone-ready app URL will then be:

- `https://<your-github-username>.github.io/<repo-name>/`

Once it loads on your phone, add it to your home screen from Safari or Chrome.
