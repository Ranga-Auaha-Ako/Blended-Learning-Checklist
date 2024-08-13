<script lang="ts">
  import CardPage from "$lib/components/cardPage.svelte";
  import { routeMode } from "$lib/state.svelte";
</script>

<CardPage
  text={{
    title: "Quick Review",
    sidebar:
      "Quickly check your assumptions against an overview of what is expected for learning at the University of Auckland.",
    [routeMode.intro]:
      "The Quick review tool will give you a broad overview of where you might need to focus to improve your course. The quick review will take you through each standard of the blended learning checklist. This is great for getting an initial look at what you might need to focus on the most. When you’re ready to get started, click Get Started.",
    [routeMode.complete]:
      "You have completed the quick review tool. You can now view your results and see where you might need to focus to improve your course.",
  }}
  mode="quick"
/>
