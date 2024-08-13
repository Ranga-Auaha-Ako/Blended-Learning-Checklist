<script lang="ts">
  import CardStack from "$lib/components/cardStack.svelte";
  import ResultsTable from "$lib/components/resultsTable.svelte";
  import SidebarChecklist from "$lib/components/sidebarChecklist.svelte";
  import checklist from "$lib/datasource/checklist";
  import { appState, ratingList, routeMode } from "$lib/state.svelte";
  import { fade, fly } from "svelte/transition";
  import MdiArrowBack from "virtual:icons/mdi/arrowBack";
  import ShareState from "./shareState.svelte";

  interface cardProps {
    mode: keyof typeof appState;
    current?: number;
    text: {
      title: string;
      sidebar: string;
      [routeMode.intro]: string;
      [routeMode.complete]: string;
    };
  }
  let { mode, current = $bindable(0), text }: cardProps = $props();

  let flatChecklist = $derived.by(() => {
    switch (mode) {
      case "quick":
        return checklist.standards.map((s) => ({ ...s, mode }));
      case "detailed":
        return checklist.flatCriteria.map((c, idx) => ({
          ...c,
          standard: checklist.standards[c.standardIndex],
          criteriaIndex: idx,
          mode,
        }));
      case "comprehensive":
        return checklist.flatIndicators.map((i, idx) => ({
          ...i,
          standard: checklist.standards[i.standardIndex],
          indicatorIndex: idx,
          mode,
        }));
    }
  });

  let hideRated = $state(true);

  let progress = $derived(Object.keys(appState[mode].progress).length);

  let currentItem = $derived(flatChecklist[current]);

  $effect(() => {
    if (progress === flatChecklist.length) {
      appState[mode].mode = routeMode.complete;
    }
  });
</script>

<div class="grid grid-cols-1 md:grid-cols-3 h-screen w-full gap-8 p-8">
  <!-- sidebar -->
  <div class="col-span-1 text-white overflow-y-auto">
    <div class="sidebar h-full flex flex-col gap-4">
      <a href="/" class="btn btn-ghost text-xl -ml-3.5 w-auto mr-auto">
        <MdiArrowBack></MdiArrowBack>
        Return to menu
      </a>
      <h2 class="font-semibold text-5xl">{text.title}</h2>
      <p class="text-lg font-light text-gray-100">
        {text.sidebar}
      </p>
      <SidebarChecklist
        items={flatChecklist.map((s, idx) => ({
          state: appState[mode].progress[s.name] !== undefined,
          text:
            s.mode === "quick"
              ? s.name
              : s.mode === "detailed"
                ? `${s.standardIndex + 1}.${s.criteriaIndex + 1} ${s.name}`
                : `${s.standardIndex + 1}.${s.criteriaIndex + 1}.${s.indicatorIndex + 1} ${s.name}`,
        }))}
        select={(idx) => {
          appState[mode].mode = routeMode.active;
          current = idx;
          hideRated = false;
        }}
        current={appState[mode].mode === routeMode.active ? current : undefined}
      ></SidebarChecklist>
    </div>
  </div>

  <div class="col-span-2">
    <main
      class="rounded-box shadow-xl bg-base-100 w-full h-full py-8 px-8"
      style:--mode={mode}
    >
      {#if appState[mode].mode === routeMode.intro}
        <div out:fade>
          <h2 class="font-bold text-4xl">Introduction</h2>
          <p class="text-lg">
            {text[routeMode.intro]}
          </p>

          <button
            class="btn btn-outline btn-primary mt-8 block mx-auto"
            onclick={() => {
              appState[mode].mode = routeMode.active;
              current = 0;
            }}
          >
            Get Started
          </button>
        </div>
      {:else if appState[mode].mode === routeMode.active}
        <div in:fly={{ delay: 150, y: 50 }} class="flex flex-col h-full">
          <div class="grid auto-rows-auto grid-cols-1 gap-0">
            {#if currentItem.mode !== "quick"}
              {#key currentItem.standardIndex}
                <h3
                  class="text-2xl font-semibold col-start-1 row-start-1 mb-2"
                  transition:fade
                >
                  {currentItem.standardIndex + 1}.{currentItem.criteriaIndex +
                    1}
                  {currentItem.name}
                </h3>
                <p transition:fade class="text-sm mb-4 col-start-1 row-start-2">
                  {checklist.standards[currentItem.standardIndex].description}
                </p>
              {/key}
            {/if}
          </div>
          <div class="w-full grow flex items-center mb-8">
            <CardStack
              cards={flatChecklist.map((s) => ({
                title: s.name,
                body: s.description || "",
                rating: appState[mode].progress[s.name],
              }))}
              {hideRated}
              bind:current
              rate={(idx, rating) => {
                appState[mode].progress[flatChecklist[idx].name] = rating;
              }}
              binaryMode={mode === "quick"}
            />
          </div>

          <div class="bottom">
            <progress
              class="progress w-full h-2 -mt-2"
              value={progress}
              max={flatChecklist.length}
            ></progress>
            <p class="text-lg font-light">
              {progress} Completed
            </p>
          </div>
        </div>
      {:else if appState[mode].mode === routeMode.complete}
        <div out:fade>
          <div class="buttonStack float-right flex gap-2">
            <button
              class="btn btn-error btn-outline"
              onclick={() => {
                if (
                  !confirm(
                    "Are you sure you want to start over? This will delete all progress from this checklist. Consider using the share button to save progress first!"
                  )
                )
                  return;
                appState[mode].mode = routeMode.intro;
                appState[mode].progress = {};
              }}
            >
              Start Over
            </button>
            <ShareState />
          </div>
          <h2 class="font-bold text-4xl">You're Done!</h2>
          <p>
            {text[routeMode.complete]}
          </p>
          <ResultsTable level={mode} />
        </div>
      {/if}
    </main>
  </div>
</div>

<style lang="postcss">
  main {
    view-transition-name: var(--mode);
  }
</style>
