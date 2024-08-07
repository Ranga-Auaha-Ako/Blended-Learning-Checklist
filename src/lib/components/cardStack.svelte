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
  let total = $derived(cards.length);
</script>

<div class="stack mx-auto grid">
  {#each cards
    .filter((c) => !hideRated || !c.rating)
    .slice(current, current + 3) as card, i (card.title)}
    <Card
      {...card}
      active={i === 0}
      rate={(rating) => {
        if (rate) rate(cards.indexOf(card), rating);
        if (!hideRated) current++;
      }}
    ></Card>
  {/each}
</div>

<style lang="postcss">
</style>
