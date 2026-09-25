/* ============================================================
   SLAORUS MINI — game library (OWNER ONLY — edit on GitHub)
   ------------------------------------------------------------
   You are the only one who can add games. Push changes to
   games.js and the site updates automatically.

   Each game:
     num   -> order number. Cards sort by this (1, 2, 3...).
     name  -> shown on the card.
     icon  -> image URL for the card. Leave "" for an
              automatic letter tile in the accent color.
     html  -> the game's HTML code. It is saved INSIDE the
              site and runs in the player. Use backticks.
              WARNING: if your HTML contains a ` character,
              escape it as \`
     isNew -> true = red "NEW!" badge + top of Featured row.
              false = off. You control it manually.
     tag   -> optional, makes a filter chip (e.g. "Action").
     url   -> optional fallback if you would rather embed a
              link than HTML code.

   Two libraries exist (the tabs in Settings):
     gnmath -> "more known library"
     lumin  -> "bigger game library"
   ============================================================ */

const GAME_LIBRARY = {
  gnmath: {
    label: "gnmath",
    games: [
      // {
      //   num: 1,
      //   name: "My First Game",
      //   icon: "",
      //   html: `<h1 style="color:white">Hello!</h1>`,
      //   isNew: true
      // },
    ]
  },
  lumin: {
    label: "Lumin",
    games: [
      // {
      //   num: 1,
      //   name: "Another Game",
      //   icon: "https://example.com/icon.png",
      //   html: `<canvas id="c"></canvas><script>/* game code */<\/script>`,
      //   isNew: false,
      //   tag: "Puzzle"
      // },
    ]
  }
};
