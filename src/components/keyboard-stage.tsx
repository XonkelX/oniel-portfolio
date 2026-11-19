"use client";

import { useEffect, useRef, useState } from "react";
import type { Mesh, MeshStandardMaterial, Object3D, Vector3 } from "three";

/** How far a keycap travels when pressed, in meters (a typical mechanical switch). */
const TRAVEL = 0.0035;
/** Keys that would scroll the page; they only stop scrolling while the keyboard has focus. */
const SCROLL_KEYS = new Set([
  "Space",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "Slash",
  "Quote",
  "Backspace",
]);
const MAX_TYPED = 38;

/** Every keycap node in keyboard.glb, named after KeyboardEvent.code (ANSI 75% layout). */
const KEY_CODES = new Set([
  "Escape",
  ...Array.from({ length: 12 }, (_, i) => `F${i + 1}`),
  "Delete",
  "Backquote",
  ...Array.from({ length: 10 }, (_, i) => `Digit${i}`),
  "Minus",
  "Equal",
  "Backspace",
  "Home",
  "Tab",
  ..."QWERTYUIOPASDFGHJKLZXCVBNM".split("").map((letter) => `Key${letter}`),
  "BracketLeft",
  "BracketRight",
  "Backslash",
  "PageUp",
  "CapsLock",
  "Semicolon",
  "Quote",
  "Enter",
  "PageDown",
  "ShiftLeft",
  "Comma",
  "Period",
  "Slash",
  "ShiftRight",
  "ArrowUp",
  "End",
  "ControlLeft",
  "MetaLeft",
  "AltLeft",
  "Space",
  "AltRight",
  "Fn",
  "ControlRight",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
]);

/** Character a tapped key types when there is no physical key event (touch screens). */
function charForCode(code: string): string | null {
  if (code.startsWith("Key")) return code.slice(3).toLowerCase();
  if (code.startsWith("Digit")) return code.slice(5);
  const symbols: Record<string, string> = {
    Space: " ",
    Minus: "-",
    Equal: "=",
    BracketLeft: "[",
    BracketRight: "]",
    Backslash: "\\",
    Semicolon: ";",
    Quote: "'",
    Comma: ",",
    Period: ".",
    Slash: "/",
    Backquote: "`",
  };
  return symbols[code] ?? null;
}

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

type Copy = {
  alt: string;
  typingLabel: string;
  placeholder: string;
};

/**
 * Mechanical keyboard rendered with three.js. Each keycap node in keyboard.glb is named after
 * KeyboardEvent.code, so a physical key press pushes the matching 3D key down.
 */
