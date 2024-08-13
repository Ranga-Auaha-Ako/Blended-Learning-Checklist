<script lang="ts">
  import { exportStateUrl } from "$lib/exportState";
  import { fade, slide } from "svelte/transition";
  import MaterialSymbolsCheckCircleOutline from "virtual:icons/material-symbols/check-circle-outline";
  import MaterialSymbolsShareOutline from "virtual:icons/material-symbols/share-outline";
  import MaterialSymbolsExportNotesOutline from "virtual:icons/material-symbols/export-notes-outline";
  import type { appState, modes } from "$lib/state.svelte";
  let url: string | undefined = $state();
  let modal: HTMLDialogElement | undefined = $state();
  let showCopied = $state(false);
  const { size = "md", level }: { size?: "sm" | "md" | "lg"; level: modes } =
    $props();

  let exporting = $state(false);
  async function exportTable() {
    exporting = true;
    const { exportData } = await import("$lib/dataexport/dataexport");
    await exportData(level);
    exporting = false;
  }
</script>

<button
  class="btn btn-primary btn-{size}"
  onclick={async () => {
    url = await exportStateUrl();
    modal?.showModal();
  }}
>
  <MaterialSymbolsShareOutline class="h-5 w-5" />
  Share
</button>
<dialog id="my_modal_1" class="modal" bind:this={modal}>
  <div class="modal-box">
    <h3 class="text-lg font-bold">Share URL</h3>
    <p class="py-4">
      Send this URL to anyone to share the results of your checklist, or click
      to Download a copy of your checklist as a spreadsheet. This file cannot be
      uploaded back into the app, but can be used to share your results with
      others.
    </p>
    {#if url}
      <button
        class="w-full rounded-lg p-4 transition bg-primary hover:bg-black hover:scale-105 active:scale-95 text-primary-content overflow-x-hidden grid grid-cols-1 grid-rows-1"
        onclick={() => {
          if (showCopied) {
            showCopied = false;
          }
          if (!url) return;
          // Attempt to use the native share function, or copy the URL to the clipboard
          if (navigator.share) {
            navigator.share({
              title: "Share URL",
              url,
            });
          } else {
            navigator.clipboard.writeText(url);
          }
          showCopied = true;
          setTimeout(() => {
            showCopied = false;
          }, 1500);
        }}
      >
        {#if showCopied}
          <span class="col-start-1 row-start-1 flex gap-2 justify-center">
            <MaterialSymbolsCheckCircleOutline class="h-6 w-6 shrink-0" />
            <span>
              {#if navigator.share}
                Shared!
              {:else}
                Copied to clipboard!
              {/if}
            </span>
          </span>
        {:else}
          <pre
            class="col-start-1 row-start-1 text-ellipsis max-w-full overflow-x-hidden"
            transition:fade>{url}</pre>
        {/if}
      </button>
    {/if}

    <button
      class="btn btn-block mt-4 btn-success btn-outline hover:scale-105 active:scale-95"
      onclick={exportTable}
      disabled={exporting}
    >
      {#if exporting}
        <span class="loading loading-spinner"></span>
      {:else}
        <MaterialSymbolsExportNotesOutline class="h-4 w-4" />
      {/if}
      Export Data to Spreadsheet
    </button>
    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn">Done!</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
