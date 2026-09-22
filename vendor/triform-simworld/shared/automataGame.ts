import { KIMI_AUTOMATA } from "./kimiSovereign";
import { STATE_MESH_NODES, type MeshNodeDefinition } from "./stateMesh";
import type { CharacterBlueprint, LayerKey, NudgeIntent } from "./triform";

export const THROAT_ROUTE = ["language-contact", "conversation", "computational-grammar-coder"] as const;
export type AutomatonStatus = "dormant" | "discovered" | "woven";
export type AutomatonMemory = { tick: number; characterId: number; phrase: string; resonance: number; intent: NudgeIntent };
export type AutomatonConnection = { characterId: number; tick: number; intent: NudgeIntent; layer: LayerKey; fromGate: number; resonance: number; artifactId: string };
export type AutomatonScope = { allowed: Array<"observe-home" | "weave-grammar" | "recall-own-memory">; denied: Array<"speak-for-resident" | "read-unrelated-memory" | "change-world-without-connection"> };
export type AutomatonSocialContext = { knownCharacterIds: number[]; lastCharacterId: number | null; lastIntent: NudgeIntent | null; lastLayer: LayerKey | null };
export type AutomatonResonance = { body: number; mind: number; heart: number; total: number; dominant: LayerKey; vector: MeshNodeDefinition["vector"] };
export type AutomatonHome = {
  id: string; label: string; gate: number; stateNodeId: number; dimension: string; form: string; capabilities: string;
  placeId: string; position: { x: number; z: number }; grammarSeed: string; color: string; status: AutomatonStatus; visits: number;
  memory: AutomatonMemory[]; connectionHistory: AutomatonConnection[]; socialContext: AutomatonSocialContext; scope: AutomatonScope; resonance: AutomatonResonance | null;
};
export type ConnectionImpact = { quality: number; social: number; coherence: number; momentum: number };
export type GrammarArtifact = { id: string; tick: number; characterId: number; automatonId: string; signature: string; phrase: string; layer: LayerKey; intent: NudgeIntent; kind: "variation" | "tool"; resonance: AutomatonResonance; lineage: string[]; impact: ConnectionImpact };
export type ThroatPath = { characterId: number; woven: string[]; completed: boolean };
export type KleinTool = { id: string; characterId: number; label: string; source: string; grantedAtTick: number; signature: string };
export type AutomataGameState = { playerCharacterId: number | null; activeAutomatonId: string | null; homes: AutomatonHome[]; grammar: GrammarArtifact[]; throatPaths: ThroatPath[]; inventory: KleinTool[]; visitedPlaces: Array<{ characterId: number; placeIds: string[] }> };

const HOME_PLACES = ["atrium", "archive", "glasshouse", "northwalk"] as const;
const HOME_COLORS = ["#d7a94a", "#7197d2", "#c878a3", "#78a478"] as const;
const GRAMMAR_SEEDS: Record<string, string> = {
  "autoling-lite": "recognize the pattern", "diseminer-lite": "let the story distribute", "klein-analogy": "turn likeness toward difference", "iching-grammar": "hold the changing line",
  "language-contact": "cross the threshold of speech", "historical-monte-carlo": "sample the lives that could follow", "autonovel": "let the scene continue", "messy": "welcome the uncertain signal",
  "success": "observe what becomes possible", "conversation": "make room for a reply", "browser-form": "ask the world for a field", "research-browser": "trace the living source",
  "computational-grammar-coder": "give the grammar a body", "autoling": "induce the next form", "diseminer": "carry the claim outward", "morph-mir": "remember and regenerate",
};
const AUTOMATON_SCOPE: AutomatonScope = { allowed: ["observe-home", "weave-grammar", "recall-own-memory"], denied: ["speak-for-resident", "read-unrelated-memory", "change-world-without-connection"] };
const SIGNS = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const labelFor = (id: string) => id.split("-").map((part) => part[0]?.toUpperCase() + part.slice(1)).join(" ");
const bound = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const signValue = (sign: string) => Math.max(0, SIGNS.indexOf(sign)) + 1;

export function createAutomataGameState(characters: Array<CharacterBlueprint & { id: number }>): AutomataGameState {
  return {
    playerCharacterId: characters[0]?.id ?? null, activeAutomatonId: "language-contact",
    homes: KIMI_AUTOMATA.map(([id, gate, dimension, form, capabilities], index) => {
      const node = STATE_MESH_NODES[gate - 1]!;
      return { id, label: labelFor(id), gate, stateNodeId: gate - 1, dimension, form, capabilities, placeId: HOME_PLACES[index % HOME_PLACES.length], position: { x: node.x * 3.85, z: node.z * 3.85 }, grammarSeed: GRAMMAR_SEEDS[id] ?? "weave a new relation", color: HOME_COLORS[index % HOME_COLORS.length]!, status: "dormant", visits: 0, memory: [], connectionHistory: [], socialContext: { knownCharacterIds: [], lastCharacterId: null, lastIntent: null, lastLayer: null }, scope: structuredClone(AUTOMATON_SCOPE), resonance: null };
    }),
    grammar: [], throatPaths: characters.map((character) => ({ characterId: character.id, woven: [], completed: false })), inventory: [], visitedPlaces: characters.map((character) => ({ characterId: character.id, placeIds: [] })),
  };
}

