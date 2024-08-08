<script lang="ts" context="module">
  export interface cardStackProps {
    cards: cardProps[];
    current?: number;
    rate: (idx: number, rating: rating) => void;
    hideRated?: boolean;
  }
  import autoAnimate from "@formkit/auto-animate";
</script>

<script lang="ts">
  import type { cardProps } from "./card.svelte";
  import Card from "./card.svelte";
  import type { rating } from "$lib/state.svelte";
  let {
    cards,
    current = $bindable(0),
    rate,
    hideRated = true,
  }: cardStackProps = $props();
  let cardStack = $derived(hideRated ? cards.filter((c) => !c.rating) : cards);
  let filteredCurrent = $derived(
    hideRated ? cardStack.indexOf(cards[current]) : current
  );

  if (hideRated) {
    let foundCurrent = cards.indexOf(cards.filter((c) => !c.rating)[current]);
    if (foundCurrent !== -1) current = foundCurrent;
    console.log("Updated current", current);
  }

  let cardStackEl: HTMLDivElement;
  const nextCard = () => {
    current = cards.indexOf(cardStack[filteredCurrent + 1]);
  };
</script>

<div class="stack mx-auto grid" bind:this={cardStackEl}>
  {#each cardStack.slice(filteredCurrent, filteredCurrent + 3) as card, i (card.title)}
    <Card
      {...card}
      active={i === 0}
      rate={(rating) => {
        if (rate) rate(cards.indexOf(card), rating);
        nextCard();
      }}
    ></Card>
  {/each}
</div>

<style lang="postcss">
</style>
