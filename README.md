# Tofu Bergerdil Games

**Tofu Bergerdil Games** is a cooperative browser raising game about Silken Tofu and
Bergie the Potato Hero learning to nourish their neighbours without losing themselves.
Guide both friends across five chapters and twenty seasons. Plan their work, study,
rest, and community life while protecting the partnership that holds them together.

## Play online

https://potatobummer.github.io/TofuBergerdilGames/

On iPhone, open the site in Safari and use **Share -> Add to Home Screen** to install
it like an app.

## How to play

1. Read the introduction to each life chapter.
2. Plan one seasonal activity for Silken and one for Bergie.
3. Balance coins, reputation, partnership, individual attributes, and vitality.
4. Respond to seasonal events created by the pair's condition and earlier plans.
5. After four seasons, face a milestone whose consequences carry into later chapters.
6. Complete all five chapters to discover both individual vocations and their shared
   future.

Matching schedules strengthen the partnership, while separate schedules can develop
different strengths. A depleted character must rest. Conditional events only occur
once per life, so different plans reveal different scenes.

Progress can be saved in the browser after starting. **Continue saved life** restores
that local save, and **Restart** clears it.

## Play locally

Because the game uses JavaScript modules, serve the repository over HTTP instead of
opening `index.html` directly:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## Development

Run the automated simulation and accessibility tests with:

```sh
npm test
```

The source keeps story and simulation data in `js/game-data.js`, state transitions
and save validation in `js/state.js`, and browser rendering in `js/app.js`. Original
storybook artwork is stored in `assets/images` and cached for offline play.
