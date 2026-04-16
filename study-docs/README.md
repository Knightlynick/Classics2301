# Study Documents

## Main guide files

- `final_exam_study_guide.md`: the editorial source of truth
- `final_exam_study_guide.tex`: generated LaTeX build source
- `final_exam_study_guide.pdf`: compiled print-ready guide

## Supporting notes

- `weeks1_4_lecture_notes.pdf`
- `midterm2_study_notes.pdf`
- `midterm2_readings_companion.pdf`

## Build flow

The guide is now generated from the Markdown source.

1. `../scripts/generate-study-guide-content.mjs` reads `final_exam_study_guide.md`.
2. It regenerates both `../docs/study-guide-content.js` and `final_exam_study_guide.tex`.
3. `build-guide.ps1` then runs `pdflatex` to produce `final_exam_study_guide.pdf`.

Build the final guide with:

```powershell
powershell -ExecutionPolicy Bypass -File build-guide.ps1
```

Build artifacts are written to `latex-build/`.
