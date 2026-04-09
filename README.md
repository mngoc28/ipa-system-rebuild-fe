# IPA System Starter

This repository has been cleaned to start a new project while keeping the
existing folder structure.

## Current baseline

- App entry is kept in `src/main.tsx`.
- Router is reset to a single starter route in `src/Router.tsx`.
- Starter page is available at `src/pages/ProjectStarter.tsx`.
- Existing folders under `src/` are preserved for gradual rebuild.

## Run locally

```bash
npm install
npm run dev
```

## Build and quality commands

```bash
npm run build
npm run lint
npm run preview
```

## Suggested rebuild flow

1. Define shared models and constants.
2. Recreate API clients by domain.
3. Rebuild hooks and store modules.
4. Rebuild pages module by module.
5. Remove old domain code after migration is complete.