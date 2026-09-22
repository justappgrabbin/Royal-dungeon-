import { createAutomataGameState, ensureAutomataGameState, recordPlaceVisit, resolveAutomataConnection, setActiveAutomaton, setGuidedResident, type AutomataGameState, type GrammarArtifact, type KleinTool } from "./automataGame";
import type { CharacterBlueprint, DecisionResult, NudgeIntent } from "./triform";

export type WorldPlace = { id: string; name: string; subtitle: string; description: string; color: string };
export type WorldPresence = { characterId: number; placeId: string; activity: string; perception: string; intention: string; lastTick: number };
export type WorldRelationship = { firstCharacterId: number; secondCharacterId: number; affinity: number; trust: number; tension: number; lastShift: string; sharedMemory: string };
export type WorldMemory = { tick: number; eventId: number; characterId: number; placeId: string; statement: string; consequence: string };
export type WorldState = { places: WorldPlace[]; presences: WorldPresence[]; relationships: WorldRelationship[]; memories: WorldMemory[]; automata: AutomataGameState };
export type WorldCharacter = CharacterBlueprint & { id: number };

export const WORLD_PLACES: WorldPlace[] = [
  { id: "atrium", name: "The Atrium", subtitle: "Common ground", description: "A high, open room where residents can be seen before they are understood.", color: "#c8a36a" },
  { id: "archive", name: "The Archive", subtitle: "Private record", description: "A quiet room of kept signals, unfinished explanations, and personal maps.", color: "#7895b8" },
  { id: "glasshouse", name: "The Glasshouse", subtitle: "Threshold garden", description: "A warm interior garden where proximity becomes visible and choices can soften.", color: "#829a72" },
  { id: "northwalk", name: "The North Walk", subtitle: "Outer edge", description: "A long passage for solitude, observation, and decisions that need distance.", color: "#af7f9a" },
];

function clamp(value: number) { return Math.max(0, Math.min(100, value)); }
function pairKey(firstCharacterId: number, secondCharacterId: number) { return firstCharacterId < secondCharacterId ? [firstCharacterId, secondCharacterId] : [secondCharacterId, firstCharacterId]; }
function findPlace(state: WorldState, id: string) { return state.places.find((place) => place.id === id) ?? state.places[0]!; }
function personPhrase(character: WorldCharacter) { return `${character.name}, ${character.role.toLowerCase()}`; }

export function createWorldState(characters: WorldCharacter[]): WorldState {
  const presences = characters.map((character, index) => ({
    characterId: character.id,
    placeId: WORLD_PLACES[index % WORLD_PLACES.length]!.id,
    activity: `${character.bodyProfile.expression}.`,
    perception: `Notices the field through ${character.mindProfile.sign}: ${character.mindProfile.traits.slice(0, 2).join(" and ")}.`,
    intention: `Social direction held through ${character.heartProfile.sign}: ${character.heartProfile.expression}.`,
    lastTick: 0,
  }));
  const relationships: WorldRelationship[] = [];
  for (let first = 0; first < characters.length; first += 1) for (let second = first + 1; second < characters.length; second += 1) {
    relationships.push({ firstCharacterId: characters[first]!.id, secondCharacterId: characters[second]!.id, affinity: 46 + ((first + second) % 3) * 6, trust: 48 + ((first * 3 + second) % 4) * 5, tension: 18 + ((first + second) % 3) * 4, lastShift: "No shared choice has altered this relationship yet.", sharedMemory: "Their history is still forming in the field." });
  }
  return { places: WORLD_PLACES, presences, relationships, memories: [], automata: createAutomataGameState(characters) };
}

export function ensureAutomataWorld(state: WorldState, characters: WorldCharacter[]): WorldState {
  return { ...state, automata: ensureAutomataGameState(state.automata, characters) };
}

