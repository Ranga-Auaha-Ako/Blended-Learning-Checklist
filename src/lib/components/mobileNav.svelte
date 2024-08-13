<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		sidebar,
		absolute = true
	}: {
		sidebar: Snippet,
		absolute: boolean
	} = $props();
	let mobileNav: HTMLDialogElement | undefined = $state();
</script>


<button class:btn-bottom-abs={absolute} class="btn btn-sm mb-4 w-full bg-gray-900 text-white border-none sm:hidden" onclick={()=>{
  mobileNav?.showModal();
}}>Navigation</button>
<dialog id="mobileNav" bind:this={mobileNav} class="modal backdrop-blur-lg">
  <div class="text-white flex max-h-[90vh] z-10">
    {@render sidebar()}
  </div>
  <form method="dialog">
    <button class="btn btn-sm btn-circle btn-ghost text-white absolute right-2 top-2 z-20">✕</button>
  </form>
</dialog>

<style lang="postcss">
	.btn-bottom-abs {
		@apply fixed right-0 bottom-0 left-0 m-3 w-auto;
	}
</style>