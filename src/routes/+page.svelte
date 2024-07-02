<script lang="ts">
  import { page } from "$app/stores";
  import MdiSchedule from "virtual:icons/mdi/schedule";

  /** @type {import('./$types').PageData} */
  export let data;

  const modes = [
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
</script>

<div class="hero min-h-screen text-white">
  <div class="hero-content text-center">
    <div>
      <h1 class="text-6xl font-bold">Blended Learning Checklist</h1>
      <p class="py-6 text-xl">To begin, pick how deep you’d like to explore</p>
      <div class="modes flex flex-wrap justify-center gap-4">
        {#each modes as mode}
          <div
            class="card bg-base-100 text-base-content text-left w-96 shadow-xl"
            style:view-transition-name={mode.id}
            on:pointerover={() => {
              data.previewMode = mode.id;
            }}
            on:pointerleave={() => {
              data.previewMode = "reset";
            }}
          >
            <div class="card-body">
              <h2 class="card-title">{mode.title}</h2>
              <p class="text-sm">{mode.description}</p>
              <div class="card-actions justify-between mt-2">
                <a href={mode.link} class="btn btn-primary">Get Started</a>
                <div
                  class="inline-flex h-12 items-center font-semibold gap-2 text-sm"
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
