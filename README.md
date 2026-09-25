# Slaorus Mini

A dark, moon-lit game launcher in the exact style of the reference site — library tabs,
accent swatches with a full custom color picker, twinkling stars — with playtime
tracking, streaks, favorites and stats. Static site: GitHub + Vercel, no backend.

> The site name is one line: edit `BRAND` at the top of `app.js`.

## Features
- Owner-only games — edited by you in `games.js` on GitHub, nothing addable from the site
- Game = `num` (order), `name`, `icon`, `html` (code saved in the site), `isNew` on/off
- gnmath / Lumin library tabs (in Settings, like the original)
- NEW! badge — you flip `isNew` true/false; new games top the Featured row
- Playtime tracker (per game + total), Recently Played, Favorites
- Stats page with bar chart and your #1 most-played crowned
- Daily streak (visiting or playing counts)
- Random button, search, tag filter chips
- Accent picker: preset pills + custom picker (gradient square, hue slider, RGB inputs, eyedropper)
- Settings toggles: cloak mode (about:blank), ambient effects (moon glow + stars)

## Deploy (GitHub + Vercel)
1. New GitHub repo → upload `index.html`, `style.css`, `app.js`, `games.js`.
2. Vercel → Add New → Project → import repo → Framework: **Other** → Deploy.
   Every push to `games.js` auto-redeploys.

## Adding a game (in games.js)
```js
gnmath: {
  games: [
    {
      num: 1,                       // order on the page
      name: "My Game",
      icon: "",                     // "" = auto letter tile
      html: `<h1>My game code</h1>`,// saved inside the site
      isNew: true                   // NEW! badge on/off — your call
    },
  ]
}
```
- **html**: wrap in backticks. If your code contains a backtick, escape it: \`
- **isNew**: `true` shows the red badge and floats it to Featured top, `false` turns it off.
- Optional: `tag: "Action"` (adds a filter chip), `url: "https://..."` (embed a link instead of HTML).
- Icons: no emojis are used anywhere on the site — all icons are hand-drawn SVG.

## Files
| File | Purpose |
|---|---|
| `index.html` | Layout, modals, settings |
| `style.css` | Theme (exact dark moon style) |
| `app.js` | Logic: library, picker, tracker, stats |
| `games.js` | **Your game list** — the only file you edit to add games |

## Data
Playtime, favorites, streaks, accent and settings are per-browser (localStorage).
