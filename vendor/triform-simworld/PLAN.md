# Game Plan: TriForm Automata Homes

## Risk Tasks

### 1. Player-controlled 3D automata world
- **Why isolated:** The user must be able to recognize a playable place, an embodied resident, reachable automata homes, and an active encounter immediately. Babylon lifecycle and pointer selection must remain stable while React updates the persistent world state.
- **Approach:** Use one lifecycle-safe Babylon canvas embedded at the top of Home. Render the 64-node 4 × 4 × 4 state space as a subdued living map under the courtyard, with all sixteen archive automata located at their gate coordinates and an embodied player marker moving among the homes. Each home dispatches a typed selection to React; server mutations remain authoritative for movement and encounter outcomes.
- **Verify:** Clicking an in-world automata home moves the selected resident to its world location, opens its encounter state, and updates the HUD without duplicate engines or browser errors.

### 2. Emergent automata grammar and throat grant rules
- **Why isolated:** Grammar, connection history, three awareness profiles, and the throat completion route must produce deterministic, explainable outputs while still allowing a vast combination space.
- **Approach:** Give each of the sixteen archive-derived Kimi automata a stable gate-coordinate home, bounded local memory ledger, social context, connection history, resonance score, and explicit grounded scope. Combine its six-bit state and five-vector with Body/Tropical, Mind/Sidereal −24, Heart/Draconic −88, nudge intent, and prior local lineage into a deterministic grammar artifact. The three throat-route automata grant a Klein tool only after all are woven; other woven connections grant a persistent variation.
- **Verify:** A player can discover and weave each throat-route automaton; the third completed route grants one Klein tool, while a non-complete connection grants an emergent variation with a distinct signature.

## Main Build

The Home screen is the game, not a dashboard. It contains the playable world, objective, player embodiment, resident presence, automata homes, encounter prompt, grammar stream, throat route, and inventory. Viewer nudges resolve the active resident–automaton interaction inside the scene. Kimi’s derivation and state-space details remain available as a secondary explanatory layer.

- **Assets:** `automata-game-world-reference` (16:9 visual target), `automata-player-explorer` (1.8m player billboard), and `klein-tool-emergence` (0.7m world pickup and inventory art).
- **Verify:**
  - The first viewport reads as a playable place with an active objective, selected embodied resident, reachable homes, and an explicit encounter action.
  - The player can move to a home, make a nudge-shaped connection choice, see grammar evolve, and receive a stored variation or tool.
  - The Body/Tropical, Mind/Sidereal −24, and Heart/Draconic −88 layers visibly change resonance and the connection outcome.
  - Every home, link, grammar artifact, throat mark, and inventory result persists across reload.
  - Canvas selection, keyboard movement, React controls, and server updates remain responsive without console errors.
  - The view is readable on desktop and mobile, with the generated visual target’s dusk courtyard palette and elevated third-person framing.
