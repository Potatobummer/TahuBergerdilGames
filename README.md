# Tofu Bergerdil Games

**Tofu Bergerdil Games** is a browser story about Silken Tofu and Bergie the Potato
Hero learning to nourish their neighbours without losing themselves. The player
guides both characters through five chapters. In every chapter they read a short
scene, choose one activity, and resolve a milestone before moving forward.

## Play online

The GitHub Pages build is available at:

https://potatobummer.github.io/TahuBergerdilGames/

On iPhone, open the site in Safari and use **Share → Add to Home Screen** to install it like an app.

## Play locally

Because the game uses JavaScript modules, serve the repository over HTTP instead of
opening `index.html` directly:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.

## How to play

1. Select **Start a new story**.
2. Use **Continue** to move through the chapter dialogue.
3. Pick one activity. Activities change each character's Joy, Skill, Bonds, vitality,
   experience, and abilities separately.
4. Choose how to face the chapter milestone.
5. Repeat through all five chapters to discover the pair's shared ending.

Progress can be saved to the browser at any time after starting. **Load progress**
restores that local save, and **Restart** clears it and returns to the title screen.

## Source tree

```text
.
├── index.html          # Accessible game shell
├── styles.css          # Responsive presentation
├── js/
│   ├── app.js          # Five-chapter game loop and rendering
│   ├── game-data.js    # Declarative story, choices, and endings
│   └── state.js        # Versioned state creation, validation, and persistence
└── assets/
    ├── audio/          # Reserved for future sound assets
    ├── fonts/          # Reserved for locally hosted fonts
    ├── icons/          # Reserved for interface icons
    └── images/         # Reserved for illustrations
```

## Project goals

- Run reliably in modern browsers and remain straightforward to develop and deploy.
- Keep story content separate from the game loop so it can be edited without changing
  application logic.
- Keep saves resilient through an explicit schema version and validation on load.
- Provide keyboard-friendly native controls and a live status region.

The story contains a complete five-chapter arc for two heroes and three possible
endings. The asset directories are intentionally empty placeholders; audio, custom
fonts, icons, and illustrations are not part of this release.
