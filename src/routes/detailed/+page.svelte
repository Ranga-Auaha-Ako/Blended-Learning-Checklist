<script lang="ts">
  import CardPage from "$lib/components/cardPage.svelte";
  import { routeMode } from "$lib/state.svelte";
</script>

<CardPage
  text={{
    title: "Detailed Assessment",
    sidebar:
      "The Detailed Assessment tool will help you get a more in-depth look at where you might need to focus to improve your course.",
    [routeMode.intro]:
      "Dive into each part of the framework. While this tool takes a little more time, you'll have a better idea at the end of what specific areas to focus more on. When you’re ready to get started, click Get Started.",
    [routeMode.complete]:
      "You have completed the detailed review tool. You can now view your results and see where you might need to focus to improve your course.",
  }}
  mode="detailed"
/>
