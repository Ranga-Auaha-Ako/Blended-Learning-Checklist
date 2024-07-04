<script lang="ts">
  import checklist from "$lib/datasource/checklist";
  let activeList = $state(0);
</script>

<div class="heading text-white mx-20 my-20 flex flex-col gap-4">
  <h2 class="font-semibold text-6xl">Comprehensive Review</h2>
  <p class="text-lg font-light">
    Review the full list of TELAS benchmark standards to ensure the highest
    possible quality course.
  </p>
  <div>
    <progress
      class="progress w-full h-5 [&::-webkit-progress-value]:transition-all [&::-webkit-progress-value]:bg-white"
      value={(activeList / checklist.standards.length) * 100}
      max="100"
    ></progress>
    <p class="text-lg font-light">
      {activeList + 1} / {checklist.standards.length} Completed
    </p>
  </div>
</div>

<main
  class="rounded-box shadow-xl bg-base-100 h-full mx-20 grid grid-cols-4 overflow-hidden"
>
  <div
    class="col-span-1 bg-gray-100 border-r border-gray-300 pt-6 overflow-y-auto"
  >
    {#each checklist.standards as standard, i}
      <button
        class="cursor-pointer p-6 hover:bg-gray-200 transition text-left"
        class:bg-gray-200={i === activeList}
        onclick={() => (activeList = i)}
      >
        {standard.name}
      </button>
    {/each}
  </div>

  <div class="col-span-3 p-12 pl-6">
    <div class="overflow-x-auto">
      {#each checklist.standards[activeList].criteria as criterion, ic}
        <div class="collapse collapse-arrow bg-base-200">
          <input type="checkbox" checked={ic === 0} />
          <div class="collapse-title text-xl font-medium">{criterion.name}</div>
          <div class="collapse-content">
            <table class="table table-lg bg-white">
              <!-- head -->
              <thead>
                <tr>
                  <th class="w-8/12">Name</th>
                  <th class="w-full">Rating</th>
                </tr>
              </thead>
              <tbody>
                {#each criterion.indicators as indicator}
                  <tr>
                    <td>{indicator.name}</td>
                    <td></td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
        <hr class="my-4" />
      {/each}
    </div>
  </div>
</main>

<style lang="postcss">
  main {
    view-transition-name: comprehensive;
  }
</style>
