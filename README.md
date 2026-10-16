# Lang School

A Nuxt 4 and Tailwind CSS language-practice application for Catalan and English, with A1–C2 selection and B2 selected by default. The interface is in Spanish and the practice content uses the selected target language.

## First edition

- 72 original starter activities: six per language and level (two grammar, two reading, one writing, one speaking).
- Automatic checking and explanations for multiple-choice activities.
- Writing prompts, indicative word ranges, and self-assessment checklists.
- Speaking prompts for independent or partner practice; no microphone capture or automatic assessment.
- Personal email/password access with Supabase, cloud history and draft synchronization, objective-answer accuracy, unique-completion coverage, and JSON export. Browser-local mode remains available without account configuration.
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

The lockfile pins the installed dependency tree. Browser-local mode needs no external services. For private access and cross-device progress, configure Supabase as described in [account setup](docs/account-setup.md). `.env.example` lists the two public configuration variables; passwords and secret keys must never be committed.

## Deploy to Vercel

1. Import `TomeuMut/Lang-School` in Vercel.
2. Set the framework preset to Nuxt, repository root as the project root, and Node.js 22.x.
3. Use `npm ci` as the install command and `npm run build` as the build command. Leave the output directory at its framework default.
4. Use `main` as the production branch. Feature and integration branches can use Vercel Preview deployments.
5. Deploy and verify language/level selection, objective correction, writing, history persistence after reload, and responsive layout.
6. For personal account access, apply the Supabase migration, create your user with public sign-ups disabled, configure the two public variables in Vercel, and redeploy. Follow [account setup](docs/account-setup.md) for recovery URLs, privacy and live verification.

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
- `tests/persistence.test.ts`: draft restoration, completion recovery, stale-tab protection, incompatible drafts, and storage failures.
- `app/composables/useAccountPractice.ts`: account lifecycle, password recovery, cloud loading, optional legacy import and guarded sign-out.
- `app/utils/cloudProgress.ts`: asynchronous write queue, retries and optimistic revision conflicts.
- `supabase/migrations/202610160001_user_progress.sql`: owner-only database access and atomic saves.
- `tests/cloud-progress.test.ts`: cross-device persistence contract, concurrent edits, retry and conflict handling.

With Supabase configured, progress is stored in the authenticated user's Postgres row and is loaded after sign-in on each device. Passwords are managed by Supabase Auth. There is no analytics. Revision checks prevent a stale device from silently overwriting newer progress; synchronization errors are visible. See [account setup](docs/account-setup.md) for the exact save guarantees and live checks still required.

Without Supabase configuration, progress uses `lang-school:progress:v1` in localStorage. Clearing browser data removes that local history. Existing local progress can be explicitly imported into an initially empty account workspace. JSON export is an archive; importing exported files is not implemented yet.

The active session, language, level, selected answer, written draft and self-assessment are saved together with history, in the account when configured or on this device in local mode. Reloading restores the session; **Continuar sesión** resumes it. **Guardar práctica** marks an exercise as completed. Changing context or starting another skill asks before replacing an unfinished session. Clearing progress also clears drafts.

Storage failures are displayed explicitly. In local mode, an older tab detects that another tab has changed storage and pauses its own writes; in account mode, the database compares revisions across devices. Export the current session before discarding pending changes. JSON export includes the current session and draft, but importing exported files is not implemented. A draft incompatible with an updated exercise bank is retained as recoverable text rather than silently discarded. Browser-local storage is not a cloud backup; clearing site data removes local-mode progress but does not delete synchronized account progress.

## Next milestones

1. Teacher-reviewed B2 banks, tagged by exam track, topic, skill, and difficulty, with substantially more unique tasks.
2. Licensed or original listening recordings and EOI mediation tasks.
3. Separate official-format mock exams with versioned specifications and grading rubrics.
4. Connect and verify the implemented Supabase account and progress integration in production; consider a later real-time synchronization flow.
5. Optional server-side assisted feedback with secret keys, rate limits, and human review; generated exercises must be validated and deduplicated before publication.

## Git Flow

`main` is production and `develop` is integration. Create `feature/*` branches from `develop` and merge through pull requests. Prepare releases on `release/*`, merge to production, add an annotated SemVer tag, and synchronise `develop`. Create urgent `hotfix/*` branches from production and merge into both production and integration. Do not rewrite shared history.
