# Private account and cloud progress

Lang School runs on Vercel with Supabase Auth and Postgres. Vercel does not store progress in its filesystem. Exercise history, seen questions, selected language/level, active session, written drafts and self-assessment are stored in the authenticated user's `user_progress` row.

## Supabase setup

1. Create a Supabase project in a suitable region.
2. Run `supabase/migrations/202610160001_user_progress.sql` in the SQL editor, or apply it using your normal Supabase migration workflow. It creates the table, owner-only row-level-security policies and the atomic revision-based save function.
3. In Authentication settings, enable email/password authentication, disable public sign-ups and set the minimum password length to 12. There is no public registration screen. Create your personal user in Authentication > Users with your email and a strong password. Confirm the email through the dashboard for this administrator-created account. Do not put your password in Git or environment variables.
4. Set the Auth Site URL to your stable Vercel or custom-domain origin, such as `https://your-project.vercel.app`.
5. Add the exact recovery redirect URL `https://your-project.vercel.app/` to the allowed redirect URLs. For local development, add `http://localhost:3000/` (or the port actually in use). If testing a preview, explicitly allow that preview origin too. Use a stable production origin for normal practice.
6. Configure the email provider in Supabase for password recovery. Its built-in development email service has delivery restrictions and is not a substitute for production SMTP. Test delivery to your own email before relying on recovery.

The application uses only a publishable key (or the legacy anon key), with RLS enabled. Never use a secret or service-role key in a `NUXT_PUBLIC_*` variable. The database rejects requests without authentication and restricts rows to `auth.uid() = user_id`. The save function also checks the explicitly bound workspace owner to reject a request if authentication changes while a save is in flight.

## Vercel configuration

Keep the Nuxt framework preset and `npm run build`. Use Node.js 22.x and `npm ci`. Leave the output directory at its framework default. Add these variables to the intended deployment environment:

```dotenv
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Redeploy after changing environment variables. Both values are public client configuration; the publishable key does not grant access to another user's progress. Database policies enforce that separation. No additional server, persistent Vercel disk or scheduled job is required.

For local development, copy `.env.example` to `.env` and fill in the same values. If neither is configured, the existing browser-local mode remains available and displays an explicit local-mode notice. A partially configured environment stops at a configuration error rather than silently switching to local mode.

## Daily use

- Sign in with your email and password. The application loads your cloud workspace before enabling practice.
- Wait for **Progreso sincronizado** before closing a device or moving to another. Drafts are debounced; completed answers and drafts use the same cloud document.
- On a second device, sign in to load the latest workspace. A page left open does not receive live updates: choose **Actualizar desde mi cuenta** before continuing on it.
- If another device saved first, automatic writes stop. Export your pending copy, then choose **Cargar versión de mi cuenta**. Pending drafts are not silently merged or allowed to overwrite the newer cloud revision. JSON export remains an archive; importing an exported file is not implemented.
- If the connection fails, the pending workspace remains in memory and the page warns that it is not synced. Reconnect and retry, or export before leaving. The app warns on navigation with unsaved cloud changes, but browsers cannot guarantee delivery when a tab is force-closed. Offline reload is not supported.
- Closing the session first waits for successful cloud saving. Signing out applies only to that browser session, so the office and home sessions can remain independently signed in. Shared computers should be signed out when finished.
- The previous browser-local history can be imported explicitly into an initially empty account workspace. It is never attached to an account automatically, never removed from the old browser and cannot replace newly started account practice.
- **Borrar progreso** clears both language histories and the active workspace in the account after synchronization. Export first if you need an archive.

Supabase persists the authentication session on the device; the progress itself is in Postgres. Clearing browser storage signs you out but does not erase cloud progress. An expired session or browser closure before a failed save can lose unsynced in-memory changes; export important pending text.

## Verification before personal production use

Local checks cover the practice engine, serialized cloud writes, failed-save retry, revision conflicts and workspace isolation. A successful build alone cannot verify your Supabase project configuration. Once connected:

1. Sign in on two separate browser profiles or devices. Complete an exercise and write a draft on the first; wait for synchronization, then load the second and confirm both restore.
2. Temporarily disconnect the network, edit a draft and verify the unsynced notice. Reconnect and retry; confirm the second device can load it.
3. Save different changes from both open devices; verify the stale one reports a conflict without overwriting the latest version.
4. Sign out and confirm no history or private text is visible in the login screen. Use a second test user to confirm its workspace is empty and distinct.
5. Verify that anonymous REST requests cannot read `user_progress` and that the second authenticated user cannot read or write the first user's row. This must be checked against the actual deployed RLS policies.
6. Request password recovery, follow the email on an allowed origin, set a new password and sign in again.
7. Test the deployed Vercel URL on a narrow mobile screen and from the office network. Corporate network rules may need to allow your Supabase project origin.

No real account, database migration, SMTP configuration or Vercel environment has been provisioned by the source changes. Live end-to-end checks remain pending until those services are configured.

References: [Supabase password login](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [password recovery](https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail), [auth events](https://supabase.com/docs/reference/javascript/auth-onauthstatechange), [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).
