# GovGig Portal

Government-backed gig worker registry, compliance, company allocation, and insurance portal prototype.

## Overview

GovGig Portal is a hackathon-ready prototype that models:

- government registration of gig workers
- company access to verified workers based on need
- traffic-aware speed and working-hours compliance
- live route and worker movement on a map
- anonymous worker rating preferences
- insurance company scheme publishing
- in-app health insurance browsing and purchase flow

## Repo Structure

- [frontend/README.md](./frontend/README.md)
- [frontend/index.html](./frontend/index.html)
- [frontend/app.js](./frontend/app.js)
- [backend/README.md](./backend/README.md)
- [backend/package.json](./backend/package.json)
- [backend/server.js](./backend/server.js)
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- [hackathon-presentation.html](./hackathon-presentation.html)
- [hackathon-presentation.md](./hackathon-presentation.md)

## Frontend

The frontend is a static web app prototype built with:

- HTML
- Vanilla JavaScript
- Leaflet
- OpenStreetMap

Main flows:

- worker registry portal
- company demand board
- compliance tracking
- insurance scheme view
- health insurance purchase UI
- live route and worker movement simulation

Run it by opening [frontend/index.html](./frontend/index.html).

## Backend

The backend is a minimal mock API scaffold built with Node's built-in `http` module.

Current sample endpoints:

- `GET /health`
- `GET /api/workers`
- `GET /api/company-requests`
- `GET /api/insurance-plans`

Run it with:

```bash
cd backend
npm start
```

## GitHub Ready

This repo includes the basic files expected for a public GitHub project:

- README
- LICENSE
- .gitignore
- CONTRIBUTING guide
- `frontend/`
- `backend/`
- `docs/`
- `assets/`

## Notes

- the current frontend still works as a client-side prototype even without the backend running
- the backend is a starting scaffold for future integration
- the map depends on internet access for Leaflet and OpenStreetMap assets

## License

MIT
