# Release test suite

Run `npm ci` once, then use:

- `npm run validate` to build the exact public artifact, inspect its publication boundary, scan for high-confidence credentials and run deterministic DOM tests.
- `npm run test:browser` to install Chromium and run the full browser journeys.

GitHub Actions uses the same `npm run test:browser` command and adds required Linux dependencies during the browser install. A missing local browser is a provisioning failure, not a skipped test; the CI release remains blocked until browser journeys pass.
