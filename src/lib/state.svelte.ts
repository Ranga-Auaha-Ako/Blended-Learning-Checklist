// This file manages the central state of the application
// import { browser } from "$app/environment";
import { onMount } from "svelte";
import checklist from "./datasource/checklist";

export enum rating {
  no = 0,
  nobut = 1,
  yesbut = 2,
  yes = 3,
  maybe = -1,
}

export const ratingList = [rating.no, rating.nobut, rating.yesbut, rating.yes];

export const ratingLabels: Record<rating, string> = {
  [rating.no]: "No",
  [rating.nobut]: "No, but",
  [rating.yesbut]: "Yes, but",
  [rating.yes]: "Yes",
  [rating.maybe]: "Maybe",
};

export type routeProgress = Record<string, rating | undefined>;

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
    mode: routeMode.active,
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

// Calculate progress by taking the avereage of ratings for the level deeper
// Abstract function
type computedRating = {
  calculated: boolean;
  rating: number;
};
const calculateAverage = (
  _ratings: Record<string, rating | undefined>,
  subratings: Record<string, computedRating>,
  items: { name: string; subItems: { name: string }[] }[]
) => {
  const calculated = items.map<[string, computedRating]>((item) => {
    // if (ratings[item.name]) {
    //   return [item.name, { calculated: false, rating: ratings[item.name] }];
    // }
    const subRatingAvg =
      item.subItems
        .map((subItem) => {
          const subRating = subratings[subItem.name]?.rating || rating.no;
          return subRating;
        })
        .reduce((a, b) => a + b, 0) / item.subItems.length;
    return [item.name, { calculated: true, rating: subRatingAvg }];
  });
  return Object.fromEntries(calculated);
};
// Detailed
export const detailedCalculatedAvg = () => {
  const originRatings = Object.entries(appState.comprehensive.progress).map(
    ([key, value]) => {
      return [key, { calculated: false, rating: value }];
    }
  );
  const items = checklist.standards.flatMap((standard) => {
    return standard.criteria.map((c) => ({
      name: c.name,
      subItems: c.indicators,
    }));
  });
  return calculateAverage(
    appState.detailed.progress,
    Object.fromEntries(originRatings),
    items
  );
};

export const quickCalculatedAvg = () => {
  const items = checklist.standards.map((s) => ({
    name: s.name,
    subItems: s.criteria,
  }));
  return calculateAverage(
    appState.quick.progress,
    detailedCalculatedAvg(),
    items
  );
};

export let indexState: {
  mode: keyof typeof appState | "reset";
} = $state({
  mode: "reset",
});

export { appState };
