# Azim Tools

Modular tools website, starting with Image to Table and designed to grow into OCR, PDF, Excel, image, text, and business utilities.

## Stack
- Next.js + TypeScript
- Tailwind CSS
- Tesseract.js for browser OCR in v1
- SheetJS for Excel export
- Python reserved for advanced OCR and document processing
- Go reserved for future high-throughput services
- Vercel for web deployment

## Structure
- `src/app` — Next.js application
- `src/lib` — reusable processing logic
- `services/python` — advanced OCR/document processing later
- `services/go` — performance-sensitive services later

## Run locally
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Image to Table v1
1. Select a table image.
2. Run browser-based OCR.
3. Convert OCR coordinates into rows/cells.
4. Edit the extracted table.
5. Export CSV or Excel.

No login, database, or server-side image upload is required for v1.

## Roadmap
- Better table structure detection
- Drag/drop and clipboard paste
- Image preprocessing
- OCR language selection
- Image to Text
- Multi-table extraction
- AI-assisted correction
- PDF to Table / Excel
- More standalone tools
