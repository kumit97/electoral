import * as XLSX from "xlsx";
import type { ElectionRecord } from "./types";

const COLUMN_ALIASES: Record<keyof Omit<ElectionRecord, "id">, string[]> = {
  sn: ["s/n", "sn", "serial", "serial no", "s.n"],
  state: ["state"],
  areaCouncil: ["area council", "lga", "area_council", "areacouncil"],
  ward: ["registration area (ward)", "ward", "registration area", "ra"],
  pollingUnit: ["polling unit", "pu", "polling_unit"],
  delimitationCode: [
    "delimitation code",
    "delim code",
    "code",
    "delimitation",
    "delim_code",
  ],
};

function normHeader(h: string) {
  return (h || "").toString().trim().toLowerCase();
}

export async function parseExcelFile(file: File): Promise<ElectionRecord[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", cellText: true, cellDates: false });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });
  if (json.length === 0) return [];

  const headers = Object.keys(json[0]);
  const map: Partial<Record<keyof Omit<ElectionRecord, "id">, string>> = {};
  for (const key of Object.keys(COLUMN_ALIASES) as (keyof typeof COLUMN_ALIASES)[]) {
    const aliases = COLUMN_ALIASES[key];
    const found = headers.find((h) => aliases.includes(normHeader(h)));
    if (found) map[key] = found;
  }

  return json.map((row, i) => {
    const get = (k: keyof typeof COLUMN_ALIASES) =>
      map[k] ? String(row[map[k]!] ?? "").trim() : "";
    return {
      id: `${i}-${Math.random().toString(36).slice(2, 8)}`,
      sn: get("sn") || String(i + 1).padStart(4, "0"),
      state: get("state"),
      areaCouncil: get("areaCouncil"),
      ward: get("ward"),
      pollingUnit: get("pollingUnit"),
      delimitationCode: get("delimitationCode"),
    };
  });
}
