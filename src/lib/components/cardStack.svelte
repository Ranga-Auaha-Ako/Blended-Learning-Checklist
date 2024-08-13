<script lang="ts" context="module">
  export interface cardStackProps {
    cards: cardProps[];
    current?: number;
    rate: (idx: number, rating: rating) => void;
    hideRated?: boolean;
    binaryMode?: boolean;
  }
</script>

<script lang="ts">
  import type { cardProps } from "./card.svelte";
  import Card from "./card.svelte";
  import { appState, rating, ratingList } from "$lib/state.svelte";
  import { tick } from "svelte";
  let {
    cards,
    current = $bindable(0),
    rate,
    hideRated = true,
    binaryMode = false,
  }: cardStackProps = $props();
  let { cardStack, filteredCurrent } = $derived.by(() => {
    let newCardStack = hideRated
      ? cards.filter((c) => c.rating === undefined)
      : cards;
    return {
      cardStack: newCardStack,
      filteredCurrent: hideRated
        ? newCardStack.indexOf(cards[current])
        : current,
    };
  });

  if (hideRated) {
    let foundCurrent = cards.indexOf(
      cards.filter((c) => c.rating === undefined)[current]
    );
    if (foundCurrent !== -1) current = foundCurrent;
    console.log("Updated current", current);
  }

  let cardStackEl: HTMLDivElement;
  const nextCard = async (focus = false) => {
    let foundCurrent = cards.indexOf(cardStack[filteredCurrent + 1]);
    if (foundCurrent === -1) return;
    current = foundCurrent;
    if (focus) {
      await tick();
      const foundInput = cardStackEl.querySelector<HTMLInputElement>(
        ".card-outer:not([inert]) input"
      );
      foundInput?.focus();
    }
  };

  const ratingItems = $derived(
    binaryMode ? [rating.no, rating.maybe, rating.yes] : ratingList
  );
  const ratingShortcuts = $derived(
    binaryMode ? ["1", "2", "3"] : ratingList.map((r) => (r + 1).toString())
  );
</script>

<svelte:window
  onkeypress={(e) => {
    // There is an accessible keypress capture in the ratingButtons component
    if (ratingShortcuts.includes(e.key)) {
      const currentRating = ratingItems[ratingShortcuts.indexOf(e.key)];
      rate && rate(current, currentRating);
      nextCard();
    }
  }}
/>

<div class="stack mx-auto grid h-full max-h-[30rem]" bind:this={cardStackEl}>
  {#each cardStack.slice(filteredCurrent, filteredCurrent + 3) as card, i (card.title)}
    <Card
      {...card}
      active={i === 0}
      rate={(rating) => {
        nextCard();
        if (rate) rate(cards.indexOf(card), rating);
      }}
      {binaryMode}
    ></Card>
  {/each}
</div>

<style lang="postcss">
</style>
