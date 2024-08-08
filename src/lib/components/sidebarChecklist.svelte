<script lang="ts">
  import MDICheck from "virtual:icons/mdi/check";
  import MDICheckBoxOutlineBlank from "virtual:icons/mdi/checkBoxOutlineBlank";

  interface checklistProps {
    items: {
      state: boolean;
      text: string;
    }[];
    select: (idx: number) => void;
    current?: number;
  }

  let { items, select, current }: checklistProps = $props();
</script>

<div class="checklist">
  {#each items as item, idx}
    <input
      type="radio"
      id="checklist-{idx}"
      class="absolute opacity-0 pointer-events-none"
      bind:group={current}
      value={idx}
      onchange={() => current !== undefined && select(current)}
    />
    <label
      for="checklist-{idx}"
      class="checklist-item"
      class:item-unchecked={!item.state}
      class:active={idx === current}
    >
      <span class="text-[1.25rem] p-4">
        {#if item.state}
          <MDICheck></MDICheck>
        {:else}
          <MDICheckBoxOutlineBlank></MDICheckBoxOutlineBlank>
        {/if}
      </span>
      <span class="p-4">
        {item.text}
      </span>
    </label>
  {/each}
</div>

<style lang="postcss">
  .checklist {
    @apply flex flex-col grow overflow-y-auto;
    /* Padding to avoid cards being cut off by mask */
    @apply pt-4 pb-28;
    mask-image: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0),
      rgba(0, 0, 0, 1) 1rem,
      rgba(0, 0, 0, 1) 70%,
      rgba(0, 0, 0, 0)
    );
  }
  .checklist-item {
    @apply font-light text-left flex flex-row items-center rounded-lg transition cursor-pointer bg-white bg-opacity-0;
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
  input:focus-visible + label {
    @apply outline-white;
  }
</style>
