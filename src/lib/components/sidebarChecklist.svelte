<script lang="ts">
  import MDICheck from "virtual:icons/mdi/check";
  import MDICheckBoxOutlineBlank from "virtual:icons/mdi/checkBoxOutlineBlank";
  import Checkbox from "./checkbox.svelte";

  interface checklistProps {
    items: {
      state: boolean;
      text: string;
    }[];
    select: (idx: number) => void;
    current?: number;
    mask?: boolean;
    autoScroll?: boolean;
    rounded?: boolean;
  }

  let {
    items,
    select,
    current,
    mask = true,
    autoScroll = true,
    rounded = true,
  }: checklistProps = $props();
  let itemsEls: (HTMLLabelElement | undefined)[] = Array(items.length).fill(
    undefined
  );
  $effect(() => {
    current;
    if (current !== undefined && autoScroll) {
      itemsEls[current]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  });
</script>

<div class="checklist-container" class:mask class:rounded class:autoScroll>
  <div class="checklist">
    {#each items as item, idx}
      <label
        for="checklist-{idx}"
        class="checklist-item p-4 gap-4"
        class:item-unchecked={!item.state}
        class:active={idx === current}
        bind:this={itemsEls[idx]}
      >
        <input
          type="radio"
          id="checklist-{idx}"
          class="absolute opacity-0 pointer-events-none"
          bind:group={current}
          value={idx}
          onchange={() => current !== undefined && select(current)}
        />
        <span class="text-[1.25rem] grow-0">
          <Checkbox checked={item.state}></Checkbox>
        </span>
        <span class="grow text-left">
          {item.text}
        </span>
      </label>
    {/each}
  </div>
</div>

<style lang="postcss">
  .checklist-container {
    @apply grow overflow-y-auto relative;
    .checklist {
      @apply flex flex-col;
      /* Padding to avoid cards being cut off by mask */
      &.mask {
        @apply pt-4 pb-28;
        &.autoScroll {
          @apply scroll-p-20;
        }
        mask-image: linear-gradient(
          to bottom,
          rgba(0, 0, 0, 0),
          rgba(0, 0, 0, 1) 1rem,
          rgba(0, 0, 0, 1) 70%,
          rgba(0, 0, 0, 0)
        );
      }
    }
    &.autoScroll {
      @apply snap-y snap-mandatory scroll-smooth;
    }
    &.rounded {
      .checklist-item {
        @apply rounded-lg;
      }
    }
  }
  .checklist-item {
    @apply font-light text-sm text-left flex flex-row items-center transition cursor-pointer bg-white bg-opacity-0;
    @apply snap-start;
    @apply outline outline-transparent -outline-offset-1;

    &.item-unchecked {
      @apply opacity-50;
    }
    &:hover {
      @apply bg-opacity-5;
    }

    &.active {
      @apply opacity-100 bg-opacity-10;
    }
  }
  label:has(input:focus-visible) {
    @apply outline-white;
  }
</style>
