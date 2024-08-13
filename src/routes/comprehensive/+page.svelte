<script lang="ts">
  import Checkbox from "$lib/components/checkbox.svelte";
  import MobileNav from "$lib/components/mobileNav.svelte";
  import RatingButtons from "$lib/components/ratingButtons.svelte";
  import ResultsTable from "$lib/components/resultsTable.svelte";
  import ShareState from "$lib/components/shareState.svelte";
  import SidebarChecklist from "$lib/components/sidebarChecklist.svelte";
  import checklist from "$lib/datasource/checklist";
  import { appState, rating, routeMode } from "$lib/state.svelte";
  import { tick } from "svelte";
  import { fade } from "svelte/transition";
  let activeList = $state(0);
  import MdiArrowBack from "virtual:icons/mdi/arrowBack";

  let flatIndicators = checklist.standards.flatMap((standard) =>
    standard.criteria.flatMap((criterion) => criterion.indicators)
  );
  let flatCriteria = checklist.standards.flatMap((standard) =>
    standard.criteria.flatMap((criterion) => criterion.indicators)
  );
  let firstIncompleteIndicator = $derived(
    flatIndicators.find(
      (indicator) =>
        appState.modes.comprehensive.progress[indicator.name] === undefined
    )
  );
  let firstIncompleteIndicatorIndex = $derived(
    firstIncompleteIndicator
      ? flatIndicators.indexOf(firstIncompleteIndicator)
      : -1
  );
  let firstIncompleteCriterion = $derived(
    checklist.standards
      .flatMap((standard) => standard.criteria)
      .find((criterion) =>
        criterion.indicators.some(
          (indicator) =>
            appState.modes.comprehensive.progress[indicator.name] === undefined
        )
      )
  );
  let firstIncompleteStandard = $derived(
    checklist.standards.find((standard) =>
      standard.criteria.some((criterion) =>
        criterion.indicators.some(
          (indicator) =>
            appState.modes.comprehensive.progress[indicator.name] === undefined
        )
      )
    )
  );
  let firstIncompleteStandardIndex = $derived(
    firstIncompleteStandard
      ? checklist.standards.indexOf(firstIncompleteStandard)
      : -1
  );
  let collapseEls: Record<
    number,
    Record<string, HTMLInputElement>
  > = Object.fromEntries(checklist.standards.map((_, idx) => [idx, {}]));
  let ratingEls: Record<
    number,
    Record<string, HTMLElement>
  > = Object.fromEntries(checklist.standards.map((_, idx) => [idx, {}]));

  let autoScroll = $state(true);

  let done = $derived(!firstIncompleteIndicator);

  $effect(() => {
    if (!autoScroll || done) return;
    if (firstIncompleteStandardIndex > -1) {
      activeList = firstIncompleteStandardIndex;
    }
  });
  $effect(() => {
    if (done) return;
    if (firstIncompleteCriterion) {
      const nextIdx = checklist.standards[activeList].criteria.indexOf(
        firstIncompleteCriterion
      );
      const prevCrit = checklist.standards[activeList].criteria[nextIdx - 1];
      const els = collapseEls[activeList];
      if (!els || nextIdx === -1) return;
      tick().then(() => {
        const nextEl = els[firstIncompleteCriterion.name];
        const prevEl = prevCrit ? els[prevCrit.name] : null;
        Object.values(els).forEach((el) => {
          if (el === nextEl) {
            el.checked = true;
          } else if (el === prevEl) {
            el.checked = false;
          }
        });
        // Don't autoscroll if it's the first item
        if (!prevCrit && firstIncompleteStandardIndex === 0) return;
        if (autoScroll)
          setTimeout(() => {
            if (nextEl.checkVisibility())
              nextEl.scrollIntoView({ block: "start", behavior: "smooth" });
          }, 300);
      });
    } else {
      tick().then(() => {
        const els = collapseEls[0];
        const firstEl = Object.values(els)[0];
        firstEl.checked = true;
      });
    }
  });

  $effect(() => {
    if (!firstIncompleteIndicator) {
      appState.modes.comprehensive.mode = routeMode.complete;
    }
  });
</script>