export function ensureAutomataGameState(state: Partial<AutomataGameState> | undefined, characters: Array<CharacterBlueprint & { id: number }>): AutomataGameState {
  if (!state?.homes?.length) return createAutomataGameState(characters);
  const seeded = createAutomataGameState(characters);
  return {
    playerCharacterId: state.playerCharacterId ?? seeded.playerCharacterId, activeAutomatonId: state.activeAutomatonId ?? seeded.activeAutomatonId,
    homes: seeded.homes.map((home) => { const saved = state.homes?.find((item) => item.id === home.id); return { ...home, ...saved, position: home.position, memory: saved?.memory ?? [], connectionHistory: saved?.connectionHistory ?? [], socialContext: saved?.socialContext ?? home.socialContext, scope: saved?.scope ?? home.scope, resonance: saved?.resonance ?? null }; }),
    grammar: state.grammar ?? [], throatPaths: characters.map((character) => state.throatPaths?.find((path) => path.characterId === character.id) ?? { characterId: character.id, woven: [], completed: false }), inventory: state.inventory ?? [], visitedPlaces: characters.map((character) => state.visitedPlaces?.find((visit) => visit.characterId === character.id) ?? { characterId: character.id, placeIds: [] }),
  };
}

export function setActiveAutomaton(state: AutomataGameState, automatonId: string) { const next = structuredClone(state); if (next.homes.some((home) => home.id === automatonId)) next.activeAutomatonId = automatonId; return next; }
export function setGuidedResident(state: AutomataGameState, characterId: number) { const next = structuredClone(state); next.playerCharacterId = characterId; return next; }
export function recordPlaceVisit(state: AutomataGameState, characterId: number, placeId: string) { const next = structuredClone(state); const record = next.visitedPlaces.find((visit) => visit.characterId === characterId); if (record && !record.placeIds.includes(placeId)) record.placeIds.push(placeId); return next; }

export function assertAutomatonScope(state: AutomataGameState, automatonId: string, action: AutomatonScope["allowed"][number]) {
  const home = state.homes.find((item) => item.id === automatonId);
  if (!home || !home.scope.allowed.includes(action)) throw new Error("This automaton is not allowed to perform that action outside its grounded scope.");
  return home;
}

export function automatonAssistantContext(state: AutomataGameState, automatonId: string) {
  const home = assertAutomatonScope(state, automatonId, "recall-own-memory");
  return { id: home.id, label: home.label, gate: home.gate, home: home.placeId, grammarSeed: home.grammarSeed, memory: home.memory, socialContext: home.socialContext, connectionHistory: home.connectionHistory, scope: home.scope };
}

export function calculateAutomatonResonance(actor: CharacterBlueprint, home: AutomatonHome): AutomatonResonance {
  const node = STATE_MESH_NODES[home.stateNodeId]!;
  const body = bound(node.vector.spatial * 0.46 + node.vector.temporal * 0.22 + signValue(actor.bodyProfile.sign) * 2.4 + actor.bodyProfile.offset * 0.2);
  const mind = bound(node.vector.knowledge * 0.4 + node.vector.dependency * 0.31 + signValue(actor.mindProfile.sign) * 2 + actor.mindProfile.offset * 0.25);
  const heart = bound(node.vector.causal * 0.33 + node.vector.spatial * 0.24 + signValue(actor.heartProfile.sign) * 1.8 + actor.heartProfile.offset * 0.3);
  const total = bound(body * 0.28 + mind * 0.32 + heart * 0.4);
  const dominant: LayerKey = heart >= mind && heart >= body ? "heart" : mind >= body ? "mind" : "body";
  return { body, mind, heart, total, dominant, vector: node.vector };
}

export function calculateConnectionImpact(actor: CharacterBlueprint, state: AutomataGameState, automatonId: string, intent: NudgeIntent): ConnectionImpact {
  const home = assertAutomatonScope(state, automatonId, "weave-grammar"); const resonance = calculateAutomatonResonance(actor, home);
  const intentModifier = intent === "Connect" ? 8 : intent === "Clarify" ? 6 : intent === "Advance" ? 5 : -2;
  const memoryModifier = Math.min(9, home.memory.length * 3); const contextModifier = Math.min(6, home.socialContext.knownCharacterIds.length * 2);
  const quality = bound(resonance.total + intentModifier + memoryModifier + contextModifier);
  return { quality, social: Math.round((quality - 50) * 0.24 + (intent === "Connect" ? 3 : 0)), coherence: Math.round((resonance.mind - 50) * 0.16 + (intent === "Clarify" ? 3 : 0)), momentum: Math.round((resonance.body - 50) * 0.14 + (intent === "Advance" ? 4 : 0)) };
}

