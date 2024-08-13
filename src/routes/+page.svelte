<script lang="ts">
  import { page } from "$app/stores";
  import { appState, indexState, type modes } from "$lib/state.svelte";
  import MdiSchedule from "virtual:icons/mdi/schedule";

  const appModeData: {
    id: modes;
    title: string;
    description: string;
    link: string;
    time: number;
  }[] = [
    {
      title: "Quick Review",
      description:
        "Quickly check your assumptions against an overview of what is expected for learning at the University of Auckland.",
      id: "quick",
      link: "/quick",
      time: 5,
    },
    {
      title: "Detailed Assessment",
      description:
        "Dive into the parts of the benchmark you think you need to look at most closely, without getting stuck in the weeds.",
      id: "detailed",
      link: "/detailed",
      time: 15,
    },
    {
      title: "Comprehensive Review",
      description:
        "Take a deep look at your course, checking against each standard to ensure everything is ready for students to learn.",
      id: "comprehensive",
      link: "/comprehensive",
      time: 30,
    },
  ];

  let enabledModes = $derived(!!appState.meta.title);
</script>

<div class="hero min-h-screen text-white">
  <div class="hero-content text-center px-4 mb-8">
    <div>
      <div class="my-8">
        <h1 class="text-6xl font-bold">Blended Learning Checklist</h1>
        <p class="py-6 text-lg max-w-prose mx-auto font-light">
          To begin, enter details about your course. Then, pick how you’d like
          to explore. Each mode will guide you through a different level of
          detail, from a quick overview to a comprehensive review. <span
            class="font-bold"
            >If you’re not sure where to start, we recommend the Quick Review.</span
          >
        </p>
        <fieldset class="flex flex-col gap-2 items-center max-w-xs mx-auto">
          <input
            type="text"
            placeholder="Course Title"
            class="formInput"
            bind:value={appState.meta.title}
            required
            title="Please enter a course title"
          />
          <div class="grid grid-cols-3 gap-1">
            <input
              type="text"
              placeholder="Semester"
              class="formInput col-span-1"
              bind:value={appState.meta.semester}
              title="Please enter a semester"
            />
            <input
              type="number"
              placeholder="Year"
              class="formInput col-span-2"
              bind:value={appState.meta.year}
              title="Please enter a year"
            />
          </div>
        </fieldset>
      </div>
      <div
        class="modes flex flex-wrap justify-center gap-4 transition"
        class:hideModes={!enabledModes}
        aria-disabled={!enabledModes}
      >
        {#each appModeData as mode}
          <div
            class="card bg-base-100 text-base-content text-left w-96 shadow-xl card-compact p-2"
            style:view-transition-name={mode.id}
            on:pointerover={() => {
              indexState.mode = mode.id;
            }}
            on:pointerleave={() => {
              indexState.mode = "reset";
            }}
          >
            <div class="card-body">
              <h2 class="card-title">{mode.title}</h2>
              <p class="text-sm">{mode.description}</p>
              <div class="card-actions justify-between mt-2">
                <a href={mode.link} class="btn btn-primary btn-sm"
                  >Get Started</a
                >
                <div
                  class="inline-flex h-8 items-center font-semibold gap-2 text-sm"
                >
                  <MdiSchedule />
                  <span>
                    {mode.time} Minutes
                  </span>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>

<style lang="postcss">
  .modes.hideModes {
    @apply opacity-50 pointer-events-none cursor-default select-none;
  }
  .formInput {
    @apply input input-ghost border border-white border-opacity-30 w-full caret-white;
    @apply text-white text-opacity-80;
    &::placeholder {
      @apply text-white text-opacity-50 text-sm;
    }
    &:focus {
      @apply ring ring-white ring-opacity-50 bg-opacity-10 text-white text-opacity-100;
    }
  }
</style>
