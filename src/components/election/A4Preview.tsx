import { useElectionStore } from "@/lib/election/store";
import { parseDelimitationCode, RESULT_ROWS } from "@/lib/election/types";
import { useEffect, useRef, useState } from "react";

// A4 landscape at 96dpi: 1123 x 794. The reference form is wider than tall.
const PAGE_W = 1123;
const PAGE_H = 794;


// ---- LEFT INFORMATION SECTION -------------------------------------------
// Rebuilt from scratch as a semantic HTML table with fixed column widths.
// No Flexbox / Grid / space-between for column layout. Every row uses the
// SAME <colgroup>, so Label / Value / Code / Boxes X positions are identical
// on every row regardless of text length.

const COL_LABEL_W = 170;
const COL_VALUE_W = 360;
const COL_CODE_W = 55;
const COL_BOXES_W = 80;
const TABLE_W = COL_LABEL_W + COL_VALUE_W + COL_CODE_W + COL_BOXES_W; // 665

const BOX_SIZE = 24;
const BOX_GAP = 3;

function DigitBoxes({ digits }: { digits: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        whiteSpace: "nowrap",
        lineHeight: 0,
      }}
    >
      {digits.split("").map((d, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            width: BOX_SIZE,
            height: BOX_SIZE,
            boxSizing: "border-box",
            border: "1.2px solid #000",
            textAlign: "center",
            verticalAlign: "middle",
            lineHeight: `${BOX_SIZE - 2}px`,
            fontFamily: "Arial, sans-serif",
            fontSize: 13,
            fontWeight: 700,
            marginLeft: i === 0 ? 0 : BOX_GAP,
          }}
        >
          {d}
        </span>
      ))}
    </span>
  );
}

function DottedLine() {
  return (
    <div
      style={{
        width: "100%",
        height: 2,
        backgroundImage:
          "radial-gradient(circle, #000 0.9px, transparent 1.1px)",
        backgroundSize: "6px 2px",
        backgroundRepeat: "repeat-x",
      }}
    />
  );
}

function ValueOverLine({ value }: { value: string }) {
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          fontSize: 12.5,
          fontWeight: 700,
          lineHeight: 1.15,
          wordBreak: "break-word",
          paddingBottom: 2,
          minHeight: 16,
        }}
      >
        {value}
      </div>
      <DottedLine />
    </div>
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
  const rows: Array<{ label: string; value: string; digits: string }> = [
    { label: "State", value: state, digits: parts.state },
    { label: "Area Council", value: areaCouncil, digits: parts.areaCouncil },
    {
      label: "Registration Area (WARD)",
      value: ward,
      digits: parts.ward,
    },
    { label: "Polling Unit", value: pollingUnit, digits: parts.pollingUnit },
  ];

  const labelCellStyle: React.CSSProperties = {
    width: COL_LABEL_W,
    padding: "10px 8px 6px 0",
    verticalAlign: "bottom",
    fontFamily: "Arial, sans-serif",
    fontSize: 13,
    fontWeight: 700,
    lineHeight: 1.15,
    whiteSpace: "normal",
  };
  const valueCellStyle: React.CSSProperties = {
    width: COL_VALUE_W,
    padding: "10px 8px 6px 8px",
    verticalAlign: "bottom",
  };
  const codeCellStyle: React.CSSProperties = {
    width: COL_CODE_W,
    padding: "10px 4px 6px 12px",
    verticalAlign: "bottom",
    fontFamily: "Arial, sans-serif",
    fontSize: 13,
    fontWeight: 700,
    whiteSpace: "nowrap",
  };
  const boxesCellStyle: React.CSSProperties = {
    width: COL_BOXES_W,
    padding: "10px 0 6px 0",
    verticalAlign: "bottom",
    whiteSpace: "nowrap",
  };

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 90,
      }}
    >
      <table
        style={{
          width: TABLE_W,
          tableLayout: "fixed",
          borderCollapse: "collapse",
          borderSpacing: 0,
        }}
      >
        <colgroup>
          <col style={{ width: COL_LABEL_W }} />
          <col style={{ width: COL_VALUE_W }} />
          <col style={{ width: COL_CODE_W }} />
          <col style={{ width: COL_BOXES_W }} />
        </colgroup>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td style={labelCellStyle}>{r.label}</td>
              <td style={valueCellStyle}>
                <ValueOverLine value={r.value} />
              </td>
              <td style={codeCellStyle}>Code</td>
              <td style={boxesCellStyle}>
                <DigitBoxes digits={r.digits} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
          {/* Left information section (fixed 5-column layout) */}
          <InfoSection
            state={record?.state || ""}
            areaCouncil={record?.areaCouncil || ""}
            ward={record?.ward || ""}
            pollingUnit={record?.pollingUnit || ""}
            parts={parts}
          />


          <ResultsTable x={640} y={140} sn={record?.sn || "0001"} />
        </div>
      </div>
    </div>
  );
}
