import { appState, rating, routeMode, type modes } from "./state.svelte";
import checklist from "./datasource/checklist";
import { KVIN as baseKVIN } from "kvin";
import pako from "pako";
import { browser } from "$app/environment";
import { Buffer } from "buffer";

// Stringify
const KVIN = new baseKVIN();
KVIN.tune = "size";

const stateOrder: [modes, string[]][] = [
  ["quick", checklist.standards.map((s) => s.name)],
  ["detailed", checklist.flatCriteria.map((c) => c.name)],
  ["comprehensive", checklist.flatIndicators.map((i) => i.name)],
];

function compressedState() {
  return {
    m: [appState.meta.title, appState.meta.semester, appState.meta.year],
    d: stateOrder.map(([state, vals]) => {
      return {
        m: appState.modes[state].mode as routeMode,
        p: vals.map<rating | undefined>(
          (v) => appState.modes[state].progress[v]
        ),
      };
    }),
  };
}

export function exportState() {
  const state = KVIN.stringify(compressedState(), { tune: "size" });
  const compressed = pako.deflate(state);
  const buffer = Buffer.from(compressed);
  const encoded = buffer.toString("base64url");
  return encoded;
}
export async function exportStateUrl() {
  const url = new URL(window.location.href);
  url.hash = exportState();
  return url.href;
}

export function parseState(base64: string) {
  try {
    const buffer = Buffer.from(base64, "base64url");
    const decompressed = pako.inflate(buffer, { to: "string" });
    const newState = KVIN.parse(decompressed) as ReturnType<
      typeof compressedState
    >;

    stateOrder.forEach(([state, vals], i) => {
      // Validate mode
      if (!(newState.d[i].m in routeMode)) throw new Error("Invalid mode");
    });
    return newState;
  } catch (e) {
    console.error("Failed to import state", e);
  }
}

export function importState(state: string | ReturnType<typeof parseState>) {
  try {
    let parsed: ReturnType<typeof parseState>;
    if (typeof state === "string") {
      parsed = parseState(state);
    } else {
      parsed = state;
    }
    if (!parsed) throw new Error("Failed to parse state");

    stateOrder.forEach(([state, vals], i) => {
      appState.modes[state].mode = parsed.d[i].m;
      vals.forEach((v, j) => {
        appState.modes[state].progress[v] = parsed.d[i].p[j];
      });
    });
    appState.meta.title = parsed.m[0];
    appState.meta.semester = parsed.m[1];
    appState.meta.year = parsed.m[2];
  } catch (e) {
    console.error("Failed to import state", e);
  }
}
