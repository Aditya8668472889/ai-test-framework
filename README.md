# 🤖 AI Test Framework

[![Playwright Tests](https://github.com/Aditya8668472889/ai-test-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/Aditya8668472889/ai-test-framework/actions/workflows/playwright.yml)

Playwright + TypeScript test framework with **AI-powered test generation** and **self-healing locators** backed by the Claude API. When a selector breaks, Claude inspects the live page and suggests a working replacement so the test keeps running.

## 📊 Dashboard

A dark-themed HTML dashboard summarizes the latest run — pass rate, per-test results, and the self-healing log.

- **From CI:** open the latest [Playwright Tests run](https://github.com/Aditya8668472889/ai-test-framework/actions/workflows/playwright.yml), then download the **`test-dashboard`** artifact and open `index.html`.
- **Locally:** generate it after a test run —

  ```bash
  npx playwright test      # writes test-results/results.json
  npm run dashboard        # builds dashboard/index.html
  open dashboard/index.html
  ```

## 🚀 Getting started

```bash
npm ci
npx playwright install chromium
npx playwright test
```

Configure credentials in a `.env` file:

```
BASE_URL=https://www.saucedemo.com
TEST_USERNAME=...
TEST_PASSWORD=...
ANTHROPIC_API_KEY=...
```

## 📁 Layout

| Path | Purpose |
| --- | --- |
| `tests/` | Test specs |
| `pages/` | Page objects (facade pattern, readonly Locators) |
| `utils/generateTests.ts` | AI test generation via Claude |
| `utils/healingLocator.ts` | Self-healing locator wrapper |
| `utils/generateDashboard.ts` | Builds the HTML dashboard |
| `dashboard/` | Generated dashboard output |

---

AI Test Framework — Built with Playwright + Claude API
