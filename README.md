# Simple Math

## GitHub Pages Deployment

- In `vite.config.ts`, set `base` to your repository path and replace `__REPO_NAME__` with your actual GitHub repo name.
- Build the project with `npm run build`.
- The production files will be generated in `dist/` and can be published to GitHub Pages.

Example base config:

```ts
// IMPORTANT: replace __REPO_NAME__ with your GitHub repo name
base: '/__REPO_NAME__/',
```
