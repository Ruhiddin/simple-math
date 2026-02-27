# Architecture Guide

## 1) Project Overview

**Simple Math** is a classroom-friendly arithmetic game built with React + Vite. It is optimized for teacher-led, fast-paced sessions where two players compete while the teacher controls pacing.

### Core purpose
- Start quickly with minimal setup.
- Generate arithmetic questions automatically.
- Run timed rounds that enforce classroom rhythm.
- Keep score externally from question correctness (teacher adjudicates and updates points).

### Main features
- Configurable arithmetic operations (`plus`, `subtract`, `multiply`, `divide`).
- Configurable difficulty via steps/actions, number range, timer, and question count.
- Random or sequential target selection.
- Round timer with forced reveal when time expires.
- Bilingual UI (English / Uzbek) with persisted language choice.
- Persisted game settings using `localStorage`.
- GitHub Pages-ready deployment.

---

## 2) Tech Stack

- **React 18** (`react` / `react-dom` 18.3.x).
- **Vite 5** for dev server and bundling.
- **TypeScript** across app logic.
- **SCSS modules** for component-scoped styles + global token files.
- **i18n** with `i18next` + `react-i18next` (local vendor copies in `vendor/`).
- **Persistence** via browser `localStorage`:
  - `simple-math-settings` for gameplay settings.
  - `lang` for selected language.
- **Deployment target:** GitHub Pages via GitHub Actions workflow.

---

## 3) Folder Structure

```txt
src/
  app/              # App shell and top-level state orchestration
  components/       # UI components (settings, timer, board, score, etc.)
  hooks/            # Reusable hooks (countdown timer)
  utils/            # Game logic utilities (generation, evaluation, RNG, formatting)
  styles/           # Global styles and SCSS tokens
  i18n.ts           # i18next setup + translation resources
.github/workflows/  # CI/CD deployment pipeline to GitHub Pages
vite.config.ts      # Vite base path and dev server config
```

### Key areas
- **`src/components`**
  - Presentational and interaction components.
  - Settings UI, question board/cards, timers, score panels, result screen, language switcher.
- **`src/hooks`**
  - `useCountdown` encapsulates round timing behavior.
- **`src/utils`**
  - `questionGenerator` builds valid expressions from settings.
  - `evaluateExpression` calculates answers.
  - `rng` provides random helpers.
  - `formatExpression` handles display formatting.
- **`src/styles`**
  - Design tokens and global styles.
- **`src/i18n.ts`**
  - Translation dictionaries and language persistence wiring.
- **Deployment config**
  - `vite.config.ts` sets `base` for GitHub Pages.
  - `.github/workflows/deploy.yml` handles build and deploy pipeline.

---

## 4) State Architecture

Top-level state lives in `src/app/App.tsx` and drives all game screens.

### Top-level app mode
- `SETUP` → Settings panel shown.
- `PLAY` → Active rounds (timer + reveal cycle).
- `RESULTS` → End-of-game view.

### Game phase
Within `PLAY`, state transitions are effectively:
- `RUNNING` (`playPhase === "running"`) → countdown active.
- `REVEAL` (`playPhase === "reveal"`) → correct question highlighted, Next enabled.
- `DONE` (conceptual) → represented by switching app `mode` to `RESULTS`.

### `roundStepKey` logic
`roundStepKey` is an incrementing round identity token used to:
- reset countdown state per round,
- associate expiration callbacks with the current round,
- prevent stale timer callbacks from revealing old rounds.

Whenever a new target round starts (`handleStart`, `handleNext`), `roundStepKey` increments.

### Timer logic integration
- `useCountdown` receives:
  - `duration` (from settings),
  - `isRunning` (derived from mode + phase + target availability),
  - `roundStepKey`,
  - `onExpire` callback (`forceReveal`).
- On expiration, `forceReveal(roundStepKey)` transitions current round from `RUNNING` to `REVEAL` and marks the target question as resolved.

### Settings persistence logic
- On app bootstrap: reads `localStorage["simple-math-settings"]`.
- Parsed settings are validated and normalized (`validateStoredSettings` + clamp rules).
- On settings changes: serialized back to `localStorage`.

---

## 5) Settings Model

Canonical gameplay settings shape (`GameSettings`):

```ts
{
  methods: Array<'plus' | 'subtract' | 'multiply' | 'divide'>,
  actions: number,
  questionCount: number,
  min: number,
  max: number,
  timeoutSeconds: number,
  targetSelectionMode: 'random' | 'sequential'
}
```

### Field meanings
- `methods`: enabled operation types used during generation.
- `actions`: number of operator steps per expression (1..5 in UI/runtime constraints).
- `questionCount`: number of generated questions (1..20 in UI/runtime constraints).
- `min` / `max`: inclusive random number bounds.
- `timeoutSeconds`: per-round countdown duration.
- `targetSelectionMode`: how next target question is chosen.

### Language setting
Language is intentionally stored outside `GameSettings`:
- key: `localStorage["lang"]`
- values: `"en"` or `"uz"`

