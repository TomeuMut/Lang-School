# Lang School

Current release: **v1.2.0**. See the [release notes](docs/releases/1.2.0.md).

A Nuxt 4 and Tailwind CSS language-practice application for Catalan and English, with A1–C2 selection and B2 selected by default. The interface is in Spanish and the practice content uses the selected target language.

## Practice bank

- Five tests of ten activities for each skill (grammar/vocabulary, reading, writing and speaking), in Catalan and English at all six A1-C2 levels: 240 tests and 2,400 scoped activities. Each grammar test covers ten constructions with different examples across the five tests. Each reading test contains two texts and five questions per text. Writing and speaking each provide ten separate communicative tasks per test, grouped around a scenario.
- Automatic checking and explanations for multiple-choice activities.
- Writing prompts, indicative word ranges, and self-assessment checklists.
- Speaking prompts for independent or partner practice; no microphone capture or automatic assessment.
- Public registration with email, name, surname, birth date and confirmed password; email/password access with Supabase, cloud history and draft synchronization, objective-answer accuracy, unique-completion coverage, and JSON export. Browser-local mode remains available without account configuration.
- Whole tests rotate independently for each language, level and skill. Tests not yet opened come first; after all five have been opened, the least recently opened test returns. An unfinished test is restored with **Continuar sesi?n**; starting another test advances the rotation. Only questions actually displayed are marked as seen. Mixed practice combines five grammar and five reading questions from the same test number.

Content and level assignments are indicative practice material awaiting teacher review, not an official exam simulator or an indicator of certification readiness. Reading material is shared within adjacent learning bands A1-A2, B1-B2 and C1-C2; changing level within a band can therefore revisit the same texts and questions. Production tasks reuse a scenario across ten different communicative purposes. Answer order changes are not counted as new content. Writing and speaking remain self-assessed, without automatic grading.

## Development

Use Node.js 22.23.4 or newer within Node 22 and npm. Install and select the version recorded in `.nvmrc` with your Node version manager.

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
6. For personal account access, apply the Supabase migration, apply the user profiles migration, enable public sign-ups and email confirmation, configure the two public variables in Vercel, and redeploy. Follow [account setup](docs/account-setup.md) for recovery URLs, privacy and live verification.

`vercel.json` declares the framework and commands. Nuxt/Nitro handles Vercel detection and output. A domain can stay with its existing provider; apply the exact DNS records shown by Vercel when attaching it.

Production deployment and account setup are not performed by this repository. Do not use local filesystem writes as production storage in Vercel functions.

## Exam references

The intended B2 preparation tracks are EOI Illes Balears (Catalan and English) and Govern Balear Catalan certification. Their formats differ. This edition practises common skills rather than reproducing task counts, timings, grading thresholds, or full official papers.

