<script lang="ts">
  import { rating, ratingLabels, ratingList } from "$lib/state.svelte";
  import { nanoid } from "nanoid";
  import StarIcon from "virtual:icons/material-symbols/star-rate-outline-rounded";
  import StarIconFilled from "virtual:icons/material-symbols/star-rate-rounded";
  import QuestionMark from "virtual:icons/material-symbols/questionMark";

  interface ratingButtonProps<canUnselect = boolean> {
    rate?: canUnselect extends true
      ? (rating: rating | undefined) => void
      : (rating: rating) => void;
    fullWidth?: boolean;
    canUnselect?: canUnselect;
    currentRating: rating | undefined;
    disabled?: boolean;
    hintNumbers?: boolean;
    binaryMode: boolean;
  }
  let {
    rate,
    fullWidth = false,
    canUnselect = false,
    currentRating,
    disabled = false,
    hintNumbers = false,
    binaryMode = false,
  }: ratingButtonProps = $props();

  const ratingItems = $derived(binaryMode ? [rating.no, rating.maybe, rating.yes] : ratingList);
  const ratingShortcuts = $derived(binaryMode ? ["1", "2", "3"] : ratingList.map(r => (r+1).toString()));

  const id = nanoid();
  let ratingEls: Record<rating, HTMLInputElement> = {} as any;
</script>

<fieldset
class="w-full grid grid-flow-col gap-0 h-full rating-row"
>
{#each ratingItems as rateitem,idx}
  <!-- Pointer down event to speed up selection system -->
  <label
    class="rating-button"
    class:fullWidth
    class:rating-active={currentRating === rateitem}
    onpointerdown={() =>
      !canUnselect && rate &&
      (!canUnselect || rateitem !== currentRating
        ? rate(rateitem)
        : rate(undefined as any))}
  >
      <input
        class="rating-button-input"
        type={canUnselect ? "checkbox" : "radio"}
        name="rating-{id}"
        value={rateitem}
        checked={rateitem === currentRating}
        bind:this={ratingEls[rateitem]}
        {disabled}
        onchange={() => {
          if(canUnselect) {
            rate && rate(rateitem === currentRating ? undefined as any : rateitem);
          }
        }}
        onkeypress={(e) => {
          if (e.key === "Enter" && rate) {
            if (rateitem !== currentRating || !canUnselect) {
              rate(rateitem);
              currentRating = rateitem;
            }
            else {
              rate(undefined as any);
              currentRating = undefined;
            }
          } else if (ratingShortcuts.includes(e.key)) {
            currentRating = ratingItems[ratingShortcuts.indexOf(e.key)];
            rate && rate(currentRating);
            e.stopPropagation();
          }
        }}
      />
    <div class="icon">
      {#if hintNumbers}
        <span class="numberHint">
          {ratingShortcuts[idx]}
        </span>
      {/if}
      {#if binaryMode && rateitem === rating.maybe}
        <QuestionMark height="1rem" />
      {:else if currentRating !== undefined && rateitem <= currentRating}
        <StarIconFilled />
      {:else}
        <StarIcon />
      {/if}
    </div>
    <span class="text-xs">
      {ratingLabels[rateitem]}
    </span>
  </label>
{/each}
</fieldset>


<style lang="postcss">
  .rating-button {
    @apply flex flex-col items-center bg-black bg-opacity-0 hover:bg-opacity-5 p-2 transition hover:scale-105 active:scale-100 cursor-pointer justify-center relative;
    &.fullWidth:first-child {
      @apply pl-0;
    }
    &.fullWidth:last-child {
      @apply pr-0;
    }
    .icon {
      @apply relative w-5 h-5;
    }
    .numberHint {
      @apply bg-gray-200 font-mono w-4 h-4 inline-flex items-center justify-center rounded-sm text-xs transition absolute top-0 left-0 right-0 mx-auto opacity-0;
    }
    &:hover, &:has(input:focus-visible) {
      .numberHint {
        @apply opacity-100;
      }
    }
    .rating-button-input {
      @apply absolute opacity-0 focus-visible:opacity-100 translate-y-1 scale-125;
    }
    &.rating-active {
      @apply bg-opacity-5;
    }
  }
</style>
