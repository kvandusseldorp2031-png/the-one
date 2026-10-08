# the-one

A browser FPS prototype inspired by *Call of Duty: Black Ops 3* — a shooting-range
slice with pointer-lock mouse aim, WASD movement, sprint/jump, and score targets.

Built with Vite + [three.js](https://threejs.org/). No backend, no database, no
credentials required.

## Run it

```bash
docker compose -f docker-compose.base44.yml up -d
```

Then open <http://localhost:3000>. The dev server hot-reloads on source edits.

## Controls

| Input | Action |
| --- | --- |
| `W` `A` `S` `D` | Move |
| `Shift` | Sprint |
| `Space` | Jump |
| Mouse | Aim (click to capture pointer) |
| Left click | Fire |
| `R` | Reload |
| `Esc` | Release the cursor |

Smaller, more distant targets score more (30 / 20 / 10 points).

## Layout

- `src/main.js` — renderer, scene, frame loop
- `src/world.js` — arena, cover, movable score targets
- `src/player.js` — pointer-lock look, movement, weapon, hitscan firing
- `src/hud.js` — score/ammo overlay and start screen
- `src/style.css` — HUD and overlay styling
