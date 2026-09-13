# PoliticalSim Globe

Interactive intro + responsibility-shift globe experience.

## Quick Start
1. Install deps: `npm install`
2. Copy `.env.example` to `.env.local` and fill it in (see Access Control).
3. Dev server: `npm run dev`
4. Open the printed URL (default `http://localhost:3000`).

## Access Control
The site sits behind a password enforced on the server (`proxy.ts`), not in the browser.
- `SITE_PASSWORD`: the password visitors enter at `/login`.
- `AUTH_SECRET`: random string (32+ chars) used to sign the session cookie. Generate one with `openssl rand -base64 48`.
- Sessions last 7 days in an httpOnly cookie. `POST /api/logout` clears it.
- Login attempts are limited to 5 per IP per 15 minutes.
- Set both variables in your hosting provider's environment settings before deploying; logins are refused if `SITE_PASSWORD` is missing.

## Intro Video
- Autoplays full-screen, no controls.
- Skip: press `L` three times quickly.
- Video file: `public/intro.mp4` (replace with your clip).

## Globe Interaction
- Rotatable, glowing wireframe globe with LOI markers and red connections.
- Passive spin pauses on selection; globe turns so the connection midpoint faces the camera, always right side up.
- Non-selected lines dim when a connection is active.
- Click/drag to rotate manually.

## Connections & LOIs
- Defined in `app/components/GlobeScene.tsx`:
  - `LOIS`: labeled locations with lat/lon.
  - `LOI_CONNECTIONS`: connections with titles, widths, and description text.
- Dropdown (top right) lists all connections; selecting opens the detail panel.

## UI Notes
- Panel sits top-right with wrapped titles; globe shifts left when panel is open.
- Dropdown fades/disabled during intro.
- Line thickness reduced for clarity; invisible pick tubes remain for easy clicking.

## Build
- Production build: `npm run build`
- Stack: Next.js (App Router) + Three.js; panel renders plain text (no markdown dependency).
