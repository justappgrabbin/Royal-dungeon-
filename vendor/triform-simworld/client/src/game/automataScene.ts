import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { GlowLayer } from "@babylonjs/core/Layers/glowLayer";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { PointerEventTypes } from "@babylonjs/core/Events/pointerEvents";
import { Scene } from "@babylonjs/core/scene";
import type { AutomatonHome } from "../../../shared/automataGame";
import type { WorldState } from "../../../shared/world";
import { STATE_MESH_NODES } from "../../../shared/stateMesh";

type Character = { id: number; name: string; hue: string };
export type AutomataSceneState = { world: WorldState; characters: Character[]; selectedCharacterId: number | null };
export type AutomataSceneCallbacks = { onReachHome: (automatonId: string) => void };
export type AutomataGameHandle = { scene: Scene; update: (state: AutomataSceneState) => void; dispose: () => void };

const PLAYER_ART = "/manus-storage/automata-player-explorer_11cb8ce5.png";
const TOOL_ART = "/manus-storage/klein-tool-emergence_5055e6ed.png";
const PLACE_POSITIONS: Record<string, Vector3> = { atrium: new Vector3(0, 0, 0), archive: new Vector3(-6.2, 0, -4.5), glasshouse: new Vector3(5.8, 0, -4.2), northwalk: new Vector3(0.4, 0, 5.2) };
const nodePosition = (nodeId: number) => { const node = STATE_MESH_NODES[nodeId]!; return new Vector3(node.x * 3.85, 0.12 + (node.y + 1.8) * 0.16, node.z * 3.85); };

function material(scene: Scene, name: string, hex: string, alpha = 1) {
  const result = new StandardMaterial(name, scene); const color = Color3.FromHexString(hex);
  result.diffuseColor = color.scale(0.38); result.emissiveColor = color.scale(0.42); result.specularColor = Color3.Black(); result.alpha = alpha;
  return result;
}

