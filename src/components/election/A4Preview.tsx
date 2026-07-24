import { useElectionStore } from "@/lib/election/store";
import { parseDelimitationCode, RESULT_ROWS } from "@/lib/election/types";
import { useEffect, useRef, useState } from "react";

// A4 landscape at 96dpi: 1123 x 794. The reference form is wider than tall.
const PAGE_W = 1123;
const PAGE_H = 794;


// ---- LEFT INFORMATION SECTION -------------------------------------------
// Fixed 5-column layout. All X coordinates are absolute and NEVER shift
// depending on text length.
const COL_LABEL_X = 24;
const COL_LABEL_W = 178;
const COL_DOTTED_X = 205;
const COL_DOTTED_W = 275;
const COL_CODE_LABEL_X = 488;
const COL_CODE_LABEL_W = 34;
const COL_BOXES_X = 528;

const ROW_H = 46;
const BOX_SIZE = 24;
const BOX_GAP = 3;

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
            fontSize: 13,
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
}: {
  y: number;
  label: string;
  value: string;
  digits: string;
}) {
  // Baseline of the dotted line inside the row
  const BASELINE = ROW_H - 8;

  return (
    <>
      {/* Column 1: Label */}
      <div
        style={{
          position: "absolute",
          left: COL_LABEL_X,
          top: y,
          width: COL_LABEL_W,
          height: ROW_H,
          display: "flex",
          alignItems: "flex-end",
          fontFamily: "Arial, sans-serif",
          fontSize: 13,
          fontWeight: 700,
          lineHeight: 1.15,
        }}
      >
        {label}
      </div>

      {/* Columns 2 + 3: fixed-width dotted line with the value centered above it */}
      <div
        style={{
          position: "absolute",
          left: COL_DOTTED_X,
          top: y,
          width: COL_DOTTED_W,
          height: ROW_H,
        }}
      >
        {/* Centered value, wraps only inside this fixed area */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: BASELINE + 2,
            maxHeight: ROW_H - 10,
            overflow: "hidden",
            textAlign: "center",
            fontFamily: "Arial, sans-serif",
            fontSize: 12.5,
            fontWeight: 700,
            lineHeight: 1.1,
            wordBreak: "break-word",
          }}
        >
          {value}
        </div>
        {/* Fixed-width dotted line */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: BASELINE,
            width: COL_DOTTED_W,
            height: 2,
            backgroundImage:
              "radial-gradient(circle, #000 0.9px, transparent 1.1px)",
            backgroundSize: "6px 2px",
            backgroundRepeat: "repeat-x",
          }}
        />
      </div>

      {/* Column 4: Code label — fixed X on every row */}
      <div
        style={{
          position: "absolute",
          left: COL_CODE_LABEL_X,
          top: y,
          width: COL_CODE_LABEL_W,
          height: ROW_H,
          display: "flex",
          alignItems: "flex-end",
          paddingBottom: 4,
          fontFamily: "Arial, sans-serif",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        Code
      </div>

      {/* Column 5: Code boxes — fixed X on every row */}
      <div
        style={{
          position: "absolute",
          left: COL_BOXES_X,
          top: y,
          height: ROW_H,
          display: "flex",
          alignItems: "flex-end",
          paddingBottom: 2,
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
}: {
  state: string;
  areaCouncil: string;
  ward: string;
  pollingUnit: string;
  parts: ReturnType<typeof parseDelimitationCode>;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 90,
        width: 620,
        height: ROW_H * 4 + 20,
      }}
    >
      <InfoRow y={0} label="State" value={state} digits={parts.state} />
      <InfoRow y={ROW_H} label="Area Council" value={areaCouncil} digits={parts.areaCouncil} />
      <InfoRow
        y={ROW_H * 2}
        label="Registration Area (WARD)"
        value={ward}
        digits={parts.ward}
      />
      <InfoRow
        y={ROW_H * 3}
        label="Polling Unit"
        value={pollingUnit}
        digits={parts.pollingUnit}
      />
    </div>
  );
}

function ResultsTable({ x, y, sn }: { x: number; y: number; sn: string }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 460 }}>
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
          fontFamily: "Arial, sans-serif",
          fontSize: 11.5,
        }}
      >
        <tbody>
          {RESULT_ROWS.map((r) => (
            <tr key={r.key}>
              <td
                style={{
                  border: "1px solid #000",
                  width: 36,
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
                  padding: "3px 8px",
                }}
              >
                {r.label}
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  width: 90,
                  padding: "3px 6px",
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
          {/* Form area */}
          <div style={{ position: "absolute", left: 0, top: 90, width: 720, height: 300 }}>
            <FormRow y={0} label="State" value={record?.state || ""} digits={parts.state} />
            <FormRow y={60} label="Area Council" value={record?.areaCouncil || ""} digits={parts.areaCouncil} />
            <FormRow
              y={120}
              label="Registration Area (WARD)"
              value={record?.ward || ""}
              digits={parts.ward}
            />
            <FormRow
              y={180}
              label="Polling Unit"
              value={record?.pollingUnit || ""}
              digits={parts.pollingUnit}
            />
          </div>

          <ResultsTable x={640} y={140} sn={record?.sn || "0001"} />
        </div>
      </div>
    </div>
  );
}
