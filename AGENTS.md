# Lang School

## CI/CD

- Read `docs/ci-cd.md` before modifying the pipeline. Workflow: `.github/workflows/ci.yml`; stable jobs: **Quality** and **Build and smoke**.
- Validate with `npm ci`, `npm run lint`, `npm run check`, existing unit tests when applicable, `npm run build`, `npx playwright install chromium`, and `npm run test:smoke`. Use the Node version in `.nvmrc`.
- Run `npm test` for unit tests. Browser smoke tests complete a practice and verify restored history and progression. Use browser-local mode only; never inject production Supabase credentials into CI. Auth/email/RLS verification is separate.
- Build before smoke tests. Playwright starts the built application on its own test port and checks Chromium desktop/mobile emulation with at most two workers. Failure reports and traces are retained as the `smoke-report` Actions artifact for seven days.
- Keep read-only workflow permissions, pinned official Actions, timeouts, cancellation of superseded runs and credential-free checkout. No Vercel or administrative database token is required by CI.
- After an authorized push, verify the Actions run matches the pushed commit and both jobs pass. Do not treat local tests or Vercel deployment status as proof of Actions success.
- Vercel Git integration provides deployment independently from CI. Do not claim that CI blocks production unless branch/deployment enforcement has been configured and verified separately. Do not change protections or secrets without authorization.
