"use client";

import { useCallback, useRef, useState } from "react";
import { createWorker } from "tesseract.js";
import * as XLSX from "xlsx";
import { parseOcrTsv, type TableData } from "@/lib/table";

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [table, setTable] = useState<TableData>([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Ready");
  const [busy, setBusy] = useState(false);

  const chooseFile = useCallback((selected: File | undefined) => {
    if (!selected || !selected.type.startsWith("image/")) return;
    setFile(selected); setTable([]); setStatus("Image ready");
    setPreview(URL.createObjectURL(selected));
  }, []);

  async function convert() {
    if (!file) return;
    setBusy(true); setProgress(0); setStatus("Preparing OCR…");
    const worker = await createWorker("eng", 1, {
      logger: m => { if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100)); },
    });
    try {
      const result = await worker.recognize(file);
      const parsed = parseOcrTsv(result.data.tsv);
      setTable(parsed.length ? parsed : result.data.text.split(/\n/).filter(Boolean).map(x => [x]));
      setStatus(`Converted ${parsed.length || 0} rows`);
    } catch (error) {
      console.error(error); setStatus("Could not read this image. Try a clearer image.");
    } finally {
      await worker.terminate(); setBusy(false);
    }
  }

  function updateCell(r: number, c: number, value: string) {
    setTable(prev => prev.map((row, ri) => ri !== r ? row : row.map((cell, ci) => ci === c ? value : cell)));
  }

  function addRow() { setTable(prev => [...prev, Array(Math.max(1, ...prev.map(r => r.length))).fill("")]); }
  function clearAll() { setFile(null); setPreview(""); setTable([]); setStatus("Ready"); setProgress(0); if (inputRef.current) inputRef.current.value = ""; }

  function exportCsv() {
    const csv = table.map(row => row.map(cell => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    download(new Blob([csv], { type: "text/csv;charset=utf-8" }), "table.csv");
  }

  function exportExcel() {
    const ws = XLSX.utils.aoa_to_sheet(table);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Table");
    XLSX.writeFile(wb, "table.xlsx");
  }

  function download(blob: Blob, name: string) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href); }

  return (
    <main className="min-h-screen">
      <header className="border-b bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4"><div><div className="text-xl font-bold">Azim Tools</div><div className="text-xs text-slate-500">Practical tools for everyday work</div></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Image → Table</span></div></header>
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="max-w-3xl"><h1 className="text-4xl font-bold tracking-tight md:text-5xl">Convert an image into an editable table.</h1><p className="mt-4 text-lg text-slate-600">Upload a screenshot or photo of a table. OCR runs in your browser and the result can be edited, copied, or exported.</p></div>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => chooseFile(e.target.files?.[0])} />
            <button onClick={() => inputRef.current?.click()} className="flex min-h-56 w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-slate-500">
              {preview ? <img src={preview} alt="Selected table" className="max-h-72 max-w-full rounded-lg object-contain" /> : <><div className="text-4xl">↑</div><div className="mt-3 font-semibold">Choose a table image</div><div className="mt-1 text-sm text-slate-500">PNG, JPG, WEBP and other browser-supported images</div></>}
            </button>
            <div className="mt-4 flex gap-3"><button disabled={!file || busy} onClick={convert} className="flex-1 rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{busy ? `Reading ${progress}%` : "Convert to table"}</button><button onClick={clearAll} className="rounded-lg border px-4 py-3 font-medium">Clear</button></div>
            <p className="mt-3 text-sm text-slate-500">{status}</p>
          </div>
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between"><div><h2 className="font-semibold">Result</h2><p className="text-sm text-slate-500">Click any cell to edit.</p></div>{table.length > 0 && <div className="flex gap-2"><button onClick={exportCsv} className="rounded-lg border px-3 py-2 text-sm">CSV</button><button onClick={exportExcel} className="rounded-lg border px-3 py-2 text-sm">Excel</button></div>}</div>
            {table.length === 0 ? <div className="mt-6 flex min-h-56 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">Your extracted table will appear here.</div> : <div className="mt-5 overflow-auto rounded-xl border"><table className="min-w-full text-sm"><tbody>{table.map((row, r) => <tr key={r} className="border-b last:border-0">{row.map((cell, c) => <td key={c} className="border-r p-0 last:border-0"><input value={cell} onChange={e => updateCell(r,c,e.target.value)} className="w-full min-w-28 bg-transparent px-3 py-2 outline-none focus:bg-slate-50" /></td>)}</tr>)}</tbody></table><button onClick={addRow} className="m-3 rounded-md border px-3 py-2 text-sm">+ Add row</button></div>}
          </div>
        </div>
      </section>
    </main>
  );
}
