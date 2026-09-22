import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createAutomataScene, type AutomataGameHandle, type AutomataSceneState } from "../game/automataScene";

export function AutomataWorldCanvas({ state, onReachHome }: { state: AutomataSceneState; onReachHome: (automatonId: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null); const handleRef = useRef<AutomataGameHandle | null>(null); const startedRef = useRef(false); const latestRef = useRef({ state, onReachHome }); latestRef.current = { state, onReachHome };
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas || startedRef.current) return; startedRef.current = true;
    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true, adaptToDeviceRatio: true }); let disposed = false;
    createAutomataScene(engine, canvas, { onReachHome: (automatonId) => latestRef.current.onReachHome(automatonId) }).then((handle) => { if (disposed) { handle.dispose(); return; } handleRef.current = handle; handle.update(latestRef.current.state); engine.runRenderLoop(() => handle.scene.render()); });
    const resize = () => engine.resize(); window.addEventListener("resize", resize);
    return () => { disposed = true; window.removeEventListener("resize", resize); handleRef.current?.dispose(); handleRef.current = null; engine.dispose(); startedRef.current = false; };
  }, []);
  useEffect(() => { handleRef.current?.update(state); }, [state]);
  return <canvas ref={canvasRef} className="automata-canvas" aria-label="Playable automata home courtyard. Use WASD or arrow keys to move. Click an automata home to visit it." />;
}