export function addResidentToWorld(state: WorldState, character: WorldCharacter, allCharacters: WorldCharacter[]): WorldState {
  const prepared = ensureAutomataWorld(state, allCharacters);
  if (prepared.presences.some((presence) => presence.characterId === character.id)) return prepared;
  const next = structuredClone(prepared);
  next.presences.push({ characterId: character.id, placeId: WORLD_PLACES[(allCharacters.length - 1) % WORLD_PLACES.length]!.id, activity: `${character.bodyProfile.expression}.`, perception: `Arrives alert to ${character.mindProfile.sign} patterns.`, intention: `${character.heartProfile.expression}.`, lastTick: 0 });
  allCharacters.filter((other) => other.id !== character.id).forEach((other, index) => next.relationships.push({ firstCharacterId: Math.min(character.id, other.id), secondCharacterId: Math.max(character.id, other.id), affinity: 45 + index * 3, trust: 50, tension: 20, lastShift: "The relationship begins with mutual attention.", sharedMemory: "They have only just entered one another's field." }));
  return next;
}

export function applyWorldConsequence(state: WorldState, actor: WorldCharacter, characters: WorldCharacter[], result: DecisionResult, tick: number, eventId: number, nudge?: NudgeIntent): WorldState {
  const next = structuredClone(ensureAutomataWorld(state, characters));
  const actorPresence = next.presences.find((presence) => presence.characterId === actor.id)!;
  const others = characters.filter((character) => character.id !== actor.id);
  const witness = others.length ? others[(tick + actor.id) % others.length]! : undefined;
  const witnessPresence = witness ? next.presences.find((presence) => presence.characterId === witness.id) : undefined;
  const nextPlaceId = nudge === "Withdraw" ? "northwalk" : nudge === "Connect" && witnessPresence ? witnessPresence.placeId : result.primaryLayer === "heart" ? "atrium" : result.primaryLayer === "mind" && witnessPresence ? witnessPresence.placeId : actorPresence.placeId;
  const place = findPlace(next, nextPlaceId);
  const behavior = nudge ? `${nudge}: ${result.description}` : result.description;
  actorPresence.placeId = nextPlaceId;
  actorPresence.activity = result.primaryLayer === "body" ? `${actor.bodyProfile.expression} in ${place.name}.` : result.primaryLayer === "mind" ? `${actor.mindProfile.expression} with ${witness?.name ?? "the nearby field"}.` : `${actor.heartProfile.expression} from ${place.name}.`;
  actorPresence.perception = `${actor.mindProfile.sign} Mind registers ${witness ? personPhrase(witness) : "the shared atmosphere"} as ${actor.mindProfile.traits[0]}.`;
  actorPresence.intention = `${actor.heartProfile.sign} Heart: ${actor.heartProfile.expression}.`;
  actorPresence.lastTick = tick;
  let consequence = `${actor.name} changes the immediate atmosphere at ${place.name}.`;
  if (witness) {
    const [firstCharacterId, secondCharacterId] = pairKey(actor.id, witness.id);
    const relationship = next.relationships.find((item) => item.firstCharacterId === firstCharacterId && item.secondCharacterId === secondCharacterId)!;
    const affinityDelta = nudge === "Connect" ? 8 : nudge === "Withdraw" ? -2 : result.primaryLayer === "mind" ? 4 : result.primaryLayer === "heart" ? 3 : 1;
    const trustDelta = nudge === "Clarify" ? 7 : nudge === "Connect" ? 4 : nudge === "Withdraw" ? 1 : result.primaryLayer === "mind" ? 3 : 1;
    const tensionDelta = nudge === "Withdraw" ? -7 : nudge === "Clarify" ? -5 : nudge === "Advance" ? 3 : nudge === "Connect" ? -2 : result.primaryLayer === "heart" ? 2 : 0;
    relationship.affinity = clamp(relationship.affinity + affinityDelta);
    relationship.trust = clamp(relationship.trust + trustDelta);
    relationship.tension = clamp(relationship.tension + tensionDelta);
    relationship.lastShift = `${actor.name} ${nudge ? `accepted a ${nudge.toLowerCase()} nudge` : result.primaryLayer === "mind" ? "made a relational intervention" : result.primaryLayer === "heart" ? "redirected the social current" : "acted in the shared space"}.`;
    relationship.sharedMemory = `${actor.name} and ${witness.name} now carry the memory of tick ${tick} at ${place.name}.`;
    consequence = `${relationship.lastShift} ${witness.name} witnesses it; trust is now ${relationship.trust} and tension ${relationship.tension}.`;
  }
  next.memories.unshift({ tick, eventId, characterId: actor.id, placeId: place.id, statement: behavior, consequence });
  next.memories = next.memories.slice(0, 30);
  return next;
}

