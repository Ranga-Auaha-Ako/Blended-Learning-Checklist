import checklist from "$lib/datasource/telas-checklist.xlsx";
import type { Criteria, Indicator, Standard } from "./vite-plugin-checklist";

export type checklistItem = Standard | Criteria | Indicator;
export const levelItemMap = {
  quick: "standard" as const,
  detailed: "criteria" as const,
  comprehensive: "indicator" as const,
};
export const levelItemMapReverse = {
  standard: "quick" as const,
  criteria: "detailed" as const,
  indicator: "comprehensive" as const,
};

class StandardList {
  constructor(public standards: Standard[]) {}
  public flatten(
    item: Standard | Criteria | Indicator | undefined = undefined
  ) {
    if (item?.type === "indicator") {
      return item.name;
    }
    if (item?.type === "criteria") {
      return item.indicators.map((i) => i.name);
    }
    if (item?.type === "standard") {
      return item.criteria.map((c) => c.name);
    }
    return this.standards.map((s) => s.name);
  }
}

export default new StandardList(checklist);
