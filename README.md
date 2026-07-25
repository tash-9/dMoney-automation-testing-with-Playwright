# dMoney Automation Testing with Playwright🎭

dMoney Automation Testing is a Playwright + TypeScript end-to-end test suite for the **dMoney QA Practice Platform** — a mobile-financial-services web app. It automates the complete agent lifecycle: signup, admin activation, system funding, agent login via email OTP, and a live cash-in transaction, verifying real money movement through the UI at every step.

## 🎯 Purpose

The suite automates a real dMoney user journey to verify:

- New user registration under the **Agent** role
- Admin-side account activation workflow
- System-to-agent wallet funding
- Secure agent login protected by **email OTP verification**
- Wallet balance accuracy after a deposit
- Agent-to-customer cash-in and transaction success

---

## 🔗 App Under Test

- **Portal:** [https://dmoneyportal.roadtocareer.net](https://dmoneyportal.roadtocareer.net)

---

## ✅ What Gets Tested

1. Visit the dMoney portal and open **Sign Up**
2. Register a new account with the **Agent** role
3. Log in as **Admin** and activate the newly created agent
4. Log in as **System** and deposit **2000 Tk** into the agent's wallet
5. Log in as the **Agent** — via password + **email OTP** — and assert the balance shows **2000 Tk**
6. Cash-in **500 Tk** from the agent to an existing customer and assert the transaction succeeds
7. Confirm the agent's balance reflects the completed transaction

---

## ✨ Features

- Full Page Object Model architecture — every screen is its own class
- Real email OTP handling via the **Gmail API** (no manual code entry, no test shortcuts)
- Unique test data generated on every run — safe to re-run without collisions
- Role-based flows: Admin, System, and Agent each modeled through a shared `AuthService`
- Sequential `test.step()` breakdown mirroring the 7 assignment requirements 1:1
- HTML test report with full trace, screenshot, and video capture on failure
- CI/CD via GitHub Actions, with a self-hosted runner to handle the site's bot-protection
- Clean environment-based configuration — zero secrets committed to the repo

---

## 	🛠️ Technologies Used

- Playwright Test
- TypeScript
- Gmail API (OAuth 2.0, `gmail.readonly`)
- dotenv
- GitHub Actions

## 📦 NPM Packages Used

- @playwright/test
- typescript
- dotenv
- @types/node

---

## 📁 Project Structure

```
pages/                          # Page Object classes — one per screen
├── BasePage.ts                 # Shared goto() helper, extended by every page
├── HomePage.ts                 # Landing page — opens Sign Up
├── RegisterPage.ts             # Registration form (role selection, submit)
├── LoginPage.ts                # Password + OTP login flow
├── AdminUsersPage.ts           # Admin user list — find and open a user
├── AdminUserDetailsPage.ts     # Admin user details — activate account
├── AgentCashInPage.ts          # Cash-in screen (used by System and Agent)
└── ProfilePage.ts              # Wallet balance display and assertions
services/
├── AuthService.ts              # Login orchestration for Admin / System / Agent
└── GmailService.ts             # Reads the OTP email via the Gmail API
utils/
├── env.ts                      # Typed, centralized environment config
└── TestDataGenerator.ts        # Generates unique agent/customer test data
tests/
└── dmoney-e2e.spec.ts          # The 7-step journey, one test.step() per requirement
.github/workflows/
├── playwright.yml              # Hosted job — install, typecheck, suite discovery
└── e2e.yml                     # Self-hosted job — the real browser E2E run
```

---

## 	⚙️ Local Installation

1. Clone the repository:

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd dmoney-automation-testing
```

2. Install dependencies:

```bash
npm install
npx playwright install --with-deps chromium
```

3. Create a `.env` file from the template and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `BASE_URL` | dMoney portal URL |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin login |
| `SYSTEM_EMAIL` / `SYSTEM_PASSWORD` | Seeded system login |
| `AGENT_PASSWORD` | Password used when registering the new agent |
| `GMAIL_BASE_LOCAL` | Local-part of the Gmail address that receives the OTP |
| `GMAIL_ACCESS_TOKEN` | OAuth token (`gmail.readonly` scope) — see below |
| `EXISTING_CUSTOMER_PHONE` | An already-active customer's phone number for the cash-in step |
| `SYSTEM_DEPOSIT_AMOUNT` / `CUSTOMER_DEPOSIT_AMOUNT` | Journey amounts (2000 / 500 by default) |

### Getting a Gmail access token

The agent login step reads a real 4-digit OTP emailed by dMoney, using **Gmail plus-addressing** (`yourname+agent123@gmail.com` still lands in `yourname@gmail.com`'s inbox), so every generated test account's OTP is readable from one place:

1. Create a project in [Google Cloud Console](https://console.cloud.google.com) and enable the **Gmail API**
2. Configure the OAuth consent screen (External → add your Gmail as a test user)
3. Create an OAuth Client ID (Application type: Desktop app)
4. In [OAuth Playground](https://developers.google.com/oauthplayground), authorize scope `https://www.googleapis.com/auth/gmail.readonly` and exchange for tokens
5. Copy the `access_token` into `GMAIL_ACCESS_TOKEN`

> Access tokens expire after ~1 hour — regenerate before each run if the OTP step fails with a Gmail 401/403.

---

## ▶️ Scripts

```bash
npm test              # Run the suite headless
npm run test:headed   # Run with a visible browser
npm run test:ui       # Interactive Playwright UI mode
npm run report        # Open the last HTML report
```

---

## 🔁 CI/CD

This project runs on **two** GitHub Actions workflows, split because the dMoney portal sits behind Cloudflare bot-protection that blocks GitHub's shared-runner IPs:

| Workflow | Runner | What it does |
|---|---|---|
| `.github/workflows/playwright.yml` | `ubuntu-latest` (hosted) | Install → TypeScript typecheck → confirms the suite is wired (`--list`). Runs on every push. |
| `.github/workflows/e2e.yml` | Self-hosted | The actual 7-step browser E2E run against the live portal. Triggered manually. |

**Repository secrets/variables** (Settings → Secrets and variables → Actions):
- Secrets: `GMAIL_BASE_LOCAL`, `GMAIL_ACCESS_TOKEN`
- Variables: `EXISTING_CUSTOMER_PHONE`

---

### 📸 Successful CI run

<img width="943" height="364" alt="image" src="https://github.com/user-attachments/assets/014499ea-6876-44e7-b64a-bfbe04316939" />


### 📸 Playwright report summary

<img width="943" height="364" alt="image" src="https://github.com/user-attachments/assets/014499ea-6876-44e7-b64a-bfbe04316939" />

<img width="1918" height="813" alt="Playwright report — full run detail" src="https://github.com/user-attachments/assets/92c5bdce-39db-4c05-b09b-ed1d2021148c" />

---

## 📝 Notes

- Test data (agent/customer name, email, phone, NID) is generated fresh on every run, so the suite is safe to re-run without colliding with previously created accounts.
- The 7 steps run as a single sequential story rather than independent tests, since each step depends on state created by the one before it.

---

## ✍️ Author
Tasfia Islam Raisha
