// import { read as readXLSX, writeXLSX, utils } from "xlsx";
import { Workbook } from "exceljs";
import templateFile from "./template.xlsx?url";
import { appState, ratingLabels } from "$lib/state.svelte";
import checklist from "$lib/datasource/checklist";

export async function exportData(mode: keyof typeof appState) {
  // Fetch template from URL
  const templateData = await fetch(templateFile);
  const templateArrayBuffer = await templateData.arrayBuffer();
  const workbook = new Workbook();
  await workbook.xlsx.load(templateArrayBuffer);
  // We have the template!
  // Now we can fill it with data
  let data: {
    Standard: string;
    Criteria: string;
    Indicator: string;
    Rating: string;
    Notes: string;
  }[] = [];
  let lastStandard = "";
  let lastCriteria = "";
  switch (mode) {
    case "quick":
      data = checklist.standards.map((standard) => {
        const rated = appState.quick.progress[standard.name];
        return {
          Standard: standard.name,
          Criteria: "",
          Indicator: "",
          Rating: rated ? ratingLabels[rated] : "",
          Notes: "",
        };
      });
      break;
    case "detailed":
      data = checklist.flatCriteria.map((criteria) => {
        const rated = appState.detailed.progress[criteria.name];
        const standard = checklist.standards[criteria.standardIndex].name;
        const result = {
          Standard: standard !== lastStandard ? standard : "",
          Criteria: criteria.name,
          Indicator: "",
          Rating: rated ? ratingLabels[rated] : "",
          Notes: "",
        };
        lastStandard = standard;
        return result;
      });
      break;
    case "comprehensive":
      data = checklist.flatIndicators.map((indicators) => {
        const rated = appState.comprehensive.progress[indicators.name];
        const standard = checklist.standards[indicators.standardIndex].name;
        const criteria = checklist.flatCriteria[indicators.criteriaIndex].name;
        const result = {
          Standard: standard !== lastStandard ? standard : "",
          Criteria: criteria !== lastCriteria ? criteria : "",
          Indicator: indicators.name,
          Rating: rated ? ratingLabels[rated] : "",
          Notes: "",
        };
        lastStandard = standard;
        lastCriteria = criteria;
        return result;
      });
      break;
    default:
      break;
  }
  const table = workbook.worksheets[0].getTable("Checklist");
  data.forEach((row, index) => {
    table.addRow([
      row.Standard,
      row.Criteria,
      row.Indicator,
      row.Rating,
      row.Notes,
    ]);
  });
  table.commit();
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export-${mode}.xlsx`;
  a.click();
  debugger;
}
exportData("quick");
