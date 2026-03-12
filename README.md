# Pitchfolio

Invest in ideas. Score the outcomes. Watch the leaderboard move.

Pitchfolio is a season-based classroom investment simulator built for project demos, launch experiments, and team-based evaluation. Students invest virtual capital in teams other than their own, admins enter performance data, and the app turns conversion into returns.

## What It Does

- Runs the whole experience by season
- Lets admins create teams, students, and stage flow
- Lets students invest virtual capital across other teams
- Records visitors and waitlist counts per team
- Calculates conversion rate, profit rate, and final return on demand
- Shows student results, team standings, and winner highlights

## Core Flow

1. Create a season
2. Add teams and students
3. Open the investment stage
4. Students allocate capital
5. Close investment
6. Enter team performance
7. Review returns and winners

## Product Shape

- `Admin`: controls seasons, setup, stage, performance, winners, and results
- `Student`: reviews teams, invests, and checks returns
- `Season-first`: all teams, users, investments, and performance data stay isolated by season

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- better-sqlite3
- Zod

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev    # start local dev server
npm run lint   # run eslint
npm run build  # production build
npm run start  # start production server
```

## Login

- Students and admins sign in with `name + PIN`
- Default PIN is `0000`
- The app uses the active season to resolve student access

## Data Model, In Plain English

- `seasons`: the container for one run of the simulation
- `teams`: project teams inside a season
- `users`: admins and students
- `investment_orders`: each submitted investment order
- `performance_metrics`: visitors and waitlist counts per team

Result values like profit rate and final return are not stored as snapshots. Pitchfolio computes them when the result screens load.

## Why It Feels Different

Pitchfolio is not a voting board with nicer labels. It is a small market for ideas.

Students do not just pick favorites. They place capital.
Admins do not just rank teams. They enter evidence.
Results do not just announce winners. They show return.

## Current Brand Direction

`Pitchfolio` = `Pitch + Portfolio`

The product frames classroom demos like a lightweight idea market: part pitch day, part investment game, part performance review.

## Notes

- Data is stored locally in SQLite
- This repo is optimized for internal/classroom use, not public multi-tenant deployment
- Authentication is intentionally lightweight for MVP speed
