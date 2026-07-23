import { useElectionStore } from "@/lib/election/store";
import { parseExcelFile } from "@/lib/election/excel-import";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Search } from "lucide-react";
import { toast } from "sonner";

export function Spreadsheet() {
  const { records, selectedId, select, setRecords, search, setSearch } =
    useElectionStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter((r) =>
      [r.sn, r.state, r.areaCouncil, r.ward, r.pollingUnit, r.delimitationCode]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [records, search]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const rows = await parseExcelFile(files[0]);
      if (rows.length === 0) {
        toast.error("No rows found in the file");
        return;
      }
      setRecords(rows);
      toast.success(`Imported ${rows.length} records`);
    } catch (e) {
      toast.error("Failed to parse file: " + (e as Error).message);
    }
  };

  const loadSample = () => {
    setRecords([
      {
        id: "sample-1",
        sn: "0001",
        state: "FCT",
        areaCouncil: "ABAJI",
        ward: "ABAJI CENTRAL",
        pollingUnit: "UNG. MAIKANO/KOFAR MAI UNGUWA I",
        delimitationCode: "37-01-01-001",
      },
      {
        id: "sample-2",
        sn: "0002",
        state: "FCT",
        areaCouncil: "ABAJI",
        ward: "ABAJI CENTRAL",
        pollingUnit: "UNG. MAIKANO/KOFAR MAI UNGUWA II",
        delimitationCode: "37-01-01-002",
      },
    ]);
  };

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="border-b p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="mr-1 h-3.5 w-3.5" /> Import Excel
          </Button>
          <Button size="sm" variant="outline" onClick={loadSample}>
            Sample
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records..."
            className="h-8 pl-7 text-xs"
          />
        </div>
      </div>

      <div
        className={`flex-1 overflow-auto ${dragOver ? "bg-accent" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        {records.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-xs text-muted-foreground">
            <Upload className="h-8 w-8 opacity-40" />
            <p>Drag & drop an Excel file here, or click Import</p>
            <p className="text-[10px]">
              Expected columns: S/N, State, Area Council, Ward, Polling Unit,
              Delimitation Code
            </p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-muted">
              <tr className="text-left">
                <th className="border-b p-1.5 font-semibold">S/N</th>
                <th className="border-b p-1.5 font-semibold">Polling Unit</th>
                <th className="border-b p-1.5 font-semibold">Code</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => select(r.id)}
                  className={`cursor-pointer border-b hover:bg-accent ${
                    r.id === selectedId ? "bg-accent" : ""
                  }`}
                >
                  <td className="p-1.5">{r.sn}</td>
                  <td className="p-1.5 truncate max-w-[180px]">{r.pollingUnit}</td>
                  <td className="p-1.5 font-mono text-[10px]">
                    {r.delimitationCode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="border-t px-3 py-1.5 text-[10px] text-muted-foreground">
        {filtered.length} / {records.length} records
      </div>
    </div>
  );
}
