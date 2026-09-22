import { SIGNS, type LayerKey } from "./triform";

export const MESH_DIMENSIONS = ["knowledge", "causal", "spatial", "temporal", "dependency"] as const;
export type MeshDimension = (typeof MESH_DIMENSIONS)[number];

export const DIMENSION_META: Record<MeshDimension, { label: string; description: string; color: string }> = {
  knowledge: { label: "Knowledge", description: "Information available to the current state.", color: "#d8b47d" },
  causal: { label: "Causal", description: "One-bit levers that can alter the next state.", color: "#cf8fb7" },
  spatial: { label: "Spatial", description: "Proximity and embodiment in the 4 × 4 × 4 mesh.", color: "#8aa9d6" },
  temporal: { label: "Temporal", description: "Sequence, recurrence, and state-cycle placement.", color: "#9bbd93" },
  dependency: { label: "Dependency", description: "Prerequisites and constraints embedded in the state.", color: "#b99add" },
};

export type MeshVector = Record<MeshDimension, number>;
export type MeshNodeDefinition = {
  id: number;
  bits: string;
  planet: string;
  gate: number;
  line: number;
  color: number;
  tone: number;
  base: number;
  degree: number;
  minute: number;
  second: number;
  arc: string;
  zodiac: string;
  house: number;
  x: number;
  y: number;
  z: number;
  vector: MeshVector;
};

export type MeshEdgeDefinition = { dimension: MeshDimension; fromNodeId: number; toNodeId: number; weight: number };

const PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];
const popcount = (value: number) => value.toString(2).replace(/0/g, "").length;

export function makeNode(id: number): MeshNodeDefinition {
  const bits = id.toString(2).padStart(6, "0");
  const xIndex = id & 3;
  const yIndex = (id >> 2) & 3;
  const zIndex = (id >> 4) & 3;
  const angle = (id * 5.625) % 360;
  const degree = Math.floor(angle);
  const minutesFloat = (angle - degree) * 60;
  const minute = Math.floor(minutesFloat);
  const second = Math.floor((minutesFloat - minute) * 60);
  const zodiac = SIGNS[Math.floor(angle / 30)];
  const activeBits = popcount(id);
  return {
    id, bits, planet: PLANETS[id % PLANETS.length], gate: id + 1, line: (id % 6) + 1,
    color: (Math.floor(id / 6) % 6) + 1, tone: (Math.floor(id / 3) % 6) + 1, base: (Math.floor(id / 12) % 5) + 1,
    degree, minute, second, arc: `${zodiac} ${degree}° ${minute}' ${second}"`, zodiac, house: (id % 12) + 1,
    x: (xIndex - 1.5) * 1.2, y: (yIndex - 1.5) * 1.2, z: (zIndex - 1.5) * 1.2,
    vector: {
      knowledge: Math.min(100, 22 + activeBits * 12 + (id % 5) * 3),
      causal: Math.min(100, 28 + (6 - activeBits) * 11 + (id % 4) * 4),
      spatial: 36 + (xIndex + yIndex + zIndex) * 7,
      temporal: 20 + ((id * 17) % 76),
      dependency: Math.min(100, 18 + activeBits * 14 + ((id >> 1) % 3) * 5),
    },
  };
}

export const STATE_MESH_NODES = Array.from({ length: 64 }, (_, id) => makeNode(id));

function addEdge(edges: MeshEdgeDefinition[], seen: Set<string>, dimension: MeshDimension, fromNodeId: number, toNodeId: number, weight = 1, directed = false) {
  const key = directed ? `${dimension}:${fromNodeId}>${toNodeId}` : `${dimension}:${Math.min(fromNodeId, toNodeId)}-${Math.max(fromNodeId, toNodeId)}`;
  if (!seen.has(key) && fromNodeId !== toNodeId) { seen.add(key); edges.push({ dimension, fromNodeId, toNodeId, weight }); }
}

export function buildDimensionEdges(dimension: MeshDimension): MeshEdgeDefinition[] {
  const edges: MeshEdgeDefinition[] = [];
  const seen = new Set<string>();
  for (const node of STATE_MESH_NODES) {
    if (dimension === "knowledge") {
      const groupStart = node.id & 0b111000;
      const next = groupStart + ((node.id - groupStart + 1) % 8);
      addEdge(edges, seen, dimension, node.id, next, 2);
    }
    if (dimension === "causal") {
      for (let bit = 0; bit < 6; bit += 1) addEdge(edges, seen, dimension, node.id, node.id ^ (1 << bit), 2);
    }
    if (dimension === "spatial") {
      const { x, y, z } = node;
      for (const candidate of STATE_MESH_NODES) {
        const adjacent = Math.abs(candidate.x - x) + Math.abs(candidate.y - y) + Math.abs(candidate.z - z) === 1.2;
        if (adjacent) addEdge(edges, seen, dimension, node.id, candidate.id, 3);
      }
    }
    if (dimension === "temporal") addEdge(edges, seen, dimension, node.id, (node.id + 1) % 64, 1, true);
    if (dimension === "dependency") {
      for (let bit = 0; bit < 6; bit += 1) if (node.id & (1 << bit)) addEdge(edges, seen, dimension, node.id, node.id & ~(1 << bit), 4, true);
    }
  }
  return edges;
}

export const STATE_MESH_EDGES = MESH_DIMENSIONS.flatMap((dimension) => buildDimensionEdges(dimension));

export function transitionNodeId(fromNodeId: number, tick: number, layer: LayerKey, nudge?: "Connect" | "Clarify" | "Advance" | "Withdraw") {
  const layerMask: Record<LayerKey, number> = { body: 0b000011, mind: 0b001100, heart: 0b110000 };
  const nudgeMask = nudge === "Connect" ? 0b010001 : nudge === "Clarify" ? 0b000110 : nudge === "Advance" ? 0b100100 : nudge === "Withdraw" ? 0b001001 : 0;
  const temporalBit = 1 << (tick % 6);
  return (fromNodeId ^ layerMask[layer] ^ nudgeMask ^ temporalBit) & 63;
}

export function dimensionForTick(tick: number): MeshDimension {
  return MESH_DIMENSIONS[tick % MESH_DIMENSIONS.length];
}
