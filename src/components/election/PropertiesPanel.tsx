import { useElectionStore, FONT_OPTIONS } from "@/lib/election/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportRecordToDocx, exportRecordsMergedToDocx } from "@/lib/election/docx-export";
import { FileDown, FileStack } from "lucide-react";
import { toast } from "sonner";

export function PropertiesPanel() {
  const { records, selectedId, updateRecord, settings, updateSettings } =
    useElectionStore();
  const record = records.find((r) => r.id === selectedId);

  const exportOne = async () => {
    if (!record) return;
    try {
      await exportRecordToDocx(record, settings);
      toast.success("Word document exported");
    } catch (e) {
      toast.error("Export failed: " + (e as Error).message);
    }
  };

  const exportAll = async () => {
    if (records.length === 0) return;
    try {
      toast.info(`Merging ${records.length} records into one document...`);
      await exportRecordsMergedToDocx(records, settings);
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

        <div className="space-y-3 border-t pt-3">
          <h3 className="text-xs font-semibold text-muted-foreground">
            Design
          </h3>

          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-muted-foreground">
              Show results table (#1-#8)
            </Label>
            <Switch
              checked={settings.showResultsTable}
              onCheckedChange={(v) => updateSettings({ showResultsTable: v })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-semibold">
              Info section (State / Area Council / Ward / Polling Unit)
            </Label>
            <FontControls
              fontFamily={settings.infoFontFamily}
              fontSize={settings.infoFontSize}
              onFontFamily={(v) => updateSettings({ infoFontFamily: v })}
              onFontSize={(v) => updateSettings({ infoFontSize: v })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[11px] font-semibold">
              Results table (#1-#8)
            </Label>
            <FontControls
              fontFamily={settings.resultsFontFamily}
              fontSize={settings.resultsFontSize}
              onFontFamily={(v) => updateSettings({ resultsFontFamily: v })}
              onFontSize={(v) => updateSettings({ resultsFontSize: v })}
              disabled={!settings.showResultsTable}
            />
          </div>
        </div>
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

function FontControls({
  fontFamily,
  fontSize,
  onFontFamily,
  onFontSize,
  disabled,
}: {
  fontFamily: string;
  fontSize: number;
  onFontFamily: (v: string) => void;
  onFontSize: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <Select value={fontFamily} onValueChange={onFontFamily} disabled={disabled}>
        <SelectTrigger className="h-8 flex-1 text-xs">
          <SelectValue placeholder="Font" />
        </SelectTrigger>
        <SelectContent>
          {FONT_OPTIONS.map((f) => (
            <SelectItem key={f.value} value={f.value} className="text-xs">
              {f.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="number"
        min={8}
        max={28}
        step={0.5}
        value={fontSize}
        disabled={disabled}
        onChange={(e) => onFontSize(Number(e.target.value) || fontSize)}
        className="h-8 w-16 text-xs"
      />
    </div>
  );
}
