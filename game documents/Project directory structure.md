your-game-project-name/
├── client/             # PlayCanvas front-end code and assets
│   ├── assets/         # Models, textures, audio (Often managed via PlayCanvas Editor)
│   ├── scenes/         # Scene files (Managed via PlayCanvas Editor)
│   ├── scripts/        # Your JavaScript/TypeScript game scripts
│   │   ├── player/     # Hero movement, abilities, troop commands
│   │   ├── ai/         # Client-side AI visualization/prediction (if any)
│   │   ├── building/   # Logic for placing modular/preset structures
│   │   ├── network/    # Colyseus client connection, message handlers
│   │   ├── systems/    # Other core game systems (e.g., inventory, combat helpers)
│   │   └── ui/         # Scripts for UI elements (HUD, voting, market)
│   ├── styles/         # CSS files (if needed beyond PlayCanvas UI)
│   ├── templates/      # HTML templates (if needed)
│   └── (PlayCanvas config files like .pcproject, config.json)
│
├── server/             # Colyseus Node.js backend server
│   ├── src/            # Server source code (TypeScript or JavaScript)
│   │   ├── rooms/      # Colyseus Room definitions
│   │   │   ├── schemas/    # RoomState, PlayerState, etc. (@colyseus/schema)
│   │   │   └── GameRoom.ts # Your main game room logic
│   │   ├── ai/         # Server-side AI logic (Invader behavior, LLM interface/prompts)
│   │   ├── game/       # Core server-side game logic (validation, combat resolution)
│   │   ├── db/         # Database interaction logic (optional separation)
│   │   └── index.ts    # Server entry point (or server.ts)
│   ├── package.json    # Node.js dependencies
│   ├── tsconfig.json   # TypeScript configuration
│   └── (Other config like .env, nodemon.json)
│
├── desktop/            # Configuration for Tauri or Electron wrapper (Optional)
│   ├── icons/          # App icons
│   ├── (Tauri/Electron specific config files like tauri.conf.json or electron-builder.yml)
│   └── (Build scripts if needed)
│
├── docs/               # Design documents, notes, diagrams (Optional)
│   └── game_dev_brainstorm_log.md # Maybe keep our design doc here?
│
├── .gitignore          # Git ignore rules
└── README.md           # Project overview