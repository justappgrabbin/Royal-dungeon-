import type { LayerKey } from "./triform";
import type { MeshDimension, MeshNodeDefinition } from "./stateMesh";

export const KIMI_DIMENSIONS = ["Movement", "Evolution", "Being", "Design", "Space"] as const;
export const KIMI_PROJECTIONS: Record<MeshDimension, string> = { knowledge: "knowledge", causal: "causal", spatial: "phase", temporal: "temporal", dependency: "dependency" };

export const KIMI_NAMED_TRANSITIONS = [
  ["ignition", "→*", "dormant → active (α: 0→σ(input))", "o_transform"], ["flow", "→", "active → active (α propagates w/ weight)", "o_transform"],
  ["weakening", "⇢", "active → weakening (α decays by λ)", "o_transform"], ["dormancy", "⇝", "weakening → dormant (α<θ; topology kept)", "o_transform"],
  ["reactivation", "↬", "dormant → active via resonance", "o_transform"], ["fusion", "⊕", "n states → bundle (o_bundle)", "o_bundle"],
  ["chain", "▸", "ordered append (o_sequence)", "o_sequence"], ["mirror", "≍", "o_reverse (Fu Xi reverse variation)", "o_reverse"],
  ["shadow", "◐", "o_inverse (yin↔yang line inversion)", "o_inverse"], ["rotation", "⟳", "o_converse (180° wheel rotation)", "o_converse"],
  ["core", "⊙", "o_nuclear (nuclear trigram)", "o_nuclear"], ["becoming", "⇒", "o_change (moving line → target state)", "o_change"],
  ["perspective", "◇", "o_project Tᵢ→ⱼ (dimension change)", "o_project"], ["recursion", "↺", "o_recurse (output re-enters as operand)", "o_recurse"],
  ["weave", "⋈", "o_discourse (L5 units → L6)", "o_discourse"], ["automatize", "⚙", "o_automaton (state set → machine)", "o_automaton"],
] as const;

export const KIMI_AUTOMATA = [
  ["autoling-lite", 17, "Design", "rule-induction FSM", "learn, recognize, generate, export"], ["diseminer-lite", 48, "Evolution", "narrative-sim FSM", "ingest, neighbors, infer, export"],
  ["klein-analogy", 4, "Design", "analogy transducer", "solve-analogy"], ["iching-grammar", 61, "Being", "hexagram pushdown automaton", "cast, transform"],
  ["language-contact", 12, "Movement", "dual-tape transducer", "simulate-contact"], ["historical-monte-carlo", 32, "Evolution", "sampling automaton", "sample-histories"],
  ["autonovel", 56, "Design", "generative stack machine", "register, learn, generate"], ["messy", 3, "Movement", "probabilistic FSM", "simulate"],
  ["success", 14, "Being", "reward hill-climber", "define, observe, propose, summary, replay"], ["conversation", 12, "Space", "turn-taking transducer", "utter, weave-packet, repair, close"],
  ["browser-form", 20, "Being", "DOM-walker FSM", "inspect-page, draft, approve-fields, confirm-inferred, fill, validate, request-submission, confirm-submission, submit, snapshot"], ["research-browser", 11, "Space", "crawl automaton", "create, source, claim, note, hypothesis, experiment, draft, snapshot"],
  ["computational-grammar-coder", 62, "Evolution", "compiler PDA", "code, disambiguate, dictionary"], ["autoling", 17, "Design", "enhanced rule-induction pipeline", "pipeline, morphology, phrase-structure, semantic-parse, induce, transform, stats"],
  ["diseminer", 48, "Evolution", "distributional narrative engine", "observe, extract-claims, monte-carlo, narrative, stats"], ["morph-mir", 24, "Space", "memory-graph automaton", "ingest, analyze, remember, regenerate"],
] as const;

export type KimiTraceStep = { automaton: string; from: string; to: string; transitionId: string; frequency: number; color: string };

export function getKimiDimension(node: MeshNodeDefinition) { return KIMI_DIMENSIONS[(node.gate - 1) % KIMI_DIMENSIONS.length]; }

export function deriveKimiTrace(input: string, node: MeshNodeDefinition, layer: LayerKey, nudge = false): KimiTraceStep[] {
  const toolId = KIMI_AUTOMATA.find(([id]) => input.toLowerCase().startsWith(id))?.[0] ?? "messy";
  const middleTransition = nudge ? "weave" : layer === "mind" ? "perspective" : layer === "heart" ? "becoming" : "flow";
  const baseFrequency = 64 + node.gate * 3.2 + node.line * 5.5;
  return [
    { automaton: "iching-grammar", from: "dormant", to: "addressed", transitionId: "ignition", frequency: baseFrequency, color: "#A44746" },
    { automaton: toolId, from: "addressed", to: "active", transitionId: middleTransition, frequency: baseFrequency + 42, color: layer === "body" ? "#C28E3C" : layer === "mind" ? "#6F8CBA" : "#A65A79" },
    { automaton: "conversation", from: "active", to: nudge ? "forked" : "retained", transitionId: nudge ? "weave" : "chain", frequency: baseFrequency + 84, color: "#6E8C3C" },
  ];
}
