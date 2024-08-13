// import { read as readXLSX, writeXLSX, utils } from "xlsx";
import { Workbook } from "exceljs";
import { appState, ratingLabels } from "$lib/state.svelte";
import checklist from "$lib/datasource/checklist";

export async function exportData(mode: keyof typeof appState) {
  const workbook = new Workbook();
  workbook.creator = "The University of Auckland";
  workbook.created = new Date(2024, 8, 13);
  workbook.modified = new Date();
  const sheet = workbook.addWorksheet("Checklist", {
    properties: {
      outlineLevelRow: 1,
      defaultColWidth: 20,
    },
  });
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
          Rating:
            rated !== undefined && ratingLabels[rated]
              ? ratingLabels[rated]
              : "",
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
  const table = sheet.addTable({
    name: "Checklist",
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleLight9",
      showRowStripes: false,
    },
    columns: [
      { name: "Standard", filterButton: true },
      { name: "Criteria", filterButton: true },
      { name: "Indicator", filterButton: true },
      { name: "Rating", filterButton: true },
      { name: "Notes", filterButton: true },
    ],
    rows: data.map((row) => [
      row.Standard,
      row.Criteria,
      row.Indicator,
      row.Rating,
      row.Notes,
    ]),
  });
  const nameCols = [1, 2, 3];
  nameCols.forEach((i) => {
    const col = sheet.getColumn(i);
    col.width = 60;
    col.alignment = { wrapText: true };
  });
  const ratingCol = sheet.getColumn(4);
  ratingCol.width = 10;
  ratingCol.eachCell((cell) => {
    cell.dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`"${Object.values(ratingLabels).join(",")}"`],
    };
  });
  switch (mode) {
    case "quick":
      sheet.getColumn(2).hidden = true;
      sheet.getColumn(3).hidden = true;
      break;
    case "detailed":
      sheet.getColumn(3).hidden = true;
      break;
    default:
      break;
  }
  const notesColumn = sheet.getColumn(5);
  notesColumn.width = 50;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `export-${mode}.xlsx`;
  a.click();
}
