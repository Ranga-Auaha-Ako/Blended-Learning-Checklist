<script lang="ts">
  import CardStack from "$lib/components/cardStack.svelte";
  import ResultsTable from "$lib/components/resultsTable.svelte";
  import SidebarChecklist from "$lib/components/sidebarChecklist.svelte";
  import checklist from "$lib/datasource/checklist";
  import {
    appState,
    ratingList,
    routeMode,
    type modes,
  } from "$lib/state.svelte";
  import { fade, fly } from "svelte/transition";
  import MdiArrowBack from "virtual:icons/mdi/arrowBack";
  import ShareState from "./shareState.svelte";
  import MobileNav from "./mobileNav.svelte";

  interface cardProps {
    mode: modes;
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

  let progress = $derived(Object.keys(appState.modes[mode].progress).length);

  let currentItem = $derived(flatChecklist[current]);

  $effect(() => {
    if (progress === flatChecklist.length) {
      appState.modes[mode].mode = routeMode.complete;
    }
  });
</script>

{#snippet sidebar()}
<SidebarChecklist
items={flatChecklist.map((s, idx) => ({
  state: appState.modes[mode].progress[s.name] !== undefined,
  text:
    s.mode === "quick"
      ? s.name
      : s.mode === "detailed"
        ? `${s.standardIndex + 1}.${s.criteriaIndex + 1} ${s.name}`
        : `${s.standardIndex + 1}.${s.criteriaIndex + 1}.${s.indicatorIndex + 1} ${s.name}`,
}))}
select={(idx) => {
  appState.modes[mode].mode = routeMode.active;
  current = idx;
  hideRated = false;
  document.querySelector<HTMLDialogElement>("dialog#mobileNav")?.close();
}}
current={appState.modes[mode].mode === routeMode.active
  ? current
  : undefined}
></SidebarChecklist>
{/snippet}

<div
  class="flex flex-col md:grid md:grid-cols-3 h-screen w-full gap-3 p-3 sm:gap-8 sm:p-8"
>
  <!-- sidebar -->
  <div class="col-span-1 shrink-0 text-white overflow-y-auto">
    <div
      class="sidebar h-full items-center sm:items-start sm:flex-col gap-2 md:gap-4 flex"
    >
      <div class="flex gap-2 md:contents w-full items-center justify-between">
        <a
          href="/"
          class="btn btn-ghost sm:text-xl -ml-3.5 w-auto mr-auto"
          title="Return to menu"
        >
          <MdiArrowBack></MdiArrowBack>
          <span class="hidden md:inline" aria-hidden="true">Return to menu</span
          >
        </a>
        <h2
          class="font-semibold leading-tight md:leading-normal sm:text-3xl md:text-5xl"
        >
          {text.title}
        </h2>
      </div>
      <p class="text-base md:text-lg hidden sm:block font-light text-gray-100">
        {text.sidebar}
      </p>
      <div class="hidden md:contents">
        {@render sidebar()}
      </div>
    </div>
  </div>

  <div class="col-span-2 grow shrink-0">
    <main
      class="rounded-box shadow-xl bg-base-100 w-full min-h-full py-8 px-8 flex flex-col h-full"
      style:--mode={mode}
    >
      {#if appState.modes[mode].mode === routeMode.intro}
        <div out:fade>
          <h2 class="font-bold text-3xl md:text-4xl">Introduction</h2>
          <p class="md:text-lg">
            {text[routeMode.intro]}
          </p>

          <fieldset
            class="flex flex-col gap-2 items-center max-w-xs mx-auto mt-8"
          >
            <input
              type="text"
              placeholder="Course title (eg, COMPSCI 101)"
              class="input input-bordered w-full"
              class:input-error={!appState.meta.title}
              bind:value={appState.meta.title}
              required
              title="Please enter a course title"
            />
            <div class="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-1 w-full">
              <input
                type="text"
                placeholder="Semester"
                class="input input-bordered w-full md:col-span-1"
                bind:value={appState.meta.semester}
                title="Please enter a semester"
              />
              <input
                type="number"
                placeholder="Year"
                class="input input-bordered w-full md:col-span-2"
                bind:value={appState.meta.year}
                title="Please enter a year"
              />
            </div>
            <button
              class="btn btn-block btn-outline btn-primary block mx-auto"
              onclick={() => {
                appState.modes[mode].mode = routeMode.active;
                current = 0;
              }}
              disabled={!appState.meta.title}
            >
              Get Started
            </button>
          </fieldset>
        </div>
      {:else if appState.modes[mode].mode === routeMode.active}
        <div in:fly={{ delay: 150, y: 50 }} class="flex flex-col h-full">
          <div class="grid auto-rows-auto grid-cols-1 gap-0">
            <div class="toolbar flex justify-end items-center gap-2 mb-4">
              <div class="grow">
                <p class="font-light leading-3 p-0">
                  {progress} Completed
                </p>
                <progress
                  class="progress w-full h-1 p-0 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]"
                  value={progress}
                  max={flatChecklist.length}
                ></progress>
              </div>
              <button
                class="btn btn-sm btn-error btn-outline"
                onclick={() => {
                  confirm("Are you sure you want to restart?") &&
                    (() => {
                      current = 0;
                      appState.modes[mode].progress = {};
                      appState.modes[mode].mode = routeMode.intro;
                    })();
                }}
              >
                Restart
              </button>
            </div>
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
          <div class="w-full grow flex items-center mb-14 sm:mb-8">
            <CardStack
              cards={flatChecklist.map((s) => ({
                title: s.name,
                body: s.description || "",
                rating: appState.modes[mode].progress[s.name],
              }))}
              {hideRated}
              bind:current
              rate={(idx, rating) => {
                appState.modes[mode].progress[flatChecklist[idx].name] = rating;
              }}
              binaryMode={mode === "quick"}
            />
          </div>

        </div>
      {:else if appState.modes[mode].mode === routeMode.complete}
        <div out:fade>
          <div class="buttonStack sm:float-right justify-center sm:justify-normal flex gap-2">
            <button
              class="btn btn-error btn-outline btn-sm sm:btn-md"
              onclick={() => {
                if (
                  !confirm(
                    "Are you sure you want to start over? This will delete all progress from this checklist. Consider using the share button to save progress first!"
                  )
                )
                  return;
                appState.modes[mode].mode = routeMode.intro;
                appState.modes[mode].progress = {};
              }}
            >
              Start Over
            </button>
            <ShareState level={mode} />
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

<MobileNav sidebar={sidebar} />


<style lang="postcss">
  main {
    view-transition-name: var(--mode);
  }
</style>
