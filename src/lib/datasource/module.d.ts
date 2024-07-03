declare module "*telas-checklist.xlsx" {
  import type { Standard } from "$lib/datasource/vite-plugin-checklist";
  const standards: Standard[];
  export default standards;
}
