import { read, utils } from "xlsx";

/**
 * Roster parsing.
 *
 * Everything happens in the browser: the file is read into memory, rows come
 * out, and nothing is ever transmitted. For a spreadsheet of children's names
 * that is not an implementation detail — it is the feature.
 */

/** Enough for any school; far below where the tab starts to struggle. */
export const MAX_ROWS = 1000;
export const MAX_FILE_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];

export interface Roster {
  headers: string[];
  /** Cell values as displayed, row-major, aligned to `headers`. */
  rows: string[][];
  /** True when the sheet had more rows than MAX_ROWS and was cut. */
  truncated: boolean;
}

export class RosterError extends Error {
  constructor(readonly reason: "unreadable" | "empty" | "too-large") {
    super(reason);
    this.name = "RosterError";
  }
}

const isBlankRow = (row: string[]) => row.every((cell) => cell === "");

/**
 * First worksheet, first non-empty row as headers.
 *
 * `raw: false` asks SheetJS for formatted strings — what the admin sees in
 * Excel is what lands on the card, which matters for dates and for roll
 * numbers Excel would otherwise hand over as floats.
 */
export function parseRoster(buffer: ArrayBuffer): Roster {
  let matrix: unknown[][];
  try {
    const workbook = read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = sheetName ? workbook.Sheets[sheetName] : undefined;
    if (!sheet) throw new Error("no sheet");

    matrix = utils.sheet_to_json<unknown[]>(sheet, {
      header: 1,
      raw: false,
      defval: "",
    });
  } catch {
    throw new RosterError("unreadable");
  }

  const grid = matrix
    .map((row) => row.map((cell) => String(cell ?? "").trim()))
    .filter((row) => !isBlankRow(row));

  const [headers, ...rows] = grid;
  if (!headers || rows.length === 0) throw new RosterError("empty");

  const width = headers.length;
  const truncated = rows.length > MAX_ROWS;

  return {
    // A merged or skipped header cell still needs a name to map by.
    headers: headers.map((header, i) => header || `Column ${i + 1}`),
    rows: rows
      .slice(0, MAX_ROWS)
      .map((row) => Array.from({ length: width }, (_, i) => row[i] ?? "")),
    truncated,
  };
}

/**
 * Header-to-field auto-matching, so a typical sheet arrives pre-mapped.
 * Normalised containment plus a small synonym table covering the labels
 * school spreadsheets actually use, in both of the app's languages.
 */
const SYNONYMS: Record<string, string[]> = {
  name: ["name", "student", "fullname", "নাম", "শিক্ষার্থী"],
  roll: ["roll", "rollno", "id", "studentid", "রোল"],
  class: ["class", "grade", "section", "শ্রেণী", "শ্রেণি", "ক্লাস"],
  phone: ["phone", "mobile", "contact", "ফোন", "মোবাইল"],
  email: ["email", "mail", "ইমেইল"],
  title: ["title", "designation", "পদবি", "পদবী"],
  company: ["company", "organization", "school", "প্রতিষ্ঠান"],
  website: ["website", "url", "ওয়েবসাইট"],
  address: ["address", "ঠিকানা"],
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");

/** Index of the header that best matches the field key, or null. */
export function suggestHeader(
  fieldKey: string,
  headers: readonly string[],
): number | null {
  const key = normalize(fieldKey);
  if (!key) return null;
  const candidates = new Set([key, ...(SYNONYMS[key] ?? []).map(normalize)]);

  let contains: number | null = null;
  for (const [index, header] of headers.entries()) {
    const cell = normalize(header);
    if (!cell) continue;
    if (candidates.has(cell)) return index;
    if (
      contains === null &&
      [...candidates].some((c) => cell.includes(c) || c.includes(cell))
    ) {
      contains = index;
    }
  }
  return contains;
}
