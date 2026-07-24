# dMoney Playwright Automation

Playwright + TypeScript end-to-end automation for the **dMoney QA Practice
Platform**, built with the Page Object Model (OOP).

The test automates the full agent lifecycle:

1. Visit `https://dmoneyportal.roadtocareer.net`
2. Click **Sign Up**
3. Register a new account with the **Agent** role
4. Log in as **Admin** (`admin@dmoney.com`) and activate the newly created agent
5. Log in as **System** (`system@dmoney.com`) and deposit **2000 Tk** to the agent
6. Log in as the **Agent** (email OTP login) and assert the balance shows **2000 Tk**
7. Deposit **500 Tk** from the agent to an existing customer and assert the transaction succeeds

## Tech stack

- [Playwright Test](https://playwright.dev/) + TypeScript
- Page Object Model — one class per screen (`pages/`), orchestration logic in `services/`
- Gmail API — used to read the login OTP sent to the agent's email

## Project structure

```
pages/       Page Object classes — one per screen (HomePage, RegisterPage, LoginPage,
             AdminUsersPage, AdminUserDetailsPage, AgentCashInPage, ProfilePage)
services/    AuthService (login orchestration for admin/system/agent),
             GmailService (reads the OTP from Gmail via the Gmail API)
utils/       env.ts (typed config), TestDataGenerator.ts (unique test data per run)
tests/       dmoney-e2e.spec.ts — the 7-step journey, one test.step() per requirement
.github/     GitHub Actions CI workflow
```

## Setup

```bash
npm install
npx playwright install --with-deps chromium
cp .env.example .env
```

Then fill in `.env`:

| Variable | Description |
|---|---|
| `BASE_URL` | App URL (`https://dmoneyportal.roadtocareer.net`) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin login |
| `SYSTEM_EMAIL` / `SYSTEM_PASSWORD` | Seeded system login |
| `AGENT_PASSWORD` | Password used when registering the new agent |
| `GMAIL_BASE_LOCAL` | Local-part of the Gmail address that receives the OTP (e.g. `yourname` for `yourname@gmail.com`) |
| `GMAIL_ACCESS_TOKEN` | OAuth access token with `gmail.readonly` scope — see below |
| `EXISTING_CUSTOMER_PHONE` | Phone number of an already-active customer, used as the recipient in step 7 |
| `SYSTEM_DEPOSIT_AMOUNT` / `CUSTOMER_DEPOSIT_AMOUNT` | Amounts used in the journey (2000 / 500 by default) |

### Getting a Gmail access token

The agent login step requires reading a 4-digit OTP that dMoney emails to the
registered address. This project uses **Gmail plus-addressing**
(`yourname+agent123@gmail.com` still delivers to `yourname@gmail.com`) so
every generated test account's OTP lands in one inbox that the test can read.

To generate a token:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
   and enable the **Gmail API**.
2. Configure the OAuth consent screen (External, add your Gmail as a test user).
3. Create an OAuth Client ID (Application type: Desktop app).
4. Go to [OAuth Playground](https://developers.google.com/oauthplayground),
   use your own Client ID/Secret, authorize the
   `https://www.googleapis.com/auth/gmail.readonly` scope, and exchange the
   authorization code for tokens.
5. Copy the `access_token` value into `GMAIL_ACCESS_TOKEN` in `.env`.

> **Note:** access tokens expire after about an hour. If the OTP step starts
> failing with a Gmail API error (401/403) rather than a genuine "OTP not
> arrived" timeout, regenerate a fresh token.

## Running

```bash
npm test              # headless
npm run test:headed   # watch it run in a real browser
npm run test:ui       # interactive UI mode
npm run report         # open the last HTML report
```

## CI/CD

GitHub Actions workflow: `.github/workflows/playwright.yml` — runs the suite
on every push and uploads the HTML report as a build artifact.

Repository secrets/variables required (**Settings → Secrets and variables → Actions**):

- Secrets: `GMAIL_BASE_LOCAL`, `GMAIL_ACCESS_TOKEN`
- Variables: `EXISTING_CUSTOMER_PHONE`


**Screenshot: successful CI run**
TO BE UPLOADED
---

**Screenshot: Playwright report summary**
<img width="459" height="116" alt="image" src="https://github.com/user-attachments/assets/8ddba2e5-7fac-4118-bd4e-3eee2adeab6c" />

<img width="1918" height="813" alt="image" src="https://github.com/user-attachments/assets/92c5bdce-39db-4c05-b09b-ed1d2021148c" />


## Notes

- Test data (agent/customer email, phone, NID) is generated fresh on every
  run via `TestDataGenerator`, so the suite can be re-run repeatedly without
  colliding with previously created accounts.
- The 7 steps run as one sequential story rather than independent tests,
  since each step depends on state created by the previous one.
