export interface CsvRow {
  front: string;
  back: string;
}

export function parseCsv(text: string): CsvRow[] {
  const rows: CsvRow[] = [];
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const fields = splitCsvLine(line);
    if (fields.length < 2) continue;
    const front = fields[0].trim();
    const back = fields.slice(1).join(",").trim();
    if (!front || !back) continue;
    if (/^question$/i.test(front) && /^answer$/i.test(back)) continue;
    rows.push({ front, back });
  }

  return rows;
}

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}