{#snippet sidebar()}
<SidebarChecklist
items={checklist.standards.map((standard, idx) => ({
  text: standard.name,
  state:
    firstIncompleteStandardIndex === -1 ||
    idx < firstIncompleteStandardIndex,
}))}
current={activeList}
select={(idx) => {
  appState.modes.comprehensive.mode = routeMode.active;
  activeList = idx;
  document.querySelector<HTMLDialogElement>("dialog#mobileNav")?.close();
}}
mask={false}
rounded={false}
autoScroll={false}
></SidebarChecklist>

{/snippet}

<div class="heading text-white mx-10 sm:mx-20 my-4 sm:my-10 flex flex-col">
  <div class="flex gap-2 md:contents w-full items-center justify-between">
    <a
      href="/"
      class="btn btn-ghost sm:text-xl -ml-3.5 w-auto mr-auto"
      title="Return to menu"
    >
      <MdiArrowBack></MdiArrowBack>
      <span class="hidden md:inline" aria-hidden="true">Return to menu</span>
    </a>
    <h2
      class="font-semibold leading-tight md:leading-normal sm:text-3xl md:text-5xl"
    >
      Comprehensive Review
    </h2>
  </div>
  <p class="text-base md:text-lg hidden sm:block font-light text-gray-100">
    Review the full list of TELAS benchmark standards to ensure the highest
    possible quality course.
  </p>
  <div>
    <progress
      class="progress w-full h-2 sm:h-4 sm:mb-2 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:bg-white"
      value={firstIncompleteIndicatorIndex === -1
        ? 100
        : (firstIncompleteIndicatorIndex / flatIndicators.length) * 100}
      max="100"
    ></progress>
    <p class="text-sm sm:text-lg font-light">
      {firstIncompleteIndicatorIndex === -1
        ? flatIndicators.length
        : firstIncompleteIndicatorIndex} / {flatIndicators.length} Completed
    </p>
  </div>
</div>

<main>
  <div class="sidePane">
    {@render sidebar()}
  </div>

  <div class="mainPane">
    {#if appState.modes.comprehensive.mode === routeMode.active}
      {#key activeList}
        <div
          class="overflow-x-auto"
          out:fade={{ duration: 200 }}
          in:fade={{ delay: 300 }}
        >
          <h3 class="text-3xl font-semibold mb-4">
            {checklist.standards[activeList].name}
          </h3>
          <div
            class="toolbar flex flex-wrap items-center justify-between gap-2 mb-4"
          >
            <fieldset class="flex flex-row gap-2 basis-96 grow max-w-xs">
              <input
                type="text"
                placeholder="Course title (eg, COMPSCI 101)"
                class="input input-sm input-bordered w-full"
                class:input-error={!appState.meta.title}
                bind:value={appState.meta.title}
                required
                title="Please enter a course title"
              />
              <input
                type="text"
                placeholder="Semester"
                class="input input-sm input-bordered w-full col-span-1"
                bind:value={appState.meta.semester}
                title="Please enter a semester"
              />
              <input
                type="number"
                placeholder="Year"
                class="input input-sm input-bordered w-full col-span-2"
                bind:value={appState.meta.year}
                title="Please enter a year"
              />
            </fieldset>
            <div class="flex flex-row gap-2 items-center flex-wrap">
              <div class="form-control shrink-0">
                <label class="label cursor-pointer gap-2">
                  <span class="label-text">Auto-scroll to next item</span>
                  <input
                    type="checkbox"
                    class="toggle"
                    bind:checked={autoScroll}
                  />
                </label>
              </div>
              <button
                class="btn btn-sm btn-error btn-outline"
                onclick={() => {
                  confirm("Are you sure you want to restart?") &&
                    (() => {
                      activeList = 0;
                      appState.modes.comprehensive.progress = {};
                      appState.modes.comprehensive.mode = routeMode.active;
                    })();
                }}
              >
                Restart
              </button>
              <ShareState level="comprehensive" size="sm"></ShareState>
            </div>
            <MobileNav sidebar={sidebar} absolute={false} />
          </div>
          {#each checklist.standards[activeList].criteria as criterion, ic}
            <div class="collapse collapse-arrow bg-base-200">
              <input
                type="checkbox"
                bind:this={collapseEls[activeList][criterion.name]}
              />
              <div
                class="collapse-title text-xl font-medium align-middle flex gap-4"
              >
                <span class="grow">
                  {criterion.name}
                </span>
                <progress
                  class="progress w-20 [&::-webkit-progress-value]:transition-all my-2.5"
                  value={(criterion.indicators.reduce(
                    (acc, indicator) =>
                      appState.modes.comprehensive.progress[indicator.name] !==
                      undefined
                        ? acc + 1
                        : acc,
                    0
                  ) /
                    criterion.indicators.length) *
                    100}
                  max="100"
                ></progress>
              </div>
              <div class="collapse-content">
                <table class="table table-lg bg-base-100">
                  <!-- head -->
                  <thead>
                    <tr>
                      <th class="w-8/12">Name</th>
                      <th class="w-full">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each criterion.indicators as indicator}
                      {@const itemRating =
                        appState.modes.comprehensive.progress[indicator.name]}
                      <tr
                        class="h-px"
                        class:red={itemRating == rating.no}
                        class:orange={itemRating == rating.nobut}
                        class:yellow={itemRating == rating.yesbut}
                        class:green={itemRating == rating.yes}
                      >
                        <td>{indicator.name}</td>
                        <td
                          class="py-0"
                          bind:this={ratingEls[activeList][indicator.name]}
                        >
                          <RatingButtons
                            canUnselect={true}
                            rate={(rating) => {
                              appState.modes.comprehensive.progress[
                                indicator.name
                              ] = rating;
                              // Select the next indicator
                              const idx =
                                criterion.indicators.indexOf(indicator);
                              if (idx < criterion.indicators.length - 1) {
                                const nextIndicator =
                                  criterion.indicators[idx + 1];
                                ratingEls[activeList][nextIndicator.name]
                                  .querySelector("input")
                                  ?.focus();
                              }
                            }}
                            binaryMode={false}
                            currentRating={appState.modes.comprehensive
                              .progress[indicator.name]}
                          ></RatingButtons>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
            <hr class="my-4" />
          {/each}
        </div>
      {/key}
    {:else}
      <h3 class="text-3xl font-semibold mb-4">
        Results

        <div class="sm:float-right flex gap-2 text-base font-normal">
          <button
            class="btn btn-sm btn-error btn-outline"
            onclick={() => {
              confirm("Are you sure you want to restart?") &&
                (() => {
                  activeList = 0;
                  appState.modes.comprehensive.progress = {};
                  appState.modes.comprehensive.mode = routeMode.active;
                })();
            }}
          >
            Restart
          </button>
          <ShareState size="sm"></ShareState>
        </div>
      </h3>
      <p>Review the results of the comprehensive review.</p>

      <ResultsTable level="comprehensive" />
    {/if}
  </div>
</main>


<style lang="postcss">
  main {
    @apply rounded-box shadow-xl bg-base-100 h-full mx-3 sm:mx-20 grid grid-cols-4 overflow-hidden;
    view-transition-name: comprehensive;
    .sidePane {
      @apply hidden sm:block col-span-1 bg-base-300 border-r border-gray-300 dark:border-gray-800 pt-6 overflow-y-auto;
      :global(.checklist-item:hover) {
        @apply bg-base-200;
      }
      :global(.checklist-item.active) {
        @apply bg-base-200 rounded-none border-y border-base-100;
      }
    }
    .mainPane {
      @apply col-span-4 sm:col-span-3 p-6 sm:p-12 sm:pl-6;
      container-type: inline-size;
      table {
        @apply h-fit overflow-clip;
        tr {
          @apply h-full transition relative;
          td {
            height: inherit;
          }
          :global(.rating-row) {
            @apply rounded overflow-clip transition;
          }
          &.red :global(.rating-row) {
            @apply bg-red-100 dark:bg-red-900;
          }
          &.orange :global(.rating-row) {
            @apply bg-orange-100 dark:bg-orange-900;
          }
          &.yellow :global(.rating-row) {
            @apply bg-yellow-100 dark:bg-yellow-900;
          }
          &.green :global(.rating-row) {
            @apply bg-green-100 dark:bg-green-900;
          }
        }
      }
    }
  }
  @container (max-width: 50rem) {
    table,
    tbody,
    tr,
    td {
      @apply block;
      thead {
        @apply hidden;
      }
      tr {
        @apply w-full;
      }
    }
  }
</style>
