# Contributing

## Scope

This repository currently contains a prototype. Keep contributions small, focused, and easy to review.

## Before Opening A PR

1. Keep the app runnable by opening `frontend/index.html` directly in a browser.
2. Avoid introducing a build step unless the repository is explicitly being upgraded.
3. Preserve the worker-registry, company-demand, compliance, and insurance portal direction.

## Contribution Guidelines

- Use plain, readable JavaScript unless the project is intentionally migrated.
- Keep copy aligned with the government gig-worker portal concept.
- If you change the product direction, update the README and presentation docs too.
- Prefer small UI and logic changes over broad rewrites.

## Testing

Minimum checks before submitting:

- open `frontend/index.html`
- verify the map still loads
- verify the tabs still switch
- verify assignment changes the route
- verify insurance purchase actions still work

## Documentation

If you change features or flows, update:

- `README.md`
- `docs/ARCHITECTURE.md`
- `hackathon-presentation.md`
