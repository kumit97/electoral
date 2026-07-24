import { useElectionStore } from "@/lib/election/store";
import { parseDelimitationCode, RESULT_ROWS } from "@/lib/election/types";
import { useEffect, useRef, useState } from "react";

// A4 portrait at 96dpi: 794 x 1123.
const PAGE_W = 794;
const PAGE_H = 1123;


// ---- LEFT INFORMATION SECTION -------------------------------------------
// Layout: [Label ....dotted line....] [Code label] [Code boxes]
// The dotted line starts immediately after the label text and extends up to
// the Code label. The value sits centered above the dotted line and wraps.
const SECTION_X = 24;
const SECTION_W = 600;
const COL_CODE_LABEL_X = 488;
const COL_CODE_LABEL_W = 40;
const COL_BOXES_X = 532;

const ROW_H = 54;
const BOX_SIZE = 26;
const BOX_GAP = 3;

// Vertical gap between the info section and the results table below it.
// Must clear the S/N label, which floats 50px above the table itself.
const SECTION_TO_TABLE_GAP = 70;

const INFO_SECTION_TOP = 90;
const INFO_SECTION_HEIGHT = ROW_H * 4 + 20;

function DigitBoxes({ digits }: { digits: string }) {
  return (
    <div style={{ display: "flex", gap: BOX_GAP }}>
      {digits.split("").map((d, i) => (
        <div
          key={i}
          style={{
            width: BOX_SIZE,
            height: BOX_SIZE,
            boxSizing: "border-box",
            border: "1.2px solid #000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Arial, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {d}
        </div>
      ))}
    </div>
  );
}

function InfoRow({
  y,
  label,
  value,
  digits,
  fontFamily,
  fontSize,
}: {
  y: number;
  label: string;
  value: string;
  digits: string;
  fontFamily: string;
  fontSize: number;
}) {
  const BASELINE = ROW_H - 10;
  const INLINE_RIGHT = COL_CODE_LABEL_X - SECTION_X - 8;
  const labelSize = Math.round(fontSize * 0.93);

  return (
    <>
      {/* Inline: "Label ................................" */}
      <div
        style={{
          position: "absolute",
          left: SECTION_X,
          top: y,
          width: INLINE_RIGHT,
          height: ROW_H,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: BASELINE - 16,
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
          }}
        >
          <span
            style={{
              fontFamily,
              fontSize: labelSize,
              fontWeight: 700,
              lineHeight: 1,
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
          <span style={{ flex: 1, height: 16, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 2,
                height: 2,
                backgroundImage:
                  "radial-gradient(circle, #000 0.9px, transparent 1.1px)",
                backgroundSize: "6px 2px",
                backgroundRepeat: "repeat-x",
              }}
            />
          </span>
        </div>

        {/* Value centered above the dotted portion; wraps inside area */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: ROW_H - BASELINE + 2,
            maxHeight: ROW_H - 12,
            overflow: "hidden",
            textAlign: "center",
            paddingLeft: `calc(${label.length}ch + 12px)`,
            paddingRight: 8,
            fontFamily,
            fontSize,
            fontWeight: 700,
            fontStyle: "italic",
            lineHeight: 1.15,
            wordBreak: "break-word",
            whiteSpace: "normal",
          }}
        >
          {value}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: COL_CODE_LABEL_X,
          top: y,
          width: COL_CODE_LABEL_W,
          height: ROW_H,
          display: "flex",
          alignItems: "flex-end",
          paddingBottom: 6,
          fontFamily: "Arial, sans-serif",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        Code
      </div>

      <div
        style={{
          position: "absolute",
          left: COL_BOXES_X,
          top: y,
          height: ROW_H,
          display: "flex",
          alignItems: "flex-end",
          paddingBottom: 4,
        }}
      >
        <DigitBoxes digits={digits} />
      </div>
    </>
  );
}

function InfoSection({
  state,
  areaCouncil,
  ward,
  pollingUnit,
  parts,
  fontFamily,
  fontSize,
}: {
  state: string;
  areaCouncil: string;
  ward: string;
  pollingUnit: string;
  parts: ReturnType<typeof parseDelimitationCode>;
  fontFamily: string;
  fontSize: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: INFO_SECTION_TOP,
        width: SECTION_W,
        height: INFO_SECTION_HEIGHT,
      }}
    >
      <InfoRow y={0} label="State" value={state} digits={parts.state} fontFamily={fontFamily} fontSize={fontSize} />
      <InfoRow y={ROW_H} label="Area Council" value={areaCouncil} digits={parts.areaCouncil} fontFamily={fontFamily} fontSize={fontSize} />
      <InfoRow
        y={ROW_H * 2}
        label="Registration Area (WARD)"
        value={ward}
        digits={parts.ward}
        fontFamily={fontFamily}
        fontSize={fontSize}
      />
      <InfoRow
        y={ROW_H * 3}
        label="Polling Unit"
        value={pollingUnit}
        digits={parts.pollingUnit}
        fontFamily={fontFamily}
        fontSize={fontSize}
      />
    </div>
  );
}

const RESULTS_TABLE_W = 380;
const RESULTS_KEY_COL_W = 28;
const RESULTS_VALUE_COL_W = 64;

function ResultsTable({
  x,
  y,
  sn,
  fontFamily,
  fontSize,
}: {
  x: number;
  y: number;
  sn: string;
  fontFamily: string;
  fontSize: number;
}) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: RESULTS_TABLE_W }}>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: -50,
          fontFamily: "Arial, sans-serif",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        <span>S/N&nbsp;&nbsp;</span>
        <span style={{ borderBottom: "1px solid #000", padding: "0 8px" }}>
          {(sn || "0001").padStart(4, "0")}
        </span>
      </div>
      <table
        style={{
          borderCollapse: "collapse",
          width: "100%",
          tableLayout: "fixed",
          fontFamily,
          fontSize,
        }}
      >
        <tbody>
          {RESULT_ROWS.map((r) => (
            <tr key={r.key}>
              <td
                style={{
                  border: "1px solid #000",
                  width: RESULTS_KEY_COL_W,
                  textAlign: "center",
                  fontWeight: 700,
                  padding: "3px 2px",
                  background: "#f5f5f5",
                }}
              >
                #{r.key}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "3px 6px",
                  lineHeight: 1.15,
                }}
              >
                {r.label}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  width: RESULTS_VALUE_COL_W,
                  padding: "3px 4px",
                }}
              />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function A4Preview() {
  const record = useElectionStore((s) =>
    s.records.find((r) => r.id === s.selectedId),
  );
  const settings = useElectionStore((s) => s.settings);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const w = el.clientWidth - 32;
      const h = el.clientHeight - 32;
      const s = Math.min(w / PAGE_W, h / PAGE_H, 1.2);
      setScale(s > 0.1 ? s : 0.5);
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const parts = parseDelimitationCode(record?.delimitationCode || "");

  // Portrait is narrower, so the results table stacks below the info
  // section (left-aligned, same margin) instead of sitting beside it.
  const resultsTableX = SECTION_X;
  const resultsTableY = INFO_SECTION_TOP + INFO_SECTION_HEIGHT + SECTION_TO_TABLE_GAP;

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full items-start justify-center overflow-auto bg-neutral-200 p-4"
    >
      <div
        style={{
          width: PAGE_W * scale,
          height: PAGE_H * scale,
        }}
      >
        <div
          style={{
            width: PAGE_W,
            height: PAGE_H,
            background: "white",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            position: "relative",
          }}
        >
          {/* Left information section (fixed 5-column layout) */}
          <InfoSection
            state={record?.state || ""}
            areaCouncil={record?.areaCouncil || ""}
            ward={record?.ward || ""}
            pollingUnit={record?.pollingUnit || ""}
            parts={parts}
            fontFamily={settings.infoFontFamily}
            fontSize={settings.infoFontSize}
          />

          {settings.showResultsTable && (
            <ResultsTable
              x={resultsTableX}
              y={140}
              sn={record?.sn || "0001"}
              fontFamily={settings.resultsFontFamily}
              fontSize={settings.resultsFontSize}
            />
          )}
        </div>
      </div>
    </div>
  );
}
