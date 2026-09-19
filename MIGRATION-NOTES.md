# Vite split

These files are a structural split of `deadliest-animals-story-updated.html`.

- `src/story/story.html` — original body markup.
- `src/App.css` — original `<style>` content.
- `src/data/animals.js` — original animal data, scene groups, scales, and scene metadata.
- `src/story/chartUtils.js` — original SVG/math/tooltip helpers.
- `src/story/buildPolarChart.js` — original chart, scrollytelling, animation, filters, and interaction logic.
- `src/story/initStory.js` — one initialization entry point for React.
- `src/App.jsx` — mounts the unchanged body markup and initializes the original chart logic.
- `src/data/worlds_deadliest_animals.csv` — copied unchanged from the supplied CSV.

Your existing `package.json`, `package-lock.json`, `vite.config.js`, and `README.md` can remain in place. No additional runtime dependency beyond the React/Vite app is required by this split.