export function KeyboardStage({
  copy,
  onLoad,
}: {
  copy: Copy;
  onLoad: () => void;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState("");
  const onLoadRef = useRef(onLoad);

  useEffect(() => {
    onLoadRef.current = onLoad;
  }, [onLoad]);

  useEffect(() => {
    const host = wrap.current;
    if (!host) return;
    let disposed = false;
    const cleanups: Array<() => void> = [];

    function typeChar(event: { code: string; key?: string }) {
      setTyped((current) => {
        if (event.code === "Backspace") return current.slice(0, -1);
        if (event.code === "Enter" || event.code === "Escape") return "";
        const char =
          event.key && event.key.length === 1
            ? event.key
            : charForCode(event.code);
        if (!char) return current;
        return (current + char).slice(-MAX_TYPED);
      });
    }

    (async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
      const { OrbitControls } =
        await import("three/addons/controls/OrbitControls.js");
      const { RoomEnvironment } =
        await import("three/addons/environments/RoomEnvironment.js");
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.className = "vino-stage__canvas";
      host.appendChild(canvas);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTexture;
      scene.environmentIntensity = 0.85;

      const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 20);
      const controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.minPolarAngle = 0.25;
      controls.maxPolarAngle = 1.32;
      controls.minAzimuthAngle = -1.1;
      controls.maxAzimuthAngle = 1.1;
      // Horizontal drags orbit, vertical swipes still scroll the page on touch screens.
      canvas.style.touchAction = "pan-y";

      const key = new THREE.DirectionalLight(0xffffff, 1.6);
      key.position.set(0.25, 0.6, 0.35);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.radius = 6;
      key.shadow.bias = -0.0004;
      scene.add(key, key.target);
      const rim = new THREE.DirectionalLight(0xffc7d0, 0.9);
      rim.position.set(-0.4, 0.3, -0.5);
      scene.add(rim);

      const gltf = await new GLTFLoader().loadAsync("/models/keyboard.glb");
      if (disposed) return;
      const model = gltf.scene;
      scene.add(model);

      type KeyState = {
        node: Object3D;
        rest: Vector3;
        materials: MeshStandardMaterial[];
        value: number;
        target: number;
      };
      const keys = new Map<string, KeyState>();
      const green = new THREE.Color("#3dbe7e");
      model.traverse((object) => {
        const mesh = object as Mesh;
        if (mesh.isMesh) {
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
      // Key nodes are named after KeyboardEvent.code (KeyA, Digit1, Space, ShiftLeft, ...).
      model.traverse((object) => {
        if (!KEY_CODES.has(object.name)) return;
        if (keys.has(object.name)) return;
        const materials: KeyState["materials"] = [];
        object.traverse((child) => {
          const mesh = child as Mesh;
          if (!mesh.isMesh) return;
          // Each key gets its own material copies so it can glow on its own.
          const list = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          const clones = list.map((material) => {
            const clone = (material as MeshStandardMaterial).clone();
            if (clone.emissive && clone.emissive.getHex() === 0) {
              clone.emissive = green.clone();
              clone.emissiveIntensity = 0;
            }
            materials.push(clone);
            return clone;
          });
          mesh.material = Array.isArray(mesh.material) ? clones : clones[0];
        });
        keys.set(object.name, {
          node: object,
          rest: object.position.clone(),
          materials,
          value: 0,
          target: 0,
        });
      });

      // Frame the board: centre it and look from the front, a little above the typing angle.
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      controls.target.copy(center);
      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(size.x * 3, size.z * 4),
        new THREE.ShadowMaterial({ opacity: 0.4 }),
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(center.x, box.min.y, center.z);
      ground.receiveShadow = true;
      scene.add(ground);
      key.target.position.copy(center);
      const span = Math.max(size.x, size.z) * 0.8;
      Object.assign(key.shadow.camera, {
        left: -span,
        right: span,
        top: span,
        bottom: -span,
        near: 0.05,
        far: 2,
      });
      key.shadow.camera.updateProjectionMatrix();

      function frame(width: number, height: number) {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        const vertical = THREE.MathUtils.degToRad(camera.fov);
        const horizontal =
          2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
        const fit = Math.max(
          // Narrow (phone) stages get extra side margin so the case edges are not cut off.
          (size.x * (camera.aspect < 1.2 ? 0.62 : 0.54)) /
            Math.tan(horizontal / 2),
          (size.z * 0.95) / Math.tan(vertical / 2),
        );
        const direction = new THREE.Vector3(0.18, 0.95, 1).normalize();
        camera.position.copy(center).addScaledVector(direction, fit);
        controls.minDistance = fit * 0.55;
        controls.maxDistance = fit * 1.6;
        controls.update();
      }

      let visible = true;
      let raf = 0;
      let last = performance.now();
      function tick(now: number) {
        raf = requestAnimationFrame(tick);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        for (const state of keys.values()) {
          if (state.value === state.target) continue;
          // Fast on the way down, a softer spring back up.
          const speed = state.target > state.value ? 28 : 11;
          const step = speed * dt;
          state.value =
            state.target > state.value
              ? Math.min(state.target, state.value + step)
              : Math.max(state.target, state.value - step);
          state.node.position.copy(state.rest);
          state.node.translateY(-TRAVEL * state.value);
          for (const material of state.materials) {
            material.emissiveIntensity = 0.55 * state.value;
          }
        }
        controls.update();
        renderer.render(scene, camera);
      }
      function setRunning(run: boolean) {
        cancelAnimationFrame(raf);
        if (run) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      }

      const resize = new ResizeObserver(([entry]) => {
        const { width, height } = entry.contentRect;
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        frame(width, height);
        renderer.render(scene, camera);
      });
      resize.observe(host);
      const seen = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        setRunning(visible && !document.hidden);
      });
      seen.observe(host);
      const onVisibility = () => setRunning(visible && !document.hidden);
      document.addEventListener("visibilitychange", onVisibility);

      function press(code: string, down: boolean) {
        const state = keys.get(code);
        if (state) state.target = down ? 1 : 0;
        return Boolean(state);
      }
      function releaseAll() {
        for (const state of keys.values()) state.target = 0;
      }
      function onKeyDown(event: KeyboardEvent) {
        if (!visible || isEditable(event.target)) return;
        const known = press(event.code, true);
        if (!known) return;
        if (
          host?.contains(document.activeElement) &&
          SCROLL_KEYS.has(event.code)
        ) {
          event.preventDefault();
        }
        if (!event.repeat || event.code === "Backspace") typeChar(event);
      }
      function onKeyUp(event: KeyboardEvent) {
        press(event.code, false);
      }

      // Touch and mouse: tapping a keycap presses it.
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let tapped: string | null = null;
      function keyAt(event: PointerEvent) {
        const rect = canvas.getBoundingClientRect();
        pointer.set(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(pointer, camera);
        for (const hit of raycaster.intersectObject(model, true)) {
          let object: Object3D | null = hit.object;
          while (object && !keys.has(object.name)) object = object.parent;
          if (object) return object.name;
        }
        return null;
      }
      function onPointerDown(event: PointerEvent) {
        tapped = keyAt(event);
        if (!tapped) return;
        press(tapped, true);
        typeChar({ code: tapped });
      }
      function onPointerUp() {
        if (tapped) press(tapped, false);
        tapped = null;
      }

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
      window.addEventListener("blur", releaseAll);
      canvas.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);

      cleanups.push(() => {
        setRunning(false);
        resize.disconnect();
        seen.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("blur", releaseAll);
        canvas.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        controls.dispose();
        scene.traverse((object) => {
          const mesh = object as Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry.dispose();
          const list = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          list.forEach((material) => material.dispose());
        });
        envTexture.dispose();
        pmrem.dispose();
        renderer.dispose();
        canvas.remove();
      });

      setRunning(true);
      onLoadRef.current();
    })().catch(() => {});

    return () => {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return (
    <div
      ref={wrap}
      className="vino-stage__viewer vino-stage__keyboard"
      tabIndex={0}
      role="application"
      aria-label={copy.alt}
    >
      <p className="vino-stage__typed" aria-live="off">
        <span className="sr-only">{copy.typingLabel} </span>
        {typed ? (
          <span>{typed}</span>
        ) : (
          <span className="vino-stage__placeholder">{copy.placeholder}</span>
        )}
        <i aria-hidden="true" />
      </p>
    </div>
  );
}