### Persistence summary
- `simple-math-settings` stores `GameSettings` JSON.
- invalid/missing values fall back to defaults.
- numeric values are normalized (integer coercion + clamps) before game start.

---

## 6) Question Generation Logic

Implemented in `src/utils/questionGenerator.ts`.

### Expression construction
For each question:
1. Start with one random number.
2. Repeat `actions` times:
   - choose an operator from enabled `methods`,
   - append next number based on operator rules.
3. Compute final answer with `evaluateExpression(numbers, operators)`.

### Actions/steps usage
- `actions` directly controls expression length:
  - numbers count = `actions + 1`
  - operators count = `actions`

### Division safety
Division avoids zero divisor:
- `safeDivisor(min, max)` retries random picks up to `maxAttempts`.
- fallback divisor is `1` if no non-zero value is produced.
- generator also forces clean divisibility:
  - picks `divisor` and `factor`,
  - rewrites current dividend as `divisor * factor`,
  - then divides by `divisor`, producing an integer step result.

### Answer calculation
- `evaluateExpression` produces authoritative numeric answer from generated arrays.
- `answer` is stored per question and later used for reveal panel and teacher matching.

---

## 7) Timer System

Implemented via `useCountdown` (`src/hooks/useCountdown.ts`).

### Hook behavior
- Initializes `remaining` from `duration`.
- Resets countdown on `duration` or `roundStepKey` changes.
- While `isRunning`, decrements every 1000 ms.
- Stops at 0 and triggers `onExpire(roundStepKey)` once.

### Expiration handling
- App passes `forceReveal` as `onExpire`.
- On expiry, app reveals correct question and disables active countdown flow.

### Stale expiration prevention
Two protections prevent old intervals from affecting new rounds:
1. **Hook-level guard**: `expiredRoundRef` ensures one expiration per `roundStepKey`.
2. **App-level guard** (`forceReveal`): checks current round identity and current mode/phase refs before mutating state.

This dual check is critical because React state updates and timers are asynchronous.

---

## 8) Stepper Input Component

Implemented in `src/components/StepperInput/StepperInput.tsx`.

### Props
- `label: string`
- `value: number`
- `onChange: (value: number) => void`
- `min: number`
- `max: number`
- `helperText?: string`
- `disabled?: boolean`

### Draft vs committed value
- Component keeps a local string `draft` for raw user typing.
- Parent owns canonical numeric `value`.
- `draft` syncs from `value` when parent updates.
- Commit happens on:
  - `blur`,
  - `Enter`,
  - +/- step buttons,
  - ArrowUp / ArrowDown key stepping.

### Validation strategy
- Parse with `Number.parseInt`.
- If parse fails: revert draft to current parent value.
- If parse succeeds: clamp to `[min, max]`.
- Only call `onChange` when value actually changes.

---

## 9) How to Add Features

### Add a new operation type
1. Extend `Operator` union in `evaluateExpression.ts`.
2. Add translation labels in `src/i18n.ts` (`settings.methods.*`).
3. Add method option in `SettingsPanel` method list.
4. Update generation logic in `questionGenerator.ts` for number construction rules.
5. Update formatting (if symbol mapping needed) in `formatExpression.ts`.

### Add a new setting
1. Extend `GameSettings` interface.
2. Add default value in `App.tsx` (`defaultSettings`).
3. Include validation in `validateStoredSettings`.
4. Add UI controls in `SettingsPanel`.
5. Wire setting into generator/timer/render behavior.
6. Add i18n labels.

### Change difficulty logic
- Main levers:
  - `actions` (expression depth),
  - `min`/`max` (number magnitude/sign),
  - enabled `methods`,
  - `timeoutSeconds`.
- For advanced difficulty curves, introduce a computed “profile” function in `utils/` and apply it before `generateQuestions`.

### Add new languages
1. Add locale key under `resources` in `src/i18n.ts`.
2. Provide complete translation dictionary.
3. Update `LanguageSwitcher` UI to expose the new locale.
4. Decide storage compatibility (`localStorage["lang"]` value).

### Modify UI themes
- Update tokens in `src/styles/tokens.scss`.
- Adjust global defaults in `src/styles/globals.scss`.
- Fine-tune component-scoped `.module.scss` files.

---

## 10) Deployment

### Vite base config
GitHub Pages requires a repo-based base path in `vite.config.ts`:

```ts
export default defineConfig({
  base: '/<repo-name>/',
});
```

For this repository it is currently `/simple-math/`.

### GitHub Pages flow
Defined in `.github/workflows/deploy.yml`:
1. Trigger on push to `main` (or manual workflow dispatch).
2. Install dependencies (`npm ci`).
3. Build (`npm run build`).
4. Upload `dist/` as Pages artifact.
5. Deploy via `actions/deploy-pages`.

### Where to change repo name
- Update `base` in `vite.config.ts` when repository name changes.
- Ensure Pages settings in GitHub repository point to GitHub Actions deployment.

---

## 11) Development Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

- `npm run dev`: local development server (default Vite port configured as `5173`).
- `npm run build`: production bundle output in `dist/`.
- `npm run preview`: serve built output locally for production-like verification.
