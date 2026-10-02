export type Cell = string;
export type TableData = Cell[][];

type Word = { text: string; x0: number; y0: number; width: number; height: number; confidence: number };

export function parseOcrTsv(tsv: string): TableData {
  const lines = tsv.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const words: Word[] = [];
  const header = lines[0].split("\t");
  const idx = (name: string) => header.indexOf(name);
  const iText = idx("text"), iX = idx("left"), iY = idx("top"), iW = idx("width"), iH = idx("height"), iC = idx("conf");
  for (const line of lines.slice(1)) {
    const p = line.split("\t");
    const text = p[iText]?.trim();
    if (!text) continue;
    words.push({
      text,
      x0: Number(p[iX]) || 0,
      y0: Number(p[iY]) || 0,
      width: Number(p[iW]) || 0,
      height: Number(p[iH]) || 0,
      confidence: Number(p[iC]) || 0,
    });
  }
  words.sort((a, b) => a.y0 - b.y0 || a.x0 - b.x0);
  const rows: Word[][] = [];
  for (const word of words) {
    const tolerance = Math.max(8, word.height * 0.6);
    let row = rows.find(r => Math.abs(r[0].y0 - word.y0) <= tolerance);
    if (!row) { row = []; rows.push(row); }
    row.push(word);
  }
  rows.forEach(r => r.sort((a, b) => a.x0 - b.x0));
  const avgGap = averageColumnGap(rows);
  return rows.map(row => {
    const cells: string[] = [];
    for (const word of row) {
      const prev = row[cells.length - 1];
      if (prev) {
        const gap = word.x0 - (prev.x0 + prev.width);
        if (gap > avgGap * 1.8) cells.push(word.text);
        else cells[cells.length - 1] += ` ${word.text}`;
      } else cells.push(word.text);
    }
    return cells;
  });
}

function averageColumnGap(rows: Word[][]): number {
  const gaps: number[] = [];
  for (const row of rows) for (let i = 1; i < row.length; i++) {
    const gap = row[i].x0 - (row[i - 1].x0 + row[i - 1].width);
    if (gap > 0) gaps.push(gap);
  }
  if (!gaps.length) return 24;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
}
