<script lang="ts" context="module">
  import { rating, ratingLabels, ratingList } from "$lib/state.svelte";

  export interface cardProps {
    title: string;
    body: string;
    active?: boolean;
    rating?: number;
    rate?: (rating: rating) => void;
  }
</script>

<script lang="ts">
  import { fade, fly } from "svelte/transition";

  const { title, body, rate, active = true }: cardProps = $props();
</script>

<div
  class="card-outer"
  class:card-active={active}
  class:pointer-events-none={!active}
  out:fly={{ duration: 300, x: 50 }}
>
  <div class="card-body">
    <h2 class="card-title text-base">
      {title}
    </h2>
    <p class="text-sm basis-0 shrink overflow-y-auto">
      {body}
    </p>
    <div
      class="card-actions bg-white border-t border-t-gray-300 grid grid-flow-col gap-0 -mx-8 -mb-8 overflow-clip"
    >
      {#each ratingList as rateitem}
        <button
          class="flex flex-col items-center hover:bg-gray-100 p-2 transition hover:scale-105
					class:pl-4={rateitem === rating.no} class:pr-4={rateitem === rating.yes}
					active:scale-100"
          onclick={() => rate && rate(rateitem)}
        >
          <div class="w-5 h-5">
            <svg
              version="1.1"
              viewBox="0 0 1200 1200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m366.94 714.71-42.703 248.9c-2.2969 13.453 3.2344 27.141 14.297 35.156 11.062 8.0625 25.781 9.1406 37.922 2.7656l223.55-117.47 223.45 117.47c5.2969 2.7656 11.062 4.0781 16.781 4.0781 7.4531 0 14.859-2.2969 21.141-6.8438 11.062-8.0625 16.688-21.703 14.297-35.156l-42.703-248.86 180.84-176.29c9.8438-9.6094 13.312-23.859 9.1406-36.938-4.2188-13.078-15.469-22.547-29.062-24.469l-249.89-36.281-111.7-226.45c-6.1406-12.234-18.609-20.062-32.297-20.062s-26.297 7.7812-32.297 20.062l-111.7 226.45-249.84 36.375c-13.547 1.9219-24.844 11.531-29.062 24.469-4.2188 13.078-0.70312 27.375 9.1406 36.938zm118.12-205.4c11.766-1.6875 21.844-9.1406 27.141-19.688l87.797-177.98 87.844 177.94c5.2969 10.547 15.375 18 27.141 19.688l196.45 28.547-142.22 138.66c-8.5312 8.2969-12.375 20.156-10.312 31.922l33.609 195.61-175.69-92.391c-5.2969-2.7656-11.062-4.0781-16.781-4.0781-5.7656 0-11.531 1.4531-16.781 4.0781l-175.69 92.391 33.609-195.61c2.0625-11.625-1.9219-23.625-10.312-31.922l-142.26-138.61z"
              />
            </svg>
          </div>
          <span class="text-xs">
            {ratingLabels[rateitem]}
          </span>
        </button>
      {/each}
    </div>
  </div>
</div>

<style lang="postcss">
  .card-outer {
    @apply card overflow-clip border border-gray-300 bg-base-200 max-w-sm text-base-content max-h-screen transition max-w-xs;
    aspect-ratio: 2/3.1;
    &.card-active {
      @apply opacity-100;
    }
  }
</style>
