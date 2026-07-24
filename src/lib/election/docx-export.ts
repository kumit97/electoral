import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeightRule,
  PageOrientation,
  VerticalAlign,
  ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import type { ElectionRecord } from "./types";
import { parseDelimitationCode, RESULT_ROWS } from "./types";

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const noBorders = {
  top: noBorder,
  bottom: noBorder,
  left: noBorder,
  right: noBorder,
};
const allBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
};

function digitBoxes(digits: string): TableCell[] {
  return digits.split("").map(
    (d) =>
      new TableCell({
        width: { size: 360, type: WidthType.DXA },
        borders: allBorders,
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 40, bottom: 40, left: 40, right: 40 },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: d, bold: true, size: 22 })],
          }),
        ],
      }),
  );
}

function labelRow(label: string, value: string, codeLabel: string, digits: string) {
  // Layout row as a 4-col table: [Label] [Value w/ dotted underline] [Code label] [digit boxes]
  const boxes = digitBoxes(digits);
  const boxesTable = new Table({
    borders: {
      top: noBorder,
      bottom: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [new TableRow({ children: boxes })],
  });

  return new TableRow({
    height: { value: 500, rule: HeightRule.ATLEAST },
    children: [
      new TableCell({
        width: { size: 1800, type: WidthType.DXA },
        borders: noBorders,
        verticalAlign: VerticalAlign.BOTTOM,
        children: [
          new Paragraph({
            children: [new TextRun({ text: label, bold: true, size: 22 })],
          }),
        ],
      }),
      new TableCell({
        width: { size: 4800, type: WidthType.DXA },
        borders: noBorders,
        verticalAlign: VerticalAlign.BOTTOM,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            border: {
              bottom: {
                style: BorderStyle.DOTTED,
                size: 6,
                color: "000000",
                space: 2,
              },
            },
            children: [new TextRun({ text: value, bold: true, size: 22 })],
          }),
        ],
      }),
      new TableCell({
        width: { size: 900, type: WidthType.DXA },
        borders: noBorders,
        verticalAlign: VerticalAlign.BOTTOM,
        margins: { left: 120, right: 80, top: 0, bottom: 0 },
        children: [
          new Paragraph({
            children: [new TextRun({ text: codeLabel, bold: true, size: 22 })],
          }),
        ],
      }),
      new TableCell({
        width: { size: 1400, type: WidthType.DXA },
        borders: noBorders,
        verticalAlign: VerticalAlign.BOTTOM,
        children: [boxesTable],
      }),
    ],
  });
}

const PAGE_PROPERTIES = {
  page: {
    size: {
      width: 16838,
      height: 11906,
      orientation: PageOrientation.LANDSCAPE,
    },
    margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
  },
};

function buildRecordTable(record: ElectionRecord): Table {
  const parts = parseDelimitationCode(record.delimitationCode);

  const leftTable = new Table({
    width: { size: 8900, type: WidthType.DXA },
    columnWidths: [1800, 4800, 900, 1400],
    borders: {
      top: noBorder,
      bottom: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      labelRow("State", record.state || "", "Code", parts.state),
      labelRow("Area Council", record.areaCouncil || "", "Code", parts.areaCouncil),
      labelRow("Registration Area (WARD)", record.ward || "", "Code", parts.ward),
      labelRow("Polling Unit", record.pollingUnit || "", "Code", parts.pollingUnit),
    ],
  });

  const RESULTS_KEY_COL = 400;
  const RESULTS_LABEL_COL = 3300;
  const RESULTS_VALUE_COL = 700;

  const resultsTable = new Table({
    width: {
      size: RESULTS_KEY_COL + RESULTS_LABEL_COL + RESULTS_VALUE_COL,
      type: WidthType.DXA,
    },
    columnWidths: [RESULTS_KEY_COL, RESULTS_LABEL_COL, RESULTS_VALUE_COL],
    rows: RESULT_ROWS.map(
      (r) =>
        new TableRow({
          height: { value: 320, rule: HeightRule.ATLEAST },
          children: [
            new TableCell({
              width: { size: RESULTS_KEY_COL, type: WidthType.DXA },
              borders: allBorders,
              verticalAlign: VerticalAlign.CENTER,
              shading: { fill: "F5F5F5", type: ShadingType.CLEAR, color: "auto" },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: `#${r.key}`, bold: true, size: 16 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: RESULTS_LABEL_COL, type: WidthType.DXA },
              borders: allBorders,
              verticalAlign: VerticalAlign.CENTER,
              margins: { left: 80, right: 50, top: 30, bottom: 30 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: r.label, size: 16 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: RESULTS_VALUE_COL, type: WidthType.DXA },
              borders: allBorders,
              children: [new Paragraph("")],
            }),
          ],
        }),
    ),
  });

  const snParagraph = new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [
      new TextRun({ text: "S/N   ", bold: true, size: 22 }),
      new TextRun({
        text: (record.sn || "0001").padStart(4, "0"),
        bold: true,
        size: 22,
        underline: {},
      }),
    ],
  });

  const RIGHT_COL_W = RESULTS_KEY_COL + RESULTS_LABEL_COL + RESULTS_VALUE_COL + 300;

  // Two-column outer table: left = form fields, right = S/N + results
  return new Table({
    width: { size: 8900 + RIGHT_COL_W, type: WidthType.DXA },
    columnWidths: [8900, RIGHT_COL_W],
    borders: {
      top: noBorder,
      bottom: noBorder,
      left: noBorder,
      right: noBorder,
      insideHorizontal: noBorder,
      insideVertical: noBorder,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 8900, type: WidthType.DXA },
            borders: noBorders,
            verticalAlign: VerticalAlign.TOP,
            children: [leftTable],
          }),
          new TableCell({
            width: { size: RIGHT_COL_W, type: WidthType.DXA },
            borders: noBorders,
            verticalAlign: VerticalAlign.TOP,
            children: [snParagraph, new Paragraph(""), resultsTable],
          }),
        ],
      }),
    ],
  });
}

function buildDocument(record: ElectionRecord): Document {
  return new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
    },
    sections: [
      {
        properties: PAGE_PROPERTIES,
        children: [buildRecordTable(record)],
      },
    ],
  });
}

/**
 * Builds a single merged Word document containing every record, one per
 * page (each record starts on a new page since every entry in `sections`
 * begins on a fresh page by default).
 */
function buildMergedDocument(records: ElectionRecord[]): Document {
  return new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
    },
    sections: records.map((record) => ({
      properties: PAGE_PROPERTIES,
      children: [buildRecordTable(record)],
    })),
  });
}

export async function exportRecordToDocx(record: ElectionRecord) {
  const doc = buildDocument(record);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `EC8A_${record.sn || "record"}.docx`);
}

/**
 * Exports all records merged into a single .docx file, one record per page.
 */
export async function exportRecordsMergedToDocx(records: ElectionRecord[]) {
  const doc = buildMergedDocument(records);
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `EC8A_forms_merged_${records.length}.docx`);
}

export async function exportRecordsToZip(records: ElectionRecord[]) {
  const zip = new JSZip();
  for (const rec of records) {
    const doc = buildDocument(rec);
    const blob = await Packer.toBlob(doc);
    zip.file(`EC8A_${rec.sn || rec.id}.docx`, blob);
  }
  const out = await zip.generateAsync({ type: "blob" });
  saveAs(out, `EC8A_forms_${records.length}.zip`);
}
