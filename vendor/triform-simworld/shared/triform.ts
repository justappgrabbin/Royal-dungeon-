export const SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;
export const HUMAN_DESIGN_TYPES = ["Generator", "Manifesting Generator", "Projector", "Manifestor", "Reflector"] as const;
export const AUTHORITIES = ["Emotional", "Sacral", "Splenic", "Ego", "Self-Projected", "Mental", "Lunar"] as const;

export type Sign = (typeof SIGNS)[number];
export type LayerKey = "body" | "mind" | "heart";
export type HumanDesignType = (typeof HUMAN_DESIGN_TYPES)[number];
export type Authority = (typeof AUTHORITIES)[number];

export const AWARENESS_LAYERS = {
  body: { label: "Body", system: "Tropical astrology", domain: "Regular actions", offset: 0, accent: "#d8b47d" },
  mind: { label: "Mind", system: "Sidereal astrology", domain: "Transpersonal interactions", offset: 24, accent: "#8aa9d6" },
  heart: { label: "Heart", system: "Draconic astrology", domain: "Social direction, movement & individuality", offset: 88, accent: "#cf8fb7" },
} as const satisfies Record<LayerKey, { label: string; system: string; domain: string; offset: number; accent: string }>;

type SignArchetype = { traits: [string, string, string]; action: string; connection: string; direction: string };
export const SIGN_ARCHETYPES: Record<Sign, SignArchetype> = {
  Aries: { traits: ["initiating", "candid", "brave"], action: "acts first", connection: "challenges the group", direction: "opens a new path" },
  Taurus: { traits: ["grounded", "sensory", "steadfast"], action: "stabilizes the moment", connection: "builds dependable trust", direction: "protects what matters" },
  Gemini: { traits: ["curious", "nimble", "expressive"], action: "gathers signals", connection: "links separate perspectives", direction: "keeps the field moving" },
  Cancer: { traits: ["protective", "receptive", "remembering"], action: "cares for immediate needs", connection: "notices emotional weather", direction: "creates belonging" },
  Leo: { traits: ["radiant", "creative", "loyal"], action: "makes a bold offering", connection: "rallies shared confidence", direction: "gives the social field a center" },
  Virgo: { traits: ["discerning", "practical", "attentive"], action: "improves what is present", connection: "offers a useful correction", direction: "brings care to the details" },
  Libra: { traits: ["relational", "diplomatic", "aesthetic"], action: "seeks a balanced response", connection: "negotiates common ground", direction: "restores reciprocity" },
  Scorpio: { traits: ["intense", "perceptive", "transformative"], action: "names the underlying tension", connection: "tests the depth of trust", direction: "turns pressure into change" },
  Sagittarius: { traits: ["expansive", "principled", "adventurous"], action: "moves toward a larger horizon", connection: "shares a motivating story", direction: "widens the collective view" },
  Capricorn: { traits: ["intentional", "responsible", "enduring"], action: "sets a workable structure", connection: "defines a shared commitment", direction: "makes progress durable" },
  Aquarius: { traits: ["visionary", "independent", "collective"], action: "experiments with a new approach", connection: "invites the network into view", direction: "redirects the social pattern" },
  Pisces: { traits: ["imaginative", "compassionate", "porous"], action: "follows an intuitive cue", connection: "softens the boundaries", direction: "makes room for possibility" },
};

export type AstrologyProfile = { sign: Sign; system: "Tropical" | "Sidereal" | "Draconic"; offset: number; traits: string[]; expression: string };
export type HumanDesignBlueprint = { type: HumanDesignType; authority: Authority; profile: string; definition: string };
export type CharacterBlueprint = {
  id?: number; name: string; role: string; hue: string; humanDesign: HumanDesignBlueprint;
  bodyProfile: AstrologyProfile; mindProfile: AstrologyProfile; heartProfile: AstrologyProfile;
};
export type DecisionResult = {
  category: "action" | "interaction" | "direction" | "nudge"; title: string; description: string; primaryLayer: LayerKey;
  layers: { key: LayerKey; contribution: string; influence: number }[];
  outcome: { social: number; coherence: number; momentum: number; note: string };
};
export type NudgeIntent = "Connect" | "Clarify" | "Advance" | "Withdraw";

