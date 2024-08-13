import { appState, rating, routeMode } from "./state.svelte";
import checklist from "./datasource/checklist";
import { KVIN as baseKVIN } from "kvin";
import pako from "pako";
import { browser } from "$app/environment";

// Source: https://stackoverflow.com/a/54123275
// base64 to buffer
async function base64ToBufferAsync(base64: string) {
  const dataUrl = "data:application/octet-binary;base64," + base64;

  return new Promise<Uint8Array>((r) => {
    fetch(dataUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => {
        r(new Uint8Array(buffer));
      });
  });
}

// buffer to base64
async function bufferToBase64Async(buffer: ArrayBuffer) {
  const blob = new Blob([buffer], { type: "application/octet-binary" });
  const fileReader = new FileReader();
  return new Promise<string>((r) => {
    fileReader.onload = function () {
      const dataUrl = fileReader.result as string;
      const base64 = dataUrl.substring(dataUrl.indexOf(",") + 1);
      r(base64);
    };
    fileReader.readAsDataURL(blob);
  });
}

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

export async function exportState() {
  const state = KVIN.stringify(compressedState(), { tune: "size" });
  console.log(compressedState(), state, btoa(state));
  const compressed = pako.deflate(state);
  const b64encoded = await bufferToBase64Async(compressed);
  console.log(compressed, b64encoded);
  return b64encoded;
}
export async function exportStateUrl() {
  const url = new URL(window.location.href);
  url.hash = await exportState();
  return url.href;
}

export async function importState(url: string) {
  try {
    const decoded = await base64ToBufferAsync(url);
    const decompressed = pako.inflate(decoded, { to: "string" });
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
