# Tahu Bergedil Games

**Tahu Bergedil Games** is a small, dependency-free browser story about growing up,
making time for the people around you, and deciding what success means. The player
travels through seven chapters, from age 7 to age 21. In every chapter they read a
short scene, choose one activity, and resolve a milestone before moving forward.

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
3. Pick one activity. Activities change Joy, Skill, and Bonds.
4. Choose how to face the chapter milestone.
5. Repeat through all seven chapters to discover an ending at age 21.

Progress can be saved to the browser at any time after starting. **Load progress**
restores that local save, and **Restart** clears it and returns to the title screen.

## Source tree

```text
.
├── index.html          # Accessible game shell
├── styles.css          # Responsive presentation
├── js/
│   ├── app.js          # Seven-chapter game loop and rendering
│   ├── game-data.js    # Declarative story, choices, and endings
│   └── state.js        # Versioned state creation, validation, and persistence
└── assets/
    ├── audio/          # Reserved for future sound assets
    ├── fonts/          # Reserved for locally hosted fonts
    ├── icons/          # Reserved for interface icons
    └── images/         # Reserved for illustrations
```

## Project goals

- Run in modern browsers with no frameworks, package manager, build step, or network
  dependencies.
- Keep story content separate from the game loop so it can be edited without changing
  application logic.
- Keep saves resilient through an explicit schema version and validation on load.
- Provide keyboard-friendly native controls and a live status region.

The first release contains one complete seven-chapter story and three possible
endings. The asset directories are intentionally empty placeholders; audio, custom
fonts, icons, and illustrations are not part of this release.