export async function createAutomataScene(engine: Engine, canvas: HTMLCanvasElement, callbacks: AutomataSceneCallbacks): Promise<AutomataGameHandle> {
  const scene = new Scene(engine); scene.clearColor = new Color4(0.026, 0.018, 0.025, 1);
  const camera = new ArcRotateCamera("observer", -Math.PI / 2, 1.04, 19, new Vector3(0, 0, 0), scene);
  camera.lowerRadiusLimit = 12; camera.upperRadiusLimit = 25; camera.lowerBetaLimit = 0.68; camera.upperBetaLimit = 1.28; camera.wheelDeltaPercentage = 0.015; camera.attachControl(canvas, true);
  const light = new HemisphericLight("dusk", new Vector3(0.1, 1, -0.2), scene); light.intensity = 0.92; light.groundColor = Color3.FromHexString("#1b1024");
  const glow = new GlowLayer("soft-grammar-glow", scene, { blurKernelSize: 26 }); glow.intensity = 0.62;

  const ground = MeshBuilder.CreateGround("atrium-ground", { width: 22, height: 17, subdivisions: 2 }, scene); ground.material = material(scene, "ground", "#251823");
  const ring = MeshBuilder.CreateTorus("atrium-ring", { diameter: 8.4, thickness: 0.045, tessellation: 80 }, scene); ring.rotation.x = Math.PI / 2; ring.position.y = 0.025; ring.material = material(scene, "ring", "#d7a94a");
  const innerRing = MeshBuilder.CreateTorus("inner-ring", { diameter: 3.2, thickness: 0.035, tessellation: 64 }, scene); innerRing.rotation.x = Math.PI / 2; innerRing.position.y = 0.03; innerRing.material = material(scene, "inner-ring", "#6f8cba");
  const gateMarkers = new Map<number, ReturnType<typeof MeshBuilder.CreateSphere>>();
  STATE_MESH_NODES.forEach((node) => { const marker = MeshBuilder.CreateSphere(`gate-${node.gate}`, { diameter: 0.11, segments: 6 }, scene); marker.position = nodePosition(node.id); marker.material = material(scene, `gate-material-${node.gate}`, "#5b456b", 0.64); marker.metadata = { nodeId: node.id, gate: node.gate }; gateMarkers.set(node.id, marker); });
  [PLACE_POSITIONS.archive, PLACE_POSITIONS.glasshouse, PLACE_POSITIONS.atrium, PLACE_POSITIONS.northwalk].forEach((point, index) => {
    const disc = MeshBuilder.CreateDisc(`place-disc-${index}`, { radius: 1.65, tessellation: 32 }, scene); disc.rotation.x = Math.PI / 2; disc.position = point.clone().add(new Vector3(0, 0.028, 0)); disc.material = material(scene, `place-disc-material-${index}`, ["#516f9e", "#71945f", "#c29d5a", "#ad668d"][index]!);
  });
  const playerRoot = MeshBuilder.CreateCapsule("player-body", { height: 1.35, radius: 0.3 }, scene); playerRoot.position = new Vector3(0, 0.7, 0); playerRoot.material = material(scene, "player-body-material", "#d7a94a");
  const throat = MeshBuilder.CreateSphere("throat-mark", { diameter: 0.15 }, scene); throat.parent = playerRoot; throat.position = new Vector3(0, 0.24, -0.28); throat.material = material(scene, "throat-mark-material", "#f3d58a");
  const playerCard = MeshBuilder.CreatePlane("player-art", { width: 1.05, height: 1.58 }, scene); playerCard.parent = playerRoot; playerCard.position = new Vector3(0, 0.12, 0.13); playerCard.billboardMode = 7; const playerMaterial = material(scene, "player-art-material", "#ffffff", 0.92); playerMaterial.diffuseTexture = new Texture(PLAYER_ART, scene, false, false); playerMaterial.opacityTexture = playerMaterial.diffuseTexture; playerCard.material = playerMaterial;
  const playerOrbit = MeshBuilder.CreateTorus("player-orbit", { diameter: 1.08, thickness: 0.03, tessellation: 36 }, scene); playerOrbit.parent = playerRoot; playerOrbit.rotation.x = Math.PI / 2; playerOrbit.position.y = -0.66; playerOrbit.material = material(scene, "player-orbit-material", "#cf8fb7");

  const homeRoots = new Map<string, { root: ReturnType<typeof MeshBuilder.CreateCylinder>; glow: ReturnType<typeof MeshBuilder.CreateSphere>; label: ReturnType<typeof MeshBuilder.CreateTorus> }>();
  let currentState: AutomataSceneState | undefined;
  const createHome = (home: AutomatonHome) => {
    const root = MeshBuilder.CreateCylinder(`home-${home.id}`, { height: 0.5, diameterTop: 0.42, diameterBottom: 0.88, tessellation: 6 }, scene); root.position = nodePosition(home.stateNodeId).add(new Vector3(0, 0.2, 0)); root.material = material(scene, `home-base-${home.id}`, home.color);
    const crystal = MeshBuilder.CreatePolyhedron(`home-crystal-${home.id}`, { type: 1, size: 0.58 }, scene); crystal.parent = root; crystal.position.y = 0.64; crystal.material = material(scene, `home-crystal-material-${home.id}`, home.color);
    const aura = MeshBuilder.CreateSphere(`home-aura-${home.id}`, { diameter: 1.34, segments: 12 }, scene); aura.parent = root; aura.position.y = 0.64; aura.material = material(scene, `home-aura-material-${home.id}`, home.color, 0.1);
    const label = MeshBuilder.CreateTorus(`home-ring-${home.id}`, { diameter: 1.05, thickness: 0.03, tessellation: 28 }, scene); label.parent = root; label.rotation.x = Math.PI / 2; label.position.y = 0.035; label.material = material(scene, `home-ring-material-${home.id}`, home.color);
    root.metadata = { automatonId: home.id }; crystal.metadata = { automatonId: home.id }; aura.metadata = { automatonId: home.id }; label.metadata = { automatonId: home.id };
    homeRoots.set(home.id, { root, glow: aura, label });
  };

  let keydown: ((event: KeyboardEvent) => void) | undefined;
  let keyup: ((event: KeyboardEvent) => void) | undefined;
  const held = new Set<string>();
  keydown = (event) => { if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) { held.add(event.code); event.preventDefault(); } };
  keyup = (event) => held.delete(event.code);
  window.addEventListener("keydown", keydown); window.addEventListener("keyup", keyup);
  scene.onBeforeRenderObservable.add(() => {
    const step = engine.getDeltaTime() * 0.0021;
    const x = (held.has("KeyD") || held.has("ArrowRight") ? 1 : 0) - (held.has("KeyA") || held.has("ArrowLeft") ? 1 : 0);
    const z = (held.has("KeyS") || held.has("ArrowDown") ? 1 : 0) - (held.has("KeyW") || held.has("ArrowUp") ? 1 : 0);
    if (x || z) { playerRoot.position.x = Math.max(-9, Math.min(9, playerRoot.position.x + x * step)); playerRoot.position.z = Math.max(-6.5, Math.min(6.5, playerRoot.position.z + z * step)); playerRoot.rotation.y = Math.atan2(x, z); }
    playerOrbit.rotation.z += 0.006; homeRoots.forEach(({ root, label }, id) => { root.rotation.y += id.length % 2 ? 0.003 : -0.002; label.rotation.z += 0.005; });
  });
  scene.onPointerObservable.add((info) => {
    if (info.type !== PointerEventTypes.POINTERPICK) return;
    const id = info.pickInfo?.pickedMesh?.metadata?.automatonId as string | undefined;
    if (id) callbacks.onReachHome(id);
  });

  const update = (state: AutomataSceneState) => {
    currentState = state;
    const automata = state.world.automata;
    automata.homes.forEach((home) => { if (!homeRoots.has(home.id)) createHome(home); const root = homeRoots.get(home.id)!; const active = automata.activeAutomatonId === home.id; const intensity = (home.resonance?.total ?? 30) / 100; root.glow.isVisible = active || home.status === "woven"; root.glow.visibility = active ? 0.14 + intensity * 0.18 : home.status === "woven" ? 0.08 + intensity * 0.11 : 0.04; root.label.scaling.setAll(active ? 1.24 : 1); gateMarkers.get(home.stateNodeId)!.visibility = 0.95; });
    const selectedPresence = state.world.presences.find((item) => item.characterId === state.selectedCharacterId);
    if (selectedPresence) { const home = automata.homes.find((item) => item.id === automata.activeAutomatonId); const target = home ? nodePosition(home.stateNodeId).add(new Vector3(0, 0.58, 0)) : PLACE_POSITIONS[selectedPresence.placeId] ?? Vector3.Zero(); playerRoot.position.x += (target.x - playerRoot.position.x) * 0.25; playerRoot.position.z += (target.z - playerRoot.position.z) * 0.25; }
    const hasTool = automata.inventory.some((item) => item.characterId === state.selectedCharacterId);
    if (hasTool && !scene.getMeshByName("tool-emergence")) { const tool = MeshBuilder.CreatePlane("tool-emergence", { width: 0.72, height: 0.72 }, scene); tool.parent = playerRoot; tool.position = new Vector3(0.62, 0.38, 0.08); tool.billboardMode = 7; const toolMaterial = material(scene, "tool-emergence-material", "#ffffff", 0.95); toolMaterial.diffuseTexture = new Texture(TOOL_ART, scene, false, false); toolMaterial.opacityTexture = toolMaterial.diffuseTexture; tool.material = toolMaterial; }
  };
  return { scene, update, dispose: () => { window.removeEventListener("keydown", keydown!); window.removeEventListener("keyup", keyup!); scene.dispose(); } };
}
