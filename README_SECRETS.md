# GitHub Secrets & Firebase: how to keep keys out of the repo

This project uses GitHub Actions to build and deploy a Create React App bundle. Keep secrets out of the repository and use GitHub Actions secrets instead.

## Add repository secrets (GitHub UI)

1. Go to your repository on GitHub.
2. Click `Settings` → `Secrets and variables` → `Actions` → `New repository secret`.
3. Add the following secrets (names used in the workflow):
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`

Notes:

- Do NOT include private service-account JSON files as `REACT_APP_*` values. Those are server-only secrets and must never be baked into client bundles.
- The workflow creates a local `.env` during the run and uses these secrets at build-time; the `.env` file is not committed.

## Update secrets after rotation

1. Regenerate the key in the provider (see Firebase steps below).
2. Replace the secret value in GitHub: `Settings` → `Secrets and variables` → `Actions` and update the secret value.
3. Re-run the workflow (push to `main`, or trigger manually from the Actions tab).

## How to rotate Firebase keys (recommended steps)

There are two common types of Firebase/Google keys you might need to rotate:

A) Web API key (used by client SDKs)

- This key is public-facing when used in client apps. Regenerate/restrict it and update repo secrets.
  Steps:

1. Open Google Cloud Console: https://console.cloud.google.com/
2. Select your project (e.g. `lotto-d19d6`).
3. From the left menu choose `APIs & Services` → `Credentials`.
4. Click `Create credentials` → `API key` to generate a new key.
5. Click the created API key and configure restrictions:
   - Under "Application restrictions" choose `HTTP referrers (web sites)` and add your allowed domains, for example:
     - `https://meneerdennis.github.io/resultaten/*`
     - `http://localhost:3000/*` (for local development)
   - Under "API restrictions" optionally restrict to the APIs this key needs (e.g., `Firebase`, `Cloud Firestore API`, etc.).
6. Copy the new key and update the GitHub secret `FIREBASE_API_KEY` with the new value.
7. Push a commit to `main` (or re-run the Actions workflow) to rebuild and redeploy the site.

B) Service account (admin) keys — if a service account JSON was exposed

- These are highly sensitive. Immediately delete the compromised key and create a new one.
  Steps:

1. Open Google Cloud Console and select your project.
2. Go to `IAM & Admin` → `Service accounts`.
3. Click the service account in question → `Keys` tab → `Add Key` → `Create new key` → choose JSON.
4. Download the JSON and store it securely (do NOT commit it).
5. Remove the old key in the same `Keys` tab (delete the compromised key).
6. If you use the service account in CI, store the JSON content as a GitHub Actions secret (for example `SERVICE_ACCOUNT_JSON`) and reference it in workflows as a secret, but do not write it into client builds.

## Remove accidentally committed env files (if they are tracked)

If you previously committed `.env.local` or similar files (containing real keys), stop tracking them and remove them from the index (this does not rewrite history):

```bash
# make sure .env* is in .gitignore (this repo already ignores .env and .env.*)
git rm --cached .env.local
git commit -m "chore: stop tracking local env files"
git push origin main
```

After this, the file will remain locally but not be present in future commits. GitHub's secret scanner may still flag past commits; see the next section to purge history.

## Optionally purge secrets from git history (destructive)

If you want to remove secrets from all past commits (so GitHub scanners stop finding them), you must rewrite history and force-push. This affects all collaborators and requires everyone to re-clone. Two recommended tools:

- BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/
- git-filter-repo (recommended): https://github.com/newren/git-filter-repo

I can help run the purge if you confirm you accept a forced-history rewrite. Otherwise, rotating keys and removing tracked files is the safer route.

## Final notes / best practices

- Never put private keys, passwords, or service-account JSON into client-side environment variables (REACT*APP*\*). Use server-side secrets in Actions or server environments.
- Restrict API keys by referrers and permissions.
- Rotate keys immediately if GitHub flags them public.

---

If you want, I can:

- Add these steps into the project's main `README.md` instead, or
- Run the `git rm --cached .env.local` and commit for you, or
- Help perform the history purge (requires explicit confirmation).

Tell me which of those you'd like me to do next.