export function visitAutomatonHome(state: WorldState, actor: WorldCharacter, characters: WorldCharacter[], automatonId: string): WorldState {
  const next = structuredClone(ensureAutomataWorld(state, characters));
  const home = next.automata.homes.find((item) => item.id === automatonId);
  const presence = next.presences.find((item) => item.characterId === actor.id);
  if (!home || !presence) throw new Error("This automaton home is not available in the current world.");
  next.automata = setGuidedResident(setActiveAutomaton(next.automata, automatonId), actor.id);
  if (home.status === "dormant") home.status = "discovered";
  presence.placeId = home.placeId;
  presence.activity = `arrives at ${home.label}, listening for its grammar.`;
  presence.perception = `${actor.mindProfile.sign} Mind notices ${home.grammarSeed}.`;
  presence.intention = `${actor.heartProfile.sign} Heart chooses whether to weave this connection.`;
  next.automata = recordPlaceVisit(next.automata, actor.id, home.placeId);
  return next;
}

export function guideResident(state: WorldState, characters: WorldCharacter[], characterId: number): WorldState {
  const next = structuredClone(ensureAutomataWorld(state, characters));
  if (!characters.some((character) => character.id === characterId)) throw new Error("The guided resident is not in this world.");
  next.automata = setGuidedResident(next.automata, characterId);
  return next;
}

export function applyAutomataConsequence(input: { state: WorldState; actor: WorldCharacter; characters: WorldCharacter[]; result: DecisionResult; tick: number; eventId: number; intent: NudgeIntent; automatonId: string }) {
  const relational = applyWorldConsequence(input.state, input.actor, input.characters, input.result, input.tick, input.eventId, input.intent);
  const resolved = resolveAutomataConnection({ state: relational.automata, actor: input.actor, automatonId: input.automatonId, tick: input.tick, intent: input.intent, layer: input.result.primaryLayer });
  relational.automata = resolved.state;
  const presence = relational.presences.find((item) => item.characterId === input.actor.id);
  const home = resolved.home;
  if (presence) {
    presence.placeId = home.placeId;
    presence.activity = `weaves ${home.label}: ${resolved.artifact.phrase}`;
    presence.perception = `${input.actor.mindProfile.sign} Mind receives ${home.form} at ${resolved.artifact.resonance.mind}% resonance.`;
    presence.intention = resolved.reward ? `${input.actor.heartProfile.sign} Heart carries a new Klein tool at ${resolved.artifact.resonance.heart}% resonance.` : `${input.actor.heartProfile.sign} Heart keeps the ${resolved.artifact.resonance.dominant}-led grammar variation.`;
  }
  const latestMemory = relational.memories[0];
  if (latestMemory) {
    latestMemory.statement = resolved.artifact.phrase;
    latestMemory.consequence = resolved.reward ? `${latestMemory.consequence} A Klein tool forms: ${resolved.reward.label} at ${resolved.artifact.resonance.total}% resonance.` : `${latestMemory.consequence} A ${resolved.artifact.resonance.dominant}-led grammar variation is retained: ${resolved.artifact.signature}.`;
  }
  return { world: relational, artifact: resolved.artifact as GrammarArtifact, reward: resolved.reward as KleinTool | undefined };
}
