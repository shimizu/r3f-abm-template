# Repository Guidelines

## Project Structure & Module Organization
Source lives in `src/`, with `main.jsx` bootstrapping Vite, `App.jsx` handling UI state, and `Scene.jsx` housing the React Three Fiber scene graph. Agent behavior helpers are split between `src/agentScript.js`, `src/agents/`, and `src/walls/` so simulation logic stays isolated from rendering. Shared assets reside under `public/model`, while raw AgentScript inputs are stored in `reflence/` for quick iteration. Keep demo-only experiments (e.g., `Road_corner_curved.tsx`) in the repository root so they are easy to prune or port.

## Build, Test, and Development Commands
Run `npm install` once per checkout, then use `npm run dev` for the hot-reload development server at `localhost:5173`. `npm run build` emits the production bundle to `dist/`, and `npm run preview` serves that bundle for smoke testing. `npm run lint` executes ESLint across the entire tree; run it before every commit to catch import or hook-order issues early.

## Coding Style & Naming Conventions
Stick to modern ES modules, functional React components, and 2-space indentation. Use `PascalCase` for components (`AgentSphere`) and `camelCase` for functions, hooks, and file-local helpers. Place render-only styles in `App.css` and prefer inline props for transient visual tweaks. When editing Three.js objects, centralize magic numbers in small constants near their usage with a short comment (e.g., `const EXIT_GLOW = 0.75`). Run ESLint with the provided `eslint.config.js`; do not mix other formatters unless they mirror this config.

## Testing Guidelines
There is no dedicated unit-test harness yet, so rely on deterministic simulation steps plus linting to guard regressions. Before opening a PR, run a full `npm run lint`, launch `npm run dev`, and verify agents navigate correctly across each layout or reference dataset under `reflence/`. If you add automated tests, colocate them next to the module under test using the `.test.jsx` suffix and document any new commands in `package.json`.

## Commit & Pull Request Guidelines
Follow the existing history that blends Conventional Commit prefixes (`feat:`, `docs:`) with concise, imperative summaries; Japanese descriptors are acceptable when they clarify context. Commits should cover logical units: simulation changes separate from rendering tweaks. Every PR needs: summary of intent, reproduction or verification steps (`npm run dev`, screenshots/GIFs of the canvas), and links to tracking issues. Highlight any performance-impacting changes (agent counts, instancing tweaks) so reviewers can profile deliberately.
