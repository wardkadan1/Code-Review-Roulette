# Code Review Roulette

A focused, accessible 3–20 person code review tool. Watch two wheels automatically reveal fair reviewer assignments, with no account, backend, or external service.

## Features

- Configurable 3–20 editable names with trimmed, case-insensitive duplicate validation.
- Automatic owner and reviewer wheels with accurate landing angles and a single cleaned-up phase timer.
- Responsive dark interface, initials, persistent result rows, and reduced-motion support.
- Reset confirmation, replay with a different mapping, and empty-team new rounds.
- Validated localStorage recovery; animation state is never saved.

## How It Works

Choose a participant count (default 5), enter names, and start the round. The wheels automatically reveal each owner and reviewer, then continue until everyone is assigned. Completed owners and reviewers are removed independently from their respective pools.

## Assignment Rules

The app samples shuffled permutations until it finds a derangement, with a bounded cyclic fallback that guarantees completion for every supported team size. Owner reveal order is shuffled separately. Each person reviews exactly one teammate and receives exactly one review; nobody reviews themselves. Precomputing this plan prevents dead ends. Replay excludes the previous mapping.

## Tech Stack

Next.js 16 App Router, React 19, strict TypeScript, Tailwind CSS 4, CSS wheel animations. Client-side state only; no environment variables required.

## Local Development

Node.js 22 or later:

```sh
npm ci
npm run dev
```

Open http://localhost:3000.

## Testing

```sh
npm test
npm run lint
```

Tests exercise 10,000 automatic rounds at sizes 3, 4, 5, 10, and 20, exact membership, uniqueness, phase transitions, replay, wheel landing geometry, legacy state migration, and saved-state corruption.

## Build

```sh
npm run build
npm start
```

## GitHub

Existing repository: https://github.com/wardkadan1/Code-Review-Roulette

Expected SSH remote: `git@github.com:wardkadan1/Code-Review-Roulette.git`. Production branch: `main`.

## Vercel Deployment

Import the existing GitHub repository into Vercel, select the Next.js preset, and use `main` as the production branch. No environment variables are needed. Keep Git integration enabled so each push to `main` automatically deploys.

## Privacy and persistence

The current round is stored only in this browser. New Round clears it. If storage is unavailable the app still works, but refresh recovery is unavailable. Malformed saved data is discarded. Refresh restarts the unfinished pair from a safe intro phase while preserving completed results. Reset confirmation suspends the sequence; confirming cancels the old timer and remounts the wheels. Team size limits and animation timings are configured in `src/lib/assignment.ts`.