- [EOI Balears B2 sample papers](https://www.caib.es/sites/eoibalears/ca/nivell_intermedi%20b2-83980/)
- [Govern Balear Catalan B2 certificate](https://www.caib.es/webgoib/-/certificat-de-nivell-b2)
- [Nuxt on Vercel](https://vercel.com/docs/frameworks/full-stack/nuxt)

Always check the specifications for the actual exam session. Neither affiliation nor endorsement is implied. All bundled exercises are original; official papers and audio are linked rather than copied.

## Architecture and privacy

- `app/data/exercises.ts`: combined activity index preserving the 72 legacy starter IDs for history and saved drafts.
- `app/data/practice-bank/`: authored grammar examples, banded reading texts/questions and scenario-based writing/speaking tasks for the expanded tests.
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

## User registration and progression

The account screen supports registration, login and password recovery. Apply `supabase/migrations/202610250001_user_profiles.sql` after the progress migration and enable email sign-ups with confirmation in Supabase. Profiles are private to their owner. The progress screen includes a 14-day activity chart and an accessible daily accuracy table, scoped to language and level. See [account setup](docs/account-setup.md) for configuration and live checks.

Vercel's Supabase integration variables (`SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) are supported directly at build time. Explicit `NUXT_PUBLIC_*` settings override these aliases. Redeploy after configuring the integration. Only public connection values enter client runtime configuration; database passwords and administrative keys are never exposed by this mapping.

## Next milestones

1. Teacher review of the expanded banks and level assignments, followed by exam-track tags and level-specific reading material.
2. Licensed or original listening recordings and EOI mediation tasks.
3. Separate official-format mock exams with versioned specifications and grading rubrics.
4. Connect and verify the implemented Supabase account and progress integration in production; consider a later real-time synchronization flow.
5. Optional server-side assisted feedback with secret keys, rate limits, and human review; generated exercises must be validated and deduplicated before publication.

## Git Flow

`main` is production and `develop` is integration. Create `feature/*` branches from `develop` and merge through pull requests. Prepare releases on `release/*`, merge to production, add an annotated SemVer tag, and synchronise `develop`. Create urgent `hotfix/*` branches from production and merge into both production and integration. Do not rewrite shared history.

## Security maintenance (2026-10-23)

Node.js 22.23.4 is the minimum supported runtime, following the [October 21 Node.js security release](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases). `.nvmrc` selects that version, `engines` limits the supported major to Node 22, and `.npmrc` enables `engine-strict` so `npm ci` rejects older runtimes. Keep later Node 22 security patches installed.

Use Node.js 22.x on Vercel and verify that both the build logs and, for server deployments, the function runtime use 22.23.4 or a later patched Node 22 release. Vercel manages runtime patch versions; a repository setting alone cannot update an existing deployment. Redeploy after integrating these changes. If Vercel has not rolled out the minimum patch, installation intentionally fails instead of building with an affected runtime.

Run `npm audit --offline=false` with network access after dependency updates. An offline or cached result is not a current security assessment. The lockfile must be committed together with dependency changes.

The current application has no PHP runtime or Composer dependencies. The [October 21 PHP advisory](https://www.php.net/archive/2026.php) concerns PHP installations serving requests; changing JavaScript dependencies does not patch a separate PHP server or an old OctoberCMS deployment. Legacy PHP services, if still online, require a separate runtime update by their operator.
### Remaining dependency advisories

The online audit after the Nuxt 4.6.2 upgrade still reports 11 high-severity affected packages per project, propagated from two underlying advisories:

- `braces` 3.0.3: [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), stack exhaustion on deeply nested glob patterns. It is pulled in by Nitro's glob tooling.
- `node-forge` 1.4.0: [GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv), RSA signature verification. It is pulled in by `listhen`.

As of this review, both installed versions are the latest published npm versions and neither advisory lists a patched version. The 11 audit entries include parent packages; they are not 11 independent flaws. Do not use `npm audit fix --force`: npm proposes downgrading Nuxt to 4.1.3, which would reintroduce the fixed Nuxt vulnerabilities. Keep development servers private and do not pass untrusted glob patterns to build tooling. Recheck these dependencies when upstream publishes fixes.

Tomeu Ferments and Portfolio ship static files, so these Node packages do not execute on public requests. Lang School builds a Nitro server; deployment runtime and bundled dependencies require separate verification. Passing tests and builds does not establish that every dependency vulnerability is unreachable.

Validated locally with a SHA-256-verified official Node.js 22.23.4 binary: type checks and production builds for all three applications, all 20 Lang School tests, and Tomeu Ferments' generated SEO checks. Static builds emit a Nuxt/Nitro `cache-driver.mjs` external-resolution warning but finish successfully. No production deployment or global Node/PHP installation was changed.

## CI/CD

GitHub Actions runs lint, type checks, unit tests, production build and desktop/mobile browser smoke tests. Vercel handles deployments through its Git integration. See [CI/CD setup and local commands](docs/ci-cd.md) for coverage, reports and the separate deployment-gating configuration.
