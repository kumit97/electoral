import { create } from "zustand";
import type { ElectionRecord } from "./types";

export interface FormSettings {
  showResultsTable: boolean;
  infoFontFamily: string;
  infoFontSize: number;
  resultsFontFamily: string;
  resultsFontSize: number;
}

export const DEFAULT_SETTINGS: FormSettings = {
  showResultsTable: true,
  infoFontFamily: "'Times New Roman', 'Liberation Serif', Georgia, serif",
  infoFontSize: 15,
  resultsFontFamily: "Arial, sans-serif",
  resultsFontSize: 10.5,
};

export const FONT_OPTIONS = [
  { label: "Times New Roman", value: "'Times New Roman', 'Liberation Serif', Georgia, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
] as const;

interface State {
  records: ElectionRecord[];
  selectedId: string | null;
  search: string;
  settings: FormSettings;
  setRecords: (r: ElectionRecord[]) => void;
  select: (id: string) => void;
  setSearch: (s: string) => void;
  updateRecord: (id: string, patch: Partial<ElectionRecord>) => void;
  updateSettings: (patch: Partial<FormSettings>) => void;
}

export const useElectionStore = create<State>((set) => ({
  records: [],
  selectedId: null,
  search: "",
  settings: DEFAULT_SETTINGS,
  setRecords: (records) =>
    set({ records, selectedId: records[0]?.id ?? null }),
  select: (selectedId) => set({ selectedId }),
  setSearch: (search) => set({ search }),
  updateRecord: (id, patch) =>
    set((s) => ({
      records: s.records.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),
  updateSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),
}));