export function resolveAutomataConnection(input: { state: AutomataGameState; actor: CharacterBlueprint & { id: number }; automatonId: string; tick: number; intent: NudgeIntent; layer: LayerKey }) {
  const next = structuredClone(input.state); const home = assertAutomatonScope(next, input.automatonId, "weave-grammar");
  home.status = "woven"; home.visits += 1; next.activeAutomatonId = home.id;
  const throat = next.throatPaths.find((item) => item.characterId === input.actor.id) ?? { characterId: input.actor.id, woven: [], completed: false };
  if (!next.throatPaths.some((item) => item.characterId === input.actor.id)) next.throatPaths.push(throat);
  if ((THROAT_ROUTE as readonly string[]).includes(home.id) && !throat.woven.includes(home.id)) throat.woven.push(home.id);
  const profile = input.layer === "body" ? input.actor.bodyProfile : input.layer === "mind" ? input.actor.mindProfile : input.actor.heartProfile;
  const node = STATE_MESH_NODES[home.stateNodeId]!; const resonance = calculateAutomatonResonance(input.actor, home); const impact = calculateConnectionImpact(input.actor, next, home.id, input.intent); home.resonance = resonance;
  const connector: Record<NudgeIntent, string> = { Connect: "with", Clarify: "through", Advance: "toward", Withdraw: "beside" };
  const coordinateCode = `${node.x.toFixed(1)},${node.y.toFixed(1)},${node.z.toFixed(1)}`;
  const vectorCode = ["knowledge", "causal", "spatial", "temporal", "dependency"].map((dimension) => `${dimension[0]}${Math.round(node.vector[dimension as keyof typeof node.vector] / 10)}`).join("");
  const signature = `${node.bits}@${coordinateCode}:${vectorCode}:${input.actor.bodyProfile.sign[0]}${input.actor.mindProfile.sign[0]}${input.actor.heartProfile.sign[0]}:${input.intent[0]}:q${impact.quality}:${throat.woven.length}`;
  const lineage = home.connectionHistory.slice(0, 2).map((connection) => `${connection.layer}@G${connection.fromGate}`);
  const vectorTerms = Object.entries(node.vector).sort(([, first], [, second]) => second - first).slice(0, 2).map(([dimension, value]) => `${dimension} ${value}`).join(" / ");
  const remembered = home.memory[0]?.phrase.split(" ").slice(0, 5).join(" "); const cohort = home.socialContext.knownCharacterIds.length;
  const phrase = `${home.grammarSeed} ${connector[input.intent]} ${profile.sign.toLowerCase()} at ${coordinateCode}, where ${vectorTerms} holds ${resonance.dominant} ${resonance.total}% / quality ${impact.quality}${remembered ? `; it recalls “${remembered}…”` : ""}${cohort ? ` with ${cohort} known resident${cohort === 1 ? "" : "s"}` : ""}${lineage.length ? `, carrying ${lineage.join(" → ")}` : ""} — ${input.actor.name.split(" ")[0]} gives the grammar a new relation.`;
  const completionReady = THROAT_ROUTE.every((id) => throat.woven.includes(id)); const existingTool = next.inventory.find((tool) => tool.characterId === input.actor.id && tool.id === "klein-throat-loom");
  let kind: GrammarArtifact["kind"] = "variation"; let reward: KleinTool | undefined;
  if (completionReady && !existingTool) { throat.completed = true; kind = "tool"; reward = { id: "klein-throat-loom", characterId: input.actor.id, label: "Klein Throat Loom", source: THROAT_ROUTE.join(" + "), grantedAtTick: input.tick, signature }; next.inventory.unshift(reward); }
  const artifact: GrammarArtifact = { id: `${input.actor.id}-${home.id}-${input.tick}-${home.visits}`, tick: input.tick, characterId: input.actor.id, automatonId: home.id, signature, phrase, layer: input.layer, intent: input.intent, kind, resonance, lineage, impact };
  next.grammar.unshift(artifact); next.grammar = next.grammar.slice(0, 36);
  home.memory.unshift({ tick: input.tick, characterId: input.actor.id, phrase, resonance: resonance.total, intent: input.intent }); home.memory = home.memory.slice(0, 12);
  home.connectionHistory.unshift({ characterId: input.actor.id, tick: input.tick, intent: input.intent, layer: input.layer, fromGate: home.gate, resonance: resonance.total, artifactId: artifact.id }); home.connectionHistory = home.connectionHistory.slice(0, 18);
  home.socialContext.knownCharacterIds = Array.from(new Set([input.actor.id, ...home.socialContext.knownCharacterIds])).slice(0, 12); home.socialContext.lastCharacterId = input.actor.id; home.socialContext.lastIntent = input.intent; home.socialContext.lastLayer = input.layer;
  return { state: next, home, artifact, throat, reward };
}

export function automataObjective(state: AutomataGameState, characterId: number | null) { const throat = state.throatPaths.find((item) => item.characterId === characterId); const completed = throat?.woven.length ?? 0; return { completed, total: THROAT_ROUTE.length, label: completed === THROAT_ROUTE.length ? "Klein tool formed — carry it into the next connection" : `Weave the throat route · ${completed}/${THROAT_ROUTE.length}` }; }
