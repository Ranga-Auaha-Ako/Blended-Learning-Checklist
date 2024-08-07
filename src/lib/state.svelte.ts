// This file manages the central state of the application
// import { browser } from "$app/environment";
import { onMount } from "svelte";

export enum rating {
  no = 0,
  nobut = 1,
  yesbut = 2,
  yes = 3,
}

export const ratingList = [rating.no, rating.nobut, rating.yesbut, rating.yes];

export const ratingLabels: Record<rating, string> = {
  [rating.no]: "No",
  [rating.nobut]: "No, but",
  [rating.yesbut]: "Yes, but",
  [rating.yes]: "Yes",
};

export type routeProgress = Record<string, rating>;

export enum routeMode {
  intro,
  active,
  complete,
}

interface routeState {
  progress: routeProgress;
  mode: routeMode;
}

const defaultAppState: {
  comprehensive: routeState;
  detailed: routeState;
  quick: routeState;
} = {
  comprehensive: {
    progress: {} as routeProgress,
    mode: routeMode.intro,
  },
  detailed: {
    progress: {} as routeProgress,
    mode: routeMode.intro,
  },
  quick: {
    progress: {} as routeProgress,
    mode: routeMode.intro,
  },
};

let appState = $state(defaultAppState);
$effect.root(() => {
  try {
    const newAppState = JSON.parse(
      sessionStorage.getItem("blended-checklist") || ""
    );
    if (newAppState) {
      appState.comprehensive =
        newAppState.comprehensive || appState.comprehensive;
      appState.detailed = newAppState.detailed || appState.detailed;
      appState.quick = newAppState.quick || appState.quick;
    }
  } catch (e) {
    console.error("Failed to parse stored state", e);
  }
  // Save the state to local storage
  $effect(() => {
    sessionStorage.setItem("blended-checklist", JSON.stringify(appState));
  });
});

export { appState };
