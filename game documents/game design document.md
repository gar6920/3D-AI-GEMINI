Game Concept: Persistent World & AI Invasions
Core Concept Summary
Multiplayer (1-100 players, local split-screen) co-op defense game with cyclical Peace (~10min) / Invasion (~30min) phases (timing flexible/variable). Players defend a central Shrine (LLM embodiment) within a circular city protected by Perimeter Walls & an LLM/vote-funded destructible Iron Dome (visual: large glass dome appearance). Players choose a Hero Class (Tech/Wizard initially), earn personal Money (50% contribution value + Troop earnings), manage land tenure, collect Artifacts, build personal bases (modular/presets), and control Troops (with Modes). 50% of earnings go to a City Money pool managed by the LLM via player votes (confidence-based trigger). The Invading AI faction operates from a predefined, indestructible Base structure, manages AI Resources (scaled by player Money, outcome, player count), and uses LLM guidance to buy invader units. AI units can scout/attack outside during Peacetime. Invasions feature hierarchical AI with global kill announcements & loot for bosses, scaling difficulty, and clear win/loss conditions. Emphasis on strategy, LLM showcasing, player democracy, low-graphic violence.

City Layout & Exterior
Center: Shrine (LLM embodiment, builds Communal Combat Units).
Inner Ring (Communal Zone): Circular area around the Shrine. No player building. Houses communal buildings (Marketplace?, NPC hubs?). Roads originate here.
Middle Ring (Player Zone): Annular zone around the Inner Ring containing Player Land Plots (temporary tenure). Players build personal bases here. Connected by roads.
Outer Ring (Perimeter): Location of the circular Communal Perimeter Walls and Gates.
Sky: "Iron Dome" Energy Shield (visual: glass dome) projected over the entire city up to the perimeter walls. Destructible with HP. Rebuilt via City Money/Votes.
Exterior: Area outside the circular walls. Contains the AI Base: a predefined, visually distinct, impassable fortress structure with effectively infinite HP defenses. Houses the AI "Shrine" thematically and serves as the invader spawn point. Exploration, encounters (NPCs, AI scouts), and player external building occur here. AI units may be present during Peacetime.
Player Experience & Mechanics
Views: Seamless FPS/Third-Person/RTS switching.
Hero Unit: Player-controlled, class-based (Tech/Wizard). Potential temporary intra-game progression (TBD). Equips Artifacts. Upgraded using personal Money (specific upgrade paths deferred).
Initial Core Active Abilities:
Tech/Engineer: 1. EMP Grenade (Control), 2. Rivet Gun (Damage), 3. Deploy Mini-Turret (Utility/Damage).
Wizard/Technomancer: 1. Ice Ability (Control), 2. Lightning Ability (Utility/Burst), 3. Fire Ability (Damage).
Delivery Goal: Abilities intended to have Single Target (Homing?) & AoE variations (specific mechanics deferred). Uses standard energy/mana/cooldowns. Basic melee attack included.
Troops/Minions (Personal Robots): Built via Command Post (~75 Money Grunt Bot, ~50 Money Scout Drone; ~8s/~5s build time - initial estimates). Max 5 (initial: 1 Drone, 4 Grunts). Equip 1 Artifact. Lost if CP destroyed. Upgrades deferred. Have tactical Modes (Attack [Attack-Move], Protect [Target/Area], Follow [Hero], Hold Position). Earn personal Money for player.
Assistant AI Bots: ~10 communal humanoid robots funded by City Money. Perform maintenance (repair, debris clearing?). Consume City Money. Tasked based on LLM analysis/votes. Can potentially query LLM for guidance.
Communal Combat Units: Automated defensive units built/funded by the Shrine using City Money (via votes/LLM). AI-controlled. Max ~12 total active units (combined). Upgradable via LLM/Votes.
"Interceptor Drone" (Flying): Anti-air focus, fast responder (~90 City Money). High Speed, Mod HP (~75), No Armor. Med-Long Range Laser Pulse (~12 DPS). Prioritizes enemy air units. Limited pursuit range. Focus fires.
"Warden Bot" (Ground): Durable frontline defender (~120 City Money). Slow Speed, High HP (~250), Med Armor (~5 flat DR). Med Range Plasma Repeater (~15 DPS). Prioritizes ground threats attacking key objectives. Limited pursuit range. Focus fires.
Economy:
Personal Money: Players receive 50% of Money from Invasion contribution + Troop earnings. Used for Land Tenure, Upgrades, Market, Donations, Personal Building. Joining players receive minimal starting amount.
City Money: Communal pool (50% invasion earnings + leaver funds). Managed by LLM via player votes.
AI Resources: Separate pool for invaders. Base amount = Function(Total Human Money) * Win/Loss Multiplier * Player Count Multiplier. Spent exclusively on buying mobile units via LLM guidance. Adjusted instantly if player joins.
Democratic Spending (City Money): LLM polled (~30s). If confidence close between top options, proposes up to 5 options for player vote (~10s window, non-intrusive UI, equal weight, random tie-break). Winning option funded. Occurs in Peace & Invasion (invasion UI TBD). Potential direct action if confidence high (TBC). Spending options include funding Bots, Communal Units, Communal Walls, Iron Dome, Aid, etc.
Land Ownership (Tenure System): Cyclical repurchase using personal Money for city plots. Structures inherited/reimbursed on transfer. Command Post requires owned land (inside city) or built outside. CP Relocatable.
Building (Personal): Hybrid system (Modular: Fences, Walls, Floors, Doors, Windows, Stairs + Presets/Blueprints). HP/Destructible. Built using personal Money. Can build outside city (unprotected).
Building (Communal): Bots build/repair communal structures (City Money). Shrine builds Communal Combat Units (City Money).
Exploration: Outside city walls. Encounters & Rewards (Money, Artifacts, Intel). AI scouts/units may be present and hostile during Peace.
Combat System: HP-based. Player performance generates Money (split 50/50 Player/City). Low-violence feedback. Global kill announcements for bosses (incl. rare Artifact drops to last hitter).
Strategy Focus: Cooperative defense, economics, base layout, customization (Artifacts), voting, tactical combat (Hero abilities + Troop Modes + leveraging communal defenses), exploration/intel.
UI: Minimap, Fog of War (resets peripherally), Market view, Inventory/Equipment view, HP bars, Personal/City Money displays, Donation UI, Voting Interface, LLM Proposal/Spending Log?, Kill Announcements, Troop Command/Mode UI, Building Interface, Iron Dome Status Indicator?, Phase Countdown Timers.
Game Loop & AI
Cycle: Variable length (~10 min Peace / ~30 min Invasion). Indicated by countdown timers.
Continuous LLM Analysis (City): LLM polls state (~30s), potentially triggers votes for City Money spending.
Continuous LLM Analysis (Invaders): Head Entity AI queries LLM periodically for strategic guidance (unit composition based on available AI Resources).
Peace Phase: Land repurchase, building/repairing, upgrading, trading, donating, social, exploration, intel gathering. LLM/Votes direct City Money spending. Bots perform tasks. Invading AI sends scouts, potentially attacks players/NPCs in Exterior. Head Entity "buys" units at AI Base.
Invasion Phase: AI units spawn from AI Base and attack city based on LLM strategy. Defend Shrine/defeat Head Entity. Generate Money. Collect Artifacts. LLM directs invasion strategy updates. LLM/Votes for City Money may occur. Head Entity must emerge from base. Communal/Player units engage Invaders (Wasps, Scuttlers, Bulwarks).
AI Invasion:
Unit Production: Head Entity uses AI Resources to "buy" units based on LLM guidance & unit costs. Spawned from AI Base.
Invader Unit Types & Behavior: Defined roles (Wasp: Anti-Air/Dome, Scuttler: Swarm/Anti-Gate, Bulwark: Siege) + Sergeants/Head (bosses). Require fallback behaviors. Must breach city defenses.
Hierarchical command (LLM/Head -> Sergeants -> Troops).
Dynamic Difficulty Scaling: Based on player count, total player team Money, AI Resource generation (incl. outcome multiplier).
LLM Integration: Directs Invasion strategy (incl. unit comp for AI), Manages City Money via proposing voted options, tasks Assistant Bots, powers some NPC dialogue, potentially generates intel.
Invasion Dynamics & Win/Loss Conditions
Player Win Condition: Defeat "Head Entity" (must leave its base) OR survive invasion timer.
Player Loss Condition: AI destroys central "Shrine".
Other Dynamics: Iron Dome status critical. Command Post survival influences bonuses/aid? Command Post destruction = troop loss. Sergeant defeat disrupts AI. Global kill announcements.
Architectural Principles (High Priority)
Server Authority: Server manages state, validates actions/votes/LLM results.
Modularity & Abstraction: Clean code structure.
Code File Size Guideline: Aim for < 1000 lines per file.
Robust Fallback Logic: For all LLM-dependent systems.
LLM Availability Monitoring: To trigger fallback logic.
Technology Stack & Implementation Details
Game Engine: PlayCanvas
Networking: Colyseus (Node.js)
Persistence: Database (Type TBD)
AI Interface: Local/Outsourced LLM via API.
Platform: PC Client (via Electron/Tauri wrapper), potential Mobile later.
Hosting: Cloud servers (e.g., DO), static hosting (e.g., Vercel).
Key Implementation Points: Split-screen rendering, state sync, DB schema, LLM API (incl. City spending/AI strategy), gamepad input, building/snapping, land tenure/market, Artifact system, Fog of War reset, combat mechanics, Assistant Bot logic, Communal Combat Unit logic, Contribution Tracking, Money Distribution (50/50), Leaver Money Handling, Voting System, AI Resource System & Scaling Formula Logic, AI Unit Purchasing/Spawning Logic, AI Base Functionality (spawn), AI Peacetime Scouting/Attack Logic, Phase Countdown Timers, Command Post Relocation Mechanics, Building Placement Rules, Troop Building/Management System, Kill Announcement System, LLM Fallback Systems, LLM Availability Monitoring, Circular City Layout Generation/Logic, Iron Dome mechanics, Join-in-Progress Logic, Initial Hero Abilities Defined, Troop Mode System, Initial Troop Stats/Costs/Behaviors defined, Initial Communal Unit Stats/Costs/Behaviors defined, Invading AI Unit logic & specific behaviors (incl. fallbacks for Wasp, Scuttler, Bulwark).