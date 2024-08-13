<script lang="ts">
  import { exportStateUrl } from "$lib/exportState";
  import { fade, slide } from "svelte/transition";
  import MaterialSymbolsCheckCircleOutline from "virtual:icons/material-symbols/check-circle-outline";
  import MaterialSymbolsShareOutline from "virtual:icons/material-symbols/share-outline";
  let url: string | undefined = $state();
  let modal: HTMLDialogElement | undefined = $state();
  let showCopied = $state(false);
  const { size = "md" }: { size?: "sm" | "md" | "lg" } = $props();
</script>

<button
  class="btn btn-primary btn-{size}"
  onclick={async () => {
    url = await exportStateUrl();
    modal?.showModal();
  }}
>
  <MaterialSymbolsShareOutline class="h-4 w-4" />
  Share
</button>
<dialog id="my_modal_1" class="modal" bind:this={modal}>
  <div class="modal-box">
    <h3 class="text-lg font-bold">Share URL</h3>
    <p class="py-4">
      Share this URL with anyone to share the results of your session.
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
        }}
      >
        {#if showCopied}
          <span class="col-start-1 row-start-1 flex gap-2 justify-center">
            <MaterialSymbolsCheckCircleOutline class="h-6 w-6 shrink-0" />
            <span> Copied to clipboard! </span>
          </span>
        {:else}
          <pre
            class="col-start-1 row-start-1 text-ellipsis max-w-full overflow-x-hidden"
            transition:fade>{url}</pre>
        {/if}
      </button>
    {/if}
    <div class="modal-action">
      <form method="dialog">
        <!-- if there is a button in form, it will close the modal -->
        <button class="btn">Done!</button>
      </form>
    </div>
  </div>
</dialog>
