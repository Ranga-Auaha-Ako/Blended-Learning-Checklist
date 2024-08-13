import { appState, rating, routeMode } from "./state.svelte";
import checklist from "./datasource/checklist";
import { KVIN as baseKVIN } from "kvin";
import pako from "pako";
import { browser } from "$app/environment";
import { Buffer } from "buffer";

// Stringify
const KVIN = new baseKVIN();
KVIN.tune = "size";

const stateOrder: [keyof typeof appState, string[]][] = [
  ["quick", checklist.standards.map((s) => s.name)],
  ["detailed", checklist.flatCriteria.map((c) => c.name)],
  ["comprehensive", checklist.flatIndicators.map((i) => i.name)],
];

function compressedState() {
  return stateOrder.map(([state, vals]) => {
    return {
      m: appState[state].mode as routeMode,
      p: vals.map<rating | undefined>((v) => appState[state].progress[v]),
    };
  });
}

export function exportState() {
  const state = KVIN.stringify(compressedState(), { tune: "size" });
  console.log(compressedState(), state, btoa(state));
  const compressed = pako.deflate(state);
  const buffer = Buffer.from(compressed);
  const encoded = buffer.toString("base64url");
  console.log(compressed, encoded);
  return encoded;
}
export async function exportStateUrl() {
  const url = new URL(window.location.href);
  url.hash = exportState();
  return url.href;
}

export async function importState(base64: string) {
  try {
    const buffer = Buffer.from(base64, "base64url");
    const decompressed = pako.inflate(buffer, { to: "string" });
    const newState = KVIN.parse(decompressed) as ReturnType<
      typeof compressedState
    >;

    stateOrder.forEach(([state, vals], i) => {
      appState[state].mode = newState[i].m;
      vals.forEach((v, j) => {
        appState[state].progress[v] = newState[i].p[j];
      });
    });
  } catch (e) {
    console.error("Failed to import state", e);
  }
}
if (browser && window.location.hash) {
  importState(window.location.hash.slice(1));
}