export function makeAstrologyProfile(sign: Sign, layer: LayerKey): AstrologyProfile {
  const archetype = SIGN_ARCHETYPES[sign];
  const expression = layer === "body" ? archetype.action : layer === "mind" ? archetype.connection : archetype.direction;
  return { sign, system: layer === "body" ? "Tropical" : layer === "mind" ? "Sidereal" : "Draconic", offset: AWARENESS_LAYERS[layer].offset, traits: archetype.traits, expression };
}

export function buildBlueprint(input: { name: string; role: string; hue: string; humanDesign: HumanDesignBlueprint; tropicalSign: Sign; siderealSign: Sign; draconicSign: Sign }): CharacterBlueprint {
  return {
    name: input.name, role: input.role, hue: input.hue, humanDesign: input.humanDesign,
    bodyProfile: makeAstrologyProfile(input.tropicalSign, "body"),
    mindProfile: makeAstrologyProfile(input.siderealSign, "mind"),
    heartProfile: makeAstrologyProfile(input.draconicSign, "heart"),
  };
}

export function simulateDecision(character: CharacterBlueprint, tick: number, nudge?: NudgeIntent): DecisionResult {
  const primaryLayer: LayerKey = tick % 3 === 0 ? "body" : tick % 3 === 1 ? "mind" : "heart";
  const primary = character[`${primaryLayer}Profile`];
  const { bodyProfile: body, mindProfile: mind, heartProfile: heart } = character;
  const nudgeMessages: Record<NudgeIntent, string> = {
    Connect: "The viewer nudge asks for a more connective version of the choice.",
    Clarify: "The viewer nudge asks for the clearest available signal.",
    Advance: "The viewer nudge asks for forward motion rather than delay.",
    Withdraw: "The viewer nudge asks for healthy distance before committing.",
  };
  const title = nudge ? `${character.name} reframes the next move` : primaryLayer === "body" ? `${character.name} takes a practical action` : primaryLayer === "mind" ? `${character.name} shifts the shared perspective` : `${character.name} redirects the social current`;
  const category = nudge ? "nudge" : primaryLayer === "body" ? "action" : primaryLayer === "mind" ? "interaction" : "direction";
  const description = nudge ? `${nudgeMessages[nudge]} ${character.name}'s Heart holds the social direction while the Body and Mind supply the action and relational framing.` : `${character.name} ${primary.expression}. The Body moves through ${body.sign}, the Mind reads transpersonal context through ${mind.sign}, and the Heart steers social direction through ${heart.sign}.`;
  const bias = nudge === "Connect" ? 8 : nudge === "Advance" ? 6 : nudge === "Clarify" ? 4 : nudge === "Withdraw" ? -5 : 0;
  return {
    category, title, description, primaryLayer,
    layers: [
      { key: "body", contribution: `${body.sign}: ${body.expression}`, influence: primaryLayer === "body" ? 52 : 24 },
      { key: "mind", contribution: `${mind.sign}: ${mind.expression}`, influence: primaryLayer === "mind" ? 52 : 24 },
      { key: "heart", contribution: `${heart.sign}: ${heart.expression}`, influence: primaryLayer === "heart" ? 52 : 24 },
    ],
    outcome: {
      social: 61 + ((tick * 7 + bias + character.name.length) % 22),
      coherence: 58 + ((tick * 5 + (nudge === "Clarify" ? 9 : 0)) % 27),
      momentum: 55 + ((tick * 11 + (nudge === "Advance" ? 12 : 0)) % 30),
      note: nudge ? `${nudge} nudge recorded as a fork in the scenario.` : "Autonomous choice recorded from the active awareness layer.",
    },
  };
}

export const STARTER_CHARACTERS: CharacterBlueprint[] = [
  buildBlueprint({ name: "Mara Vale", role: "Pattern broker", hue: "#d6a77b", humanDesign: { type: "Projector", authority: "Splenic", profile: "2/4", definition: "Focused insight" }, tropicalSign: "Virgo", siderealSign: "Leo", draconicSign: "Aquarius" }),
  buildBlueprint({ name: "Orin Sato", role: "Field maker", hue: "#88aac8", humanDesign: { type: "Generator", authority: "Sacral", profile: "4/6", definition: "Steady response" }, tropicalSign: "Taurus", siderealSign: "Aries", draconicSign: "Libra" }),
  buildBlueprint({ name: "Ilya Noor", role: "Threshold scout", hue: "#cd8fb3", humanDesign: { type: "Manifesting Generator", authority: "Emotional", profile: "3/5", definition: "Adaptive motion" }, tropicalSign: "Gemini", siderealSign: "Taurus", draconicSign: "Scorpio" }),
];
