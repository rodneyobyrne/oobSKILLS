# Release test suite

Run `npm ci` once, then use:

- `npm run validate` to build the exact public artifact, inspect its publication boundary, scan for high-confidence credentials and run deterministic DOM tests.
- `npx playwright install chromium` followed by `npm run test:browser` for full browser journeys.

GitHub Actions installs Chromium with its Linux system dependencies before running the browser suite. A missing local browser is a provisioning failure, not a skipped test; the CI release remains blocked until browser journeys pass.
