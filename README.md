# Lang School

A Nuxt 4 and Tailwind CSS language-practice application for Catalan and English, with A1–C2 selection and B2 selected by default. The interface is in Spanish and the practice content uses the selected target language.

## First edition

- 72 original starter activities: six per language and level (two grammar, two reading, one writing, one speaking).
- Automatic checking and explanations for multiple-choice activities.
- Writing prompts, indicative word ranges, and self-assessment checklists.
- Speaking prompts for independent or partner practice; no microphone capture or automatic assessment.
- Browser-local history, objective-answer accuracy, unique-completion coverage, and JSON export.
- Unseen activities take priority. Once a skill's pool is exhausted, the least recently seen activities return. Questions are marked as seen when displayed, including unfinished questions. No activity appears twice within one session.

Content and level assignments are indicative starter material awaiting teacher review. This is not an official exam simulator or an indicator of certification readiness. The small starter bank will repeat quickly within individual skills; changing answer order is not treated as new content.

## Development

Use Node.js 22.12 or newer within Node 22 and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Nuxt (normally `http://localhost:3000`).

```sh
npm run test
npm run typecheck
npm run build
npm run preview
```

The lockfile pins the installed dependency tree. There are no API keys, external database requirements, or environment variables in this edition.

## Deploy to Vercel

1. Import `TomeuMut/Lang-School` in Vercel.
2. Set the framework preset to Nuxt, repository root as the project root, and Node.js 22.x.
3. Use `npm ci` as the install command and `npm run build` as the build command. Leave the output directory at its framework default.
4. Use `main` as the production branch. Feature and integration branches can use Vercel Preview deployments.
5. Deploy and verify language/level selection, objective correction, writing, history persistence after reload, and responsive layout.

`vercel.json` declares the framework and commands. Nuxt/Nitro handles Vercel detection and output. A domain can stay with its existing provider; apply the exact DNS records shown by Vercel when attaching it.

Production deployment and account setup are not performed by this repository. Do not use local filesystem writes as production storage in Vercel functions.

## Exam references

The intended B2 preparation tracks are EOI Illes Balears (Catalan and English) and Govern Balear Catalan certification. Their formats differ. This edition practises common skills rather than reproducing task counts, timings, grading thresholds, or full official papers.

- [EOI Balears B2 sample papers](https://www.caib.es/sites/eoibalears/ca/nivell_intermedi%20b2-83980/)
- [Govern Balear Catalan B2 certificate](https://www.caib.es/webgoib/-/certificat-de-nivell-b2)
- [Nuxt on Vercel](https://vercel.com/docs/frameworks/full-stack/nuxt)

Always check the specifications for the actual exam session. Neither affiliation nor endorsement is implied. All bundled exercises are original; official papers and audio are linked rather than copied.

## Architecture and privacy

- `app/data/exercises.ts`: typed, original starter bank with stable exercise IDs.
- `app/utils/practice.ts`: selection policy, progress types, and defensive storage parsing.
- `app/composables/usePractice.ts`: session lifecycle and local persistence.
- `app/app.vue`: responsive dashboard, practice, history, and resource screens.
- `tests/practice.test.ts`: bank integrity, anti-repeat selection, and storage recovery.

Progress is stored under `lang-school:progress:v1` in localStorage. Submitted text responses are saved on this device; there is no login, analytics, cross-device synchronisation, or cloud backup. Clearing browser data removes the history. JSON export is an archive; importing it is not implemented yet. If storage is blocked or full, the interface reports that progress may be temporary.

An unfinished session stays in memory when navigating between app views. Changing language, level, or starting another skill asks before replacing that session. Unsaved text is not a persistent draft: use **Guardar práctica** to save it. The app requests the browser's leave-page warning when unsaved text or self-assessment is present, but browsers may suppress that warning. Reloading or closing the page can discard unfinished work.

## Next milestones

1. Teacher-reviewed B2 banks, tagged by exam track, topic, skill, and difficulty, with substantially more unique tasks.
2. Licensed or original listening recordings and EOI mediation tasks.
3. Separate official-format mock exams with versioned specifications and grading rubrics.
4. Authentication and a durable database for cross-device progress and per-user selection history.
5. Optional server-side assisted feedback with secret keys, rate limits, and human review; generated exercises must be validated and deduplicated before publication.

## Git Flow

`main` is production and `develop` is integration. Create `feature/*` branches from `develop` and merge through pull requests. Prepare releases on `release/*`, merge to production, add an annotated SemVer tag, and synchronise `develop`. Create urgent `hotfix/*` branches from production and merge into both production and integration. Do not rewrite shared history.
