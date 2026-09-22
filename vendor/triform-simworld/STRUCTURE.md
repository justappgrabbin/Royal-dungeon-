# TriForm Automata Homes Structure

The application uses a **game-first Home screen**. Babylon owns the live visual world and pointer/keyboard input. React owns the heads-up interface, encounter choices, and inspectable causal language. The server remains authoritative for world, automata, grammar, throat, inventory, and relationship state.

| Layer | Module | Responsibility |
|---|---|---|
| Game canvas | `client/src/components/AutomataWorldCanvas.tsx` | Creates and disposes the single Babylon engine, receives world props, and forwards home selection to Home. |
| Scene | `client/src/game/automataScene.ts` | Renders the 64-node state-space floor, player, residents, sixteen gate-positioned home meshes, paths, tool effect, camera, and keyboard navigation. |
| Ecology rules | `shared/automataGame.ts` | Creates archive-derived homes, enforces grounded scope, calculates TriForm resonance, persists local memory/context/history, resolves grammar connections, tracks throat marks, and grants tools or variations. |
| Lived world | `shared/world.ts` | Preserves places, resident presence, relationships, memories, and embeds the automata game state. |
| Persistence | `server/triformDb.ts` | Extends the authoritative simulation snapshot and writes game travel and connection outcomes to the saved world state. |
| UI host | `client/src/pages/Home.tsx` | Shows objective, resident embodiment, active encounter, grammar stream, inventory, and optional Kimi explanation. |

## Automata World Contract

Each automaton has one stable home linked to its archive-derived gate and dimension. Its coordinate is derived from the same 64-node 4 × 4 × 4 mesh that visibly underlies the courtyard. A home owns a bounded memory ledger, its own connection lineage, current social context, last resonance, and an explicit scope that permits only home observation, grammar weaving, and recall of that automaton’s own memory. The player’s interaction proceeds from **discover → attune → weave**. A weave combines the home’s six-bit gate and five-vector, local lineage, actor’s Body, Mind, Heart profile, and nudge intent.

The throat route is `language-contact` → `conversation` → `computational-grammar-coder`. When all three are woven for one character, the system grants a durable Klein tool. Any other fully woven connection grants a deterministic emergent variation instead. Both outcomes are retained in inventory and recorded with an emergence signature.
