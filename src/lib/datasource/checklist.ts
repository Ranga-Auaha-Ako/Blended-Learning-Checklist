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
  get flatCriteria() {
    return this.standards.flatMap((s, idx) =>
      s.criteria.map((c) => ({ ...c, standardIndex: idx }))
    );
  }
  get flatIndicators() {
    return this.flatCriteria.flatMap((c, idx) =>
      c.indicators.map((i) => ({
        ...i,
        standardIndex: c.standardIndex,
        criteriaIndex: idx,
      }))
    );
  }
}

export default new StandardList(checklist);
