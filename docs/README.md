# Roman Crime Study App

## What it is

A dependency-free static study app for `Classics 2301` with:
- a Roman-heavy final exam mix,
- cumulative review mode,
- by-week practice,
- answer explanations,
- local progress storage,
- a topic browser built from the same study data as the quiz.

## Local use

### Easiest

Open `index.html` directly in a browser.

### Better for offline/PWA behavior

Serve the `docs` folder as a static site:

```powershell
cd d:\Dev\School\Classics2301\docs
python -m http.server 8765
```

Then open:

```text
http://127.0.0.1:8765
```

## GitHub Pages

If this project is pushed to GitHub, publish the site from the `/docs` folder in repository settings.
