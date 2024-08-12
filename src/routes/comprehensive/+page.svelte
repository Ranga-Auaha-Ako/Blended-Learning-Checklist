<script lang="ts">
  import Checkbox from "$lib/components/checkbox.svelte";
  import RatingButtons from "$lib/components/ratingButtons.svelte";
  import ResultsTable from "$lib/components/resultsTable.svelte";
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
        appState.comprehensive.progress[indicator.name] === undefined
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
            appState.comprehensive.progress[indicator.name] === undefined
        )
      )
  );
  let firstIncompleteStandard = $derived(
    checklist.standards.find((standard) =>
      standard.criteria.some((criterion) =>
        criterion.indicators.some(
          (indicator) =>
            appState.comprehensive.progress[indicator.name] === undefined
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
      appState.comprehensive.mode = routeMode.complete;
    }
  });
</script>

<div class="heading text-white mx-20 my-10 flex flex-col">
  <a href="/" class="btn btn-ghost text-xl -ml-3.5 w-auto mr-auto">
    <MdiArrowBack></MdiArrowBack>
    Return to menu
  </a>
  <h2 class="font-semibold text-5xl">Comprehensive Review</h2>
  <p class="text-lg font-light mb-4">
    Review the full list of TELAS benchmark standards to ensure the highest
    possible quality course.
  </p>
  <div>
    <progress
      class="progress w-full h-4 mb-2 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:bg-white"
      value={firstIncompleteIndicatorIndex === -1
        ? 100
        : (firstIncompleteIndicatorIndex / flatIndicators.length) * 100}
      max="100"
    ></progress>
    <p class="text-lg font-light">
      {firstIncompleteIndicatorIndex === -1
        ? flatIndicators.length
        : firstIncompleteIndicatorIndex} / {flatIndicators.length} Completed
    </p>
  </div>
</div>

<main>
  <div class="sidePane">
    <SidebarChecklist
      items={checklist.standards.map((standard, idx) => ({
        text: standard.name,
        state:
          firstIncompleteStandardIndex === -1 ||
          idx < firstIncompleteStandardIndex,
      }))}
      current={activeList}
      select={(idx) => {
        appState.comprehensive.mode = routeMode.active;
        activeList = idx;
      }}
      mask={false}
      autoScroll={false}
    ></SidebarChecklist>
  </div>

  <div class="mainPane">
    {#if appState.comprehensive.mode === routeMode.active}
      {#key activeList}
        <div
          class="overflow-x-auto"
          out:fade={{ duration: 200 }}
          in:fade={{ delay: 300 }}
        >
          <h3 class="text-3xl font-semibold mb-4">
            {checklist.standards[activeList].name}
          </h3>
          <div class="toolbar flex justify-end items-center gap-4 mb-4">
            <div class="form-control">
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
                    appState.comprehensive.progress = {};
                    appState.comprehensive.mode = routeMode.active;
                  })();
              }}
            >
              Restart
            </button>
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
                      appState.comprehensive.progress[indicator.name] !==
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
                <table class="table table-lg bg-white">
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
                        appState.comprehensive.progress[indicator.name]}
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
                              appState.comprehensive.progress[indicator.name] =
                                rating;
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
                            currentRating={appState.comprehensive.progress[
                              indicator.name
                            ]}
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

        <button
          class="btn btn-sm btn-error btn-outline float-right"
          onclick={() => {
            confirm("Are you sure you want to restart?") &&
              (() => {
                activeList = 0;
                appState.comprehensive.progress = {};
                appState.comprehensive.mode = routeMode.active;
              })();
          }}
        >
          Restart
        </button>
      </h3>
      <p>Review the results of the comprehensive review.</p>

      <ResultsTable level="comprehensive" />
    {/if}
  </div>
</main>

<style lang="postcss">
  main {
    @apply rounded-box shadow-xl bg-base-100 h-full mx-20 grid grid-cols-4 overflow-hidden;
    view-transition-name: comprehensive;
    .sidePane {
      @apply col-span-1 bg-gray-100 border-r border-gray-300 pt-6 overflow-y-auto;
      :global(.checklist-item:hover) {
        @apply bg-gray-200;
      }
      :global(.checklist-item.active) {
        @apply bg-gray-200 rounded-none;
      }
    }
    .mainPane {
      @apply col-span-3 p-12 pl-6;
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
            @apply bg-red-100;
          }
          &.orange :global(.rating-row) {
            @apply bg-orange-100;
          }
          &.yellow :global(.rating-row) {
            @apply bg-yellow-100;
          }
          &.green :global(.rating-row) {
            @apply bg-green-100;
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
