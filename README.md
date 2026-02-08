# Playwright GH Users Search - Final (POM + Locators + Fixtures)

## What you get
- Page Object Model (POM)
- Locators in `locators/` (object repository)
- BasePage with reusable actions that accept `Locator` parameters
- Assertions are only inside page classes
- Tests only call page methods
- Custom fixture exposes pages as `pages.userSearch`
- Tagging supported via `@pages`

## Install
```bash
npm i
npx playwright install
```

## Run all tests
```bash
npm test
```

## Run only @pages tests
```bash
npm run test:pages
```

## Headed
```bash
npm run test:headed
```