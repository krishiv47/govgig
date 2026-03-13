# Architecture

## Overview

The repository is now split into `frontend/` and `backend/`.

## Frontend

Location:

- `frontend/index.html`
- `frontend/app.js`

Responsibilities:

- render the portal UI
- manage tab state
- simulate worker movement
- update route, speed, fuel, and working-hours data
- render the Leaflet map
- handle insurance purchase interactions

## Backend

Location:

- `backend/server.js`
- `backend/package.json`

Responsibilities:

- expose mock API responses
- model future worker, company, and insurance endpoints
- act as a starting point for real backend integration

## Current Frontend Sections

- `Home`
- `Companies`
- `Compliance`
- `Schemes`
- `Registry`

## Mock Backend Endpoints

- `GET /health`
- `GET /api/workers`
- `GET /api/company-requests`
- `GET /api/insurance-plans`

## Current Constraints

- frontend does not yet consume the backend APIs
- state is still in-memory
- no database
- no real government or insurer integrations
