# Code Review Roulette

A focused, accessible five-person code review tool. Spin two wheels to reveal fair reviewer assignments, with no account, backend, or external service.

## Features

- Exactly five editable names with trimmed, case-insensitive duplicate validation.
- Owner and reviewer wheels with accurate landing angles and gated interaction.
- Responsive dark interface, initials, persistent result rows, and reduced-motion support.
- Reset confirmation, replay with a different mapping, and empty-team new rounds.
- Validated localStorage recovery; animation state is never saved.

## How It Works

Enter five names, spin the owner wheel, then spin the reviewer wheel. Repeat until all five matches are revealed. Completed owners and reviewers are removed independently from their respective pools.

## Assignment Rules

The app enumerates the 44 derangements of five people and chooses one at random. Owner reveal order is shuffled separately. Each person reviews exactly one teammate and receives exactly one review; nobody reviews themselves. Precomputing this plan prevents dead ends. Replay excludes the previous mapping.

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

Tests exercise 10,000 randomized rounds, exact membership, uniqueness, state transitions, replay, and saved-state corruption.

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

The current round is stored only in this browser. New Round clears it. If storage is unavailable the app still works, but refresh recovery is unavailable. Malformed saved data is discarded. Refresh during a spin restores the last stable step, allowing that spin to be repeated safely.
