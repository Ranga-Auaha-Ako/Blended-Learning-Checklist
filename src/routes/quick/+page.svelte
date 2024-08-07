<script lang="ts">
  import CardStack from "$lib/components/cardStack.svelte";
  import ResultsTable from "$lib/components/resultsTable.svelte";
  import checklist from "$lib/datasource/checklist";
  import { appState, routeMode } from "$lib/state.svelte.ts";
  import { fade, fly } from "svelte/transition";

  let progress = $derived(Object.keys(appState.quick.progress).length);

  $effect(() => {
    if (progress === checklist.standards.length) {
      appState.quick.mode = routeMode.complete;
    }
  });
</script>

<div class="grid grid-cols-1 md:grid-cols-3 min-h-screen w-full gap-8 p-8">
  <!-- sidebar -->
  <div class="col-span-1">
    <div class="sidebar"></div>
  </div>

  <div class="col-span-2">
    <main class="rounded-box shadow-xl bg-base-100 w-full h-full py-14 px-14">
      {#if appState.quick.mode === routeMode.intro}
        <div out:fade>
          <h2 class="font-bold text-4xl">Introduction</h2>
          <p class="text-lg">
            The Quick review tool will give you a broad overview of where you
            might need to focus to improve your course. Text going here should
            explain more about the tool and have good word usage to make word
            look good here. When you’re ready to get started, click Get Started.
          </p>

          <button
            class="btn btn-primary mt-8 block mx-auto"
            onclick={() => (appState.quick.mode = routeMode.active)}
          >
            Get Started
          </button>
        </div>
      {:else if appState.quick.mode === routeMode.active}
        <div in:fly={{ delay: 150, y: 50 }}>
          <progress
            class="progress w-full h-2 -mt-2 mb-2"
            value={progress}
            max={checklist.standards.length}
          ></progress>
          <p class="text-lg font-light">
            {progress} Completed
          </p>
          <div class="w-full">
            <CardStack
              cards={checklist.standards.map((s) => ({
                title: s.name,
                body: s.description || "",
                rating: appState.quick.progress[s.name] || undefined,
              }))}
              rate={(idx, rating) => {
                console.log(idx, checklist.standards[idx], rating);
                appState.quick.progress[checklist.standards[idx].name] = rating;
              }}
            />
          </div>
        </div>
      {:else if appState.quick.mode === routeMode.complete}
        <div out:fade>
          <button
            class="btn btn-primary mt-8 float-right"
            onclick={() => {
              appState.quick.mode = routeMode.intro;
              appState.quick.progress = {};
            }}
          >
            Start Over
          </button>
          <h2 class="font-bold text-4xl">You're Done!</h2>
          <p>
            You have completed the quick review tool. You can now view your
            results and see where you might need to focus to improve your
            course.
          </p>
          <ResultsTable level="quick" />
        </div>
      {/if}
    </main>
  </div>
</div>

<style lang="postcss">
  main {
    view-transition-name: quick;
  }
</style>
