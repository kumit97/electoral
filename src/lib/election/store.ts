import { create } from "zustand";
import type { ElectionRecord } from "./types";

interface State {
  records: ElectionRecord[];
  selectedId: string | null;
  search: string;
  setRecords: (r: ElectionRecord[]) => void;
  select: (id: string) => void;
  setSearch: (s: string) => void;
  updateRecord: (id: string, patch: Partial<ElectionRecord>) => void;
}

export const useElectionStore = create<State>((set) => ({
  records: [],
  selectedId: null,
  search: "",
  setRecords: (records) =>
    set({ records, selectedId: records[0]?.id ?? null }),
  select: (selectedId) => set({ selectedId }),
  setSearch: (search) => set({ search }),
  updateRecord: (id, patch) =>
    set((s) => ({
      records: s.records.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),
}));
