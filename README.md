# PoliticalSim Globe

Interactive intro + responsibility-shift globe experience.

## Quick Start
1. Install deps: `npm install`
2. Dev server: `npm run dev`
3. Open the printed URL (default `http://localhost:3000`).

## Intro Video
- Autoplays full-screen, no controls.
- Skip: press `L` three times quickly.
- Video file: `public/intro.mp4` (replace with your clip).

## Globe Interaction
- Rotatable, glowing wireframe globe with LOI markers and red connections.
- Passive spin pauses on selection; globe reorients so origin is forward/mid, destination downward.
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
