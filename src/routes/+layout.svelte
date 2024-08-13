<script lang="ts">
  import "../app.postcss";
  import { page } from "$app/stores";
  import { onNavigate } from "$app/navigation";
  import { indexState } from "$lib/state.svelte";
  import { browser } from "$app/environment";
  import { importState, parseState } from "$lib/exportState";

  const destinationGradient = {
    quick: "gradient-quick" as const,
    detailed: "gradient-detailed" as const,
    comprehensive: "gradient-comprehensive" as const,
    default: "" as const,
  };

  const getDestinationGradient = (route: string | null | undefined) => {
    if (typeof route !== "string") return destinationGradient.default;
    if (route?.startsWith("/quick")) return destinationGradient.quick;
    if (route?.startsWith("/detailed")) return destinationGradient.detailed;
    if (route?.startsWith("/comprehensive"))
      return destinationGradient.comprehensive;
    return destinationGradient.default;
  };

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      const bgGradient = document.getElementById("background-wrapper");
      const targetGradient = getDestinationGradient(navigation.to?.route.id);
      bgGradient?.classList.remove(
        destinationGradient.quick,
        destinationGradient.detailed,
        destinationGradient.comprehensive
      );
      if (targetGradient) bgGradient?.classList.add(targetGradient);
      // Handle case where transitioning between home and a page
      if (!getDestinationGradient($page.route.id)) {
        bgGradient?.classList.add("transitioning-home");
      }
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
        bgGradient?.classList.remove("transitioning-home");
      });
    });
  });
  $effect(() => {
    if (getDestinationGradient($page.route.id) !== "") return;
    const pointer = indexState.mode;
    const bgGradient = document.getElementById("background-wrapper");
    bgGradient?.classList.remove(
      destinationGradient.quick,
      destinationGradient.detailed,
      destinationGradient.comprehensive
    );
    if (
      pointer &&
      typeof pointer === "string" &&
      pointer in destinationGradient
    ) {
      // add the appropriate gradient class
      bgGradient?.classList.add(
        destinationGradient[pointer as keyof typeof destinationGradient]
      );
    }
  });

  // Handle loading state from URL UI
  let importModal: HTMLDialogElement | undefined = $state();

  let parsedState: ReturnType<typeof parseState> | undefined = $state();
  $effect(() => {
    parsedState = window.location.hash
      ? parseState(window.location.hash.slice(1))
      : undefined;
    if (importModal && parsedState) {
      importModal.showModal();
    }
  });
</script>

<div
  id="background-wrapper"
  class:bg-home={getDestinationGradient($page.route.id) === ""}
  class="brand-gradient {getDestinationGradient($page.route.id)}"
></div>
<div
  class="background-overlay"
  class:overlayShadow={!getDestinationGradient($page.route.id)}
></div>
<div class="content-wrapper">
  <slot></slot>
</div>

<dialog bind:this={importModal} class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold mb-2">Shared Link</h3>
    <p class="pt-2">
      It looks like you've opened a shared link to this tool. Would you like to
      view the results?
    </p>
    <!-- Meta details table -->
    {#if parsedState}
      <table class="table table-compact">
        <thead>
          <tr>
            <th>Title</th>
            <th>Semester</th>
            <th>Year</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{parsedState.m[0]}</td>
            <td>{parsedState.m[1]}</td>
            <td>{parsedState.m[2]}</td>
          </tr>
        </tbody>
      </table>
    {/if}
    <p class="pt-3 font-bold text-red-700">
      Caution: This will overwrite your current data. Make sure you have saved
      your current progress before importing.
    </p>
    <div class="modal-action">
      <form method="dialog">
        <button
          class="btn btn-primary btn-success"
          onclick={() => {
            if (window.location.hash) {
              importState(window.location.hash.slice(1));
              window.location.hash = "";
              window.location.reload();
            }
          }}
        >
          Import
        </button>
        <!-- if there is a button in form, it will close the modal -->
        <button
          class="btn"
          onclick={() => {
            window.location.hash = "";
          }}>Close</button
        >
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<style lang="postcss">
  ::view-transition-old(background),
  ::view-transition-new(background) {
    /* animation-delay: 0.3s; */
    /* animation-duration: 1s; */
  }
  #background-wrapper {
    @apply fixed inset-0 bg-gray-100 z-0;
    view-transition-name: background;
  }
  .content-wrapper {
    @apply relative z-20;
    view-transition-name: content;
  }
  .background-overlay {
    @apply fixed inset-0 z-10 transition ease-in-out pointer-events-none;
    transition-duration: 2s;
    background: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.4) 44%,
      rgba(0, 0, 0, 0.3) 54.5%,
      rgba(0, 0, 0, 0.2) 90%
    );
    view-transition-name: overlay;
    opacity: 0;
    &.overlayShadow {
      opacity: 1;
    }
  }
</style>
