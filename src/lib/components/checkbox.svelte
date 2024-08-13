<script lang="ts">
  import { fade } from "svelte/transition";
  import MDICheck from "virtual:icons/mdi/check";
  import MDICheckBox from "virtual:icons/mdi/checkBox";
  import MDICheckBoxOutlineBlank from "virtual:icons/mdi/checkBoxOutlineBlank";

  let {
    checked,
    style = "simple",
  }: { checked: boolean; style?: "box" | "simple" } = $props();
</script>

<span class="inline-grid grid-cols-1 grid-rows-1 w-6 h-6">
  {#if checked}
    <span class="col-start-1 row-start-1" transition:fade>
      {#if style === "box"}
        <MDICheckBox class="inline w-6 h-6" width="auto" height="auto" />
      {:else}
        <MDICheck class="inline w-6 h-6" width="auto" height="auto" />
      {/if}
    </span>
  {:else}
    <span class="col-start-1 row-start-1" transition:fade>
      <MDICheckBoxOutlineBlank
        class="inline w-6 h-6"
        width="auto"
        height="auto"
      />
    </span>
  {/if}
</span>
