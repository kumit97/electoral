import { useElectionStore } from "@/lib/election/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exportRecordToDocx, exportRecordsMergedToDocx } from "@/lib/election/docx-export";
import { FileDown, FileStack } from "lucide-react";
import { toast } from "sonner";

export function PropertiesPanel() {
  const { records, selectedId, updateRecord } = useElectionStore();
  const record = records.find((r) => r.id === selectedId);

  const exportOne = async () => {
    if (!record) return;
    try {
      await exportRecordToDocx(record);
      toast.success("Word document exported");
    } catch (e) {
      toast.error("Export failed: " + (e as Error).message);
    }
  };

  const exportAll = async () => {
    if (records.length === 0) return;
    try {
      toast.info(`Merging ${records.length} records into one document...`);
      await exportRecordsMergedToDocx(records);
      toast.success("Merged Word document exported");
    } catch (e) {
      toast.error("Export failed: " + (e as Error).message);
    }
  };

  return (
    <div className="flex h-full flex-col border-l bg-background">
      <div className="border-b p-3">
        <h2 className="text-sm font-semibold">Record Properties</h2>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {!record ? (
          <p className="text-xs text-muted-foreground">
            Select a record from the spreadsheet.
          </p>
        ) : (
          <>
            <Field
              label="S/N"
              value={record.sn}
              onChange={(v) => updateRecord(record.id, { sn: v })}
            />
            <Field
              label="State"
              value={record.state}
              onChange={(v) => updateRecord(record.id, { state: v })}
            />
            <Field
              label="Area Council"
              value={record.areaCouncil}
              onChange={(v) => updateRecord(record.id, { areaCouncil: v })}
            />
            <Field
              label="Registration Area (WARD)"
              value={record.ward}
              onChange={(v) => updateRecord(record.id, { ward: v })}
            />
            <Field
              label="Polling Unit"
              value={record.pollingUnit}
              onChange={(v) => updateRecord(record.id, { pollingUnit: v })}
            />
            <Field
              label="Delimitation Code (XX-XX-XX-XXX)"
              value={record.delimitationCode}
              onChange={(v) => updateRecord(record.id, { delimitationCode: v })}
              mono
            />
          </>
        )}
      </div>

      <div className="border-t p-3 space-y-2">
        <Button
          size="sm"
          className="w-full"
          onClick={exportOne}
          disabled={!record}
        >
          <FileDown className="mr-1 h-3.5 w-3.5" /> Export Current (.docx)
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={exportAll}
          disabled={records.length === 0}
        >
          <FileStack className="mr-1 h-3.5 w-3.5" /> Export All (Merged .docx)
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-8 text-xs ${mono ? "font-mono" : ""}`}
      />
    </div>
  );
}
