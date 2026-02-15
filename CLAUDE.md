# CLAUDE.md

## Project Overview

**Office Chores App** — A React + TypeScript single-page application that provides an Outlook-style calendar interface for managing recurring office tasks. Data is persisted entirely in `localStorage`; there is no backend.

The application lives in the `chores-app/` directory at the repository root.

## Tech Stack

- **Framework:** React 19 with TypeScript (strict mode)
- **Build tool:** Vite 7
- **Date library:** date-fns 4 (tree-shakeable, used throughout for all date manipulation)
- **ID generation:** nanoid 5
- **Module system:** ESM (`"type": "module"` in package.json)

## Project Structure

```
chores-app/
├── index.html                  # App entry point (loads src/main.tsx)
├── package.json
├── tsconfig.json               # Strict TS config targeting ES2020
├── vite.config.ts              # Minimal Vite config with React plugin
└── src/
    ├── main.tsx                # React root mount
    ├── App.tsx                 # Top-level layout, state, and routing between views
    ├── types.ts                # Shared TypeScript types and constants
    ├── index.css               # All styles (Outlook-inspired, single CSS file)
    ├── components/
    │   ├── CalendarHeader.tsx   # View toggle (Day/Week/Month) and date navigation
    │   ├── ChoreCard.tsx        # Reusable chore display card with completion toggle
    │   ├── ChoreModal.tsx       # Add/edit chore form modal
    │   ├── DayView.tsx          # Single-day detail view
    │   ├── MiniCalendar.tsx     # Sidebar month navigator widget
    │   ├── MonthView.tsx        # Month grid calendar view
    │   ├── Sidebar.tsx          # Left sidebar container
    │   └── WeekView.tsx         # Week grid view
    ├── hooks/
    │   └── useChores.ts         # CRUD operations + localStorage persistence
    └── utils/
        └── recurrence.ts        # Recurrence expansion logic (getOccurrences, getChoresForRange)
```

## Commands

All commands must be run from the `chores-app/` directory:

```bash
cd chores-app

npm run dev       # Start Vite dev server (default: http://localhost:5173)
npm run build     # Type-check with tsc, then build for production
npm run preview   # Serve the production build locally
```

The `build` script runs `tsc && vite build` — TypeScript errors will fail the build.

## Key Data Types

Defined in `src/types.ts`:

- **`Chore`** — Core entity with `id`, `title`, `description`, `date` (ISO `YYYY-MM-DD`), `color` (hex), `recurrence` (nullable), and `completed` (keyed by `YYYY-MM-DD`).
- **`RecurrenceRule`** — `{ frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'; endDate?: string }`.
- **`CalendarView`** — `'day' | 'week' | 'month'`.
- **`CHORE_COLORS`** — Readonly array of 8 hex color constants.

## Architecture and Patterns

### State Management
- All chore state is managed by the `useChores` custom hook in `src/hooks/useChores.ts`.
- The hook uses `useState` initialized from `localStorage` and syncs back via `useEffect`.
- `localStorage` key: `"chores-app-data"`.
- App-level UI state (selected date, view mode, modal state) lives in `App.tsx`.

### Data Flow
- Unidirectional: `App.tsx` passes data and callbacks as props to child components.
- No context providers or external state management libraries.
- Memoized callbacks via `useCallback` in `App.tsx` and `useChores`.
- Calendar views use `useMemo` with `getChoresForRange` to compute visible chores.

### Recurrence System
- `src/utils/recurrence.ts` contains pure functions for expanding recurring chores into date occurrences within a given range.
- `getOccurrences(chore, rangeStart, rangeEnd)` — Returns ISO date strings for one chore.
- `getChoresForRange(chores, rangeStart, rangeEnd)` — Returns `Map<string, Chore[]>` for rendering.

## Code Conventions

### Naming
- **Components:** PascalCase, one per file, filename matches component name.
- **Props interfaces:** `{ComponentName}Props` (e.g., `ChoreModalProps`).
- **Hooks:** `use` prefix (e.g., `useChores`).
- **Utility functions:** Descriptive verb names (e.g., `getOccurrences`, `getChoresForRange`).

### Exports
- Named exports for all components and hooks (e.g., `export function App() {}`).
- No default exports.

### TypeScript
- Strict mode enabled with `noUnusedLocals`, `noUnusedParameters`, and `noFallthroughCasesInSwitch`.
- Use `import type` for type-only imports.
- Dates are stored as ISO `YYYY-MM-DD` strings; `Date` objects are used only for computation and display.

### CSS
- All styles in a single `src/index.css` file.
- BEM-like class naming: `.calendar-header`, `.chore-card`, `.modal-overlay`.
- CSS custom properties for theming/colors.
- Flexbox and CSS Grid for layouts.

## What This Project Does NOT Have

- **No tests** — No test runner, no test files, no testing libraries.
- **No linter/formatter** — No ESLint, Prettier, or pre-commit hooks.
- **No CI/CD** — No GitHub Actions or other pipeline configuration.
- **No backend** — All data is in the browser's `localStorage`.
- **No environment variables** — No `.env` files or runtime configuration.
- **No routing library** — View switching is managed via React state in `App.tsx`.

## Development Notes

- When adding new calendar views or modifying existing ones, follow the pattern in `MonthView.tsx` / `WeekView.tsx` / `DayView.tsx`: accept `selectedDate`, `chores`, and callback props; use `useMemo` with `getChoresForRange` for the visible date range.
- New components should be placed in `src/components/` with a matching filename and named export.
- New hooks should be placed in `src/hooks/`.
- New utility functions should be placed in `src/utils/`.
- Keep the `Chore` interface in `types.ts` as the single source of truth for the data shape.
