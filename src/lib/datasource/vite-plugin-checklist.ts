// Inspired by OriginJS / vite-plugin-content
// Created to interpret the telas-checklist.xlsx file

import { createFilter } from "@rollup/pluginutils";
import toSource from "tosource";
import fs from "node:fs";
import xlsx from "xlsx";
const fileRegex = /telas-checklist\.xlsx?$/;

export interface Indicator {
  type: "indicator";
  name: string;
  description?: string;
}

export interface Criteria {
  type: "criteria";
  name: string;
  description?: string;
  indicators: Indicator[];
}

export interface Standard {
  type: "standard";
  name: string;
  description?: string;
  criteria: Criteria[];
}

function parseSheet(book: xlsx.WorkBook) {
  if (!book.Workbook || !book.Workbook.Sheets || !book.Workbook.Sheets[0].name)
    return;
  const sheet = book.Sheets[book.Workbook.Sheets[0].name];
  const data = xlsx.utils.sheet_to_json<{
    Standard: string | false;
    "Standard Description": string | false;
    Criteria: string | false;
    "Criteria Description": string | false;
    Indicator: string | false;
    "Indicator Description": string | false;
  }>(sheet, {
    defval: false,
    header: [
      "Standard",
      "Standard Description",
      "Criteria",
      "Criteria Description",
      "Indicator",
      "Indicator Description",
    ],
    range: 1,
  });
  // Data now contains an array of arrays, where each inner array represents a row of the sheet
  let standards: Standard[] = [];
  let currentStandard: Standard | null = null;
  data.forEach((row) => {
    if (row.Standard) {
      currentStandard = {
        type: "standard",
        name: row.Standard,
        description: row["Standard Description"] || undefined,
        criteria: [],
      };
      standards.push(currentStandard);
    }
    if (row.Criteria) {
      currentStandard?.criteria.push({
        type: "criteria",
        name: row.Criteria,
        description: row["Criteria Description"] || undefined,
        indicators: [],
      });
    }
    if (row.Indicator) {
      currentStandard?.criteria[
        currentStandard.criteria.length - 1
      ].indicators.push({
        type: "indicator",
        name: row.Indicator,
        description: row["Indicator Description"] || undefined,
      });
    }
  });
  return standards;
}

export default function xlsxTransform() {
  return {
    name: "vite-xlsx",

    transform(_, id: string) {
      if (fileRegex.test(id)) {
        const file = fs.readFileSync(id);
        const xlsxData = xlsx.read(file);
        const generatedCode = `const data = ${toSource(
          parseSheet(xlsxData)
        )};\nexport default data;`;

        return {
          code: generatedCode,
          map: null,
        };
      }
    },
  };
}
