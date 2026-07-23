import { useElectionStore } from "@/lib/election/store";
import { parseDelimitationCode, RESULT_ROWS } from "@/lib/election/types";
import { useEffect, useRef, useState } from "react";

// A4 landscape at 96dpi: 1123 x 794. The reference form is wider than tall.
const PAGE_W = 1123;
const PAGE_H = 794;

function DigitBoxes({ digits }: { digits: string }) {
  return (
    <div style={{ display: "inline-flex", gap: 2, verticalAlign: "middle" }}>
      {digits.split("").map((d, i) => (
        <div
          key={i}
          style={{
            width: 22,
            height: 22,
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

function DottedLine({ width }: { width: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width,
        borderBottom: "1.5px dotted #000",
        height: 1,
      }}
    />
  );
}

function FormRow({
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
  const LABEL_X = 40;
  const LABEL_W = 180;
  const DOTTED_X = LABEL_X + LABEL_W;
  const DOTTED_W = 260;
  const CODE_LABEL_X = DOTTED_X + DOTTED_W + 16;
  const BOX_X = CODE_LABEL_X + 42;

  return (
    <div style={{ position: "absolute", left: 0, top: y, width: "100%", height: 40 }}>
      <div
        style={{
          position: "absolute",
          left: LABEL_X,
          bottom: 4,
          width: LABEL_W,
          fontFamily: "Arial, sans-serif",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          left: DOTTED_X,
          bottom: 0,
          width: DOTTED_W,
          height: 32,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 4,
            textAlign: "center",
            fontFamily: "Arial, sans-serif",
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.15,
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {value}
        </div>
        <DottedLine width={DOTTED_W} />
      </div>
      <div
        style={{
          position: "absolute",
          left: CODE_LABEL_X,
          bottom: 4,
          fontFamily: "Arial, sans-serif",
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        Code
      </div>
      <div style={{ position: "absolute", left: BOX_X, bottom: 4 }}>
        <DigitBoxes digits={digits} />
      </div>
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
