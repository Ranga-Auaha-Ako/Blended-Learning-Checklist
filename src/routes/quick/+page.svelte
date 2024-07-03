<script lang="ts">
  import checklist from "$lib/datasource/checklist";
</script>

<div class="grid grid-cols-1 md:grid-cols-3 min-h-screen w-full gap-8 p-8">
  <!-- sidebar -->
  <div class="col-span-1">
    <div class="sidebar"></div>
  </div>

  <div class="col-span-2">
    <main class="rounded-box shadow-xl bg-base-100 w-full h-full py-14 px-14">
      <h2 class="font-bold text-4xl">Introduction</h2>
      <p class="text-lg">
        The Quick review tool will give you a broad overview of where you might
        need to focus to improve your course. Text going here should explain
        more about the tool and have good word usage to make word look good
        here. When you’re ready to get started, click Get Started.
      </p>

      <div class="stack-container flex justify-center mb-10">
        <div class="stack mx-auto">
          {#each checklist.standards.slice(0, 3) as standard}
            <div class="card bg-base-200 max-w-sm text-base-content shadow-md">
              <div class="card-body">
                <h2 class="card-title">
                  {standard.name}
                </h2>
                {#if standard.description}
                  <p>
                    {standard.description}
                  </p>
                {:else}
                  {#each checklist.flatten(standard) as i}
                    <ul>
                      <li>{i}</li>
                    </ul>
                  {/each}
                {/if}
                <div class="card-actions justify-end">
                  <div class="rating">
                    <input
                      type="radio"
                      name="rating-1"
                      class="mask mask-star"
                    />
                    <input
                      type="radio"
                      name="rating-1"
                      class="mask mask-star"
                      checked="checked"
                    />
                    <input
                      type="radio"
                      name="rating-1"
                      class="mask mask-star"
                    />
                    <input
                      type="radio"
                      name="rating-1"
                      class="mask mask-star"
                    />
                    <input
                      type="radio"
                      name="rating-1"
                      class="mask mask-star"
                    />
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </main>
  </div>
</div>

<style lang="postcss">
  main {
    view-transition-name: quick;
  }
</style>
