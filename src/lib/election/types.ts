export interface ElectionRecord {
  id: string;
  sn: string;
  state: string;
  areaCouncil: string;
  ward: string;
  pollingUnit: string;
  delimitationCode: string; // XX-XX-XX-XXX
}

export interface CodeParts {
  state: string; // 2 digits
  areaCouncil: string; // 2 digits
  ward: string; // 2 digits
  pollingUnit: string; // 3 digits
}

export function parseDelimitationCode(code: string): CodeParts {
  const clean = (code || "").toString().trim();
  const parts = clean.split("-");
  return {
    state: (parts[0] || "").padStart(2, "0").slice(0, 2),
    areaCouncil: (parts[1] || "").padStart(2, "0").slice(0, 2),
    ward: (parts[2] || "").padStart(2, "0").slice(0, 2),
    pollingUnit: (parts[3] || "").padStart(3, "0").slice(0, 3),
  };
}

export const RESULT_ROWS = [
  { key: "1", label: "No. of Registered Voters" },
  { key: "2", label: "No. of Accredited Voters" },
  { key: "3", label: "No. of Ballot Papers Issued to PU" },
  { key: "4", label: "No. of Unused Ballot Papers" },
  { key: "5", label: "No. of Spoilt Ballot Papers" },
  { key: "6", label: "No. of Rejected Ballots" },
  { key: "7", label: "Total No. of Valid Votes Cast" },
  { key: "8", label: "Total No. of Used Ballot Papers (Total of #5 + #6 + #7)" },
] as const;
